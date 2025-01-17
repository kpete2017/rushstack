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
exports.CopyFilesPlugin = void 0;
const chokidar = __importStar(require("chokidar"));
const path = __importStar(require("path"));
const fast_glob_1 = __importDefault(require("fast-glob"));
const perf_hooks_1 = require("perf_hooks");
const node_core_library_1 = require("@rushstack/node-core-library");
const HeftEventPluginBase_1 = require("../pluginFramework/HeftEventPluginBase");
const Async_1 = require("../utilities/Async");
const Constants_1 = require("../utilities/Constants");
class CopyFilesPlugin extends HeftEventPluginBase_1.HeftEventPluginBase {
    constructor() {
        super(...arguments);
        this.pluginName = 'CopyFilesPlugin';
        this.eventActionName = 'copyFiles';
        this.loggerName = 'copy-files';
    }
    /**
     * @override
     */
    async handleBuildEventActionsAsync(heftEvent, heftEventActions, logger, heftSession, heftConfiguration, properties) {
        await this._runCopyFilesForHeftEventActions(heftEventActions, logger, heftConfiguration);
    }
    async _runCopyFilesForHeftEventActions(heftEventActions, logger, heftConfiguration) {
        const copyConfigurations = [];
        for (const copyFilesEventAction of heftEventActions) {
            for (const copyOperation of copyFilesEventAction.copyOperations) {
                copyConfigurations.push(Object.assign(Object.assign({}, copyOperation), { resolvedDestinationFolderPaths: copyOperation.destinationFolders.map((destinationFolder) => path.join(heftConfiguration.buildFolder, destinationFolder)) }));
            }
        }
        await this.runCopyAsync({
            buildFolder: heftConfiguration.buildFolder,
            copyConfigurations,
            logger,
            watchMode: false
        });
    }
    async runCopyAsync(options) {
        const { logger, buildFolder, copyConfigurations } = options;
        const startTime = perf_hooks_1.performance.now();
        const copyDescriptors = await this._getCopyFileDescriptorsAsync(buildFolder, copyConfigurations);
        if (copyDescriptors.length === 0) {
            // No need to run copy and print to console
            return;
        }
        const { copiedFileCount, linkedFileCount } = await this._copyFilesAsync(copyDescriptors);
        const duration = perf_hooks_1.performance.now() - startTime;
        logger.terminal.writeLine(`Copied ${copiedFileCount} file${copiedFileCount === 1 ? '' : 's'} and ` +
            `linked ${linkedFileCount} file${linkedFileCount === 1 ? '' : 's'} in ${Math.round(duration)}ms`);
        // Then enter watch mode if requested
        if (options.watchMode) {
            Async_1.Async.runWatcherWithErrorHandling(async () => await this._runWatchAsync(options), logger);
        }
    }
    async _copyFilesAsync(copyDescriptors) {
        if (copyDescriptors.length === 0) {
            return { copiedFileCount: 0, linkedFileCount: 0 };
        }
        let copiedFileCount = 0;
        let linkedFileCount = 0;
        await Async_1.Async.forEachLimitAsync(copyDescriptors, Constants_1.Constants.maxParallelism, async (copyDescriptor) => {
            if (copyDescriptor.hardlink) {
                linkedFileCount++;
                await node_core_library_1.FileSystem.createHardLinkAsync({
                    linkTargetPath: copyDescriptor.sourceFilePath,
                    newLinkPath: copyDescriptor.destinationFilePath,
                    alreadyExistsBehavior: "overwrite" /* Overwrite */
                });
            }
            else {
                copiedFileCount++;
                await node_core_library_1.FileSystem.copyFileAsync({
                    sourcePath: copyDescriptor.sourceFilePath,
                    destinationPath: copyDescriptor.destinationFilePath,
                    alreadyExistsBehavior: "overwrite" /* Overwrite */
                });
            }
        });
        return {
            copiedFileCount,
            linkedFileCount
        };
    }
    async _getCopyFileDescriptorsAsync(buildFolder, copyConfigurations) {
        const processedCopyDescriptors = [];
        // Create a map to deduplicate and prevent double-writes
        // resolvedDestinationFilePath -> descriptor
        const destinationCopyDescriptors = new Map();
        for (const copyConfiguration of copyConfigurations) {
            // Resolve the source folder path which is where the glob will be run from
            const resolvedSourceFolderPath = path.resolve(buildFolder, copyConfiguration.sourceFolder);
            const sourceFileRelativePaths = new Set(await fast_glob_1.default(this._getIncludedGlobPatterns(copyConfiguration), {
                cwd: resolvedSourceFolderPath,
                ignore: copyConfiguration.excludeGlobs,
                dot: true,
                onlyFiles: true
            }));
            // Dedupe and throw if a double-write is detected
            for (const destinationFolderPath of copyConfiguration.resolvedDestinationFolderPaths) {
                for (const sourceFileRelativePath of sourceFileRelativePaths) {
                    // Only include the relative path from the sourceFolder if flatten is false
                    const resolvedSourceFilePath = path.join(resolvedSourceFolderPath, sourceFileRelativePath);
                    const resolvedDestinationFilePath = path.resolve(destinationFolderPath, copyConfiguration.flatten ? '.' : path.dirname(sourceFileRelativePath), path.basename(sourceFileRelativePath));
                    // Throw if a duplicate copy target with a different source or options is specified
                    const existingDestinationCopyDescriptor = destinationCopyDescriptors.get(resolvedDestinationFilePath);
                    if (existingDestinationCopyDescriptor) {
                        if (existingDestinationCopyDescriptor.sourceFilePath === resolvedSourceFilePath &&
                            existingDestinationCopyDescriptor.hardlink === !!copyConfiguration.hardlink) {
                            // Found a duplicate, avoid adding again
                            continue;
                        }
                        throw new Error(`Cannot copy different files to the same destination "${resolvedDestinationFilePath}"`);
                    }
                    // Finally, default hardlink to false, add to the result, and add to the map for deduping
                    const processedCopyDescriptor = {
                        sourceFilePath: resolvedSourceFilePath,
                        destinationFilePath: resolvedDestinationFilePath,
                        hardlink: !!copyConfiguration.hardlink
                    };
                    processedCopyDescriptors.push(processedCopyDescriptor);
                    destinationCopyDescriptors.set(resolvedDestinationFilePath, processedCopyDescriptor);
                }
            }
        }
        // We're done with the map, grab the values and return
        return processedCopyDescriptors;
    }
    _getIncludedGlobPatterns(copyConfiguration) {
        const patternsToGlob = new Set();
        // Glob file extensions with a specific glob to increase perf
        const escapedFileExtensions = new Set();
        for (const fileExtension of copyConfiguration.fileExtensions || []) {
            let escapedFileExtension;
            if (fileExtension.charAt(0) === '.') {
                escapedFileExtension = fileExtension.substr(1);
            }
            else {
                escapedFileExtension = fileExtension;
            }
            escapedFileExtension = fast_glob_1.default.escapePath(escapedFileExtension);
            escapedFileExtensions.add(escapedFileExtension);
        }
        if (escapedFileExtensions.size > 1) {
            patternsToGlob.add(`**/*.{${Array.from(escapedFileExtensions).join(',')}}`);
        }
        else if (escapedFileExtensions.size === 1) {
            patternsToGlob.add(`**/*.${Array.from(escapedFileExtensions)[0]}`);
        }
        // Now include the other globs as well
        for (const include of copyConfiguration.includeGlobs || []) {
            patternsToGlob.add(include);
        }
        return Array.from(patternsToGlob);
    }
    async _runWatchAsync(options) {
        const { buildFolder, copyConfigurations, logger } = options;
        for (const copyConfiguration of copyConfigurations) {
            // Obtain the glob patterns to provide to the watcher
            const globsToWatch = this._getIncludedGlobPatterns(copyConfiguration);
            if (globsToWatch.length) {
                const resolvedSourceFolderPath = path.join(buildFolder, copyConfiguration.sourceFolder);
                const watcher = chokidar.watch(globsToWatch, {
                    cwd: resolvedSourceFolderPath,
                    ignoreInitial: true,
                    ignored: copyConfiguration.excludeGlobs
                });
                const copyAsset = async (relativeAssetPath) => {
                    const { copiedFileCount, linkedFileCount } = await this._copyFilesAsync(copyConfiguration.resolvedDestinationFolderPaths.map((resolvedDestinationFolderPath) => {
                        return {
                            sourceFilePath: path.join(resolvedSourceFolderPath, relativeAssetPath),
                            destinationFilePath: path.join(resolvedDestinationFolderPath, copyConfiguration.flatten ? path.basename(relativeAssetPath) : relativeAssetPath),
                            hardlink: !!copyConfiguration.hardlink
                        };
                    }));
                    logger.terminal.writeLine(copyConfiguration.hardlink
                        ? `Linked ${linkedFileCount} file${linkedFileCount === 1 ? '' : 's'}`
                        : `Copied ${copiedFileCount} file${copiedFileCount === 1 ? '' : 's'}`);
                };
                const deleteAsset = async (relativeAssetPath) => {
                    const deletePromises = copyConfiguration.resolvedDestinationFolderPaths.map((resolvedDestinationFolderPath) => node_core_library_1.FileSystem.deleteFileAsync(path.resolve(resolvedDestinationFolderPath, relativeAssetPath)));
                    await Promise.all(deletePromises);
                    logger.terminal.writeLine(`Deleted ${deletePromises.length} file${deletePromises.length === 1 ? '' : 's'}`);
                };
                watcher.on('add', copyAsset);
                watcher.on('change', copyAsset);
                watcher.on('unlink', deleteAsset);
            }
        }
        return new Promise(() => {
            /* never resolve */
        });
    }
}
exports.CopyFilesPlugin = CopyFilesPlugin;
//# sourceMappingURL=CopyFilesPlugin.js.map