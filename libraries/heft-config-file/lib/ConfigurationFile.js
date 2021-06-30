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
exports.ConfigurationFile = exports.PathResolutionMethod = exports.InheritanceType = void 0;
const nodeJsPath = __importStar(require("path"));
const jsonpath_plus_1 = require("jsonpath-plus");
const node_core_library_1 = require("@rushstack/node-core-library");
/**
 * @beta
 */
var InheritanceType;
(function (InheritanceType) {
    /**
     * Append additional elements after elements from the parent file's property
     */
    InheritanceType["append"] = "append";
    /**
     * Discard elements from the parent file's property
     */
    InheritanceType["replace"] = "replace";
    /**
     * Custom inheritance functionality
     */
    InheritanceType["custom"] = "custom";
})(InheritanceType = exports.InheritanceType || (exports.InheritanceType = {}));
/**
 * @beta
 */
var PathResolutionMethod;
(function (PathResolutionMethod) {
    /**
     * Resolve a path relative to the configuration file
     */
    PathResolutionMethod[PathResolutionMethod["resolvePathRelativeToConfigurationFile"] = 0] = "resolvePathRelativeToConfigurationFile";
    /**
     * Resolve a path relative to the root of the project containing the configuration file
     */
    PathResolutionMethod[PathResolutionMethod["resolvePathRelativeToProjectRoot"] = 1] = "resolvePathRelativeToProjectRoot";
    /**
     * Treat the property as a NodeJS-style require/import reference and resolve using standard
     * NodeJS filesystem resolution
     */
    PathResolutionMethod[PathResolutionMethod["NodeResolve"] = 2] = "NodeResolve";
    /**
     * Resolve the property using a custom resolver.
     */
    PathResolutionMethod[PathResolutionMethod["custom"] = 3] = "custom";
})(PathResolutionMethod = exports.PathResolutionMethod || (exports.PathResolutionMethod = {}));
const CONFIGURATION_FILE_FIELD_ANNOTATION = Symbol('configuration-file-field-annotation');
/**
 * @beta
 */
