/// <reference types="node" />
import { Terminal } from '@rushstack/node-core-library';
import { RushConfiguration } from '../../api/RushConfiguration';
import { RushUserConfiguration } from '../../api/RushUserConfiguration';
export interface IFileSystemBuildCacheProviderOptions {
    rushConfiguration: RushConfiguration;
    rushUserConfiguration: RushUserConfiguration;
}
export declare class FileSystemBuildCacheProvider {
    private readonly _cacheFolderPath;
    constructor(options: IFileSystemBuildCacheProviderOptions);
    getCacheEntryPath(cacheId: string): string;
    tryGetCacheEntryPathByIdAsync(terminal: Terminal, cacheId: string): Promise<string | undefined>;
    trySetCacheEntryBufferAsync(terminal: Terminal, cacheId: string, entryBuffer: Buffer): Promise<string>;
}
//# sourceMappingURL=FileSystemBuildCacheProvider.d.ts.map