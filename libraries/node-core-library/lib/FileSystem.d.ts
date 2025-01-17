/// <reference types="node" />
import * as fs from 'fs';
import { NewlineKind, Encoding } from './Text';
import { PosixModeBits } from './PosixModeBits';
/**
 * An alias for the Node.js `fs.Stats` object.
 *
 * @remarks
 * This avoids the need to import the `fs` package when using the {@link FileSystem} API.
 * @public
 */
export declare type FileSystemStats = fs.Stats;
/**
 * The options for {@link FileSystem.readFolder}
 * @public
 */
export interface IFileSystemReadFolderOptions {
    /**
     * If true, returns the absolute paths of the files in the folder.
     * @defaultValue false
     */
    absolutePaths?: boolean;
}
/**
 * The options for {@link FileSystem.writeFile}
 * @public
 */
export interface IFileSystemWriteFileOptions {
    /**
     * If true, will ensure the folder is created before writing the file.
     * @defaultValue false
     */
    ensureFolderExists?: boolean;
    /**
     * If specified, will normalize line endings to the specified style of newline.
     * @defaultValue `undefined` which means no conversion will be performed
     */
    convertLineEndings?: NewlineKind;
    /**
     * If specified, will change the encoding of the file that will be written.
     * @defaultValue "utf8"
     */
    encoding?: Encoding;
}
/**
 * The options for {@link FileSystem.readFile}
 * @public
 */
export interface IFileSystemReadFileOptions {
    /**
     * If specified, will change the encoding of the file that will be written.
     * @defaultValue Encoding.Utf8
     */
    encoding?: Encoding;
    /**
     * If specified, will normalize line endings to the specified style of newline.
     * @defaultValue `undefined` which means no conversion will be performed
     */
    convertLineEndings?: NewlineKind;
}
/**
 * The options for {@link FileSystem.move}
 * @public
 */
export interface IFileSystemMoveOptions {
    /**
     * The path of the existing object to be moved.
     * The path may be absolute or relative.
     */
    sourcePath: string;
    /**
     * The new path for the object.
     * The path may be absolute or relative.
     */
    destinationPath: string;
    /**
     * If true, will overwrite the file if it already exists.
     * @defaultValue true
     */
    overwrite?: boolean;
    /**
     * If true, will ensure the folder is created before writing the file.
     * @defaultValue false
     */
    ensureFolderExists?: boolean;
}
/**
 * @public
 */
export interface IFileSystemCopyFileBaseOptions {
    /**
     * The path of the existing object to be copied.
     * The path may be absolute or relative.
     */
    sourcePath: string;
    /**
     * Specifies what to do if the target object already exists.
     * @defaultValue {@link AlreadyExistsBehavior.Overwrite}
     */
    alreadyExistsBehavior?: AlreadyExistsBehavior;
}
/**
 * The options for {@link FileSystem.copyFile}
 * @public
 */
export interface IFileSystemCopyFileOptions extends IFileSystemCopyFileBaseOptions {
    /**
     * The path that the object will be copied to.
     * The path may be absolute or relative.
     */
    destinationPath: string;
}
/**
 * Specifies the behavior of {@link FileSystem.copyFiles} in a situation where the target object
 * already exists.
 * @public
 */
export declare const enum AlreadyExistsBehavior {
    /**
     * If the destination object exists, overwrite it.
     * This is the default behavior for {@link FileSystem.copyFiles}.
     */
    Overwrite = "overwrite",
    /**
     * If the destination object exists, report an error.
     */
    Error = "error",
    /**
     * If the destination object exists, skip it and continue the operation.
     */
    Ignore = "ignore"
}
/**
 * Callback function type for {@link IFileSystemCopyFilesAsyncOptions.filter}
 * @public
 */
export declare type FileSystemCopyFilesAsyncFilter = (sourcePath: string, destinationPath: string) => Promise<boolean>;
/**
 * Callback function type for {@link IFileSystemCopyFilesOptions.filter}
 * @public
 */
export declare type FileSystemCopyFilesFilter = (sourcePath: string, destinationPath: string) => boolean;
/**
 * The options for {@link FileSystem.copyFilesAsync}
 * @public
 */
