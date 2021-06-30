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
exports.Eslint = void 0;
const path = __importStar(require("path"));
const crypto = __importStar(require("crypto"));
const semver = __importStar(require("semver"));
const LinterBase_1 = require("./LinterBase");
const FileError_1 = require("../../pluginFramework/logging/FileError");
class Eslint extends LinterBase_1.LinterBase {
    constructor(options) {
        super('eslint', options);
        this._eslintTimings = new Map();
        this._patchTimer(options.eslintPackagePath); // This must happen before the rest of the linter package is loaded
        this._eslintPackagePath = options.eslintPackagePath;
        this._eslintPackage = require(options.eslintPackagePath);
    }
    printVersionHeader() {
        this._terminal.writeLine(`Using ESLint version ${this._eslintPackage.Linter.version}`);
        const majorVersion = semver.major(this._eslintPackage.Linter.version);
        if (majorVersion < 7) {
            throw new Error('Heft requires ESLint 7 or newer.  Your ESLint version is too old:\n' + this._eslintPackagePath);
        }
        if (majorVersion > 7) {
            // We don't use writeWarningLine() here because, if the person wants to take their chances with
            // a newer ESLint release, their build should be allowed to succeed.
            this._terminal.writeLine('The ESLint version is newer than the latest version that was tested with Heft; it may not work correctly:');
            this._terminal.writeLine(this._eslintPackagePath);
        }
    }
    reportFailures() {
        let eslintFailureCount = 0;
        const errors = [];
        const warnings = [];
        for (const eslintFileResult of this._lintResult) {
            const buildFolderRelativeFilePath = path.relative(this._buildFolderPath, eslintFileResult.filePath);
            for (const message of eslintFileResult.messages) {
                eslintFailureCount++;
                // https://eslint.org/docs/developer-guide/nodejs-api#◆-lintmessage-type
                const formattedMessage = message.ruleId
                    ? `(${message.ruleId}) ${message.message}`
                    : message.message;
                const errorObject = new FileError_1.FileError(formattedMessage, buildFolderRelativeFilePath, message.line, message.column);
                switch (message.severity) {
                    case 2 /* error */: {
                        errors.push(errorObject);
                        break;
                    }
                    case 1 /* warning */: {
                        warnings.push(errorObject);
                        break;
                    }
                }
            }
        }
        if (eslintFailureCount > 0) {
            this._terminal.writeLine(`Encountered ${eslintFailureCount} ESLint issue${eslintFailureCount > 1 ? 's' : ''}:`);
        }
        for (const error of errors) {
            this._scopedLogger.emitError(error);
        }
        for (const warning of warnings) {
            this._scopedLogger.emitWarning(warning);
        }
    }
    get cacheVersion() {
        const eslintConfigHash = crypto
            .createHash('sha1')
            .update(JSON.stringify(this._eslintBaseConfiguration));
        const eslintConfigVersion = `${this._eslintPackage.Linter.version}_${eslintConfigHash.digest('hex')}`;
        return eslintConfigVersion;
    }
    async initializeAsync() {
        this._eslint = new this._eslintPackage.ESLint({
            cwd: this._buildFolderPath,
            overrideConfigFile: this._linterConfigFilePath
        });
        this._eslintBaseConfiguration = await this._eslint.calculateConfigForFile(this._linterConfigFilePath);
        this._eslintCli = new this._eslintPackage.CLIEngine({
            cwd: this._buildFolderPath,
            configFile: this._linterConfigFilePath
        });
    }
    lintFile(sourceFile) {
        const lintResults = this._eslintCli.executeOnText(sourceFile.text, sourceFile.fileName).results;
        const failures = [];
        for (const lintResult of lintResults) {
            if (lintResult.messages.length > 0) {
                failures.push(lintResult);
            }
        }
        return failures;
    }
    lintingFinished(lintFailures) {
        this._lintResult = lintFailures;
        let omittedRuleCount = 0;
        for (const [ruleName, measurementName] of this._eslintTimings.entries()) {
            const timing = this.getTiming(measurementName);
            if (timing.duration > 0) {
                this._terminal.writeVerboseLine(`Rule "${ruleName}" duration: ${timing.duration}ms`);
            }
            else {
                omittedRuleCount++;
            }
        }
        if (omittedRuleCount > 0) {
            this._terminal.writeVerboseLine(`${omittedRuleCount} rules took 0ms`);
        }
    }
    async isFileExcludedAsync(filePath) {
        return await this._eslint.isPathIgnored(filePath);
    }
    _patchTimer(eslintPackagePath) {
        const timing = require(path.join(eslintPackagePath, 'lib', 'linter', 'timing'));
        timing.enabled = true;
        timing.time = (key, fn) => {
            const timingName = `Eslint${key}`;
            this._eslintTimings.set(key, timingName);
            return (...args) => this._measurePerformance(timingName, () => fn(...args));
        };
    }
}
exports.Eslint = Eslint;
//# sourceMappingURL=Eslint.js.map