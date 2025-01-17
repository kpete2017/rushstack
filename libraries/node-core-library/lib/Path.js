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
exports.Path = void 0;
const path = __importStar(require("path"));
const Text_1 = require("./Text");
/**
 * Common operations for manipulating file and directory paths.
 * @remarks
 * This API is intended to eventually be a complete replacement for the NodeJS "path" API.
 * @public
 */
class Path {
    /**
     * Returns true if "childPath" is located inside the "parentFolderPath" folder
     * or one of its child folders.  Note that "parentFolderPath" is not considered to be
     * under itself.  The "childPath" can refer to any type of file system object.
     *
     * @remarks
     * The indicated file/folder objects are not required to actually exist on disk.
     * For example, "parentFolderPath" is interpreted as a folder name even if it refers to a file.
     * If the paths are relative, they will first be resolved using path.resolve().
     */
    static isUnder(childPath, parentFolderPath) {
        // If childPath is under parentPath, then relativePath will be something like
        // "../.." or "..\\..", which consists entirely of periods and slashes.
        // (Note that something like "....t" is actually a valid filename, but "...." is not.)
        const relativePath = path.relative(childPath, parentFolderPath);
        return Path._relativePathRegex.test(relativePath);
    }
    /**
     * Returns true if "childPath" is equal to "parentFolderPath", or if it is inside that folder
     * or one of its children.  The "childPath" can refer to any type of file system object.
     *
     * @remarks
     * The indicated file/folder objects are not required to actually exist on disk.
     * For example, "parentFolderPath" is interpreted as a folder name even if it refers to a file.
     * If the paths are relative, they will first be resolved using path.resolve().
     */
    static isUnderOrEqual(childPath, parentFolderPath) {
        const relativePath = path.relative(childPath, parentFolderPath);
        return relativePath === '' || Path._relativePathRegex.test(relativePath);
    }
    /**
     * Returns true if `path1` and `path2` refer to the same underlying path.
     *
     * @remarks
     *
     * The comparison is performed using `path.relative()`.
     */
    static isEqual(path1, path2) {
        return path.relative(path1, path2) === '';
    }
    /**
     * Formats a path to look nice for reporting purposes.
     * @remarks
     * If `pathToConvert` is under the `baseFolder`, then it will be converted to a relative with the `./` prefix.
     * Otherwise, it will be converted to an absolute path.
     *
     * Backslashes will be converted to slashes, unless the path starts with an OS-specific string like `C:\`.
     */
    static formatConcisely(options) {
        // Same logic as Path.isUnderOrEqual()
        const relativePath = path.relative(options.pathToConvert, options.baseFolder);
        const isUnderOrEqual = relativePath === '' || Path._relativePathRegex.test(relativePath);
        if (isUnderOrEqual) {
            // Note that isUnderOrEqual()'s relativePath is the reverse direction
            return './' + Path.convertToSlashes(path.relative(options.baseFolder, options.pathToConvert));
        }
        const absolutePath = path.resolve(options.pathToConvert);
        return absolutePath;
    }
    /**
     * Replaces Windows-style backslashes with POSIX-style slashes.
     *
     * @remarks
     * POSIX is a registered trademark of the Institute of Electrical and Electronic Engineers, Inc.
     */
    static convertToSlashes(inputPath) {
        return Text_1.Text.replaceAll(inputPath, '\\', '/');
    }
    /**
     * Replaces POSIX-style slashes with Windows-style backslashes
     *
     * @remarks
     * POSIX is a registered trademark of the Institute of Electrical and Electronic Engineers, Inc.
     */
    static convertToBackslashes(inputPath) {
        return Text_1.Text.replaceAll(inputPath, '/', '\\');
    }
    /**
     * Returns true if the specified path is a relative path and does not use `..` to walk upwards.
     *
     * @example
     * ```ts
     * // These evaluate to true
     * isDownwardRelative('folder');
     * isDownwardRelative('file');
     * isDownwardRelative('folder/');
     * isDownwardRelative('./folder/');
     * isDownwardRelative('./folder/file');
     *
     * // These evaluate to false
     * isDownwardRelative('../folder');
     * isDownwardRelative('folder/../file');
     * isDownwardRelative('/folder/file');
     * ```
     */
    static isDownwardRelative(inputPath) {
        if (path.isAbsolute(inputPath)) {
            return false;
        }
        // Does it contain ".."
        if (Path._upwardPathSegmentRegex.test(inputPath)) {
            return false;
        }
        return true;
    }
}
exports.Path = Path;
// Matches a relative path consisting entirely of periods and slashes
// Example: ".", "..", "../..", etc
Path._relativePathRegex = /^[.\/\\]+$/;
// Matches a relative path segment that traverses upwards
// Example: "a/../b"
Path._upwardPathSegmentRegex = /([\/\\]|^)\.\.([\/\\]|$)/;
//# sourceMappingURL=Path.js.map