export interface IFileSystemCopyFilesAsyncOptions {
    /**
     * The starting path of the file or folder to be copied.
     * The path may be absolute or relative.
     */
    sourcePath: string;
    /**
     * The path that the files will be copied to.
     * The path may be absolute or relative.
     */
    destinationPath: string;
    /**
     * If true, then when copying symlinks, copy the target object instead of copying the link.
     */
    dereferenceSymlinks?: boolean;
    /**
     * Specifies what to do if the target object already exists.
     */
    alreadyExistsBehavior?: AlreadyExistsBehavior;
    /**
     * If true, then the target object will be assigned "last modification" and "last access" timestamps
     * that are the same as the source.  Otherwise, the OS default timestamps are assigned.
     */
    preserveTimestamps?: boolean;
    /**
     * A callback that will be invoked for each path that is copied.  The callback can return `false`
     * to cause the object to be excluded from the operation.
     */
    filter?: FileSystemCopyFilesAsyncFilter | FileSystemCopyFilesFilter;
}
/**
 * The options for {@link FileSystem.copyFiles}
 * @public
 */
export interface IFileSystemCopyFilesOptions extends IFileSystemCopyFilesAsyncOptions {
    /**  {@inheritdoc IFileSystemCopyFilesAsyncOptions.filter} */
    filter?: FileSystemCopyFilesFilter;
}
/**
 * The options for {@link FileSystem.deleteFile}
 * @public
 */
export interface IFileSystemDeleteFileOptions {
    /**
     * If true, will throw an exception if the file did not exist before `deleteFile()` was called.
     * @defaultValue false
     */
    throwIfNotExists?: boolean;
}
/**
 * The options for {@link FileSystem.updateTimes}
 * Both times must be specified.
 * @public
 */
export interface IFileSystemUpdateTimeParameters {
    /**
     * The POSIX epoch time or Date when this was last accessed.
     */
    accessedTime: number | Date;
    /**
     * The POSIX epoch time or Date when this was last modified
     */
    modifiedTime: number | Date;
}
/**
 * The options for {@link FileSystem.createSymbolicLinkJunction}, {@link FileSystem.createSymbolicLinkFile},
 * {@link FileSystem.createSymbolicLinkFolder}, and {@link FileSystem.createHardLink}.
 *
 * @public
 */
export interface IFileSystemCreateLinkOptions {
    /**
     * The existing path that the symbolic link will point to.
     */
    linkTargetPath: string;
    /**
     * The new path for the new symlink link to be created.
     */
    newLinkPath: string;
    /**
     * Specifies what to do if the target object already exists. Defaults to `AlreadyExistsBehavior.Error`.
     */
    alreadyExistsBehavior?: AlreadyExistsBehavior;
}
/**
 * The FileSystem API provides a complete set of recommended operations for interacting with the file system.
 *
 * @remarks
 * We recommend to use this instead of the native `fs` API, because `fs` is a minimal set of low-level
 * primitives that must be mapped for each supported operating system. The FileSystem API takes a
 * philosophical approach of providing "one obvious way" to do each operation. We also prefer synchronous
 * operations except in cases where there would be a clear performance benefit for using async, since synchronous
 * code is much easier to read and debug. Also, indiscriminate parallelism has been seen to actually worsen
 * performance, versus improving it.
 *
 * Note that in the documentation, we refer to "filesystem objects", this can be a
 * file, folder, symbolic link, hard link, directory junction, etc.
 *
 * @public
 */
