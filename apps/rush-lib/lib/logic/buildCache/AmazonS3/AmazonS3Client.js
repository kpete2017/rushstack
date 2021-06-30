"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AmazonS3Client = void 0;
const crypto = __importStar(require("crypto"));
const fetch = __importStar(require("node-fetch"));
const WebClient_1 = require("../../../utilities/WebClient");
const CONTENT_HASH_HEADER_NAME = 'x-amz-content-sha256';
const DATE_HEADER_NAME = 'x-amz-date';
const HOST_HEADER_NAME = 'host';
const SECURITY_TOKEN_HEADER_NAME = 'x-amz-security-token';
const DEFAULT_S3_REGION = 'us-east-1';
class AmazonS3Client {
    constructor(credentials, options) {
        this._credentials = credentials;
        this._validateBucketName(options.s3Bucket);
        this._s3Bucket = options.s3Bucket;
        this._s3Region = options.s3Region;
        this._webClient = new WebClient_1.WebClient();
    }
    static tryDeserializeCredentials(credentialString) {
        if (!credentialString) {
            return undefined;
        }
        const fields = credentialString.split(':');
        if (fields.length < 2 || fields.length > 3) {
            throw new Error('Amazon S3 credential is in an unexpected format.');
        }
        return {
            accessKeyId: fields[0],
            secretAccessKey: fields[1],
            sessionToken: fields[2]
        };
    }
    async getObjectAsync(objectName) {
        const response = await this._makeRequestAsync('GET', objectName);
        if (response.ok) {
            return await response.buffer();
        }
        else if (response.status === 404) {
            return undefined;
        }
        else if (response.status === 403 && !this._credentials) {
            return undefined;
        }
        else {
            this._throwS3Error(response);
        }
    }
    async uploadObjectAsync(objectName, objectBuffer) {
        if (!this._credentials) {
            throw new Error('Credentials are required to upload objects to S3.');
        }
        const response = await this._makeRequestAsync('PUT', objectName, objectBuffer);
        if (!response.ok) {
            this._throwS3Error(response);
        }
    }
    async _makeRequestAsync(verb, objectName, body) {
        const isoDateString = this._getIsoDateString();
        const bodyHash = this._getSha256(body);
        const host = this._getHost();
        const headers = new fetch.Headers();
        headers.set(DATE_HEADER_NAME, isoDateString.dateTime);
        headers.set(CONTENT_HASH_HEADER_NAME, bodyHash);
        if (this._credentials) {
            // Compute the authorization header. See https://docs.aws.amazon.com/AmazonS3/latest/API/sig-v4-header-based-auth.html
            const signedHeaderNames = [HOST_HEADER_NAME, CONTENT_HASH_HEADER_NAME, DATE_HEADER_NAME];
            const canonicalHeaders = [
                `${HOST_HEADER_NAME}:${host}`,
                `${CONTENT_HASH_HEADER_NAME}:${bodyHash}`,
                `${DATE_HEADER_NAME}:${isoDateString.dateTime}`
            ];
            // Handle signing with temporary credentials (via sts:assume-role)
            if (this._credentials.sessionToken) {
                signedHeaderNames.push(SECURITY_TOKEN_HEADER_NAME);
                canonicalHeaders.push(`${SECURITY_TOKEN_HEADER_NAME}:${this._credentials.sessionToken}`);
            }
            const signedHeaderNamesString = signedHeaderNames.join(';');
            // The canonical request looks like this:
            //  GET
            // /test.txt
            //
            // host:examplebucket.s3.amazonaws.com
            // range:bytes=0-9
            // x-amz-content-sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
            // x-amz-date:20130524T000000Z
            //
            // host;range;x-amz-content-sha256;x-amz-date
            // e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
            const canonicalRequest = [
                verb,
                `/${objectName}`,
                '',
                ...canonicalHeaders,
                '',
                signedHeaderNamesString,
                bodyHash
            ].join('\n');
            const canonicalRequestHash = this._getSha256(canonicalRequest);
            const scope = `${isoDateString.date}/${this._s3Region}/s3/aws4_request`;
            // The string to sign looks like this:
            // AWS4-HMAC-SHA256
            // 20130524T423589Z
            // 20130524/us-east-1/s3/aws4_request
            // 7344ae5b7ee6c3e7e6b0fe0640412a37625d1fbfff95c48bbb2dc43964946972
            const stringToSign = [
                'AWS4-HMAC-SHA256',
                isoDateString.dateTime,
                scope,
                canonicalRequestHash
            ].join('\n');
            const dateKey = this._getSha256Hmac(`AWS4${this._credentials.secretAccessKey}`, isoDateString.date);
            const dateRegionKey = this._getSha256Hmac(dateKey, this._s3Region);
            const dateRegionServiceKey = this._getSha256Hmac(dateRegionKey, 's3');
            const signingKey = this._getSha256Hmac(dateRegionServiceKey, 'aws4_request');
            const signature = this._getSha256Hmac(signingKey, stringToSign, 'hex');
            const authorizationHeader = `AWS4-HMAC-SHA256 Credential=${this._credentials.accessKeyId}/${scope},SignedHeaders=${signedHeaderNamesString},Signature=${signature}`;
            headers.set('Authorization', authorizationHeader);
            if (this._credentials.sessionToken) {
                // Handle signing with temporary credentials (via sts:assume-role)
                headers.set('X-Amz-Security-Token', this._credentials.sessionToken);
            }
        }
        const webFetchOptions = {
            verb,
            headers
        };
        if (verb === 'PUT') {
            webFetchOptions.body = body;
        }
        const response = await this._webClient.fetchAsync(`https://${host}/${objectName}`, webFetchOptions);
        return response;
    }
    _getSha256Hmac(key, data, encoding) {
        const hash = crypto.createHmac('sha256', key);
        hash.update(data);
        if (encoding) {
            return hash.digest(encoding);
        }
        else {
            return hash.digest();
        }
    }
    _getSha256(data) {
        if (data) {
            const hash = crypto.createHash('sha256');
            hash.update(data);
            return hash.digest('hex');
        }
        else {
            // This is the null SHA256 hash
            return 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
        }
    }
    _getIsoDateString(date = new Date()) {
        let dateString = date.toISOString();
        dateString = dateString.replace(/[-:]/g, ''); // Remove separator characters
        dateString = dateString.substring(0, 15); // Drop milliseconds
        // dateTime is an ISO8601 date. It looks like "20130524T423589"
        // date is an ISO date. It looks like "20130524"
        return {
            dateTime: `${dateString}Z`,
            date: dateString.substring(0, 8)
        };
    }
    _throwS3Error(response) {
        throw new Error(`Amazon S3 responded with status code ${response.status} (${response.statusText})`);
    }
    _getHost() {
        if (this._s3Region === DEFAULT_S3_REGION) {
            return `${this._s3Bucket}.s3.amazonaws.com`;
        }
        else {
            return `${this._s3Bucket}.s3-${this._s3Region}.amazonaws.com`;
        }
    }
    /**
     * Validates a S3 bucket name.
     * {@link https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-s3-bucket-naming-requirements.html}
     */
    _validateBucketName(s3BucketName) {
        if (!s3BucketName) {
            throw new Error('A S3 bucket name must be provided');
        }
        if (!s3BucketName.match(/^[a-z\d-.]{3,63}$/)) {
            throw new Error(`The bucket name "${s3BucketName}" is invalid. A S3 bucket name must only contain lowercase ` +
                'alphanumerical characters, dashes, and periods and must be between 3 and 63 characters long.');
        }
        if (!s3BucketName.match(/^[a-z\d]/)) {
            throw new Error(`The bucket name "${s3BucketName}" is invalid. A S3 bucket name must start with a lowercase ` +
                'alphanumerical character.');
        }
        if (s3BucketName.match(/-$/)) {
            throw new Error(`The bucket name "${s3BucketName}" is invalid. A S3 bucket name must not end in a dash.`);
        }
        if (s3BucketName.match(/(\.\.)|(\.-)|(-\.)/)) {
            throw new Error(`The bucket name "${s3BucketName}" is invalid. A S3 bucket name must not have consecutive periods or ` +
                'dashes adjacent to periods.');
        }
        if (s3BucketName.match(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/)) {
            throw new Error(`The bucket name "${s3BucketName}" is invalid. A S3 bucket name must not be formatted as an IP address.`);
        }
    }
}
exports.AmazonS3Client = AmazonS3Client;
//# sourceMappingURL=AmazonS3Client.js.map