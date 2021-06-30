"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.AmazonS3BuildCacheProvider = void 0;
const EnvironmentConfiguration_1 = require("../../../api/EnvironmentConfiguration");
const CloudBuildCacheProviderBase_1 = require("../CloudBuildCacheProviderBase");
const CredentialCache_1 = require("../../CredentialCache");
const RushConstants_1 = require("../../RushConstants");
const AmazonS3Client_1 = require("./AmazonS3Client");
class AmazonS3BuildCacheProvider extends CloudBuildCacheProviderBase_1.CloudBuildCacheProviderBase {
    constructor(options) {
        super();
        this._options = options;
        this._s3Prefix = options.s3Prefix;
        this._environmentCredential = EnvironmentConfiguration_1.EnvironmentConfiguration.buildCacheCredential;
        this._isCacheWriteAllowedByConfiguration = options.isCacheWriteAllowed;
    }
    get isCacheWriteAllowed() {
        var _a;
        return (_a = EnvironmentConfiguration_1.EnvironmentConfiguration.buildCacheWriteAllowed) !== null && _a !== void 0 ? _a : this._isCacheWriteAllowedByConfiguration;
    }
    get _credentialCacheId() {
        if (!this.__credentialCacheId) {
            const cacheIdParts = ['aws-s3', this._options.s3Region, this._options.s3Bucket];
            if (this._isCacheWriteAllowedByConfiguration) {
                cacheIdParts.push('cacheWriteAllowed');
            }
            this.__credentialCacheId = cacheIdParts.join('|');
        }
        return this.__credentialCacheId;
    }
    async _getS3ClientAsync() {
        var _a;
        if (!this.__s3Client) {
            let credentials = AmazonS3Client_1.AmazonS3Client.tryDeserializeCredentials(this._environmentCredential);
            if (!credentials) {
                let cacheEntry;
                await CredentialCache_1.CredentialCache.usingAsync({
                    supportEditing: false
                }, (credentialsCache) => {
                    cacheEntry = credentialsCache.tryGetCacheEntry(this._credentialCacheId);
                });
                if (cacheEntry) {
                    const expirationTime = (_a = cacheEntry.expires) === null || _a === void 0 ? void 0 : _a.getTime();
                    if (expirationTime && expirationTime < Date.now()) {
                        throw new Error('Cached Amazon S3 credentials have expired. ' +
                            `Update the credentials by running "rush ${RushConstants_1.RushConstants.updateCloudCredentialsCommandName}".`);
                    }
                    else {
                        credentials = AmazonS3Client_1.AmazonS3Client.tryDeserializeCredentials(cacheEntry === null || cacheEntry === void 0 ? void 0 : cacheEntry.credential);
                    }
                }
                else if (this._isCacheWriteAllowedByConfiguration) {
                    throw new Error("An Amazon S3 credential hasn't been provided, or has expired. " +
                        `Update the credentials by running "rush ${RushConstants_1.RushConstants.updateCloudCredentialsCommandName}", ` +
                        `or provide an <AccessKeyId>:<SecretAccessKey> pair in the ` +
                        `${"RUSH_BUILD_CACHE_CREDENTIAL" /* RUSH_BUILD_CACHE_CREDENTIAL */} environment variable`);
                }
            }
            this.__s3Client = new AmazonS3Client_1.AmazonS3Client(credentials, this._options);
        }
        return this.__s3Client;
    }
    async tryGetCacheEntryBufferByIdAsync(terminal, cacheId) {
        try {
            const client = await this._getS3ClientAsync();
            return await client.getObjectAsync(this._s3Prefix ? `${this._s3Prefix}/${cacheId}` : cacheId);
        }
        catch (e) {
            terminal.writeWarningLine(`Error getting cache entry from S3: ${e}`);
            return undefined;
        }
    }
    async trySetCacheEntryBufferAsync(terminal, cacheId, objectBuffer) {
        if (!this.isCacheWriteAllowed) {
            terminal.writeErrorLine('Writing to S3 cache is not allowed in the current configuration.');
            return false;
        }
        try {
            const client = await this._getS3ClientAsync();
            await client.uploadObjectAsync(this._s3Prefix ? `${this._s3Prefix}/${cacheId}` : cacheId, objectBuffer);
            return true;
        }
        catch (e) {
            terminal.writeWarningLine(`Error uploading cache entry to S3: ${e}`);
            return false;
        }
    }
    async updateCachedCredentialAsync(terminal, credential) {
        await CredentialCache_1.CredentialCache.usingAsync({
            supportEditing: true
        }, async (credentialsCache) => {
            credentialsCache.setCacheEntry(this._credentialCacheId, credential);
            await credentialsCache.saveIfModifiedAsync();
        });
    }
    async updateCachedCredentialInteractiveAsync(terminal) {
        throw new Error('The interactive cloud credentials flow is not supported for Amazon S3.\n' +
            'Install and authenticate with aws-cli, or provide your credentials to rush using the --credential flag instead.');
    }
    async deleteCachedCredentialsAsync(terminal) {
        await CredentialCache_1.CredentialCache.usingAsync({
            supportEditing: true
        }, async (credentialsCache) => {
            credentialsCache.deleteCacheEntry(this._credentialCacheId);
            await credentialsCache.saveIfModifiedAsync();
        });
    }
}
exports.AmazonS3BuildCacheProvider = AmazonS3BuildCacheProvider;
//# sourceMappingURL=AmazonS3BuildCacheProvider.js.map