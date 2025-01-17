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
exports.TypeScriptPlugin = void 0;
const path = __importStar(require("path"));
const node_core_library_1 = require("@rushstack/node-core-library");
const TypeScriptBuilder_1 = require("./TypeScriptBuilder");
const CoreConfigFiles_1 = require("../../utilities/CoreConfigFiles");
const PLUGIN_NAME = 'typescript';
class TypeScriptPlugin {
    constructor(taskPackageResolver) {
        this.pluginName = PLUGIN_NAME;
        this._typeScriptConfigurationFileCache = new Map();
        this._taskPackageResolver = taskPackageResolver;
    }
    apply(heftSession, heftConfiguration) {
        const logger = heftSession.requestScopedLogger('TypeScript Plugin');
        heftSession.hooks.clean.tap(PLUGIN_NAME, (clean) => {
            clean.hooks.loadStageConfiguration.tapPromise(PLUGIN_NAME, async () => {
                await this._updateCleanOptions(logger, heftConfiguration, clean.properties);
            });
        });
        heftSession.hooks.build.tap(PLUGIN_NAME, (build) => {
            build.hooks.compile.tap(PLUGIN_NAME, (compile) => {
                compile.hooks.run.tapPromise(PLUGIN_NAME, async () => {
                    await new Promise((resolve, reject) => {
                        let isFirstEmit = true;
                        this._runTypeScriptAsync(logger, {
                            heftSession,
                            heftConfiguration,
                            buildProperties: build.properties,
                            watchMode: build.properties.watchMode,
                            emitCallback: () => {
                                if (isFirstEmit) {
                                    isFirstEmit = false;
                                    // In watch mode, `_runTypeScriptAsync` will never resolve so we need to resolve the promise here
                                    // to allow the build to move on to the `afterCompile` substage.
                                    if (build.properties.watchMode) {
                                        resolve();
                                    }
                                }
                                else {
                                    compile.hooks.afterRecompile.promise().catch((error) => {
                                        heftConfiguration.globalTerminal.writeErrorLine(`An error occurred in an afterRecompile hook: ${error}`);
                                    });
                                }
                            }
                        })
                            .then(resolve)
                            .catch(reject);
                    });
                });
            });
        });
    }
    async _ensureConfigFileLoadedAsync(terminal, heftConfiguration) {
        const buildFolder = heftConfiguration.buildFolder;
        let typescriptConfigurationFileCacheEntry = this._typeScriptConfigurationFileCache.get(buildFolder);
        if (!typescriptConfigurationFileCacheEntry) {
            typescriptConfigurationFileCacheEntry = {
                configurationFile: await CoreConfigFiles_1.CoreConfigFiles.typeScriptConfigurationFileLoader.tryLoadConfigurationFileForProjectAsync(terminal, buildFolder, heftConfiguration.rigConfig)
            };
            this._typeScriptConfigurationFileCache.set(buildFolder, typescriptConfigurationFileCacheEntry);
        }
        return typescriptConfigurationFileCacheEntry.configurationFile;
    }
    async _updateCleanOptions(logger, heftConfiguration, cleanProperties) {
        const configurationFile = await this._ensureConfigFileLoadedAsync(logger.terminal, heftConfiguration);
        if (configurationFile === null || configurationFile === void 0 ? void 0 : configurationFile.additionalModuleKindsToEmit) {
            for (const additionalModuleKindToEmit of configurationFile.additionalModuleKindsToEmit) {
                cleanProperties.pathsToDelete.add(path.resolve(heftConfiguration.buildFolder, additionalModuleKindToEmit.outFolderName));
            }
        }
    }
    async _runTypeScriptAsync(logger, options) {
        const { heftSession, heftConfiguration, buildProperties, watchMode } = options;
        const typescriptConfigurationJson = await this._ensureConfigFileLoadedAsync(logger.terminal, heftConfiguration);
        const tsconfigFilePath = `${heftConfiguration.buildFolder}/tsconfig.json`;
        buildProperties.isTypeScriptProject = await node_core_library_1.FileSystem.existsAsync(tsconfigFilePath);
        if (!buildProperties.isTypeScriptProject) {
            // If there are no TSConfig, we have nothing to do
            return;
        }
        const typeScriptConfiguration = {
            copyFromCacheMode: typescriptConfigurationJson === null || typescriptConfigurationJson === void 0 ? void 0 : typescriptConfigurationJson.copyFromCacheMode,
            additionalModuleKindsToEmit: typescriptConfigurationJson === null || typescriptConfigurationJson === void 0 ? void 0 : typescriptConfigurationJson.additionalModuleKindsToEmit,
            emitCjsExtensionForCommonJS: typescriptConfigurationJson === null || typescriptConfigurationJson === void 0 ? void 0 : typescriptConfigurationJson.emitCjsExtensionForCommonJS,
            emitMjsExtensionForESModule: typescriptConfigurationJson === null || typescriptConfigurationJson === void 0 ? void 0 : typescriptConfigurationJson.emitMjsExtensionForESModule,
            emitFolderNameForTests: typescriptConfigurationJson === null || typescriptConfigurationJson === void 0 ? void 0 : typescriptConfigurationJson.emitFolderNameForTests,
            maxWriteParallelism: (typescriptConfigurationJson === null || typescriptConfigurationJson === void 0 ? void 0 : typescriptConfigurationJson.maxWriteParallelism) || 50,
            isLintingEnabled: !(buildProperties.lite || (typescriptConfigurationJson === null || typescriptConfigurationJson === void 0 ? void 0 : typescriptConfigurationJson.disableTslint))
        };
        if (heftConfiguration.projectPackageJson.private !== true) {
            if (typeScriptConfiguration.copyFromCacheMode === undefined) {
                logger.terminal.writeVerboseLine('Setting TypeScript copyFromCacheMode to "copy" because the "private" field ' +
                    'in package.json is not set to true. Linked files are not handled correctly ' +
                    'when package are packed for publishing.');
                // Copy if the package is intended to be published
                typeScriptConfiguration.copyFromCacheMode = 'copy';
            }
            else if (typeScriptConfiguration.copyFromCacheMode !== 'copy') {
                logger.emitWarning(new Error(`The TypeScript copyFromCacheMode is set to "${typeScriptConfiguration.copyFromCacheMode}", ` +
                    'but the the "private" field in package.json is not set to true. ' +
                    'Linked files are not handled correctly when packages are packed for publishing.'));
            }
        }
        const toolPackageResolution = await this._taskPackageResolver.resolveToolPackagesAsync(heftConfiguration, logger.terminal);
        if (!toolPackageResolution.typeScriptPackagePath) {
            throw new Error('Unable to resolve a TypeScript compiler package');
        }
        // Set some properties used by the Jest plugin
        buildProperties.emitFolderNameForTests = typeScriptConfiguration.emitFolderNameForTests || 'lib';
        buildProperties.emitExtensionForTests = typeScriptConfiguration.emitCjsExtensionForCommonJS
            ? '.cjs'
            : '.js';
        const typeScriptBuilderConfiguration = {
            buildFolder: heftConfiguration.buildFolder,
            typeScriptToolPath: toolPackageResolution.typeScriptPackagePath,
            tslintToolPath: toolPackageResolution.tslintPackagePath,
            eslintToolPath: toolPackageResolution.eslintPackagePath,
            tsconfigPath: tsconfigFilePath,
            lintingEnabled: !!typeScriptConfiguration.isLintingEnabled,
            buildCacheFolder: heftConfiguration.buildCacheFolder,
            additionalModuleKindsToEmit: typeScriptConfiguration.additionalModuleKindsToEmit,
            emitCjsExtensionForCommonJS: !!typeScriptConfiguration.emitCjsExtensionForCommonJS,
            emitMjsExtensionForESModule: !!typeScriptConfiguration.emitMjsExtensionForESModule,
            copyFromCacheMode: typeScriptConfiguration.copyFromCacheMode,
            watchMode: watchMode,
            maxWriteParallelism: typeScriptConfiguration.maxWriteParallelism
        };
        const typeScriptBuilder = new TypeScriptBuilder_1.TypeScriptBuilder(heftConfiguration.terminalProvider, typeScriptBuilderConfiguration, heftSession, options.emitCallback);
        if (heftSession.debugMode) {
            await typeScriptBuilder.invokeAsync();
        }
        else {
            await typeScriptBuilder.invokeAsSubprocessAsync();
        }
    }
}
exports.TypeScriptPlugin = TypeScriptPlugin;
//# sourceMappingURL=TypeScriptPlugin.js.map