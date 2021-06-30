/// <reference types="node" />
import { IAmazonS3BuildCacheProviderOptions } from './AmazonS3BuildCacheProvider';
export interface IAmazonS3Credentials {
    accessKeyId: string;
    secretAccessKey: string;
    sessionToken: string | undefined;
}
export declare class AmazonS3Client {
    private readonly _credentials;
    private readonly _s3Bucket;
    private readonly _s3Region;
    private readonly _webClient;
    constructor(credentials: IAmazonS3Credentials | undefined, options: IAmazonS3BuildCacheProviderOptions);
    static tryDeserializeCredentials(credentialString: string | undefined): IAmazonS3Credentials | undefined;
    getObjectAsync(objectName: string): Promise<Buffer | undefined>;
    uploadObjectAsync(objectName: string, objectBuffer: Buffer): Promise<void>;
    private _makeRequestAsync;
    _getSha256Hmac(key: string | Buffer, data: string): Buffer;
    _getSha256Hmac(key: string | Buffer, data: string, encoding: 'hex'): string;
    private _getSha256;
    private _getIsoDateString;
    private _throwS3Error;
    private _getHost;
    /**
     * Validates a S3 bucket name.
     * {@link https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-s3-bucket-naming-requirements.html}
     */
    private _validateBucketName;
}
//# sourceMappingURL=AmazonS3Client.d.ts.map