"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggingManager = void 0;
const ScopedLogger_1 = require("./ScopedLogger");
const FileError_1 = require("./FileError");
class LoggingManager {
    constructor(options) {
        this._scopedLoggers = new Map();
        this._shouldPrintStacks = false;
        this._hasAnyErrors = false;
        this._options = options;
    }
    get errorsHaveBeenEmitted() {
        return this._hasAnyErrors;
    }
    enablePrintStacks() {
        this._shouldPrintStacks = true;
    }
    requestScopedLogger(plugin, loggerName) {
        const existingScopedLogger = this._scopedLoggers.get(loggerName);
        if (existingScopedLogger) {
            throw new Error(`A named logger with name "${loggerName}" has already been requested ` +
                `by plugin "${existingScopedLogger._requestingPlugin.pluginName}".`);
        }
        else {
            const scopedLogger = new ScopedLogger_1.ScopedLogger({
                requestingPlugin: plugin,
                loggerName,
                terminalProvider: this._options.terminalProvider,
                getShouldPrintStacks: () => this._shouldPrintStacks,
                errorHasBeenEmittedCallback: () => (this._hasAnyErrors = true)
            });
            this._scopedLoggers.set(loggerName, scopedLogger);
            return scopedLogger;
        }
    }
    getErrorStrings(fileErrorFormat) {
        const result = [];
        for (const scopedLogger of this._scopedLoggers.values()) {
            result.push(...scopedLogger.errors.map((error) => `[${scopedLogger.loggerName}] ${LoggingManager.getErrorMessage(error, fileErrorFormat)}`));
        }
        return result;
    }
    getWarningStrings(fileErrorFormat) {
        const result = [];
        for (const scopedLogger of this._scopedLoggers.values()) {
            result.push(...scopedLogger.warnings.map((warning) => `[${scopedLogger.loggerName}] ${LoggingManager.getErrorMessage(warning, fileErrorFormat)}`));
        }
        return result;
    }
    static getErrorMessage(error, fileErrorFormat) {
        if (error instanceof FileError_1.FileError) {
            return error.toString(fileErrorFormat);
        }
        else {
            return error.message;
        }
    }
}
exports.LoggingManager = LoggingManager;
//# sourceMappingURL=LoggingManager.js.map