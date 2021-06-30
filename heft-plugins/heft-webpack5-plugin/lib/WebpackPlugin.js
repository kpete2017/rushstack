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
exports.WebpackPlugin = void 0;
const nodePath = __importStar(require("path"));
const webpack_1 = __importDefault(require("webpack"));
const node_core_library_1 = require("@rushstack/node-core-library");
const shared_1 = require("./shared");
const WebpackConfigurationLoader_1 = require("./WebpackConfigurationLoader");
const PLUGIN_NAME = 'WebpackPlugin';
const WEBPACK_DEV_SERVER_PACKAGE_NAME = 'webpack-dev-server';
const WEBPACK_DEV_SERVER_ENV_VAR_NAME = 'WEBPACK_DEV_SERVER';
/**
 * @internal
 */
class WebpackPlugin {
    constructor() {
        this.pluginName = PLUGIN_NAME;
    }
    apply(heftSession, heftConfiguration) {
        heftSession.hooks.build.tap(PLUGIN_NAME, (build) => {
            build.hooks.bundle.tap(PLUGIN_NAME, (bundle) => {
                bundle.hooks.configureWebpack.tap({ name: PLUGIN_NAME, stage: Number.MIN_SAFE_INTEGER }, (webpackConfiguration) => {
                    const webpackVersions = shared_1.getWebpackVersions();
                    bundle.properties.webpackVersion = webpack_1.default.version;
                    bundle.properties.webpackDevServerVersion = webpackVersions.webpackDevServerVersion;
                    return webpackConfiguration;
                });
                bundle.hooks.configureWebpack.tapPromise(PLUGIN_NAME, async (existingConfiguration) => {
                    const logger = heftSession.requestScopedLogger('configure-webpack');
                    if (existingConfiguration) {
                        logger.terminal.writeVerboseLine('Skipping loading webpack config file because the webpack config has already been set.');
                        return existingConfiguration;
                    }
                    else {
                        return await WebpackConfigurationLoader_1.WebpackConfigurationLoader.tryLoadWebpackConfigAsync(logger, heftConfiguration.buildFolder, build.properties);
                    }
                });
                bundle.hooks.run.tapPromise(PLUGIN_NAME, async () => {
                    await this._runWebpackAsync(heftSession, heftConfiguration, bundle.properties, build.properties, heftConfiguration.terminalProvider.supportsColor);
                });
            });
        });
    }
    async _runWebpackAsync(heftSession, heftConfiguration, bundleSubstageProperties, buildProperties, supportsColor) {
        const webpackConfiguration = bundleSubstageProperties.webpackConfiguration;
        if (!webpackConfiguration) {
            return;
        }
        const logger = heftSession.requestScopedLogger('webpack');
        const webpackVersions = shared_1.getWebpackVersions();
        if (bundleSubstageProperties.webpackVersion !== webpackVersions.webpackVersion) {
            logger.emitError(new Error(`The Webpack plugin expected to be configured with Webpack version ${webpackVersions.webpackVersion}, ` +
                `but the configuration specifies version ${bundleSubstageProperties.webpackVersion}. ` +
                'Are multiple versions of the Webpack plugin present?'));
        }
        if (bundleSubstageProperties.webpackDevServerVersion !== webpackVersions.webpackDevServerVersion) {
            logger.emitError(new Error(`The Webpack plugin expected to be configured with webpack-dev-server version ${webpackVersions.webpackDevServerVersion}, ` +
                `but the configuration specifies version ${bundleSubstageProperties.webpackDevServerVersion}. ` +
                'Are multiple versions of the Webpack plugin present?'));
        }
        logger.terminal.writeLine(`Using Webpack version ${webpack_1.default.version}`);
        const compiler = Array.isArray(webpackConfiguration)
            ? webpack_1.default(webpackConfiguration) /* (webpack.Compilation[]) => webpack.MultiCompiler */
            : webpack_1.default(webpackConfiguration); /* (webpack.Compilation) => webpack.Compiler */
        if (buildProperties.serveMode) {
            const defaultDevServerOptions = {
                host: 'localhost',
                publicPath: '/',
                filename: '[name]_[hash].js',
                clientLogLevel: 'info',
                stats: {
                    cached: false,
                    cachedAssets: false,
                    colors: supportsColor
                },
                port: 8080
            };
            let options;
            if (Array.isArray(webpackConfiguration)) {
                const devServerOptions = webpackConfiguration
                    .map((configuration) => configuration.devServer)
                    .filter((devServer) => !!devServer);
                if (devServerOptions.length > 1) {
                    logger.emitWarning(new Error(`Detected multiple webpack devServer configurations, using the first one.`));
                }
                if (devServerOptions.length > 0) {
                    options = Object.assign(Object.assign({}, defaultDevServerOptions), devServerOptions[0]);
                }
                else {
                    options = defaultDevServerOptions;
                }
            }
            else {
                options = Object.assign(Object.assign({}, defaultDevServerOptions), webpackConfiguration.devServer);
            }
            // Register a plugin to callback after webpack is done with the first compilation
            // so we can move on to post-build
            let firstCompilationDoneCallback;
            const originalBeforeCallback = options.before;
            options.before = (app, devServer, compiler) => {
                compiler.hooks.done.tap('heft-webpack-plugin', () => {
                    if (firstCompilationDoneCallback) {
                        firstCompilationDoneCallback();
                        firstCompilationDoneCallback = undefined;
                    }
                });
                if (originalBeforeCallback) {
                    return originalBeforeCallback(app, devServer, compiler);
                }
            };
            // The webpack-dev-server package has a design flaw, where merely loading its package will set the
            // WEBPACK_DEV_SERVER environment variable -- even if no APIs are accessed. This environment variable
            // causes incorrect behavior if Heft is not running in serve mode. Thus, we need to be careful to call require()
            // only if Heft is in serve mode.
            const WebpackDevServer = require(WEBPACK_DEV_SERVER_PACKAGE_NAME);
            // TODO: the WebpackDevServer accepts a third parameter for a logger. We should make
            // use of that to make logging cleaner
            const webpackDevServer = new WebpackDevServer(compiler, options);
            await new Promise((resolve, reject) => {
                firstCompilationDoneCallback = resolve;
                webpackDevServer.listen(options.port, options.host, (error) => {
                    if (error) {
                        reject(error);
                    }
                });
            });
        }
        else {
            if (process.env[WEBPACK_DEV_SERVER_ENV_VAR_NAME]) {
                logger.emitWarning(new Error(`The "${WEBPACK_DEV_SERVER_ENV_VAR_NAME}" environment variable is set, ` +
                    'which will cause problems when webpack is not running in serve mode. ' +
                    `(Did a dependency inadvertently load the "${WEBPACK_DEV_SERVER_PACKAGE_NAME}" package?)`));
            }
            let stats;
            if (buildProperties.watchMode) {
                try {
                    stats = await node_core_library_1.LegacyAdapters.convertCallbackToPromise(compiler.watch.bind(compiler), {});
                }
                catch (e) {
                    logger.emitError(e);
                }
            }
            else {
                try {
                    stats = await node_core_library_1.LegacyAdapters.convertCallbackToPromise(compiler.run.bind(compiler));
                    await node_core_library_1.LegacyAdapters.convertCallbackToPromise(compiler.close.bind(compiler));
                }
                catch (e) {
                    logger.emitError(e);
                }
            }
            if (stats) {
                // eslint-disable-next-line require-atomic-updates
                buildProperties.webpackStats = stats;
                this._emitErrors(logger, heftConfiguration.buildFolder, stats);
            }
        }
    }
    _emitErrors(logger, buildFolder, stats) {
        if (stats.hasErrors() || stats.hasWarnings()) {
            const serializedStats = stats.toJson('errors-warnings');
            if (serializedStats.warnings) {
                for (const warning of serializedStats.warnings) {
                    logger.emitWarning(this._normalizeError(buildFolder, warning));
                }
            }
            if (serializedStats.errors) {
                for (const error of serializedStats.errors) {
                    logger.emitError(this._normalizeError(buildFolder, error));
                }
            }
        }
    }
    _normalizeError(buildFolder, error) {
        if (error instanceof Error) {
            return error;
        }
        else {
            let moduleName = error.moduleName;
            if (!moduleName && error.moduleIdentifier) {
                moduleName = node_core_library_1.Path.convertToSlashes(nodePath.relative(buildFolder, error.moduleIdentifier));
            }
            let formattedError;
            if (error.loc && moduleName) {
                formattedError = `${moduleName}:${error.loc} - ${error.message}`;
            }
            else if (moduleName) {
                formattedError = `${moduleName} - ${error.message}`;
            }
            else {
                formattedError = error.message;
            }
            return new Error(formattedError);
        }
    }
}
exports.WebpackPlugin = WebpackPlugin;
//# sourceMappingURL=WebpackPlugin.js.map