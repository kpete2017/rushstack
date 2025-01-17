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
exports.CoreConfigFiles = exports.HeftEvent = void 0;
const path = __importStar(require("path"));
const heft_config_file_1 = require("@rushstack/heft-config-file");
var HeftEvent;
(function (HeftEvent) {
    // Part of the 'clean' stage
    HeftEvent["clean"] = "clean";
    // Part of the 'build' stage
    HeftEvent["preCompile"] = "pre-compile";
    HeftEvent["compile"] = "compile";
    HeftEvent["bundle"] = "bundle";
    HeftEvent["postBuild"] = "post-build";
    // Part of the 'test' stage
    HeftEvent["test"] = "test";
})(HeftEvent = exports.HeftEvent || (exports.HeftEvent = {}));
class CoreConfigFiles {
    /**
     * Returns the loader for the `config/heft.json` config file.
     */
    static get heftConfigFileLoader() {
        if (!CoreConfigFiles._heftConfigFileLoader) {
            const schemaPath = path.join(__dirname, '..', 'schemas', 'heft.schema.json');
            CoreConfigFiles._heftConfigFileLoader = new heft_config_file_1.ConfigurationFile({
                projectRelativeFilePath: 'config/heft.json',
                jsonSchemaPath: schemaPath,
                propertyInheritance: {
                    heftPlugins: {
                        inheritanceType: heft_config_file_1.InheritanceType.append
                    }
                },
                jsonPathMetadata: {
                    '$.heftPlugins.*.plugin': {
                        pathResolutionMethod: heft_config_file_1.PathResolutionMethod.NodeResolve
                    },
                    '$.eventActions.[?(@.actionKind==="runScript")].scriptPath': {
                        pathResolutionMethod: heft_config_file_1.PathResolutionMethod.resolvePathRelativeToProjectRoot
                    }
                }
            });
        }
        return CoreConfigFiles._heftConfigFileLoader;
    }
    /**
     * Gets the eventActions from config/heft.json
     */
    static async getConfigConfigFileEventActionsAsync(terminal, heftConfiguration) {
        let result = CoreConfigFiles._heftConfigFileEventActionsCache.get(heftConfiguration);
        if (!result) {
            const heftConfigJson = await CoreConfigFiles.heftConfigFileLoader.tryLoadConfigurationFileForProjectAsync(terminal, heftConfiguration.buildFolder, heftConfiguration.rigConfig);
            result = {
                copyFiles: new Map(),
                deleteGlobs: new Map(),
                runScript: new Map()
            };
            CoreConfigFiles._heftConfigFileEventActionsCache.set(heftConfiguration, result);
            for (const eventAction of (heftConfigJson === null || heftConfigJson === void 0 ? void 0 : heftConfigJson.eventActions) || []) {
                switch (eventAction.actionKind) {
                    case 'copyFiles': {
                        CoreConfigFiles._addEventActionToMap(eventAction, result.copyFiles);
                        break;
                    }
                    case 'deleteGlobs': {
                        CoreConfigFiles._addEventActionToMap(eventAction, result.deleteGlobs);
                        break;
                    }
                    case 'runScript': {
                        CoreConfigFiles._addEventActionToMap(eventAction, result.runScript);
                        break;
                    }
                    default: {
                        throw new Error(`Unknown heft eventAction actionKind "${eventAction.actionKind}" in ` +
                            `"${CoreConfigFiles.heftConfigFileLoader.getObjectSourceFilePath(eventAction)}" `);
                    }
                }
            }
        }
        return result;
    }
    /**
     * Returns the loader for the `config/api-extractor-task.json` config file.
     */
    static get apiExtractorTaskConfigurationLoader() {
        if (!CoreConfigFiles._apiExtractorTaskConfigurationLoader) {
            const schemaPath = path.resolve(__dirname, '..', 'schemas', 'api-extractor-task.schema.json');
            CoreConfigFiles._apiExtractorTaskConfigurationLoader =
                new heft_config_file_1.ConfigurationFile({
                    projectRelativeFilePath: 'config/api-extractor-task.json',
                    jsonSchemaPath: schemaPath
                });
        }
        return CoreConfigFiles._apiExtractorTaskConfigurationLoader;
    }
    /**
     * Returns the loader for the `config/typescript.json` config file.
     */
    static get typeScriptConfigurationFileLoader() {
        if (!CoreConfigFiles._typeScriptConfigurationFileLoader) {
            const schemaPath = path.resolve(__dirname, '..', 'schemas', 'typescript.schema.json');
            CoreConfigFiles._typeScriptConfigurationFileLoader =
                new heft_config_file_1.ConfigurationFile({
                    projectRelativeFilePath: 'config/typescript.json',
                    jsonSchemaPath: schemaPath,
                    propertyInheritance: {
                        staticAssetsToCopy: {
                            inheritanceType: heft_config_file_1.InheritanceType.custom,
                            inheritanceFunction: (currentObject, parentObject) => {
                                const result = {};
                                CoreConfigFiles._inheritArray(result, 'fileExtensions', currentObject, parentObject);
                                CoreConfigFiles._inheritArray(result, 'includeGlobs', currentObject, parentObject);
                                CoreConfigFiles._inheritArray(result, 'excludeGlobs', currentObject, parentObject);
                                return result;
                            }
                        }
                    }
                });
        }
        return CoreConfigFiles._typeScriptConfigurationFileLoader;
    }
    /**
     * Returns the loader for the `config/api-extractor-task.json` config file.
     */
    static get nodeServiceConfigurationLoader() {
        if (!CoreConfigFiles._nodeServiceConfigurationLoader) {
            const schemaPath = path.resolve(__dirname, '..', 'schemas', 'node-service.schema.json');
            CoreConfigFiles._nodeServiceConfigurationLoader =
                new heft_config_file_1.ConfigurationFile({
                    projectRelativeFilePath: 'config/node-service.json',
                    jsonSchemaPath: schemaPath
                });
        }
        return CoreConfigFiles._nodeServiceConfigurationLoader;
    }
    static get sassConfigurationFileLoader() {
        const schemaPath = path.resolve(__dirname, '..', 'schemas', 'sass.schema.json');
        CoreConfigFiles._sassConfigurationFileLoader = new heft_config_file_1.ConfigurationFile({
            projectRelativeFilePath: 'config/sass.json',
            jsonSchemaPath: schemaPath,
            jsonPathMetadata: {
                '$.importIncludePaths.*': {
                    pathResolutionMethod: heft_config_file_1.PathResolutionMethod.resolvePathRelativeToProjectRoot
                },
                '$.generatedTsFolder.*': {
                    pathResolutionMethod: heft_config_file_1.PathResolutionMethod.resolvePathRelativeToProjectRoot
                },
                '$.srcFolder.*': {
                    pathResolutionMethod: heft_config_file_1.PathResolutionMethod.resolvePathRelativeToProjectRoot
                }
            }
        });
        return CoreConfigFiles._sassConfigurationFileLoader;
    }
    static _addEventActionToMap(eventAction, map) {
        const heftEvent = CoreConfigFiles._parseHeftEvent(eventAction);
        let eventArray = map.get(heftEvent);
        if (!eventArray) {
            eventArray = [];
            map.set(heftEvent, eventArray);
        }
        eventArray.push(eventAction);
    }
    static _parseHeftEvent(eventAction) {
        switch (eventAction.heftEvent) {
            case 'clean':
                return HeftEvent.clean;
            case 'pre-compile':
                return HeftEvent.preCompile;
            case 'compile':
                return HeftEvent.compile;
            case 'bundle':
                return HeftEvent.bundle;
            case 'post-build':
                return HeftEvent.postBuild;
            case 'test':
                return HeftEvent.test;
            default:
                throw new Error(`Unknown heft event "${eventAction.heftEvent}" in ` +
                    ` "${CoreConfigFiles.heftConfigFileLoader.getObjectSourceFilePath(eventAction)}".`);
        }
    }
    static _inheritArray(resultObject, propertyName, currentObject, parentObject) {
        let newValue;
        if (currentObject[propertyName] && parentObject[propertyName]) {
            newValue = [
                ...currentObject[propertyName],
                ...parentObject[propertyName]
            ];
        }
        else {
            newValue = currentObject[propertyName] || parentObject[propertyName];
        }
        if (newValue !== undefined) {
            resultObject[propertyName] = newValue;
        }
    }
}
exports.CoreConfigFiles = CoreConfigFiles;
CoreConfigFiles._heftConfigFileEventActionsCache = new Map();
//# sourceMappingURL=CoreConfigFiles.js.map