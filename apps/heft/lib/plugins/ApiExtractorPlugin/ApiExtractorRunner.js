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
exports.ApiExtractorRunner = void 0;
const semver = __importStar(require("semver"));
const path = __importStar(require("path"));
const node_core_library_1 = require("@rushstack/node-core-library");
const SubprocessRunnerBase_1 = require("../../utilities/subprocess/SubprocessRunnerBase");
class ApiExtractorRunner extends SubprocessRunnerBase_1.SubprocessRunnerBase {
    get filename() {
        return __filename;
    }
    async invokeAsync() {
        this._scopedLogger = await this.requestScopedLoggerAsync('api-extractor');
        this._terminal = this._scopedLogger.terminal;
        const apiExtractor = require(this._configuration.apiExtractorPackagePath);
        this._scopedLogger.terminal.writeLine(`Using API Extractor version ${apiExtractor.Extractor.version}`);
        const apiExtractorVersion = semver.parse(apiExtractor.Extractor.version);
        if (!apiExtractorVersion ||
            apiExtractorVersion.major < 7 ||
            (apiExtractorVersion.major === 7 && apiExtractorVersion.minor < 10)) {
            this._scopedLogger.emitWarning(new Error(`Heft requires API Extractor version 7.10.0 or newer`));
        }
        const configObjectFullPath = this._configuration.apiExtractorJsonFilePath;
        const configObject = apiExtractor.ExtractorConfig.loadFile(configObjectFullPath);
        const extractorConfig = apiExtractor.ExtractorConfig.prepare({
            configObject,
            configObjectFullPath,
            packageJsonFullPath: path.join(this._configuration.buildFolder, 'package.json'),
            projectFolderLookupToken: this._configuration.buildFolder
        });
        const extractorOptions = {
            localBuild: !this._configuration.production,
            typescriptCompilerFolder: this._configuration.typescriptPackagePath,
            messageCallback: (message) => {
                switch (message.logLevel) {
                    case "error" /* Error */: {
                        let logMessage;
                        if (message.sourceFilePath) {
                            const filePathForLog = node_core_library_1.Path.isUnderOrEqual(message.sourceFilePath, this._configuration.buildFolder)
                                ? path.relative(this._configuration.buildFolder, message.sourceFilePath)
                                : message.sourceFilePath;
                            logMessage =
                                `${filePathForLog}:${message.sourceFileLine}:${message.sourceFileColumn} - ` +
                                    `(${message.category}) ${message.text}`;
                        }
                        else {
                            logMessage = message.text;
                        }
                        this._scopedLogger.emitError(new Error(logMessage));
                        break;
                    }
                    case "warning" /* Warning */: {
                        let logMessage;
                        if (message.sourceFilePath) {
                            const filePathForLog = node_core_library_1.Path.isUnderOrEqual(message.sourceFilePath, this._configuration.buildFolder)
                                ? path.relative(this._configuration.buildFolder, message.sourceFilePath)
                                : message.sourceFilePath;
                            logMessage =
                                `${filePathForLog}:${message.sourceFileLine}:${message.sourceFileColumn} - ` +
                                    `(${message.messageId}) ${message.text}`;
                        }
                        else {
                            logMessage = message.text;
                        }
                        this._scopedLogger.emitWarning(new Error(logMessage));
                        break;
                    }
                    case "verbose" /* Verbose */: {
                        this._terminal.writeVerboseLine(message.text);
                        break;
                    }
                    case "info" /* Info */: {
                        this._terminal.writeLine(message.text);
                        break;
                    }
                    case "none" /* None */: {
                        // Ignore messages with ExtractorLogLevel.None
                        break;
                    }
                    default:
                        this._scopedLogger.emitError(new Error(`Unexpected API Extractor log level: ${message.logLevel}`));
                }
                message.handled = true;
            }
        };
        const apiExtractorResult = apiExtractor.Extractor.invoke(extractorConfig, extractorOptions);
        const { errorCount, warningCount } = apiExtractorResult;
        if (errorCount > 0) {
            this._terminal.writeErrorLine(`API Extractor completed with ${errorCount} error${errorCount > 1 ? 's' : ''}`);
        }
        else if (warningCount > 0) {
            this._terminal.writeWarningLine(`API Extractor completed with ${warningCount} warning${warningCount > 1 ? 's' : ''}`);
        }
        if (!apiExtractorResult.succeeded) {
            throw new Error('API Extractor failed.');
        }
        if (apiExtractorResult.apiReportChanged && this._configuration.production) {
            throw new Error('API Report changed.');
        }
    }
}
exports.ApiExtractorRunner = ApiExtractorRunner;
//# sourceMappingURL=ApiExtractorRunner.js.map