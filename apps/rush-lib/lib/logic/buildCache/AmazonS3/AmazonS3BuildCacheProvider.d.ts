/// <reference types="node" />
import { Terminal } from '@rushstack/node-core-library';
import { CloudBuildCacheProviderBase } from '../CloudBuildCacheProviderBase';
export interface IAmazonS3BuildCacheProviderOptions {
    s3Bucket: string;
    s3Region: string;
    s3Prefix?: string;
    isCacheWriteAllowed: boolean;
}
export declare class AmazonS3BuildCacheProvider extends CloudBuildCacheProviderBase {
    private readonly _options;
    private readonly _s3Prefix;
    private readonly _environmentCredential;
    private readonly _isCacheWriteAllowedByConfiguration;
    private __credentialCacheId;
    get isCacheWriteAllowed(): boolean;
    private __s3Client;
    constructor(options: IAmazonS3BuildCacheProviderOptions);
    private get _credentialCacheId();
    private _getS3ClientAsync;
    tryGetCacheEntryBufferByIdAsync(terminal: Terminal, cacheId: string): Promise<Buffer | undefined>;
    trySetCacheEntryBufferAsync(terminal: Terminal, cacheId: string, objectBuffer: Buffer): Promise<boolean>;
    updateCachedCredentialAsync(terminal: Terminal, credential: string): Promise<void>;
    updateCachedCredentialInteractiveAsync(terminal: Terminal): Promise<void>;
    deleteCachedCredentialsAsync(terminal: Terminal): Promise<void>;
}
//# sourceMappingURL=AmazonS3BuildCacheProvider.d.ts.map