export declare class FileSystem {
    /**
     * Returns true if the path exists on disk.
     * Behind the scenes it uses `fs.existsSync()`.
     * @remarks
     * There is a debate about the fact that after `fs.existsSync()` returns true,
     * the file might be deleted before fs.readSync() is called, which would imply that everybody
     * should catch a `readSync()` exception, and nobody should ever use `fs.existsSync()`.
     * We find this to be unpersuasive, since "unexceptional exceptions" really hinder the
     * break-on-exception debugging experience. Also, throwing/catching is generally slow.
     * @param path - The absolute or relative path to the filesystem object.
     */
    static exists(path: string): boolean;
    /**
     * An async version of {@link FileSystem.exists}.
     */
    static existsAsync(path: string): Promise<boolean>;
    /**
     * Gets the statistics for a particular filesystem object.
     * If the path is a link, this function follows the link and returns statistics about the link target.
     * Behind the scenes it uses `fs.statSync()`.
     * @param path - The absolute or relative path to the filesystem object.
     */
    static getStatistics(path: string): FileSystemStats;
    /**
     * An async version of {@link FileSystem.getStatistics}.
     */
    static getStatisticsAsync(path: string): Promise<FileSystemStats>;
    /**
     * Updates the accessed and modified timestamps of the filesystem object referenced by path.
     * Behind the scenes it uses `fs.utimesSync()`.
     * The caller should specify both times in the `times` parameter.
     * @param path - The path of the file that should be modified.
     * @param times - The times that the object should be updated to reflect.
     */
    static updateTimes(path: string, times: IFileSystemUpdateTimeParameters): void;
    /**
     * An async version of {@link FileSystem.updateTimes}.
     */
    static updateTimesAsync(path: string, times: IFileSystemUpdateTimeParameters): Promise<void>;
    /**
     * Changes the permissions (i.e. file mode bits) for a filesystem object.
     * Behind the scenes it uses `fs.chmodSync()`.
     * @param path - The absolute or relative path to the object that should be updated.
     * @param modeBits - POSIX-style file mode bits specified using the {@link PosixModeBits} enum
     */
    static changePosixModeBits(path: string, mode: PosixModeBits): void;
    /**
     * An async version of {@link FileSystem.changePosixModeBits}.
     */
    static changePosixModeBitsAsync(path: string, mode: PosixModeBits): Promise<void>;
    /**
     * Retrieves the permissions (i.e. file mode bits) for a filesystem object.
     * Behind the scenes it uses `fs.chmodSync()`.
     * @param path - The absolute or relative path to the object that should be updated.
     *
     * @remarks
     * This calls {@link FileSystem.getStatistics} to get the POSIX mode bits.
     * If statistics in addition to the mode bits are needed, it is more efficient
     * to call {@link FileSystem.getStatistics} directly instead.
     */
    static getPosixModeBits(path: string): PosixModeBits;
    /**
     * An async version of {@link FileSystem.getPosixModeBits}.
     */
    static getPosixModeBitsAsync(path: string): Promise<PosixModeBits>;
    /**
     * Returns a 10-character string representation of a PosixModeBits value similar to what
     * would be displayed by a command such as "ls -l" on a POSIX-like operating system.
     * @remarks
     * For example, `PosixModeBits.AllRead | PosixModeBits.AllWrite` would be formatted as "-rw-rw-rw-".
     * @param modeBits - POSIX-style file mode bits specified using the {@link PosixModeBits} enum
     */
    static formatPosixModeBits(modeBits: PosixModeBits): string;
    /**
     * Moves a file. The folder must exist, unless the `ensureFolderExists` option is provided.
     * Behind the scenes it uses `fs-extra.moveSync()`
     */
    static move(options: IFileSystemMoveOptions): void;
    /**
     * An async version of {@link FileSystem.move}.
     */
    static moveAsync(options: IFileSystemMoveOptions): Promise<void>;
    /**
     * Recursively creates a folder at a given path.
     * Behind the scenes is uses `fs-extra.ensureDirSync()`.
     * @remarks
     * Throws an exception if anything in the folderPath is not a folder.
     * @param folderPath - The absolute or relative path of the folder which should be created.
     */
    static ensureFolder(folderPath: string): void;
    /**
     * An async version of {@link FileSystem.ensureFolder}.
     */
    static ensureFolderAsync(folderPath: string): Promise<void>;
    /**
     * Reads the contents of the folder, not including "." or "..".
     * Behind the scenes it uses `fs.readdirSync()`.
     * @param folderPath - The absolute or relative path to the folder which should be read.
     * @param options - Optional settings that can change the behavior. Type: `IReadFolderOptions`
     */
    static readFolder(folderPath: string, options?: IFileSystemReadFolderOptions): string[];
    /**
     * An async version of {@link FileSystem.readFolder}.
     */
    static readFolderAsync(folderPath: string, options?: IFileSystemReadFolderOptions): Promise<string[]>;
    /**
     * Deletes a folder, including all of its contents.
     * Behind the scenes is uses `fs-extra.removeSync()`.
     * @remarks
     * Does not throw if the folderPath does not exist.
     * @param folderPath - The absolute or relative path to the folder which should be deleted.
     */
    static deleteFolder(folderPath: string): void;
    /**
     * An async version of {@link FileSystem.deleteFolder}.
     */
    static deleteFolderAsync(folderPath: string): Promise<void>;
    /**
     * Deletes the content of a folder, but not the folder itself. Also ensures the folder exists.
     * Behind the scenes it uses `fs-extra.emptyDirSync()`.
     * @remarks
     * This is a workaround for a common race condition, where the virus scanner holds a lock on the folder
     * for a brief period after it was deleted, causing EBUSY errors for any code that tries to recreate the folder.
     * @param folderPath - The absolute or relative path to the folder which should have its contents deleted.
     */
    static ensureEmptyFolder(folderPath: string): void;
    /**
     * An async version of {@link FileSystem.ensureEmptyFolder}.
     */
    static ensureEmptyFolderAsync(folderPath: string): Promise<void>;
    /**
     * Writes a text string to a file on disk, overwriting the file if it already exists.
     * Behind the scenes it uses `fs.writeFileSync()`.
     * @remarks
     * Throws an error if the folder doesn't exist, unless ensureFolder=true.
     * @param filePath - The absolute or relative path of the file.
     * @param contents - The text that should be written to the file.
     * @param options - Optional settings that can change the behavior. Type: `IWriteFileOptions`
     */
    static writeFile(filePath: string, contents: string | Buffer, options?: IFileSystemWriteFileOptions): void;
    /**
     * An async version of {@link FileSystem.writeFile}.
     */
    static writeFileAsync(filePath: string, contents: string | Buffer, options?: IFileSystemWriteFileOptions): Promise<void>;
    /**
     * Writes a text string to a file on disk, appending to the file if it already exists.
     * Behind the scenes it uses `fs.appendFileSync()`.
     * @remarks
     * Throws an error if the folder doesn't exist, unless ensureFolder=true.
     * @param filePath - The absolute or relative path of the file.
     * @param contents - The text that should be written to the file.
     * @param options - Optional settings that can change the behavior. Type: `IWriteFileOptions`
     */
    static appendToFile(filePath: string, contents: string | Buffer, options?: IFileSystemWriteFileOptions): void;
    /**
     * An async version of {@link FileSystem.appendToFile}.
     */
    static appendToFileAsync(filePath: string, contents: string | Buffer, options?: IFileSystemWriteFileOptions): Promise<void>;
    /**
     * Reads the contents of a file into a string.
     * Behind the scenes it uses `fs.readFileSync()`.
     * @param filePath - The relative or absolute path to the file whose contents should be read.
     * @param options - Optional settings that can change the behavior. Type: `IReadFileOptions`
     */
    static readFile(filePath: string, options?: IFileSystemReadFileOptions): string;
    /**
     * An async version of {@link FileSystem.readFile}.
     */
    static readFileAsync(filePath: string, options?: IFileSystemReadFileOptions): Promise<string>;
    /**
     * Reads the contents of a file into a buffer.
     * Behind the scenes is uses `fs.readFileSync()`.
     * @param filePath - The relative or absolute path to the file whose contents should be read.
     */
    static readFileToBuffer(filePath: string): Buffer;
    /**
     * An async version of {@link FileSystem.readFileToBuffer}.
     */
    static readFileToBufferAsync(filePath: string): Promise<Buffer>;
    /**
     * Copies a single file from one location to another.
     * By default, destinationPath is overwritten if it already exists.
     *
     * @remarks
     * The `copyFile()` API cannot be used to copy folders.  It copies at most one file.
     * Use {@link FileSystem.copyFiles} if you need to recursively copy a tree of folders.
     *
     * The implementation is based on `copySync()` from the `fs-extra` package.
     */
    static copyFile(options: IFileSystemCopyFileOptions): void;
    /**
     * An async version of {@link FileSystem.copyFile}.
     */
    static copyFileAsync(options: IFileSystemCopyFileOptions): Promise<void>;
    /**
     * Copies a file or folder from one location to another, recursively copying any folder contents.
     * By default, destinationPath is overwritten if it already exists.
     *
     * @remarks
     * If you only intend to copy a single file, it is recommended to use {@link FileSystem.copyFile}
     * instead to more clearly communicate the intended operation.
     *
     * The implementation is based on `copySync()` from the `fs-extra` package.
     */
    static copyFiles(options: IFileSystemCopyFilesOptions): void;
    /**
     * An async version of {@link FileSystem.copyFiles}.
     */
    static copyFilesAsync(options: IFileSystemCopyFilesOptions): Promise<void>;
    /**
     * Deletes a file. Can optionally throw if the file doesn't exist.
     * Behind the scenes it uses `fs.unlinkSync()`.
     * @param filePath - The absolute or relative path to the file that should be deleted.
     * @param options - Optional settings that can change the behavior. Type: `IDeleteFileOptions`
     */
    static deleteFile(filePath: string, options?: IFileSystemDeleteFileOptions): void;
    /**
     * An async version of {@link FileSystem.deleteFile}.
     */
    static deleteFileAsync(filePath: string, options?: IFileSystemDeleteFileOptions): Promise<void>;
    /**
     * Gets the statistics of a filesystem object. Does NOT follow the link to its target.
     * Behind the scenes it uses `fs.lstatSync()`.
     * @param path - The absolute or relative path to the filesystem object.
     */
    static getLinkStatistics(path: string): FileSystemStats;
    /**
     * An async version of {@link FileSystem.getLinkStatistics}.
     */
    static getLinkStatisticsAsync(path: string): Promise<FileSystemStats>;
    /**
     * If `path` refers to a symbolic link, this returns the path of the link target, which may be
     * an absolute or relative path.
     *
     * @remarks
     * If `path` refers to a filesystem object that is not a symbolic link, then an `ErrnoException` is thrown
     * with code 'UNKNOWN'.  If `path` does not exist, then an `ErrnoException` is thrown with code `ENOENT`.
     *
     * @param path - The absolute or relative path to the symbolic link.
     * @returns the path of the link target
     */
    static readLink(path: string): string;
    /**
     * An async version of {@link FileSystem.readLink}.
     */
    static readLinkAsync(path: string): Promise<string>;
    /**
     * Creates a Windows "directory junction". Behaves like `createSymbolicLinkToFile()` on other platforms.
     * Behind the scenes it uses `fs.symlinkSync()`.
     */
    static createSymbolicLinkJunction(options: IFileSystemCreateLinkOptions): void;
    /**
     * An async version of {@link FileSystem.createSymbolicLinkJunction}.
     */
    static createSymbolicLinkJunctionAsync(options: IFileSystemCreateLinkOptions): Promise<void>;
    /**
     * Creates a symbolic link to a file (on Windows this requires elevated permissionsBits).
     * Behind the scenes it uses `fs.symlinkSync()`.
     */
    static createSymbolicLinkFile(options: IFileSystemCreateLinkOptions): void;
    /**
     * An async version of {@link FileSystem.createSymbolicLinkFile}.
     */
    static createSymbolicLinkFileAsync(options: IFileSystemCreateLinkOptions): Promise<void>;
    /**
     * Creates a symbolic link to a folder (on Windows this requires elevated permissionsBits).
     * Behind the scenes it uses `fs.symlinkSync()`.
     */
    static createSymbolicLinkFolder(options: IFileSystemCreateLinkOptions): void;
    /**
     * An async version of {@link FileSystem.createSymbolicLinkFolder}.
     */
    static createSymbolicLinkFolderAsync(options: IFileSystemCreateLinkOptions): Promise<void>;
    /**
     * Creates a hard link.
     * Behind the scenes it uses `fs.linkSync()`.
     */
    static createHardLink(options: IFileSystemCreateLinkOptions): void;
    /**
     * An async version of {@link FileSystem.createHardLink}.
     */
    static createHardLinkAsync(options: IFileSystemCreateLinkOptions): Promise<void>;
    /**
     * Follows a link to its destination and returns the absolute path to the final target of the link.
     * Behind the scenes it uses `fs.realpathSync()`.
     * @param linkPath - The path to the link.
     */
    static getRealPath(linkPath: string): string;
    /**
     * An async version of {@link FileSystem.getRealPath}.
     */
    static getRealPathAsync(linkPath: string): Promise<string>;
    /**
     * Returns true if the error provided indicates the file or folder does not exist.
     */
    static isNotExistError(error: Error): boolean;
    /**
     * Returns true if the error provided indicates the file does not exist.
     */
    static isFileDoesNotExistError(error: Error): boolean;
    /**
     * Returns true if the error provided indicates the folder does not exist.
     */
    static isFolderDoesNotExistError(error: Error): boolean;
    /**
     * Detects if the provided error object is a `NodeJS.ErrnoException`
     */
    static isErrnoException(error: Error): error is NodeJS.ErrnoException;
    private static _wrapException;
    private static _wrapExceptionAsync;
    private static _updateErrorMessage;
}
//# sourceMappingURL=FileSystem.d.ts.map