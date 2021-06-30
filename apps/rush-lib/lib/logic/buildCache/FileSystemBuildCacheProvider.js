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
exports.FileSystemBuildCacheProvider = void 0;
const path = __importStar(require("path"));
const node_core_library_1 = require("@rushstack/node-core-library");
const DEFAULT_BUILD_CACHE_FOLDER_NAME = 'build-cache';
class FileSystemBuildCacheProvider {
    constructor(options) {
        this._cacheFolderPath =
            options.rushUserConfiguration.buildCacheFolder ||
                path.join(options.rushConfiguration.commonTempFolder, DEFAULT_BUILD_CACHE_FOLDER_NAME);
    }
    getCacheEntryPath(cacheId) {
        return path.join(this._cacheFolderPath, cacheId);
    }
    async tryGetCacheEntryPathByIdAsync(terminal, cacheId) {
        const cacheEntryFilePath = this.getCacheEntryPath(cacheId);
        if (await node_core_library_1.FileSystem.existsAsync(cacheEntryFilePath)) {
            return cacheEntryFilePath;
        }
        else {
            return undefined;
        }
    }
    async trySetCacheEntryBufferAsync(terminal, cacheId, entryBuffer) {
        const cacheEntryFilePath = this.getCacheEntryPath(cacheId);
        await node_core_library_1.FileSystem.writeFileAsync(cacheEntryFilePath, entryBuffer, { ensureFolderExists: true });
        terminal.writeVerboseLine(`Wrote cache entry to "${cacheEntryFilePath}".`);
        return cacheEntryFilePath;
    }
}
exports.FileSystemBuildCacheProvider = FileSystemBuildCacheProvider;
//# sourceMappingURL=FileSystemBuildCacheProvider.js.map