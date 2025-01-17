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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteGlobsPlugin = void 0;
const path = __importStar(require("path"));
const glob_1 = __importDefault(require("glob"));
const node_core_library_1 = require("@rushstack/node-core-library");
const HeftEventPluginBase_1 = require("../pluginFramework/HeftEventPluginBase");
const Async_1 = require("../utilities/Async");
const Constants_1 = require("../utilities/Constants");
const globEscape = require('glob-escape'); // No @types/glob-escape package exists
class DeleteGlobsPlugin extends HeftEventPluginBase_1.HeftEventPluginBase {
    constructor() {
        super(...arguments);
        this.pluginName = 'DeleteGlobsPlugin';
        this.eventActionName = 'deleteGlobs';
        this.loggerName = 'delete-globs';
    }
    /**
     * @override
     */
    async handleCleanEventActionsAsync(heftEvent, heftEventActions, logger, heftSession, heftConfiguration, properties) {
        await this._runDeleteForHeftEventActions(heftEventActions, logger, heftConfiguration, properties.pathsToDelete);
    }
    /**
     * @override
     */
    async handleBuildEventActionsAsync(heftEvent, heftEventActions, logger, heftSession, heftConfiguration, properties) {
        await this._runDeleteForHeftEventActions(heftEventActions, logger, heftConfiguration);
    }
    async _runDeleteForHeftEventActions(heftEventActions, logger, heftConfiguration, additionalPathsToDelete) {
        let deletedFiles = 0;
        let deletedFolders = 0;
        const pathsToDelete = new Set(additionalPathsToDelete);
        for (const deleteGlobsEventAction of heftEventActions) {
            for (const globPattern of deleteGlobsEventAction.globsToDelete) {
                const resolvedPaths = await this._resolvePathAsync(globPattern, heftConfiguration.buildFolder);
                for (const resolvedPath of resolvedPaths) {
                    pathsToDelete.add(resolvedPath);
                }
            }
        }
        await Async_1.Async.forEachLimitAsync(Array.from(pathsToDelete), Constants_1.Constants.maxParallelism, async (pathToDelete) => {
            try {
                node_core_library_1.FileSystem.deleteFile(pathToDelete, { throwIfNotExists: true });
                logger.terminal.writeVerboseLine(`Deleted "${pathToDelete}"`);
                deletedFiles++;
            }
            catch (error) {
                if (node_core_library_1.FileSystem.exists(pathToDelete)) {
                    node_core_library_1.FileSystem.deleteFolder(pathToDelete);
                    logger.terminal.writeVerboseLine(`Deleted folder "${pathToDelete}"`);
                    deletedFolders++;
                }
            }
        });
        if (deletedFiles > 0 || deletedFolders > 0) {
            logger.terminal.writeLine(`Deleted ${deletedFiles} file${deletedFiles !== 1 ? 's' : ''} ` +
                `and ${deletedFolders} folder${deletedFolders !== 1 ? 's' : ''}`);
        }
    }
    async _resolvePathAsync(globPattern, buildFolder) {
        if (globEscape(globPattern) !== globPattern) {
            const expandedGlob = await node_core_library_1.LegacyAdapters.convertCallbackToPromise(glob_1.default, globPattern, {
                cwd: buildFolder
            });
            const result = [];
            for (const pathFromGlob of expandedGlob) {
                result.push(path.resolve(buildFolder, pathFromGlob));
            }
            return result;
        }
        else {
            return [path.resolve(buildFolder, globPattern)];
        }
    }
}
exports.DeleteGlobsPlugin = DeleteGlobsPlugin;
//# sourceMappingURL=DeleteGlobsPlugin.js.map