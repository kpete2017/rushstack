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
exports.CopyStaticAssetsPlugin = void 0;
const path = __importStar(require("path"));
const heft_config_file_1 = require("@rushstack/heft-config-file");
const CoreConfigFiles_1 = require("../utilities/CoreConfigFiles");
const CopyFilesPlugin_1 = require("./CopyFilesPlugin");
const PLUGIN_NAME = 'CopyStaticAssetsPlugin';
class CopyStaticAssetsPlugin extends CopyFilesPlugin_1.CopyFilesPlugin {
    constructor() {
        super(...arguments);
        /**
         * @override
         */
        this.pluginName = PLUGIN_NAME;
    }
    static get _partialTsconfigFileLoader() {
        if (!CopyStaticAssetsPlugin.__partialTsconfigFileLoader) {
            const schemaPath = path.resolve(__dirname, '..', 'schemas', 'anything.schema.json');
            CopyStaticAssetsPlugin.__partialTsconfigFileLoader = new heft_config_file_1.ConfigurationFile({
                projectRelativeFilePath: 'tsconfig.json',
                jsonSchemaPath: schemaPath,
                propertyInheritance: {
                    compilerOptions: {
                        inheritanceType: heft_config_file_1.InheritanceType.custom,
                        inheritanceFunction: (currentObject, parentObject) => {
                            if (currentObject && !parentObject) {
                                return currentObject;
                            }
                            else if (!currentObject && parentObject) {
                                return parentObject;
                            }
                            else if (parentObject && currentObject) {
                                return Object.assign(Object.assign({}, parentObject), currentObject);
                            }
                            else {
                                return undefined;
                            }
                        }
                    }
                },
                jsonPathMetadata: {
                    '$.compilerOptions.outDir': {
                        pathResolutionMethod: heft_config_file_1.PathResolutionMethod.resolvePathRelativeToConfigurationFile
                    }
                }
            });
        }
        return CopyStaticAssetsPlugin.__partialTsconfigFileLoader;
    }
    /**
     * @override
     */
    apply(heftSession, heftConfiguration) {
        heftSession.hooks.build.tap(PLUGIN_NAME, (build) => {
            build.hooks.compile.tap(PLUGIN_NAME, (compile) => {
                compile.hooks.run.tapPromise(PLUGIN_NAME, async () => {
                    const logger = heftSession.requestScopedLogger('copy-static-assets');
                    const copyStaticAssetsConfiguration = await this._loadCopyStaticAssetsConfigurationAsync(logger.terminal, heftConfiguration);
                    await this.runCopyAsync({
                        logger,
                        copyConfigurations: [copyStaticAssetsConfiguration],
                        buildFolder: heftConfiguration.buildFolder,
                        watchMode: build.properties.watchMode
                    });
                });
            });
        });
    }
    async _loadCopyStaticAssetsConfigurationAsync(terminal, heftConfiguration) {
        const typescriptConfiguration = await CoreConfigFiles_1.CoreConfigFiles.typeScriptConfigurationFileLoader.tryLoadConfigurationFileForProjectAsync(terminal, heftConfiguration.buildFolder, heftConfiguration.rigConfig);
        const resolvedDestinationFolderPaths = new Set();
        const destinationFolderNames = new Set();
        const tsconfigDestinationFolderPath = await this._tryGetTsconfigOutDirPathAsync(heftConfiguration.buildFolder, terminal);
        if (tsconfigDestinationFolderPath) {
            resolvedDestinationFolderPaths.add(tsconfigDestinationFolderPath);
            destinationFolderNames.add(path.relative(heftConfiguration.buildFolder, tsconfigDestinationFolderPath));
        }
        for (const emitModule of (typescriptConfiguration === null || typescriptConfiguration === void 0 ? void 0 : typescriptConfiguration.additionalModuleKindsToEmit) || []) {
            resolvedDestinationFolderPaths.add(path.resolve(heftConfiguration.buildFolder, emitModule.outFolderName));
            destinationFolderNames.add(emitModule.outFolderName);
        }
        return Object.assign(Object.assign({}, typescriptConfiguration === null || typescriptConfiguration === void 0 ? void 0 : typescriptConfiguration.staticAssetsToCopy), { 
            // For now - these may need to be revised later
            sourceFolder: 'src', destinationFolders: Array.from(destinationFolderNames), resolvedDestinationFolderPaths: Array.from(resolvedDestinationFolderPaths), flatten: false, hardlink: false });
    }
    async _tryGetTsconfigOutDirPathAsync(projectFolder, terminal) {
        var _a;
        const partialTsconfig = await CopyStaticAssetsPlugin._partialTsconfigFileLoader.tryLoadConfigurationFileForProjectAsync(terminal, projectFolder);
        return (_a = partialTsconfig === null || partialTsconfig === void 0 ? void 0 : partialTsconfig.compilerOptions) === null || _a === void 0 ? void 0 : _a.outDir;
    }
}
exports.CopyStaticAssetsPlugin = CopyStaticAssetsPlugin;
//# sourceMappingURL=CopyStaticAssetsPlugin.js.map