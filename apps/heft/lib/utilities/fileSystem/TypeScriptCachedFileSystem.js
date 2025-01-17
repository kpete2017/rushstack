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
exports.TypeScriptCachedFileSystem = void 0;
const fs = __importStar(require("fs"));
const node_core_library_1 = require("@rushstack/node-core-library");
/**
 * This is a FileSystem API (largely unrelated to the @rushstack/node-core-library FileSystem API)
 * that provides caching to the Heft TypeScriptBuilder.
 * It uses an in-memory cache to avoid requests against the disk. It assumes that the disk stays
 * static after construction, except for writes performed through the TypeScriptCachedFileSystem
 * instance.
 */
class TypeScriptCachedFileSystem {
    constructor() {
        this._statsCache = new Map();
        this._readFolderCache = new Map();
        this._readFileCache = new Map();
        this._realPathCache = new Map();
        this.exists = (path) => {
            try {
                this.getStatistics(path);
                return true;
            }
            catch (e) {
                if (node_core_library_1.FileSystem.isNotExistError(e)) {
                    return false;
                }
                else {
                    throw e;
                }
            }
        };
        this.getStatistics = (path) => {
            return this._withCaching(path, node_core_library_1.FileSystem.getStatistics, this._statsCache);
        };
        this.ensureFolder = (folderPath) => {
            var _a, _b;
            if (!((_a = this._readFolderCache.get(folderPath)) === null || _a === void 0 ? void 0 : _a.entry) && !((_b = this._statsCache.get(folderPath)) === null || _b === void 0 ? void 0 : _b.entry)) {
                node_core_library_1.FileSystem.ensureFolder(folderPath);
                this._invalidateCacheEntry(folderPath);
            }
        };
        this.ensureFolderAsync = async (folderPath) => {
            var _a, _b;
            if (!((_a = this._readFolderCache.get(folderPath)) === null || _a === void 0 ? void 0 : _a.entry) && !((_b = this._statsCache.get(folderPath)) === null || _b === void 0 ? void 0 : _b.entry)) {
                await node_core_library_1.FileSystem.ensureFolderAsync(folderPath);
                this._invalidateCacheEntry(folderPath);
            }
        };
        this.writeFile = (filePath, contents, options) => {
            node_core_library_1.FileSystem.writeFile(filePath, contents, options);
            this._invalidateCacheEntry(filePath);
        };
        this.readFile = (filePath, options) => {
            let contents = this.readFileToBuffer(filePath).toString((options === null || options === void 0 ? void 0 : options.encoding) || "utf8" /* Utf8 */);
            if (options === null || options === void 0 ? void 0 : options.convertLineEndings) {
                contents = node_core_library_1.Text.convertTo(contents, options.convertLineEndings);
            }
            return contents;
        };
        this.readFileToBuffer = (filePath) => {
            return this._withCaching(filePath, node_core_library_1.FileSystem.readFileToBuffer, this._readFileCache);
        };
        this.copyFileAsync = async (options) => {
            await node_core_library_1.FileSystem.copyFileAsync(options);
            this._invalidateCacheEntry(options.destinationPath);
        };
        this.deleteFile = (filePath, options) => {
            var _a;
            const cachedError = (_a = this._statsCache.get(filePath)) === null || _a === void 0 ? void 0 : _a.error;
            if (!cachedError || !node_core_library_1.FileSystem.isFileDoesNotExistError(cachedError)) {
                node_core_library_1.FileSystem.deleteFile(filePath);
                this._invalidateCacheEntry(filePath);
            }
            else if (options === null || options === void 0 ? void 0 : options.throwIfNotExists) {
                throw cachedError;
            }
        };
        this.createHardLinkAsync = async (options) => {
            await node_core_library_1.FileSystem.createHardLinkAsync(options);
            this._invalidateCacheEntry(options.newLinkPath);
        };
        this.getRealPath = (linkPath) => {
            return this._withCaching(linkPath, node_core_library_1.FileSystem.getRealPath, this._realPathCache);
        };
        this.readFolderFilesAndDirectories = (folderPath) => {
            return this._withCaching(folderPath, (path) => {
                // TODO: Replace this with a FileSystem API
                const folderEntries = fs.readdirSync(path, { withFileTypes: true });
                return this._sortFolderEntries(folderEntries);
            }, this._readFolderCache);
        };
    }
    _sortFolderEntries(folderEntries) {
        // TypeScript expects entries sorted ordinally by name
        // In practice this might not matter
        folderEntries.sort((a, b) => node_core_library_1.Sort.compareByValue(a, b));
        const files = [];
        const directories = [];
        for (const folderEntry of folderEntries) {
            if (folderEntry.isFile()) {
                files.push(folderEntry.name);
            }
            else if (folderEntry.isDirectory()) {
                directories.push(folderEntry.name);
            }
        }
        return { files, directories };
    }
    _withCaching(path, fn, cache) {
        let cacheEntry = cache.get(path);
        if (!cacheEntry) {
            try {
                cacheEntry = { entry: fn(path) };
            }
            catch (e) {
                cacheEntry = { error: e, entry: undefined };
            }
            cache.set(path, cacheEntry);
        }
        if (cacheEntry.entry) {
            return cacheEntry.entry;
        }
        else {
            throw cacheEntry.error;
        }
    }
    _invalidateCacheEntry(path) {
        this._statsCache.delete(path);
        this._readFolderCache.delete(path);
        this._readFileCache.delete(path);
        this._realPathCache.delete(path);
    }
}
exports.TypeScriptCachedFileSystem = TypeScriptCachedFileSystem;
//# sourceMappingURL=TypeScriptCachedFileSystem.js.map