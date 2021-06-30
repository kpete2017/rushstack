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
exports.WebpackConfigurationLoader = void 0;
const path = __importStar(require("path"));
const node_core_library_1 = require("@rushstack/node-core-library");
const WEBPACK_CONFIG_FILENAME = 'webpack.config.js';
const WEBPACK_DEV_CONFIG_FILENAME = 'webpack.dev.config.js';
class WebpackConfigurationLoader {
    static async tryLoadWebpackConfigAsync(logger, buildFolder, buildProperties) {
        // TODO: Eventually replace this custom logic with a call to this utility in in webpack-cli:
        // https://github.com/webpack/webpack-cli/blob/next/packages/webpack-cli/lib/groups/ConfigGroup.js
        let webpackConfigJs;
        try {
            if (buildProperties.serveMode) {
                logger.terminal.writeVerboseLine(`Attempting to load webpack configuration from "${WEBPACK_DEV_CONFIG_FILENAME}".`);
                webpackConfigJs = WebpackConfigurationLoader._tryLoadWebpackConfiguration(buildFolder, WEBPACK_DEV_CONFIG_FILENAME);
            }
            if (!webpackConfigJs) {
                logger.terminal.writeVerboseLine(`Attempting to load webpack configuration from "${WEBPACK_CONFIG_FILENAME}".`);
                webpackConfigJs = WebpackConfigurationLoader._tryLoadWebpackConfiguration(buildFolder, WEBPACK_CONFIG_FILENAME);
            }
        }
        catch (error) {
            logger.emitError(error);
        }
        if (webpackConfigJs) {
            const webpackConfig = webpackConfigJs.default || webpackConfigJs;
            if (typeof webpackConfig === 'function') {
                return webpackConfig({ prod: buildProperties.production, production: buildProperties.production });
            }
            else {
                return webpackConfig;
            }
        }
        else {
            return undefined;
        }
    }
    static _tryLoadWebpackConfiguration(buildFolder, configurationFilename) {
        const fullWebpackConfigPath = path.join(buildFolder, configurationFilename);
        if (node_core_library_1.FileSystem.exists(fullWebpackConfigPath)) {
            try {
                return require(fullWebpackConfigPath);
            }
            catch (e) {
                throw new Error(`Error loading webpack configuration at "${fullWebpackConfigPath}": ${e}`);
            }
        }
        else {
            return undefined;
        }
    }
}
exports.WebpackConfigurationLoader = WebpackConfigurationLoader;
//# sourceMappingURL=WebpackConfigurationLoader.js.map