"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.RunScriptPlugin = void 0;
const HeftEventPluginBase_1 = require("../pluginFramework/HeftEventPluginBase");
const Async_1 = require("../utilities/Async");
const Constants_1 = require("../utilities/Constants");
class RunScriptPlugin extends HeftEventPluginBase_1.HeftEventPluginBase {
    constructor() {
        super(...arguments);
        this.pluginName = 'RunScriptPlugin';
        this.eventActionName = 'runScript';
        this.loggerName = 'run-script';
    }
    /**
     * @override
     */
    async handleBuildEventActionsAsync(heftEvent, runScriptEventActions, logger, heftSession, heftConfiguration, properties) {
        await this._runScriptsForHeftEventActions(runScriptEventActions, logger, heftSession, heftConfiguration, properties);
    }
    /**
     * @override
     */
    async handleTestEventActionsAsync(heftEvent, runScriptEventActions, logger, heftSession, heftConfiguration, properties) {
        await this._runScriptsForHeftEventActions(runScriptEventActions, logger, heftSession, heftConfiguration, properties);
    }
    async _runScriptsForHeftEventActions(runScriptEventActions, logger, heftSession, heftConfiguration, properties) {
        await Async_1.Async.forEachLimitAsync(runScriptEventActions, Constants_1.Constants.maxParallelism, async (runScriptEventAction) => {
            // The scriptPath property should be fully resolved since it is included in the resolution logic used by
            // HeftConfiguration
            const resolvedModulePath = runScriptEventAction.scriptPath;
            // Use the HeftEvent.actionId field for the logger since this should identify the HeftEvent that the
            // script is sourced from. This is also a bit more user-friendly and customizable than simply using
            // the script name for the logger. We will also prefix the logger name with the plugin name to clarify
            // that the output is coming from the RunScriptPlugin.
            const scriptLogger = heftSession.requestScopedLogger(`${logger.loggerName}:${runScriptEventAction.actionId}`);
            const runScript = require(resolvedModulePath);
            if (runScript.run && runScript.runAsync) {
                throw new Error(`The script at "${resolvedModulePath}" exports both a "run" and a "runAsync" function`);
            }
            else if (!runScript.run && !runScript.runAsync) {
                throw new Error(`The script at "${resolvedModulePath}" doesn\'t export a "run" or a "runAsync" function`);
            }
            const runScriptOptions = {
                scopedLogger: scriptLogger,
                debugMode: heftSession.debugMode,
                scriptOptions: runScriptEventAction.scriptOptions,
                heftConfiguration,
                properties
            };
            if (runScript.run) {
                runScript.run(runScriptOptions);
            }
            else if (runScript.runAsync) {
                await runScript.runAsync(runScriptOptions);
            }
        });
    }
}
exports.RunScriptPlugin = RunScriptPlugin;
//# sourceMappingURL=RunScriptPlugin.js.map