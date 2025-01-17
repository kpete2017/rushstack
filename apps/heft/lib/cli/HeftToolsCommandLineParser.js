"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.HeftToolsCommandLineParser = void 0;
const ts_command_line_1 = require("@rushstack/ts-command-line");
const node_core_library_1 = require("@rushstack/node-core-library");
const argparse_1 = require("argparse");
const tapable_1 = require("tapable");
const MetricsCollector_1 = require("../metrics/MetricsCollector");
const CleanAction_1 = require("./actions/CleanAction");
const BuildAction_1 = require("./actions/BuildAction");
const StartAction_1 = require("./actions/StartAction");
const TestAction_1 = require("./actions/TestAction");
const PluginManager_1 = require("../pluginFramework/PluginManager");
const HeftConfiguration_1 = require("../configuration/HeftConfiguration");
const InternalHeftSession_1 = require("../pluginFramework/InternalHeftSession");
const CleanStage_1 = require("../stages/CleanStage");
const BuildStage_1 = require("../stages/BuildStage");
const TestStage_1 = require("../stages/TestStage");
const LoggingManager_1 = require("../pluginFramework/logging/LoggingManager");
const CustomAction_1 = require("./actions/CustomAction");
const Constants_1 = require("../utilities/Constants");
const HeftLifecycle_1 = require("../pluginFramework/HeftLifecycle");
class HeftToolsCommandLineParser extends ts_command_line_1.CommandLineParser {
    constructor() {
        super({
            toolFilename: 'heft',
            toolDescription: 'Heft is a pluggable build system designed for web projects.'
        });
        this._preInitializationArgumentValues = this._getPreInitializationArgumentValues();
        this._terminalProvider = new node_core_library_1.ConsoleTerminalProvider();
        this._terminal = new node_core_library_1.Terminal(this._terminalProvider);
        this._metricsCollector = new MetricsCollector_1.MetricsCollector();
        this._loggingManager = new LoggingManager_1.LoggingManager({
            terminalProvider: this._terminalProvider
        });
        if (this.isDebug) {
            this._loggingManager.enablePrintStacks();
            node_core_library_1.InternalError.breakInDebugger = true;
        }
        this._heftConfiguration = HeftConfiguration_1.HeftConfiguration.initialize({
            cwd: process.cwd(),
            terminalProvider: this._terminalProvider
        });
        const stages = {
            buildStage: new BuildStage_1.BuildStage(this._heftConfiguration, this._loggingManager),
            cleanStage: new CleanStage_1.CleanStage(this._heftConfiguration, this._loggingManager),
            testStage: new TestStage_1.TestStage(this._heftConfiguration, this._loggingManager)
        };
        const actionOptions = {
            terminal: this._terminal,
            loggingManager: this._loggingManager,
            metricsCollector: this._metricsCollector,
            heftConfiguration: this._heftConfiguration,
            stages
        };
        this._heftLifecycleHook = new tapable_1.SyncHook(['heftLifecycle']);
        this._internalHeftSession = new InternalHeftSession_1.InternalHeftSession(Object.assign(Object.assign({ getIsDebugMode: () => this.isDebug }, stages), { heftLifecycleHook: this._heftLifecycleHook, loggingManager: this._loggingManager, metricsCollector: this._metricsCollector, registerAction: (options) => {
                const action = new CustomAction_1.CustomAction(options, actionOptions);
                this.addAction(action);
            } }));
        this._pluginManager = new PluginManager_1.PluginManager({
            terminal: this._terminal,
            heftConfiguration: this._heftConfiguration,
            internalHeftSession: this._internalHeftSession
        });
        const cleanAction = new CleanAction_1.CleanAction(actionOptions);
        const buildAction = new BuildAction_1.BuildAction(actionOptions);
        const startAction = new StartAction_1.StartAction(actionOptions);
        const testAction = new TestAction_1.TestAction(actionOptions);
        this.addAction(cleanAction);
        this.addAction(buildAction);
        this.addAction(startAction);
        this.addAction(testAction);
    }
    get isDebug() {
        return !!this._preInitializationArgumentValues.debug;
    }
    get terminal() {
        return this._terminal;
    }
    onDefineParameters() {
        this._unmanagedFlag = this.defineFlagParameter({
            parameterLongName: '--unmanaged',
            description: 'Disables the Heft version selector: When Heft is invoked via the shell path, normally it' +
                " will examine the project's package.json dependencies and try to use the locally installed version" +
                ' of Heft. Specify "--unmanaged" to force the invoked version of Heft to be used. This is useful for' +
                ' example if you want to test a different version of Heft.'
        });
        this._debugFlag = this.defineFlagParameter({
            parameterLongName: Constants_1.Constants.debugParameterLongName,
            description: 'Show the full call stack if an error occurs while executing the tool'
        });
        this._pluginsParameter = this.defineStringListParameter({
            parameterLongName: Constants_1.Constants.pluginParameterLongName,
            argumentName: 'PATH',
            description: 'Used to specify Heft plugins.'
        });
    }
    async execute(args) {
        // Defensively set the exit code to 1 so if the tool crashes for whatever reason, we'll have a nonzero exit code.
        process.exitCode = 1;
        this._terminalProvider.verboseEnabled = this.isDebug;
        try {
            this._normalizeCwd();
            await this._checkForUpgradeAsync();
            await this._heftConfiguration._checkForRigAsync();
            if (this._heftConfiguration.rigConfig.rigFound) {
                const rigProfileFolder = await this._heftConfiguration.rigConfig.getResolvedProfileFolderAsync();
                const relativeRigFolderPath = node_core_library_1.Path.formatConcisely({
                    pathToConvert: rigProfileFolder,
                    baseFolder: this._heftConfiguration.buildFolder
                });
                this._terminal.writeLine(`Using rig configuration from ${relativeRigFolderPath}`);
            }
            await this._initializePluginsAsync();
            const heftLifecycle = {
                hooks: new HeftLifecycle_1.HeftLifecycleHooks()
            };
            this._heftLifecycleHook.call(heftLifecycle);
            await heftLifecycle.hooks.toolStart.promise();
            return await super.execute(args);
        }
        catch (e) {
            await this._reportErrorAndSetExitCode(e);
            return false;
        }
    }
    async _checkForUpgradeAsync() {
        // The .heft/clean.json file is a fairly reliable heuristic for detecting projects created prior to
        // the big config file redesign with Heft 0.14.0
        if (await node_core_library_1.FileSystem.existsAsync('.heft/clean.json')) {
            this._terminal.writeErrorLine('\nThis project has a ".heft/clean.json" file, which is now obsolete as of Heft 0.14.0.');
            this._terminal.writeLine('\nFor instructions for migrating config files, please read UPGRADING.md in the @rushstack/heft package folder.\n');
            throw new node_core_library_1.AlreadyReportedError();
        }
    }
    async onExecute() {
        try {
            await super.onExecute();
            await this._metricsCollector.flushAndTeardownAsync();
        }
        catch (e) {
            await this._reportErrorAndSetExitCode(e);
        }
        // If we make it here, things are fine and reset the exit code back to 0
        process.exitCode = 0;
    }
    _normalizeCwd() {
        const buildFolder = this._heftConfiguration.buildFolder;
        this._terminal.writeLine(`Project build folder is "${buildFolder}"`);
        const currentCwd = process.cwd();
        if (currentCwd !== buildFolder) {
            // Update the CWD to the project's build root. Some tools, like Jest, use process.cwd()
            this._terminal.writeVerboseLine(`CWD is "${currentCwd}". Normalizing to project build folder.`);
            process.chdir(buildFolder);
        }
    }
    _getPreInitializationArgumentValues(args = process.argv) {
        // This is a rough parsing of the --plugin parameters
        const parser = new argparse_1.ArgumentParser({ addHelp: false });
        parser.addArgument(this._pluginsParameter.longName, { dest: 'plugins', action: 'append' });
        parser.addArgument(this._debugFlag.longName, { dest: 'debug', action: 'storeTrue' });
        const [result] = parser.parseKnownArgs(args);
        return result;
    }
    async _initializePluginsAsync() {
        this._pluginManager.initializeDefaultPlugins();
        await this._pluginManager.initializePluginsFromConfigFileAsync();
        const pluginSpecifiers = this._preInitializationArgumentValues.plugins || [];
        for (const pluginSpecifier of pluginSpecifiers) {
            this._pluginManager.initializePlugin(pluginSpecifier);
        }
        this._pluginManager.afterInitializeAllPlugins();
    }
    async _reportErrorAndSetExitCode(error) {
        if (!(error instanceof node_core_library_1.AlreadyReportedError)) {
            this._terminal.writeErrorLine(error.toString());
        }
        if (this.isDebug) {
            this._terminal.writeLine();
            this._terminal.writeErrorLine(error.stack);
        }
        await this._metricsCollector.flushAndTeardownAsync();
        if (!process.exitCode || process.exitCode > 0) {
            process.exit(process.exitCode);
        }
        else {
            process.exit(1);
        }
    }
}
exports.HeftToolsCommandLineParser = HeftToolsCommandLineParser;
//# sourceMappingURL=HeftToolsCommandLineParser.js.map