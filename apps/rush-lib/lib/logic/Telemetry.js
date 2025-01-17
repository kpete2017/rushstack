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
exports.Telemetry = void 0;
const path = __importStar(require("path"));
const node_core_library_1 = require("@rushstack/node-core-library");
const Rush_1 = require("../api/Rush");
const lodash = node_core_library_1.Import.lazy('lodash', require);
const MAX_FILE_COUNT = 100;
class Telemetry {
    constructor(rushConfiguration) {
        this._rushConfiguration = rushConfiguration;
        this._enabled = this._rushConfiguration.telemetryEnabled;
        this._store = [];
        const folderName = 'telemetry';
        this._dataFolder = path.join(this._rushConfiguration.commonTempFolder, folderName);
    }
    log(telemetryData) {
        if (!this._enabled) {
            return;
        }
        const data = lodash.cloneDeep(telemetryData);
        data.timestamp = data.timestamp || new Date().getTime();
        data.platform = data.platform || process.platform;
        data.rushVersion = data.rushVersion || Rush_1.Rush.version;
        this._store.push(data);
    }
    flush(writeFile = node_core_library_1.FileSystem.writeFile) {
        if (!this._enabled || this._store.length === 0) {
            return;
        }
        const fullPath = this._getFilePath();
        node_core_library_1.FileSystem.ensureFolder(this._dataFolder);
        writeFile(fullPath, JSON.stringify(this._store));
        this._store = [];
        this._cleanUp();
    }
    get store() {
        return this._store;
    }
    /**
     * When there are too many log files, delete the old ones.
     */
    _cleanUp() {
        if (node_core_library_1.FileSystem.exists(this._dataFolder)) {
            const files = node_core_library_1.FileSystem.readFolder(this._dataFolder);
            if (files.length > MAX_FILE_COUNT) {
                const sortedFiles = files
                    .map((fileName) => {
                    const filePath = path.join(this._dataFolder, fileName);
                    const stats = node_core_library_1.FileSystem.getStatistics(filePath);
                    return {
                        filePath: filePath,
                        modifiedTime: stats.mtime.getTime(),
                        isFile: stats.isFile()
                    };
                })
                    .filter((value) => {
                    // Only delete files
                    return value.isFile;
                })
                    .sort((a, b) => {
                    return a.modifiedTime - b.modifiedTime;
                })
                    .map((s) => {
                    return s.filePath;
                });
                const filesToDelete = sortedFiles.length - MAX_FILE_COUNT;
                for (let i = 0; i < filesToDelete; i++) {
                    node_core_library_1.FileSystem.deleteFile(sortedFiles[i]);
                }
            }
        }
    }
    _getFilePath() {
        let fileName = `telemetry_${new Date().toISOString()}`;
        fileName = fileName.replace(/[\-\:\.]/g, '_') + '.json';
        return path.join(this._dataFolder, fileName);
    }
}
exports.Telemetry = Telemetry;
//# sourceMappingURL=Telemetry.js.map