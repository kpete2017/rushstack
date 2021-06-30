/// <reference types="node" />
import { Terminal } from '@rushstack/node-core-library';
export declare abstract class CloudBuildCacheProviderBase {
    abstract readonly isCacheWriteAllowed: boolean;
    abstract tryGetCacheEntryBufferByIdAsync(terminal: Terminal, cacheId: string): Promise<Buffer | undefined>;
    abstract trySetCacheEntryBufferAsync(terminal: Terminal, cacheId: string, entryBuffer: Buffer): Promise<boolean>;
    abstract updateCachedCredentialAsync(terminal: Terminal, credential: string): Promise<void>;
    abstract updateCachedCredentialInteractiveAsync(terminal: Terminal): Promise<void>;
    abstract deleteCachedCredentialsAsync(terminal: Terminal): Promise<void>;
}
//# sourceMappingURL=CloudBuildCacheProviderBase.d.ts.map