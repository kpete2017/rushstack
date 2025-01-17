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
exports.FileSystem = void 0;
const nodeJsPath = __importStar(require("path"));
const fs = __importStar(require("fs"));
const fsx = __importStar(require("fs-extra"));
const Text_1 = require("./Text");
const MOVE_DEFAULT_OPTIONS = {
    overwrite: true,
    ensureFolderExists: false
};
const READ_FOLDER_DEFAULT_OPTIONS = {
    absolutePaths: false
};
const WRITE_FILE_DEFAULT_OPTIONS = {
    ensureFolderExists: false,
    convertLineEndings: undefined,
    encoding: "utf8" /* Utf8 */
};
const APPEND_TO_FILE_DEFAULT_OPTIONS = Object.assign({}, WRITE_FILE_DEFAULT_OPTIONS);
const READ_FILE_DEFAULT_OPTIONS = {
    encoding: "utf8" /* Utf8 */,
    convertLineEndings: undefined
};
const COPY_FILE_DEFAULT_OPTIONS = {
    alreadyExistsBehavior: "overwrite" /* Overwrite */
};
const COPY_FILES_DEFAULT_OPTIONS = {
    alreadyExistsBehavior: "overwrite" /* Overwrite */
};
const DELETE_FILE_DEFAULT_OPTIONS = {
    throwIfNotExists: false
};
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
class FileSystem {
    // ===============
    // COMMON OPERATIONS
    // ===============
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
    static exists(path) {
        return FileSystem._wrapException(() => {
            return fsx.existsSync(path);
        });
    }
    /**
     * An async version of {@link FileSystem.exists}.
     */
    static async existsAsync(path) {
        return await FileSystem._wrapExceptionAsync(() => {
            return new Promise((resolve) => {
                fsx.exists(path, resolve);
            });
        });
    }
    /**
     * Gets the statistics for a particular filesystem object.
     * If the path is a link, this function follows the link and returns statistics about the link target.
     * Behind the scenes it uses `fs.statSync()`.
     * @param path - The absolute or relative path to the filesystem object.
     */
    static getStatistics(path) {
        return FileSystem._wrapException(() => {
            return fsx.statSync(path);
        });
    }
    /**
     * An async version of {@link FileSystem.getStatistics}.
     */
    static async getStatisticsAsync(path) {
        return await FileSystem._wrapExceptionAsync(() => {
            return fsx.stat(path);
        });
    }
    /**
     * Updates the accessed and modified timestamps of the filesystem object referenced by path.
     * Behind the scenes it uses `fs.utimesSync()`.
     * The caller should specify both times in the `times` parameter.
     * @param path - The path of the file that should be modified.
     * @param times - The times that the object should be updated to reflect.
     */
    static updateTimes(path, times) {
        return FileSystem._wrapException(() => {
            fsx.utimesSync(path, times.accessedTime, times.modifiedTime);
        });
    }
    /**
     * An async version of {@link FileSystem.updateTimes}.
     */
    static async updateTimesAsync(path, times) {
        await FileSystem._wrapExceptionAsync(() => {
            // This cast is needed because the fs-extra typings require both parameters
            // to have the same type (number or Date), whereas Node.js does not require that.
            return fsx.utimes(path, times.accessedTime, times.modifiedTime);
        });
    }
    /**
     * Changes the permissions (i.e. file mode bits) for a filesystem object.
     * Behind the scenes it uses `fs.chmodSync()`.
     * @param path - The absolute or relative path to the object that should be updated.
     * @param modeBits - POSIX-style file mode bits specified using the {@link PosixModeBits} enum
     */
    static changePosixModeBits(path, mode) {
        FileSystem._wrapException(() => {
            fs.chmodSync(path, mode);
        });
    }
    /**
     * An async version of {@link FileSystem.changePosixModeBits}.
     */
    static async changePosixModeBitsAsync(path, mode) {
        await FileSystem._wrapExceptionAsync(() => {
            return fsx.chmod(path, mode);
        });
    }
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
    static getPosixModeBits(path) {
        return FileSystem._wrapException(() => {
            return FileSystem.getStatistics(path).mode;
        });
    }
    /**
     * An async version of {@link FileSystem.getPosixModeBits}.
     */
    static async getPosixModeBitsAsync(path) {
        return await FileSystem._wrapExceptionAsync(async () => {
            return (await FileSystem.getStatisticsAsync(path)).mode;
        });
    }
    /**
     * Returns a 10-character string representation of a PosixModeBits value similar to what
     * would be displayed by a command such as "ls -l" on a POSIX-like operating system.
     * @remarks
     * For example, `PosixModeBits.AllRead | PosixModeBits.AllWrite` would be formatted as "-rw-rw-rw-".
     * @param modeBits - POSIX-style file mode bits specified using the {@link PosixModeBits} enum
     */
    static formatPosixModeBits(modeBits) {
        let result = '-'; // (later we may add support for additional states such as S_IFDIR or S_ISUID)
        result += modeBits & 256 /* UserRead */ ? 'r' : '-';
        result += modeBits & 128 /* UserWrite */ ? 'w' : '-';
        result += modeBits & 64 /* UserExecute */ ? 'x' : '-';
        result += modeBits & 32 /* GroupRead */ ? 'r' : '-';
        result += modeBits & 16 /* GroupWrite */ ? 'w' : '-';
        result += modeBits & 8 /* GroupExecute */ ? 'x' : '-';
        result += modeBits & 4 /* OthersRead */ ? 'r' : '-';
        result += modeBits & 2 /* OthersWrite */ ? 'w' : '-';
        result += modeBits & 1 /* OthersExecute */ ? 'x' : '-';
        return result;
    }
    /**
     * Moves a file. The folder must exist, unless the `ensureFolderExists` option is provided.
     * Behind the scenes it uses `fs-extra.moveSync()`
     */
    static move(options) {
        FileSystem._wrapException(() => {
            options = Object.assign(Object.assign({}, MOVE_DEFAULT_OPTIONS), options);
            try {
                fsx.moveSync(options.sourcePath, options.destinationPath, { overwrite: options.overwrite });
            }
            catch (error) {
                if (options.ensureFolderExists) {
                    if (!FileSystem.isNotExistError(error)) {
                        throw error;
                    }
                    const folderPath = nodeJsPath.dirname(options.destinationPath);
                    FileSystem.ensureFolder(folderPath);
                    fsx.moveSync(options.sourcePath, options.destinationPath, { overwrite: options.overwrite });
                }
                else {
                    throw error;
                }
            }
        });
    }
    /**
     * An async version of {@link FileSystem.move}.
     */
    static async moveAsync(options) {
        await FileSystem._wrapExceptionAsync(async () => {
            options = Object.assign(Object.assign({}, MOVE_DEFAULT_OPTIONS), options);
            try {
                await fsx.move(options.sourcePath, options.destinationPath, { overwrite: options.overwrite });
            }
            catch (error) {
                if (options.ensureFolderExists) {
                    if (!FileSystem.isNotExistError(error)) {
                        throw error;
                    }
                    const folderPath = nodeJsPath.dirname(options.destinationPath);
                    await FileSystem.ensureFolderAsync(nodeJsPath.dirname(folderPath));
                    await fsx.move(options.sourcePath, options.destinationPath, { overwrite: options.overwrite });
                }
                else {
                    throw error;
                }
            }
        });
    }
    // ===============
    // FOLDER OPERATIONS
    // ===============
    /**
     * Recursively creates a folder at a given path.
     * Behind the scenes is uses `fs-extra.ensureDirSync()`.
     * @remarks
     * Throws an exception if anything in the folderPath is not a folder.
     * @param folderPath - The absolute or relative path of the folder which should be created.
     */
    static ensureFolder(folderPath) {
        FileSystem._wrapException(() => {
            fsx.ensureDirSync(folderPath);
        });
    }
    /**
     * An async version of {@link FileSystem.ensureFolder}.
     */
    static async ensureFolderAsync(folderPath) {
        await FileSystem._wrapExceptionAsync(() => {
            return fsx.ensureDir(folderPath);
        });
    }
    /**
     * Reads the contents of the folder, not including "." or "..".
     * Behind the scenes it uses `fs.readdirSync()`.
     * @param folderPath - The absolute or relative path to the folder which should be read.
     * @param options - Optional settings that can change the behavior. Type: `IReadFolderOptions`
     */
    static readFolder(folderPath, options) {
        return FileSystem._wrapException(() => {
            options = Object.assign(Object.assign({}, READ_FOLDER_DEFAULT_OPTIONS), options);
            // @todo: Update this to use Node 10's `withFileTypes: true` option when we drop support for Node 8
            const fileNames = fsx.readdirSync(folderPath);
            if (options.absolutePaths) {
                return fileNames.map((fileName) => nodeJsPath.resolve(folderPath, fileName));
            }
            else {
                return fileNames;
            }
        });
    }
    /**
     * An async version of {@link FileSystem.readFolder}.
     */
    static async readFolderAsync(folderPath, options) {
        return await FileSystem._wrapExceptionAsync(async () => {
            options = Object.assign(Object.assign({}, READ_FOLDER_DEFAULT_OPTIONS), options);
            // @todo: Update this to use Node 10's `withFileTypes: true` option when we drop support for Node 8
            const fileNames = await fsx.readdir(folderPath);
            if (options.absolutePaths) {
                return fileNames.map((fileName) => nodeJsPath.resolve(folderPath, fileName));
            }
            else {
                return fileNames;
            }
        });
    }
    /**
     * Deletes a folder, including all of its contents.
     * Behind the scenes is uses `fs-extra.removeSync()`.
     * @remarks
     * Does not throw if the folderPath does not exist.
     * @param folderPath - The absolute or relative path to the folder which should be deleted.
     */
    static deleteFolder(folderPath) {
        FileSystem._wrapException(() => {
            fsx.removeSync(folderPath);
        });
    }
    /**
     * An async version of {@link FileSystem.deleteFolder}.
     */
    static async deleteFolderAsync(folderPath) {
        await FileSystem._wrapExceptionAsync(() => {
            return fsx.remove(folderPath);
        });
    }
    /**
     * Deletes the content of a folder, but not the folder itself. Also ensures the folder exists.
     * Behind the scenes it uses `fs-extra.emptyDirSync()`.
     * @remarks
     * This is a workaround for a common race condition, where the virus scanner holds a lock on the folder
     * for a brief period after it was deleted, causing EBUSY errors for any code that tries to recreate the folder.
     * @param folderPath - The absolute or relative path to the folder which should have its contents deleted.
     */
    static ensureEmptyFolder(folderPath) {
        FileSystem._wrapException(() => {
            fsx.emptyDirSync(folderPath);
        });
    }
    /**
     * An async version of {@link FileSystem.ensureEmptyFolder}.
     */
    static async ensureEmptyFolderAsync(folderPath) {
        await FileSystem._wrapExceptionAsync(() => {
            return fsx.emptyDir(folderPath);
        });
    }
    // ===============
    // FILE OPERATIONS
    // ===============
    /**
     * Writes a text string to a file on disk, overwriting the file if it already exists.
     * Behind the scenes it uses `fs.writeFileSync()`.
     * @remarks
     * Throws an error if the folder doesn't exist, unless ensureFolder=true.
     * @param filePath - The absolute or relative path of the file.
     * @param contents - The text that should be written to the file.
     * @param options - Optional settings that can change the behavior. Type: `IWriteFileOptions`
     */
    static writeFile(filePath, contents, options) {
        FileSystem._wrapException(() => {
            options = Object.assign(Object.assign({}, WRITE_FILE_DEFAULT_OPTIONS), options);
            if (options.convertLineEndings) {
                contents = Text_1.Text.convertTo(contents.toString(), options.convertLineEndings);
            }
            try {
                fsx.writeFileSync(filePath, contents, { encoding: options.encoding });
            }
            catch (error) {
                if (options.ensureFolderExists) {
                    if (!FileSystem.isNotExistError(error)) {
                        throw error;
                    }
                    const folderPath = nodeJsPath.dirname(filePath);
                    FileSystem.ensureFolder(folderPath);
                    fsx.writeFileSync(filePath, contents, { encoding: options.encoding });
                }
                else {
                    throw error;
                }
            }
        });
    }
    /**
     * An async version of {@link FileSystem.writeFile}.
     */
    static async writeFileAsync(filePath, contents, options) {
        await FileSystem._wrapExceptionAsync(async () => {
            options = Object.assign(Object.assign({}, WRITE_FILE_DEFAULT_OPTIONS), options);
            if (options.convertLineEndings) {
                contents = Text_1.Text.convertTo(contents.toString(), options.convertLineEndings);
            }
            try {
                await fsx.writeFile(filePath, contents, { encoding: options.encoding });
            }
            catch (error) {
                if (options.ensureFolderExists) {
                    if (!FileSystem.isNotExistError(error)) {
                        throw error;
                    }
                    const folderPath = nodeJsPath.dirname(filePath);
                    await FileSystem.ensureFolderAsync(folderPath);
                    await fsx.writeFile(filePath, contents, { encoding: options.encoding });
                }
                else {
                    throw error;
                }
            }
        });
    }
    /**
     * Writes a text string to a file on disk, appending to the file if it already exists.
     * Behind the scenes it uses `fs.appendFileSync()`.
     * @remarks
     * Throws an error if the folder doesn't exist, unless ensureFolder=true.
     * @param filePath - The absolute or relative path of the file.
     * @param contents - The text that should be written to the file.
     * @param options - Optional settings that can change the behavior. Type: `IWriteFileOptions`
     */
    static appendToFile(filePath, contents, options) {
        FileSystem._wrapException(() => {
            options = Object.assign(Object.assign({}, APPEND_TO_FILE_DEFAULT_OPTIONS), options);
            if (options.convertLineEndings) {
                contents = Text_1.Text.convertTo(contents.toString(), options.convertLineEndings);
            }
            try {
                fsx.appendFileSync(filePath, contents, { encoding: options.encoding });
            }
            catch (error) {
                if (options.ensureFolderExists) {
                    if (!FileSystem.isNotExistError(error)) {
                        throw error;
                    }
                    const folderPath = nodeJsPath.dirname(filePath);
                    FileSystem.ensureFolder(folderPath);
                    fsx.appendFileSync(filePath, contents, { encoding: options.encoding });
                }
                else {
                    throw error;
                }
            }
        });
    }
    /**
     * An async version of {@link FileSystem.appendToFile}.
     */
    static async appendToFileAsync(filePath, contents, options) {
        await FileSystem._wrapExceptionAsync(async () => {
            options = Object.assign(Object.assign({}, APPEND_TO_FILE_DEFAULT_OPTIONS), options);
            if (options.convertLineEndings) {
                contents = Text_1.Text.convertTo(contents.toString(), options.convertLineEndings);
            }
            try {
                await fsx.appendFile(filePath, contents, { encoding: options.encoding });
            }
            catch (error) {
                if (options.ensureFolderExists) {
                    if (!FileSystem.isNotExistError(error)) {
                        throw error;
                    }
                    const folderPath = nodeJsPath.dirname(filePath);
                    await FileSystem.ensureFolderAsync(folderPath);
                    await fsx.appendFile(filePath, contents, { encoding: options.encoding });
                }
                else {
                    throw error;
                }
            }
        });
    }
    /**
     * Reads the contents of a file into a string.
     * Behind the scenes it uses `fs.readFileSync()`.
     * @param filePath - The relative or absolute path to the file whose contents should be read.
     * @param options - Optional settings that can change the behavior. Type: `IReadFileOptions`
     */
    static readFile(filePath, options) {
        return FileSystem._wrapException(() => {
            options = Object.assign(Object.assign({}, READ_FILE_DEFAULT_OPTIONS), options);
            let contents = FileSystem.readFileToBuffer(filePath).toString(options.encoding);
            if (options.convertLineEndings) {
                contents = Text_1.Text.convertTo(contents, options.convertLineEndings);
            }
            return contents;
        });
    }
    /**
     * An async version of {@link FileSystem.readFile}.
     */
    static async readFileAsync(filePath, options) {
        return await FileSystem._wrapExceptionAsync(async () => {
            options = Object.assign(Object.assign({}, READ_FILE_DEFAULT_OPTIONS), options);
            let contents = (await FileSystem.readFileToBufferAsync(filePath)).toString(options.encoding);
            if (options.convertLineEndings) {
                contents = Text_1.Text.convertTo(contents, options.convertLineEndings);
            }
            return contents;
        });
    }
    /**
     * Reads the contents of a file into a buffer.
     * Behind the scenes is uses `fs.readFileSync()`.
     * @param filePath - The relative or absolute path to the file whose contents should be read.
     */
    static readFileToBuffer(filePath) {
        return FileSystem._wrapException(() => {
            return fsx.readFileSync(filePath);
        });
    }
    /**
     * An async version of {@link FileSystem.readFileToBuffer}.
     */
    static async readFileToBufferAsync(filePath) {
        return await FileSystem._wrapExceptionAsync(() => {
            return fsx.readFile(filePath);
        });
    }
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
    static copyFile(options) {
        options = Object.assign(Object.assign({}, COPY_FILE_DEFAULT_OPTIONS), options);
        if (FileSystem.getStatistics(options.sourcePath).isDirectory()) {
            throw new Error('The specified path refers to a folder; this operation expects a file object:\n' + options.sourcePath);
        }
        FileSystem._wrapException(() => {
            fsx.copySync(options.sourcePath, options.destinationPath, {
                errorOnExist: options.alreadyExistsBehavior === "error" /* Error */,
                overwrite: options.alreadyExistsBehavior === "overwrite" /* Overwrite */
            });
        });
    }
    /**
     * An async version of {@link FileSystem.copyFile}.
     */
    static async copyFileAsync(options) {
        options = Object.assign(Object.assign({}, COPY_FILE_DEFAULT_OPTIONS), options);
        if (FileSystem.getStatistics(options.sourcePath).isDirectory()) {
            throw new Error('The specified path refers to a folder; this operation expects a file object:\n' + options.sourcePath);
        }
        await FileSystem._wrapExceptionAsync(() => {
            return fsx.copy(options.sourcePath, options.destinationPath, {
                errorOnExist: options.alreadyExistsBehavior === "error" /* Error */,
                overwrite: options.alreadyExistsBehavior === "overwrite" /* Overwrite */
            });
        });
    }
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
    static copyFiles(options) {
        options = Object.assign(Object.assign({}, COPY_FILES_DEFAULT_OPTIONS), options);
        FileSystem._wrapException(() => {
            fsx.copySync(options.sourcePath, options.destinationPath, {
                dereference: !!options.dereferenceSymlinks,
                errorOnExist: options.alreadyExistsBehavior === "error" /* Error */,
                overwrite: options.alreadyExistsBehavior === "overwrite" /* Overwrite */,
                preserveTimestamps: !!options.preserveTimestamps,
                filter: options.filter
            });
        });
    }
    /**
     * An async version of {@link FileSystem.copyFiles}.
     */
    static async copyFilesAsync(options) {
        options = Object.assign(Object.assign({}, COPY_FILES_DEFAULT_OPTIONS), options);
        await FileSystem._wrapExceptionAsync(async () => {
            fsx.copySync(options.sourcePath, options.destinationPath, {
                dereference: !!options.dereferenceSymlinks,
                errorOnExist: options.alreadyExistsBehavior === "error" /* Error */,
                overwrite: options.alreadyExistsBehavior === "overwrite" /* Overwrite */,
                preserveTimestamps: !!options.preserveTimestamps,
                filter: options.filter
            });
        });
    }
    /**
     * Deletes a file. Can optionally throw if the file doesn't exist.
     * Behind the scenes it uses `fs.unlinkSync()`.
     * @param filePath - The absolute or relative path to the file that should be deleted.
     * @param options - Optional settings that can change the behavior. Type: `IDeleteFileOptions`
     */
    static deleteFile(filePath, options) {
        FileSystem._wrapException(() => {
            options = Object.assign(Object.assign({}, DELETE_FILE_DEFAULT_OPTIONS), options);
            try {
                fsx.unlinkSync(filePath);
            }
            catch (error) {
                if (options.throwIfNotExists || !FileSystem.isNotExistError(error)) {
                    throw error;
                }
            }
        });
    }
    /**
     * An async version of {@link FileSystem.deleteFile}.
     */
    static async deleteFileAsync(filePath, options) {
        await FileSystem._wrapExceptionAsync(async () => {
            options = Object.assign(Object.assign({}, DELETE_FILE_DEFAULT_OPTIONS), options);
            try {
                await fsx.unlink(filePath);
            }
            catch (error) {
                if (options.throwIfNotExists || !FileSystem.isNotExistError(error)) {
                    throw error;
                }
            }
        });
    }
    // ===============
    // LINK OPERATIONS
    // ===============
    /**
     * Gets the statistics of a filesystem object. Does NOT follow the link to its target.
     * Behind the scenes it uses `fs.lstatSync()`.
     * @param path - The absolute or relative path to the filesystem object.
     */
    static getLinkStatistics(path) {
        return FileSystem._wrapException(() => {
            return fsx.lstatSync(path);
        });
    }
    /**
     * An async version of {@link FileSystem.getLinkStatistics}.
     */
    static async getLinkStatisticsAsync(path) {
        return await FileSystem._wrapExceptionAsync(() => {
            return fsx.lstat(path);
        });
    }
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
    static readLink(path) {
        return FileSystem._wrapException(() => {
            return fsx.readlinkSync(path);
        });
    }
    /**
     * An async version of {@link FileSystem.readLink}.
     */
    static async readLinkAsync(path) {
        return await FileSystem._wrapExceptionAsync(() => {
            return fsx.readlink(path);
        });
    }
    /**
     * Creates a Windows "directory junction". Behaves like `createSymbolicLinkToFile()` on other platforms.
     * Behind the scenes it uses `fs.symlinkSync()`.
     */
    static createSymbolicLinkJunction(options) {
        FileSystem._wrapException(() => {
            // For directories, we use a Windows "junction".  On POSIX operating systems, this produces a regular symlink.
            fsx.symlinkSync(options.linkTargetPath, options.newLinkPath, 'junction');
        });
    }
    /**
     * An async version of {@link FileSystem.createSymbolicLinkJunction}.
     */
    static async createSymbolicLinkJunctionAsync(options) {
        await FileSystem._wrapExceptionAsync(() => {
            // For directories, we use a Windows "junction".  On POSIX operating systems, this produces a regular symlink.
            return fsx.symlink(options.linkTargetPath, options.newLinkPath, 'junction');
        });
    }
    /**
     * Creates a symbolic link to a file (on Windows this requires elevated permissionsBits).
     * Behind the scenes it uses `fs.symlinkSync()`.
     */
    static createSymbolicLinkFile(options) {
        FileSystem._wrapException(() => {
            fsx.symlinkSync(options.linkTargetPath, options.newLinkPath, 'file');
        });
    }
    /**
     * An async version of {@link FileSystem.createSymbolicLinkFile}.
     */
    static async createSymbolicLinkFileAsync(options) {
        await FileSystem._wrapExceptionAsync(() => {
            return fsx.symlink(options.linkTargetPath, options.newLinkPath, 'file');
        });
    }
    /**
     * Creates a symbolic link to a folder (on Windows this requires elevated permissionsBits).
     * Behind the scenes it uses `fs.symlinkSync()`.
     */
    static createSymbolicLinkFolder(options) {
        FileSystem._wrapException(() => {
            fsx.symlinkSync(options.linkTargetPath, options.newLinkPath, 'dir');
        });
    }
    /**
     * An async version of {@link FileSystem.createSymbolicLinkFolder}.
     */
    static async createSymbolicLinkFolderAsync(options) {
        await FileSystem._wrapExceptionAsync(() => {
            return fsx.symlink(options.linkTargetPath, options.newLinkPath, 'dir');
        });
    }
    /**
     * Creates a hard link.
     * Behind the scenes it uses `fs.linkSync()`.
     */
    static createHardLink(options) {
        FileSystem._wrapException(() => {
            try {
                fsx.linkSync(options.linkTargetPath, options.newLinkPath);
            }
            catch (error) {
                if (error.code === 'EEXIST') {
                    switch (options.alreadyExistsBehavior) {
                        case "ignore" /* Ignore */:
                            return;
                        case "overwrite" /* Overwrite */:
                            this.deleteFile(options.newLinkPath);
                            break;
                        case "error" /* Error */:
                        default:
                            throw error;
                    }
                }
                else {
                    const linkTargetExists = FileSystem.exists(options.linkTargetPath);
                    if (FileSystem.isNotExistError(error) && linkTargetExists) {
                        this.ensureFolder(nodeJsPath.dirname(options.newLinkPath));
                        this.createHardLink(options);
                    }
                    else {
                        throw error;
                    }
                }
            }
        });
    }
    /**
     * An async version of {@link FileSystem.createHardLink}.
     */
    static async createHardLinkAsync(options) {
        await FileSystem._wrapExceptionAsync(async () => {
            try {
                await fsx.link(options.linkTargetPath, options.newLinkPath);
            }
            catch (error) {
                if (error.code === 'EEXIST') {
                    switch (options.alreadyExistsBehavior) {
                        case "ignore" /* Ignore */:
                            return;
                        case "overwrite" /* Overwrite */:
                            await this.deleteFileAsync(options.newLinkPath);
                            break;
                        case "error" /* Error */:
                        default:
                            throw error;
                    }
                }
                else {
                    const linkTargetExists = await FileSystem.exists(options.linkTargetPath);
                    if (FileSystem.isNotExistError(error) && linkTargetExists) {
                        await this.ensureFolderAsync(nodeJsPath.dirname(options.newLinkPath));
                        await this.createHardLinkAsync(options);
                    }
                    else {
                        throw error;
                    }
                }
            }
        });
    }
    /**
     * Follows a link to its destination and returns the absolute path to the final target of the link.
     * Behind the scenes it uses `fs.realpathSync()`.
     * @param linkPath - The path to the link.
     */
    static getRealPath(linkPath) {
        return FileSystem._wrapException(() => {
            return fsx.realpathSync(linkPath);
        });
    }
    /**
     * An async version of {@link FileSystem.getRealPath}.
     */
    static async getRealPathAsync(linkPath) {
        return await FileSystem._wrapExceptionAsync(() => {
            return fsx.realpath(linkPath);
        });
    }
    // ===============
    // UTILITY FUNCTIONS
    // ===============
    /**
     * Returns true if the error provided indicates the file or folder does not exist.
     */
    static isNotExistError(error) {
        return FileSystem.isFileDoesNotExistError(error) || FileSystem.isFolderDoesNotExistError(error);
    }
    /**
     * Returns true if the error provided indicates the file does not exist.
     */
    static isFileDoesNotExistError(error) {
        return FileSystem.isErrnoException(error) && error.code === 'ENOENT';
    }
    /**
     * Returns true if the error provided indicates the folder does not exist.
     */
    static isFolderDoesNotExistError(error) {
        return FileSystem.isErrnoException(error) && error.code === 'ENOTDIR';
    }
    /**
     * Detects if the provided error object is a `NodeJS.ErrnoException`
     */
    static isErrnoException(error) {
        const typedError = error;
        return (typeof typedError.code === 'string' &&
            typeof typedError.errno === 'number' &&
            typeof typedError.path === 'string' &&
            typeof typedError.syscall === 'string');
    }
    static _wrapException(fn) {
        try {
            return fn();
        }
        catch (error) {
            FileSystem._updateErrorMessage(error);
            throw error;
        }
    }
    static async _wrapExceptionAsync(fn) {
        try {
            return await fn();
        }
        catch (error) {
            FileSystem._updateErrorMessage(error);
            throw error;
        }
    }
    static _updateErrorMessage(error) {
        if (FileSystem.isErrnoException(error)) {
            if (FileSystem.isFileDoesNotExistError(error)) {
                // eslint-disable-line @typescript-eslint/no-use-before-define
                error.message = `File does not exist: ${error.path}\n${error.message}`;
            }
            else if (FileSystem.isFolderDoesNotExistError(error)) {
                // eslint-disable-line @typescript-eslint/no-use-before-define
                error.message = `Folder does not exist: ${error.path}\n${error.message}`;
            }
        }
    }
}
exports.FileSystem = FileSystem;
//# sourceMappingURL=FileSystem.js.map