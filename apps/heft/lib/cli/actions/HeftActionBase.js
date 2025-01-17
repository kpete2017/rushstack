"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeftActionBase = void 0;
const ts_command_line_1 = require("@rushstack/ts-command-line");
const node_core_library_1 = require("@rushstack/node-core-library");
const perf_hooks_1 = require("perf_hooks");
const Constants_1 = require("../../utilities/Constants");
class HeftActionBase extends ts_command_line_1.CommandLineAction {
    constructor(commandLineOptions, heftActionOptions) {
        super(commandLineOptions);
        this.terminal = heftActionOptions.terminal;
        this.loggingManager = heftActionOptions.loggingManager;
        this.metricsCollector = heftActionOptions.metricsCollector;
        this.heftConfiguration = heftActionOptions.heftConfiguration;
        this.stages = heftActionOptions.stages;
        this.setStartTime();
    }
    onDefineParameters() {
        this.verboseFlag = this.defineFlagParameter({
            parameterLongName: '--verbose',
            parameterShortName: '-v',
            description: 'If specified, log information useful for debugging.'
        });
    }
    defineChoiceParameter(options) {
        this._validateDefinedParameter(options);
        return super.defineChoiceParameter(options);
    }
    defineFlagParameter(options) {
        this._validateDefinedParameter(options);
        return super.defineFlagParameter(options);
    }
    defineIntegerParameter(options) {
        this._validateDefinedParameter(options);
        return super.defineIntegerParameter(options);
    }
    defineStringParameter(options) {
        this._validateDefinedParameter(options);
        return super.defineStringParameter(options);
    }
    defineStringListParameter(options) {
        this._validateDefinedParameter(options);
        return super.defineStringListParameter(options);
    }
    setStartTime() {
        this.metricsCollector.setStartTime();
    }
    recordMetrics() {
        this.metricsCollector.record(this.actionName);
    }
    async onExecute() {
        this.terminal.writeLine(`Starting ${this.actionName}`);
        if (this.verboseFlag.value) {
            if (this.heftConfiguration.terminalProvider instanceof node_core_library_1.ConsoleTerminalProvider) {
                this.heftConfiguration.terminalProvider.verboseEnabled = true;
            }
        }
        let encounteredError = false;
        try {
            await this.actionExecuteAsync();
            await this.afterExecuteAsync();
        }
        catch (e) {
            encounteredError = true;
            throw e;
        }
        finally {
            this.recordMetrics();
            const warningStrings = this.loggingManager.getWarningStrings();
            const errorStrings = this.loggingManager.getErrorStrings();
            const encounteredWarnings = warningStrings.length > 0;
            encounteredError = encounteredError || errorStrings.length > 0;
            this.terminal.writeLine(node_core_library_1.Colors.bold((encounteredError ? node_core_library_1.Colors.red : encounteredWarnings ? node_core_library_1.Colors.yellow : node_core_library_1.Colors.green)(`-------------------- Finished (${Math.round(perf_hooks_1.performance.now()) / 1000}s) --------------------`)));
            if (warningStrings.length > 0) {
                this.terminal.writeWarningLine(`Encountered ${warningStrings.length} warnings:`);
                for (const warningString of warningStrings) {
                    this.terminal.writeWarningLine(`  ${warningString}`);
                }
            }
            if (errorStrings.length > 0) {
                this.terminal.writeErrorLine(`Encountered ${errorStrings.length} errors:`);
                for (const errorString of errorStrings) {
                    this.terminal.writeErrorLine(`  ${errorString}`);
                }
            }
            const projectPackageJson = this.heftConfiguration.projectPackageJson;
            this.terminal.writeLine(`Project: ${projectPackageJson.name}`, node_core_library_1.Colors.dim(node_core_library_1.Colors.gray(`@${projectPackageJson.version}`)));
            this.terminal.writeLine(`Heft version: ${this.heftConfiguration.heftPackageJson.version}`);
            this.terminal.writeLine(`Node version: ${process.version}`);
        }
        if (encounteredError) {
            throw new node_core_library_1.AlreadyReportedError();
        }
    }
    /**
     * @virtual
     */
    async afterExecuteAsync() {
        /* no-op by default */
    }
    _validateDefinedParameter(options) {
        if (options.parameterLongName === Constants_1.Constants.pluginParameterLongName ||
            options.parameterLongName === Constants_1.Constants.debugParameterLongName) {
            throw new Error(`Actions must not register a parameter with longName "${options.parameterLongName}".`);
        }
    }
}
exports.HeftActionBase = HeftActionBase;
//# sourceMappingURL=HeftActionBase.js.map