class ConfigurationFile {
    constructor(options) {
        this._configPromiseCache = new Map();
        this._packageJsonLookup = new node_core_library_1.PackageJsonLookup();
        this.projectRelativeFilePath = options.projectRelativeFilePath;
        this._schemaPath = options.jsonSchemaPath;
        this._jsonPathMetadata = options.jsonPathMetadata || {};
        this._propertyInheritanceTypes = options.propertyInheritance || {};
    }
    get _schema() {
        if (!this.__schema) {
            this.__schema = node_core_library_1.JsonSchema.fromFile(this._schemaPath);
        }
        return this.__schema;
    }
    /**
     * Find and return a configuration file for the specified project, automatically resolving
     * `extends` properties and handling rigged configuration files. Will throw an error if a configuration
     * file cannot be found in the rig or project config folder.
     */
    async loadConfigurationFileForProjectAsync(terminal, projectPath, rigConfig) {
        const projectConfigurationFilePath = this._getConfigurationFilePathForProject(projectPath);
        return await this._loadConfigurationFileInnerWithCacheAsync(terminal, projectConfigurationFilePath, new Set(), rigConfig);
    }
    /**
     * This function is identical to {@link ConfigurationFile.loadConfigurationFileForProjectAsync}, except
     * that it returns `undefined` instead of throwing an error if the configuration file cannot be found.
     */
    async tryLoadConfigurationFileForProjectAsync(terminal, projectPath, rigConfig) {
        try {
            return await this.loadConfigurationFileForProjectAsync(terminal, projectPath, rigConfig);
        }
        catch (e) {
            if (node_core_library_1.FileSystem.isNotExistError(e)) {
                return undefined;
            }
            throw e;
        }
    }
    /**
     * Get the path to the source file that the referenced property was originally
     * loaded from.
     */
    getObjectSourceFilePath(obj) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const annotation = obj[CONFIGURATION_FILE_FIELD_ANNOTATION];
        if (annotation) {
            return annotation.configurationFilePath;
        }
        return undefined;
    }
    /**
     * Get the value of the specified property on the specified object that was originally
     * loaded from a configuration file.
     */
    getPropertyOriginalValue(options) {
        const annotation = 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        options.parentObject[CONFIGURATION_FILE_FIELD_ANNOTATION];
        if (annotation && annotation.originalValues.hasOwnProperty(options.propertyName)) {
            return annotation.originalValues[options.propertyName];
        }
        else {
            return undefined;
        }
    }
    async _loadConfigurationFileInnerWithCacheAsync(terminal, resolvedConfigurationFilePath, visitedConfigurationFilePaths, rigConfig) {
        let cacheEntryPromise = this._configPromiseCache.get(resolvedConfigurationFilePath);
        if (!cacheEntryPromise) {
            cacheEntryPromise = this._loadConfigurationFileInnerAsync(terminal, resolvedConfigurationFilePath, visitedConfigurationFilePaths, rigConfig);
            this._configPromiseCache.set(resolvedConfigurationFilePath, cacheEntryPromise);
        }
        // We check for loops after caching a promise for this config file, but before attempting
        // to resolve the promise. We can't handle loop detection in the `InnerAsync` function, because
        // we could end up waiting for a cached promise (like A -> B -> A) that never resolves.
        if (visitedConfigurationFilePaths.has(resolvedConfigurationFilePath)) {
            const resolvedConfigurationFilePathForLogging = ConfigurationFile._formatPathForLogging(resolvedConfigurationFilePath);
            throw new Error('A loop has been detected in the "extends" properties of configuration file at ' +
                `"${resolvedConfigurationFilePathForLogging}".`);
        }
        visitedConfigurationFilePaths.add(resolvedConfigurationFilePath);
        return await cacheEntryPromise;
    }
    // NOTE: Internal calls to load a configuration file should use `_loadConfigurationFileInnerWithCacheAsync`.
    // Don't call this function directly, as it does not provide config file loop detection,
    // and you won't get the advantage of queueing up for a config file that is already loading.
    async _loadConfigurationFileInnerAsync(terminal, resolvedConfigurationFilePath, visitedConfigurationFilePaths, rigConfig) {
        const resolvedConfigurationFilePathForLogging = ConfigurationFile._formatPathForLogging(resolvedConfigurationFilePath);
        let fileText;
        try {
            fileText = await node_core_library_1.FileSystem.readFileAsync(resolvedConfigurationFilePath);
        }
        catch (e) {
            if (node_core_library_1.FileSystem.isNotExistError(e)) {
                if (rigConfig) {
                    terminal.writeVerboseLine(`Config file "${resolvedConfigurationFilePathForLogging}" does not exist. Attempting to load via rig.`);
                    const rigResult = await this._tryLoadConfigurationFileInRigAsync(terminal, rigConfig, visitedConfigurationFilePaths);
                    if (rigResult) {
                        return rigResult;
                    }
                }
                else {
                    terminal.writeVerboseLine(`Configuration file "${resolvedConfigurationFilePathForLogging}" not found.`);
                }
                e.message = `File does not exist: ${resolvedConfigurationFilePathForLogging}`;
            }
            throw e;
        }
        let configurationJson;
        try {
            configurationJson = await node_core_library_1.JsonFile.parseString(fileText);
        }
        catch (e) {
            throw new Error(`In config file "${resolvedConfigurationFilePathForLogging}": ${e}`);
        }
        this._schema.validateObject(configurationJson, resolvedConfigurationFilePathForLogging);
        this._annotateProperties(resolvedConfigurationFilePath, configurationJson);
        for (const [jsonPath, metadata] of Object.entries(this._jsonPathMetadata)) {
            jsonpath_plus_1.JSONPath({
                path: jsonPath,
                json: configurationJson,
                callback: (payload, payloadType, fullPayload) => {
                    const resolvedPath = this._resolvePathProperty(resolvedConfigurationFilePath, fullPayload.path, fullPayload.value, metadata);
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    fullPayload.parent[fullPayload.parentProperty] = resolvedPath;
                },
                otherTypeCallback: () => {
                    throw new Error('@other() tags are not supported');
                }
            });
        }
        let parentConfiguration = {};
        if (configurationJson.extends) {
            try {
                const resolvedParentConfigPath = node_core_library_1.Import.resolveModule({
                    modulePath: configurationJson.extends,
                    baseFolderPath: nodeJsPath.dirname(resolvedConfigurationFilePath)
                });
                parentConfiguration = await this._loadConfigurationFileInnerWithCacheAsync(terminal, resolvedParentConfigPath, visitedConfigurationFilePaths, undefined);
            }
            catch (e) {
                if (node_core_library_1.FileSystem.isNotExistError(e)) {
                    throw new Error(`In file "${resolvedConfigurationFilePathForLogging}", file referenced in "extends" property ` +
                        `("${configurationJson.extends}") cannot be resolved.`);
                }
                else {
                    throw e;
                }
            }
        }
        const propertyNames = new Set([
            ...Object.keys(parentConfiguration),
            ...Object.keys(configurationJson)
        ]);
        const resultAnnotation = {
            configurationFilePath: resolvedConfigurationFilePath,
            originalValues: {}
        };
        const result = {
            [CONFIGURATION_FILE_FIELD_ANNOTATION]: resultAnnotation
        };
        for (const propertyName of propertyNames) {
            if (propertyName === '$schema' || propertyName === 'extends') {
                continue;
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const propertyValue = configurationJson[propertyName];
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const parentPropertyValue = parentConfiguration[propertyName];
            const bothAreArrays = Array.isArray(propertyValue) && Array.isArray(parentPropertyValue);
            const defaultInheritanceType = bothAreArrays
                ? { inheritanceType: InheritanceType.append }
                : { inheritanceType: InheritanceType.replace };
            const propertyInheritance = 
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            this._propertyInheritanceTypes[propertyName] !== undefined
                ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    this._propertyInheritanceTypes[propertyName]
                : defaultInheritanceType;
            let newValue;
            const usePropertyValue = () => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                resultAnnotation.originalValues[propertyName] = this.getPropertyOriginalValue({
                    parentObject: configurationJson,
                    propertyName: propertyName
                });
                newValue = propertyValue;
            };
            const useParentPropertyValue = () => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                resultAnnotation.originalValues[propertyName] = this.getPropertyOriginalValue({
                    parentObject: parentConfiguration,
                    propertyName: propertyName
                });
                newValue = parentPropertyValue;
            };
            if (propertyValue && !parentPropertyValue) {
                usePropertyValue();
            }
            else if (parentPropertyValue && !propertyValue) {
                useParentPropertyValue();
            }
            else {
                switch (propertyInheritance.inheritanceType) {
                    case InheritanceType.replace: {
                        if (propertyValue !== undefined) {
                            usePropertyValue();
                        }
                        else {
                            useParentPropertyValue();
                        }
                        break;
                    }
                    case InheritanceType.append: {
                        if (propertyValue !== undefined && parentPropertyValue === undefined) {
                            usePropertyValue();
                        }
                        else if (propertyValue === undefined && parentPropertyValue !== undefined) {
                            useParentPropertyValue();
                        }
                        else {
                            if (!Array.isArray(propertyValue) || !Array.isArray(parentPropertyValue)) {
                                throw new Error(`Issue in processing configuration file property "${propertyName}". ` +
                                    `Property is not an array, but the inheritance type is set as "${InheritanceType.append}"`);
                            }
                            newValue = [...parentPropertyValue, ...propertyValue];
                            newValue[CONFIGURATION_FILE_FIELD_ANNOTATION] = {
                                configurationFilePath: undefined,
                                originalValues: Object.assign(Object.assign({}, parentPropertyValue[CONFIGURATION_FILE_FIELD_ANNOTATION].originalValues), propertyValue[CONFIGURATION_FILE_FIELD_ANNOTATION].originalValues)
                            };
                        }
                        break;
                    }
                    case InheritanceType.custom: {
                        const customInheritance = propertyInheritance;
                        if (!customInheritance.inheritanceFunction ||
                            typeof customInheritance.inheritanceFunction !== 'function') {
                            throw new Error('For property inheritance type "InheritanceType.custom", an inheritanceFunction must be provided.');
                        }
                        newValue = customInheritance.inheritanceFunction(propertyValue, parentPropertyValue);
                        break;
                    }
                    default: {
                        throw new Error(`Unknown inheritance type "${propertyInheritance}"`);
                    }
                }
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            result[propertyName] = newValue;
        }
        try {
            this._schema.validateObject(result, resolvedConfigurationFilePathForLogging);
        }
        catch (e) {
            throw new Error(`Resolved configuration object does not match schema: ${e}`);
        }
        return result;
    }
    async _tryLoadConfigurationFileInRigAsync(terminal, rigConfig, visitedConfigurationFilePaths) {
        if (rigConfig.rigFound) {
            const rigProfileFolder = await rigConfig.getResolvedProfileFolderAsync();
            try {
                return await this._loadConfigurationFileInnerWithCacheAsync(terminal, nodeJsPath.resolve(rigProfileFolder, this.projectRelativeFilePath), visitedConfigurationFilePaths, undefined);
            }
            catch (e) {
                // Ignore cases where a configuration file doesn't exist in a rig
                if (!node_core_library_1.FileSystem.isNotExistError(e)) {
                    throw e;
                }
                else {
                    terminal.writeVerboseLine(`Configuration file "${this.projectRelativeFilePath}" not found in rig ("${ConfigurationFile._formatPathForLogging(rigProfileFolder)}")`);
                }
            }
        }
        else {
            terminal.writeVerboseLine(`No rig found for "${ConfigurationFile._formatPathForLogging(rigConfig.projectFolderPath)}"`);
        }
        return undefined;
    }
    _annotateProperties(resolvedConfigurationFilePath, obj) {
        if (!obj) {
            return;
        }
        if (typeof obj === 'object') {
            this._annotateProperty(resolvedConfigurationFilePath, obj);
            for (const objValue of Object.values(obj)) {
                this._annotateProperties(resolvedConfigurationFilePath, objValue);
            }
        }
    }
    _annotateProperty(resolvedConfigurationFilePath, obj) {
        if (!obj) {
            return;
        }
        if (typeof obj === 'object') {
            obj[CONFIGURATION_FILE_FIELD_ANNOTATION] = {
                configurationFilePath: resolvedConfigurationFilePath,
                originalValues: Object.assign({}, obj)
            };
        }
    }
    _resolvePathProperty(configurationFilePath, propertyName, propertyValue, metadata) {
        const resolutionMethod = metadata.pathResolutionMethod;
        if (resolutionMethod === undefined) {
            return propertyValue;
        }
        switch (metadata.pathResolutionMethod) {
            case PathResolutionMethod.resolvePathRelativeToConfigurationFile: {
                return nodeJsPath.resolve(nodeJsPath.dirname(configurationFilePath), propertyValue);
            }
            case PathResolutionMethod.resolvePathRelativeToProjectRoot: {
                const packageRoot = this._packageJsonLookup.tryGetPackageFolderFor(configurationFilePath);
                if (!packageRoot) {
                    throw new Error(`Could not find a package root for path "${ConfigurationFile._formatPathForLogging(configurationFilePath)}"`);
                }
                return nodeJsPath.resolve(packageRoot, propertyValue);
            }
            case PathResolutionMethod.NodeResolve: {
                return node_core_library_1.Import.resolveModule({
                    modulePath: propertyValue,
                    baseFolderPath: nodeJsPath.dirname(configurationFilePath)
                });
            }
            case PathResolutionMethod.custom: {
                if (!metadata.customResolver) {
                    throw new Error(`The pathResolutionMethod was set to "${PathResolutionMethod[resolutionMethod]}", but a custom ` +
                        'resolver was not provided.');
                }
                return metadata.customResolver(configurationFilePath, propertyName, propertyValue);
            }
            default: {
                throw new Error(`Unsupported PathResolutionMethod: ${PathResolutionMethod[resolutionMethod]} (${resolutionMethod})`);
            }
        }
    }
    _getConfigurationFilePathForProject(projectPath) {
        return nodeJsPath.resolve(projectPath, this.projectRelativeFilePath);
    }
}
exports.ConfigurationFile = ConfigurationFile;
/**
 * @internal
 */
ConfigurationFile._formatPathForLogging = (path) => path;
//# sourceMappingURL=ConfigurationFile.js.map