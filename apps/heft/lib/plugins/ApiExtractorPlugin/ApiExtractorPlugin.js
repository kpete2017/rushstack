"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiExtractorPlugin = void 0;
const ApiExtractorRunner_1 = require("./ApiExtractorRunner");
const CoreConfigFiles_1 = require("../../utilities/CoreConfigFiles");
const PLUGIN_NAME = 'ApiExtractorPlugin';
const CONFIG_FILE_LOCATION = './config/api-extractor.json';
class ApiExtractorPlugin {
    constructor(taskPackageResolver) {
        this.pluginName = PLUGIN_NAME;
        this._toolPackageResolver = taskPackageResolver;
    }
    apply(heftSession, heftConfiguration) {
        const { buildFolder } = heftConfiguration;
        heftSession.hooks.build.tap(PLUGIN_NAME, async (build) => {
            build.hooks.bundle.tap(PLUGIN_NAME, (bundle) => {
                bundle.hooks.run.tapPromise(PLUGIN_NAME, async () => {
                    // API Extractor provides an ExtractorConfig.tryLoadForFolder() API that will probe for api-extractor.json
                    // including support for rig.json.  However, Heft does not load the @microsoft/api-extractor package at all
                    // unless it sees a config/api-extractor.json file.  Thus we need to do our own lookup here.
                    const apiExtractorJsonFilePath = await heftConfiguration.rigConfig.tryResolveConfigFilePathAsync(CONFIG_FILE_LOCATION);
                    if (apiExtractorJsonFilePath !== undefined) {
                        await this._runApiExtractorAsync(heftSession, {
                            heftConfiguration,
                            buildFolder,
                            debugMode: heftSession.debugMode,
                            watchMode: build.properties.watchMode,
                            production: build.properties.production,
                            apiExtractorJsonFilePath: apiExtractorJsonFilePath
                        });
                    }
                });
            });
        });
    }
    async _runApiExtractorAsync(heftSession, options) {
        const { heftConfiguration, buildFolder, debugMode, watchMode, production } = options;
        const logger = heftSession.requestScopedLogger('API Extractor Plugin');
        const apiExtractorTaskConfiguration = await CoreConfigFiles_1.CoreConfigFiles.apiExtractorTaskConfigurationLoader.tryLoadConfigurationFileForProjectAsync(logger.terminal, heftConfiguration.buildFolder, heftConfiguration.rigConfig);
        if (watchMode) {
            logger.terminal.writeWarningLine("API Extractor isn't currently supported in --watch mode.");
            return;
        }
        const resolution = await this._toolPackageResolver.resolveToolPackagesAsync(options.heftConfiguration, logger.terminal);
        if (!resolution) {
            logger.emitError(new Error('Unable to resolve a compiler package for tsconfig.json'));
            return;
        }
        if (!resolution.apiExtractorPackagePath) {
            logger.emitError(new Error('Unable to resolve the "@microsoft/api-extractor" package for this project'));
            return;
        }
        const apiExtractorRunner = new ApiExtractorRunner_1.ApiExtractorRunner(heftConfiguration.terminalProvider, {
            apiExtractorJsonFilePath: options.apiExtractorJsonFilePath,
            apiExtractorPackagePath: resolution.apiExtractorPackagePath,
            typescriptPackagePath: (apiExtractorTaskConfiguration === null || apiExtractorTaskConfiguration === void 0 ? void 0 : apiExtractorTaskConfiguration.useProjectTypescriptVersion) ? resolution.typeScriptPackagePath
                : undefined,
            buildFolder: buildFolder,
            production: production
        }, heftSession);
        if (debugMode) {
            await apiExtractorRunner.invokeAsync();
        }
        else {
            await apiExtractorRunner.invokeAsSubprocessAsync();
        }
    }
}
exports.ApiExtractorPlugin = ApiExtractorPlugin;
//# sourceMappingURL=ApiExtractorPlugin.js.map