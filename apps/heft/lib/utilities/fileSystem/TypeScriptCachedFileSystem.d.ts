/// <reference types="node" />
import { IFileSystemWriteFileOptions, IFileSystemReadFileOptions, IFileSystemCopyFileOptions, IFileSystemDeleteFileOptions, IFileSystemCreateLinkOptions, FileSystemStats } from '@rushstack/node-core-library';
export interface IReadFolderFilesAndDirectoriesResult {
    files: string[];
    directories: string[];
}
/**
 * This is a FileSystem API (largely unrelated to the @rushstack/node-core-library FileSystem API)
 * that provides caching to the Heft TypeScriptBuilder.
 * It uses an in-memory cache to avoid requests against the disk. It assumes that the disk stays
 * static after construction, except for writes performed through the TypeScriptCachedFileSystem
 * instance.
 */
export declare class TypeScriptCachedFileSystem {
    private _statsCache;
    private _readFolderCache;
    private _readFileCache;
    private _realPathCache;
    exists: (path: string) => boolean;
    getStatistics: (path: string) => FileSystemStats;
    ensureFolder: (folderPath: string) => void;
    ensureFolderAsync: (folderPath: string) => Promise<void>;
    writeFile: (filePath: string, contents: string | Buffer, options?: IFileSystemWriteFileOptions | undefined) => void;
    readFile: (filePath: string, options?: IFileSystemReadFileOptions | undefined) => string;
    readFileToBuffer: (filePath: string) => Buffer;
    copyFileAsync: (options: IFileSystemCopyFileOptions) => Promise<void>;
    deleteFile: (filePath: string, options?: IFileSystemDeleteFileOptions | undefined) => void;
    createHardLinkAsync: (options: IFileSystemCreateLinkOptions) => Promise<void>;
    getRealPath: (linkPath: string) => string;
    readFolderFilesAndDirectories: (folderPath: string) => IReadFolderFilesAndDirectoriesResult;
    private _sortFolderEntries;
    private _withCaching;
    private _invalidateCacheEntry;
}
//# sourceMappingURL=TypeScriptCachedFileSystem.d.ts.map