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
exports.WebpackConfigurationUpdater = void 0;
const path = __importStar(require("path"));
const lodash = __importStar(require("lodash"));
const Constants_1 = require("./utilities/Constants");
const FILE_TOKEN_REGEX = new RegExp(lodash.escapeRegExp('[file]'));
class WebpackConfigurationUpdater {
    static amendWebpackConfigurationForMultiLocale(options) {
        const loader = path.resolve(__dirname, 'loaders', 'LocLoader.js');
        const loaderOptions = {
            pluginInstance: options.pluginInstance,
            resxNewlineNormalization: options.resxNewlineNormalization
        };
        WebpackConfigurationUpdater._addLoadersForLocFiles(options, loader, loaderOptions);
        WebpackConfigurationUpdater._tryUpdateLocaleTokenInPublicPathPlugin(options);
        WebpackConfigurationUpdater._tryUpdateSourceMapFilename(options.configuration);
    }
    static amendWebpackConfigurationForInPlaceLocFiles(options) {
        const loader = path.resolve(__dirname, 'loaders', 'InPlaceLocFileLoader.js');
        const loaderOptions = {
            resxNewlineNormalization: options.resxNewlineNormalization
        };
        WebpackConfigurationUpdater._addRulesToConfiguration(options.configuration, [
            {
                test: Constants_1.Constants.LOC_JSON_REGEX,
                use: [
                    {
                        loader: loader,
                        options: loaderOptions
                    }
                ]
            },
            {
                test: Constants_1.Constants.RESX_REGEX,
                use: [
                    {
                        loader: loader,
                        options: loaderOptions
                    }
                ],
                type: 'json'
            }
        ]);
    }
    static _tryUpdateLocaleTokenInPublicPathPlugin(options) {
        let setPublicPathPlugin;
        try {
            const pluginPackage = require('@rushstack/set-webpack-public-path-plugin');
            setPublicPathPlugin = pluginPackage.SetPublicPathPlugin;
        }
        catch (e) {
            // public path plugin isn't present - ignore
        }
        if (setPublicPathPlugin && options.configuration.plugins) {
            for (const plugin of options.configuration.plugins) {
                if (plugin instanceof setPublicPathPlugin) {
                    if (plugin.options &&
                        plugin.options.scriptName &&
                        plugin.options.scriptName.isTokenized &&
                        plugin.options.scriptName.name) {
                        plugin.options.scriptName.name = plugin.options.scriptName.name.replace(/\[locale\]/g, options.localeNameOrPlaceholder);
                    }
                }
            }
        }
    }
    static _addLoadersForLocFiles(options, loader, loaderOptions) {
        WebpackConfigurationUpdater._addRulesToConfiguration(options.configuration, [
            {
                test: {
                    and: [(filePath) => !options.filesToIgnore.has(filePath), Constants_1.Constants.LOC_JSON_REGEX]
                },
                use: [
                    {
                        loader: loader,
                        options: loaderOptions
                    }
                ]
            },
            {
                test: {
                    and: [(filePath) => !options.filesToIgnore.has(filePath), Constants_1.Constants.RESX_REGEX]
                },
                use: [
                    {
                        loader: loader,
                        options: loaderOptions
                    }
                ],
                type: 'json'
            }
        ]);
    }
    static _addRulesToConfiguration(configuration, rules) {
        if (!configuration.module) {
            configuration.module = {
                rules: []
            };
        }
        if (!configuration.module.rules) {
            configuration.module.rules = [];
        }
        configuration.module.rules.push(...rules);
    }
    static _tryUpdateSourceMapFilename(configuration) {
        if (!configuration.output) {
            configuration.output = {}; // This should never happen
        }
        if (configuration.output.sourceMapFilename !== undefined) {
            configuration.output.sourceMapFilename = configuration.output.sourceMapFilename.replace(FILE_TOKEN_REGEX, Constants_1.Constants.NO_LOCALE_SOURCE_MAP_FILENAME_TOKEN);
        }
    }
}
exports.WebpackConfigurationUpdater = WebpackConfigurationUpdater;
//# sourceMappingURL=WebpackConfigurationUpdater.js.map