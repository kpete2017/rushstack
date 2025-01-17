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
const webpack = require("webpack");
const workerThreads = __importStar(require("worker_threads"));
const MessagePortMinifier_1 = require("../MessagePortMinifier");
const ModuleMinifierPlugin_1 = require("../ModuleMinifierPlugin");
require("../OverrideWebpackIdentifierAllocation");
// Hack to support mkdirp on node 10
process.umask = () => 0;
const { configFilePath, sourceMap, usePortableModules } = workerThreads.workerData;
const webpackConfigs = require(configFilePath); // eslint-disable-line @typescript-eslint/no-var-requires
// chalk.enabled = enableColor;
const minifier = new MessagePortMinifier_1.MessagePortMinifier(workerThreads.parentPort);
async function processTaskAsync(index) {
    const config = webpackConfigs[index];
    console.log(`Compiling config: ${config.name || (config.output && config.output.filename)}`);
    const optimization = config.optimization || (config.optimization = {});
    const { minimizer } = optimization;
    if (minimizer) {
        for (const plugin of minimizer) {
            if (plugin instanceof ModuleMinifierPlugin_1.ModuleMinifierPlugin) {
                plugin.minifier = minifier;
            }
        }
    }
    else {
        const { devtool, mode } = config;
        const finalSourceMap = typeof sourceMap === 'boolean'
            ? sourceMap
            : typeof devtool === 'string'
                ? devtool.endsWith('source-map') && !devtool.includes('eval')
                : devtool !== false && mode === 'production';
        optimization.minimizer = [
            new ModuleMinifierPlugin_1.ModuleMinifierPlugin({
                minifier,
                usePortableModules,
                sourceMap: finalSourceMap
            })
        ];
    }
    await new Promise((resolve, reject) => {
        const compiler = webpack(config);
        compiler.run(async (err, stats) => {
            if (err) {
                return reject(err);
            }
            if (stats && stats.hasErrors()) {
                const errorStats = stats.toJson('errors-only');
                errorStats.errors.forEach((error) => {
                    console.error(error);
                });
                return reject(new Error(`Webpack failed with ${errorStats.errors.length} error(s).`));
            }
            resolve();
        });
    });
}
process.exitCode = 3;
workerThreads.parentPort.on('message', (message) => {
    // Termination request
    if (message === false) {
        process.exit(0);
    }
    // Input for the MessagePortMinifier
    if (typeof message === 'object') {
        return;
    }
    const index = message;
    processTaskAsync(index).then(() => {
        workerThreads.parentPort.postMessage(index);
    }, (err) => {
        console.error(err);
        process.exit(1);
    });
});
//# sourceMappingURL=WebpackWorker.js.map