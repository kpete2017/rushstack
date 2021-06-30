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
const path = __importStar(require("path"));
const node_core_library_1 = require("@rushstack/node-core-library");
/**
 * This custom reporter presents Jest test results using Heft's logging system.
 *
 * @privateRemarks
 * After making changes to this code, it's recommended to use `--debug-heft-reporter` to compare
 * with the output from Jest's default reporter, to check our output is consistent with typical
 * Jest behavior.
 *
 * For reference, Jest's default implementation is here:
 * https://github.com/facebook/jest/blob/master/packages/jest-reporters/src/default_reporter.ts
 */
class HeftJestReporter {
    constructor(jestConfig, options) {
        this._terminal = options.heftConfiguration.globalTerminal;
        this._buildFolder = options.heftConfiguration.buildFolder;
        this._debugMode = options.debugMode;
    }
    async onTestStart(test) {
        this._terminal.writeLine(node_core_library_1.Colors.whiteBackground(node_core_library_1.Colors.black('START')), ` ${this._getTestPath(test.path)}`);
    }
    async onTestResult(test, testResult, aggregatedResult) {
        this._writeConsoleOutput(testResult);
        const { numPassingTests, numFailingTests, failureMessage, testExecError } = testResult;
        if (numFailingTests > 0) {
            this._terminal.write(node_core_library_1.Colors.redBackground(node_core_library_1.Colors.black('FAIL')));
        }
        else if (testExecError) {
            this._terminal.write(node_core_library_1.Colors.redBackground(node_core_library_1.Colors.black(`FAIL (${testExecError.type})`)));
        }
        else {
            this._terminal.write(node_core_library_1.Colors.greenBackground(node_core_library_1.Colors.black('PASS')));
        }
        const duration = test.duration ? `${test.duration / 1000}s` : '?';
        this._terminal.writeLine(` ${this._getTestPath(test.path)} (duration: ${duration}, ${numPassingTests} passed, ${numFailingTests} failed)`);
        if (failureMessage) {
            this._terminal.writeErrorLine(failureMessage);
        }
        if (testResult.snapshot.updated) {
            this._terminal.writeErrorLine(`Updated ${this._formatWithPlural(testResult.snapshot.updated, 'snapshot', 'snapshots')}`);
        }
        if (testResult.snapshot.added) {
            this._terminal.writeErrorLine(`Added ${this._formatWithPlural(testResult.snapshot.added, 'snapshot', 'snapshots')}`);
        }
    }
    // Tests often write messy console output.  For example, it may contain messages such as
    // "ERROR: Test successfully threw an exception!", which may confuse someone who is investigating
    // a build failure and searching its log output for errors.  To reduce confusion, we add a prefix
    // like "|console.error|" to each output line, to clearly distinguish test logging from regular
    // task output.  You can suppress test logging entirely using the "--silent" CLI parameter.
    _writeConsoleOutput(testResult) {
        if (testResult.console) {
            for (const logEntry of testResult.console) {
                switch (logEntry.type) {
                    case 'debug':
                        this._writeConsoleOutputWithLabel('console.debug', logEntry.message);
                        break;
                    case 'log':
                        this._writeConsoleOutputWithLabel('console.log', logEntry.message);
                        break;
                    case 'warn':
                        this._writeConsoleOutputWithLabel('console.warn', logEntry.message);
                        break;
                    case 'error':
                        this._writeConsoleOutputWithLabel('console.error', logEntry.message);
                        break;
                    case 'info':
                        this._writeConsoleOutputWithLabel('console.info', logEntry.message);
                        break;
                    case 'groupCollapsed':
                        if (this._debugMode) {
                            // The "groupCollapsed" name is too long
                            this._writeConsoleOutputWithLabel('collapsed', logEntry.message);
                        }
                        break;
                    case 'assert':
                    case 'count':
                    case 'dir':
                    case 'dirxml':
                    case 'group':
                    case 'time':
                        if (this._debugMode) {
                            this._writeConsoleOutputWithLabel(logEntry.type, `(${logEntry.type}) ${logEntry.message}`, true);
                        }
                        break;
                    default:
                        // Let's trap any new log types that get introduced in the future to make sure we handle
                        // them correctly.
                        throw new node_core_library_1.InternalError('Unimplemented Jest console log entry type: ' + logEntry.type);
                }
            }
        }
    }
    _writeConsoleOutputWithLabel(label, message, debug) {
        if (message === '') {
            return;
        }
        const scrubbedMessage = node_core_library_1.Text.ensureTrailingNewline(node_core_library_1.Text.convertToLf(message));
        const lines = scrubbedMessage.split('\n').slice(0, -1);
        const PAD_LENGTH = 13; // "console.error" is the longest label
        const paddedLabel = '|' + label.padStart(PAD_LENGTH) + '|';
        const prefix = debug ? node_core_library_1.Colors.yellow(paddedLabel) : node_core_library_1.Colors.cyan(paddedLabel);
        for (const line of lines) {
            this._terminal.writeLine(prefix, ' ' + line);
        }
    }
    async onRunStart(aggregatedResult, options) {
        // Jest prints some text that changes the console's color without a newline, so we reset the console's color here
        // and print a newline.
        this._terminal.writeLine('\u001b[0m');
        this._terminal.writeLine(`Run start. ${this._formatWithPlural(aggregatedResult.numTotalTestSuites, 'test suite', 'test suites')}`);
    }
    async onRunComplete(contexts, results) {
        const { numPassedTests, numFailedTests, numTotalTests, numRuntimeErrorTestSuites } = results;
        this._terminal.writeLine();
        this._terminal.writeLine('Tests finished:');
        const successesText = `  Successes: ${numPassedTests}`;
        this._terminal.writeLine(numPassedTests > 0 ? node_core_library_1.Colors.green(successesText) : successesText);
        const failText = `  Failures: ${numFailedTests}`;
        this._terminal.writeLine(numFailedTests > 0 ? node_core_library_1.Colors.red(failText) : failText);
        if (numRuntimeErrorTestSuites) {
            this._terminal.writeLine(node_core_library_1.Colors.red(`  Failed test suites: ${numRuntimeErrorTestSuites}`));
        }
        this._terminal.writeLine(`  Total: ${numTotalTests}`);
    }
    getLastError() {
        // This reporter doesn't have any errors to throw
    }
    _getTestPath(fullTestPath) {
        return path.relative(this._buildFolder, fullTestPath);
    }
    _formatWithPlural(num, singular, plural) {
        return `${num} ${num === 1 ? singular : plural}`;
    }
}
exports.default = HeftJestReporter;
//# sourceMappingURL=HeftJestReporter.js.map