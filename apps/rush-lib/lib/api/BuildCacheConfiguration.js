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
exports.BuildCacheConfiguration = void 0;
const path = __importStar(require("path"));
const node_core_library_1 = require("@rushstack/node-core-library");
const FileSystemBuildCacheProvider_1 = require("../logic/buildCache/FileSystemBuildCacheProvider");
const RushConstants_1 = require("../logic/RushConstants");
const RushUserConfiguration_1 = require("./RushUserConfiguration");
const EnvironmentConfiguration_1 = require("./EnvironmentConfiguration");
const CacheEntryId_1 = require("../logic/buildCache/CacheEntryId");
const AzureStorageBuildCacheProviderModule = node_core_library_1.Import.lazy('../logic/buildCache/AzureStorageBuildCacheProvider', require);
const AmazonS3BuildCacheProviderModule = node_core_library_1.Import.lazy('../logic/buildCache/AmazonS3/AmazonS3BuildCacheProvider', require);
/**
 * Use this class to load and save the "common/config/rush/build-cache.json" config file.
 * This file provides configuration options for cached project build output.
 * @public
 */
class BuildCacheConfiguration {
    constructor(options) {
        var _a;
        this.buildCacheEnabled = (_a = EnvironmentConfiguration_1.EnvironmentConfiguration.buildCacheEnabled) !== null && _a !== void 0 ? _a : options.buildCacheJson.buildCacheEnabled;
        this.getCacheEntryId = options.getCacheEntryId;
        this.localCacheProvider = new FileSystemBuildCacheProvider_1.FileSystemBuildCacheProvider({
            rushUserConfiguration: options.rushUserConfiguration,
            rushConfiguration: options.rushConfiguration
        });
        const { buildCacheJson } = options;
        switch (buildCacheJson.cacheProvider) {
            case 'local-only': {
                // Don't configure a cloud cache provider
                break;
            }
            case 'azure-blob-storage': {
                this.cloudCacheProvider = this._createAzureStorageBuildCacheProvider(buildCacheJson.azureBlobStorageConfiguration);
                break;
            }
            case 'amazon-s3': {
                this.cloudCacheProvider = this._createAmazonS3BuildCacheProvider(buildCacheJson.amazonS3Configuration);
                break;
            }
            default: {
                throw new Error(`Unexpected cache provider: ${buildCacheJson.cacheProvider}`);
            }
        }
    }
    /**
     * Attempts to load the build-cache.json data from the standard file path `common/config/rush/build-cache.json`.
     * If the file has not been created yet, then undefined is returned.
     */
    static async tryLoadAsync(terminal, rushConfiguration) {
        const jsonFilePath = BuildCacheConfiguration.getBuildCacheConfigFilePath(rushConfiguration);
        if (!node_core_library_1.FileSystem.exists(jsonFilePath)) {
            return undefined;
        }
        return await BuildCacheConfiguration._loadAsync(jsonFilePath, terminal, rushConfiguration);
    }
    /**
     * Loads the build-cache.json data from the standard file path `common/config/rush/build-cache.json`.
     * If the file has not been created yet, or if the feature is not enabled, then an error is reported.
     */
    static async loadAndRequireEnabledAsync(terminal, rushConfiguration) {
        const jsonFilePath = BuildCacheConfiguration.getBuildCacheConfigFilePath(rushConfiguration);
        if (!node_core_library_1.FileSystem.exists(jsonFilePath)) {
            terminal.writeErrorLine(`The build cache feature is not enabled. This config file is missing:\n` + jsonFilePath);
            terminal.writeLine(`\nThe Rush website documentation has instructions for enabling the build cache.`);
            throw new node_core_library_1.AlreadyReportedError();
        }
        const buildCacheConfiguration = await BuildCacheConfiguration._loadAsync(jsonFilePath, terminal, rushConfiguration);
        if (!buildCacheConfiguration.buildCacheEnabled) {
            terminal.writeErrorLine(`The build cache feature is not enabled. You can enable it by editing this config file:\n` +
                jsonFilePath);
            throw new node_core_library_1.AlreadyReportedError();
        }
        return buildCacheConfiguration;
    }
    static async _loadAsync(jsonFilePath, terminal, rushConfiguration) {
        const buildCacheJson = await node_core_library_1.JsonFile.loadAndValidateAsync(jsonFilePath, BuildCacheConfiguration._jsonSchema);
        const rushUserConfiguration = await RushUserConfiguration_1.RushUserConfiguration.initializeAsync();
        let getCacheEntryId;
        try {
            getCacheEntryId = CacheEntryId_1.CacheEntryId.parsePattern(buildCacheJson.cacheEntryNamePattern);
        }
        catch (e) {
            terminal.writeErrorLine(`Error parsing cache entry name pattern "${buildCacheJson.cacheEntryNamePattern}": ${e}`);
            throw new node_core_library_1.AlreadyReportedError();
        }
        return new BuildCacheConfiguration({
            buildCacheJson,
            getCacheEntryId,
            rushConfiguration,
            rushUserConfiguration
        });
    }
    static getBuildCacheConfigFilePath(rushConfiguration) {
        return path.resolve(rushConfiguration.commonRushConfigFolder, RushConstants_1.RushConstants.buildCacheFilename);
    }
    _createAzureStorageBuildCacheProvider(azureStorageConfigurationJson) {
        return new AzureStorageBuildCacheProviderModule.AzureStorageBuildCacheProvider({
            storageAccountName: azureStorageConfigurationJson.storageAccountName,
            storageContainerName: azureStorageConfigurationJson.storageContainerName,
            azureEnvironment: azureStorageConfigurationJson.azureEnvironment,
            blobPrefix: azureStorageConfigurationJson.blobPrefix,
            isCacheWriteAllowed: !!azureStorageConfigurationJson.isCacheWriteAllowed
        });
    }
    _createAmazonS3BuildCacheProvider(amazonS3ConfigurationJson) {
        return new AmazonS3BuildCacheProviderModule.AmazonS3BuildCacheProvider({
            s3Region: amazonS3ConfigurationJson.s3Region,
            s3Bucket: amazonS3ConfigurationJson.s3Bucket,
            s3Prefix: amazonS3ConfigurationJson.s3Prefix,
            isCacheWriteAllowed: !!amazonS3ConfigurationJson.isCacheWriteAllowed
        });
    }
}
exports.BuildCacheConfiguration = BuildCacheConfiguration;
BuildCacheConfiguration._jsonSchema = node_core_library_1.JsonSchema.fromFile(path.join(__dirname, '..', 'schemas', 'build-cache.schema.json'));
//# sourceMappingURL=BuildCacheConfiguration.js.map