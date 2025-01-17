"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeftSession = void 0;
/**
 * @public
 */
class HeftSession {
    /**
     * @internal
     */
    constructor(options, internalSessionOptions) {
        this._options = options;
        this._loggingManager = internalSessionOptions.loggingManager;
        this.metricsCollector = internalSessionOptions.metricsCollector;
        this.registerAction = internalSessionOptions.registerAction;
        this.hooks = {
            metricsCollector: this.metricsCollector.hooks,
            heftLifecycle: internalSessionOptions.heftLifecycleHook,
            build: internalSessionOptions.buildStage.stageInitializationHook,
            clean: internalSessionOptions.cleanStage.stageInitializationHook,
            test: internalSessionOptions.testStage.stageInitializationHook
        };
        this._getIsDebugMode = internalSessionOptions.getIsDebugMode;
        this.requestAccessToPluginByName = options.requestAccessToPluginByName;
    }
    /**
     * If set to true, the build is running with the --debug flag
     */
    get debugMode() {
        return this._getIsDebugMode();
    }
    /**
     * Call this function to request a logger with the specified name.
     */
    requestScopedLogger(loggerName) {
        return this._loggingManager.requestScopedLogger(this._options.plugin, loggerName);
    }
}
exports.HeftSession = HeftSession;
//# sourceMappingURL=HeftSession.js.map