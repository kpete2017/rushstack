/// <reference types="node" />
import { Terminal } from '@rushstack/node-core-library';
import { CloudBuildCacheProviderBase } from './CloudBuildCacheProviderBase';
export declare enum AzureAuthorityHosts {
    AzureChina = "https://login.chinacloudapi.cn",
    AzureGermany = "https://login.microsoftonline.de",
    AzureGovernment = "https://login.microsoftonline.us",
    AzurePublicCloud = "https://login.microsoftonline.com"
}
export declare type AzureEnvironmentNames = keyof typeof AzureAuthorityHosts;
export interface IAzureStorageBuildCacheProviderOptions {
    storageContainerName: string;
    storageAccountName: string;
    azureEnvironment?: AzureEnvironmentNames;
    blobPrefix?: string;
    isCacheWriteAllowed: boolean;
}
export declare class AzureStorageBuildCacheProvider extends CloudBuildCacheProviderBase {
    private readonly _storageAccountName;
    private readonly _storageContainerName;
    private readonly _azureEnvironment;
    private readonly _blobPrefix;
    private readonly _environmentCredential;
    private readonly _isCacheWriteAllowedByConfiguration;
    private __credentialCacheId;
    get isCacheWriteAllowed(): boolean;
    private _containerClient;
    constructor(options: IAzureStorageBuildCacheProviderOptions);
    private get _credentialCacheId();
    private get _storageAccountUrl();
    tryGetCacheEntryBufferByIdAsync(terminal: Terminal, cacheId: string): Promise<Buffer | undefined>;
    trySetCacheEntryBufferAsync(terminal: Terminal, cacheId: string, entryStream: Buffer): Promise<boolean>;
    updateCachedCredentialAsync(terminal: Terminal, credential: string): Promise<void>;
    updateCachedCredentialInteractiveAsync(terminal: Terminal): Promise<void>;
    deleteCachedCredentialsAsync(terminal: Terminal): Promise<void>;
    private _getBlobClientForCacheIdAsync;
    private _getContainerClientAsync;
    private _getSasQueryParametersAsync;
    private _getConnectionString;
}
//# sourceMappingURL=AzureStorageBuildCacheProvider.d.ts.map