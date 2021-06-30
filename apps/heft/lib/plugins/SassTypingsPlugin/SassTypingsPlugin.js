"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.SassTypingsPlugin = void 0;
const SassTypingsGenerator_1 = require("./SassTypingsGenerator");
const CoreConfigFiles_1 = require("../../utilities/CoreConfigFiles");
const Async_1 = require("../../utilities/Async");
const PLUGIN_NAME = 'SassTypingsPlugin';
class SassTypingsPlugin {
    constructor() {
        this.pluginName = PLUGIN_NAME;
    }
    /**
     * Generate typings for Sass files before TypeScript compilation.
     */
    apply(heftSession, heftConfiguration) {
        heftSession.hooks.build.tap(PLUGIN_NAME, (build) => {
            build.hooks.preCompile.tap(PLUGIN_NAME, (preCompile) => {
                preCompile.hooks.run.tapPromise(PLUGIN_NAME, async () => {
                    await this._runSassTypingsGeneratorAsync(heftSession, heftConfiguration, build.properties.watchMode);
                });
            });
        });
    }
    async _runSassTypingsGeneratorAsync(heftSession, heftConfiguration, isWatchMode) {
        const logger = heftSession.requestScopedLogger('sass-typings-generator');
        const sassConfiguration = await this._loadSassConfigurationAsync(heftConfiguration, logger);
        const sassTypingsGenerator = new SassTypingsGenerator_1.SassTypingsGenerator({
            buildFolder: heftConfiguration.buildFolder,
            sassConfiguration
        });
        await sassTypingsGenerator.generateTypingsAsync();
        if (isWatchMode) {
            Async_1.Async.runWatcherWithErrorHandling(async () => await sassTypingsGenerator.runWatcherAsync(), logger);
        }
    }
    async _loadSassConfigurationAsync(heftConfiguration, logger) {
        const { buildFolder } = heftConfiguration;
        const sassConfigurationJson = await CoreConfigFiles_1.CoreConfigFiles.sassConfigurationFileLoader.tryLoadConfigurationFileForProjectAsync(logger.terminal, buildFolder, heftConfiguration.rigConfig);
        return Object.assign({}, sassConfigurationJson);
    }
}
exports.SassTypingsPlugin = SassTypingsPlugin;
//# sourceMappingURL=SassTypingsPlugin.js.map