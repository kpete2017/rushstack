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
exports.BulkScriptAction = void 0;
const os = __importStar(require("os"));
const safe_1 = __importDefault(require("colors/safe"));
const node_core_library_1 = require("@rushstack/node-core-library");
const ts_command_line_1 = require("@rushstack/ts-command-line");
const index_1 = require("../../index");
const SetupChecks_1 = require("../../logic/SetupChecks");
const TaskSelector_1 = require("../../logic/TaskSelector");
const Stopwatch_1 = require("../../utilities/Stopwatch");
const BaseScriptAction_1 = require("./BaseScriptAction");
const TaskRunner_1 = require("../../logic/taskRunner/TaskRunner");
const Utilities_1 = require("../../utilities/Utilities");
const RushConstants_1 = require("../../logic/RushConstants");
const LastLinkFlag_1 = require("../../api/LastLinkFlag");
const BuildCacheConfiguration_1 = require("../../api/BuildCacheConfiguration");
const Selection_1 = require("../../logic/Selection");
const SelectionParameterSet_1 = require("../SelectionParameterSet");
/**
 * This class implements bulk commands which are run individually for each project in the repo,
 * possibly in parallel.  The action executes a script found in the project's package.json file.
 *
 * @remarks
 * Bulk commands can be defined via common/config/command-line.json.  Rush's predefined "build"
 * and "rebuild" commands are also modeled as bulk commands, because they essentially just
 * execute scripts from package.json in the same as any custom command.
 */
class BulkScriptAction extends BaseScriptAction_1.BaseScriptAction {
    constructor(options) {
        super(options);
        this._enableParallelism = options.enableParallelism;
        this._ignoreMissingScript = options.ignoreMissingScript;
        this._isIncrementalBuildAllowed = options.incremental;
        this._commandToRun = options.commandToRun || options.actionName;
        this._ignoreDependencyOrder = options.ignoreDependencyOrder;
        this._allowWarningsInSuccessfulBuild = options.allowWarningsInSuccessfulBuild;
        this._watchForChanges = options.watchForChanges;
        this._disableBuildCache = options.disableBuildCache;
        this._repoCommandLineConfiguration = options.commandLineConfiguration;
    }
    async runAsync() {
        var _a;
        // TODO: Replace with last-install.flag when "rush link" and "rush unlink" are deprecated
        const lastLinkFlag = LastLinkFlag_1.LastLinkFlagFactory.getCommonTempFlag(this.rushConfiguration);
        if (!lastLinkFlag.isValid()) {
            const useWorkspaces = this.rushConfiguration.pnpmOptions && this.rushConfiguration.pnpmOptions.useWorkspaces;
            if (useWorkspaces) {
                throw new Error(`Link flag invalid.${os.EOL}Did you run "rush install" or "rush update"?`);
            }
            else {
                throw new Error(`Link flag invalid.${os.EOL}Did you run "rush link"?`);
            }
        }
        this._doBeforeTask();
        const stopwatch = Stopwatch_1.Stopwatch.start();
        const isQuietMode = !this._verboseParameter.value;
        // if this is parallelizable, then use the value from the flag (undefined or a number),
        // if parallelism is not enabled, then restrict to 1 core
        const parallelism = this._enableParallelism ? this._parallelismParameter.value : '1';
        // Collect all custom parameter values
        const customParameterValues = [];
        for (const customParameter of this.customParameters) {
            customParameter.appendToArgList(customParameterValues);
        }
        const changedProjectsOnly = this._isIncrementalBuildAllowed && this._changedProjectsOnly.value;
        const terminal = new node_core_library_1.Terminal(new node_core_library_1.ConsoleTerminalProvider());
        let buildCacheConfiguration;
        if (!((_a = this._disableBuildCacheFlag) === null || _a === void 0 ? void 0 : _a.value) && !this._disableBuildCache) {
            buildCacheConfiguration = await BuildCacheConfiguration_1.BuildCacheConfiguration.tryLoadAsync(terminal, this.rushConfiguration);
        }
        const selection = this._selectionParameters.getSelectedProjects();
        if (!selection.size) {
            terminal.writeLine(safe_1.default.yellow(`The command line selection parameters did not match any projects.`));
            return;
        }
        const taskSelectorOptions = {
            rushConfiguration: this.rushConfiguration,
            buildCacheConfiguration,
            selection,
            commandName: this.actionName,
            commandToRun: this._commandToRun,
            customParameterValues,
            isQuietMode: isQuietMode,
            isIncrementalBuildAllowed: this._isIncrementalBuildAllowed,
            ignoreMissingScript: this._ignoreMissingScript,
            ignoreDependencyOrder: this._ignoreDependencyOrder,
            packageDepsFilename: Utilities_1.Utilities.getPackageDepsFilenameForCommand(this._commandToRun)
        };
        const taskRunnerOptions = {
            quietMode: isQuietMode,
            parallelism: parallelism,
            changedProjectsOnly: changedProjectsOnly,
            allowWarningsInSuccessfulBuild: this._allowWarningsInSuccessfulBuild,
            repoCommandLineConfiguration: this._repoCommandLineConfiguration
        };
        const executeOptions = {
            taskSelectorOptions,
            taskRunnerOptions,
            stopwatch,
            terminal
        };
        if (this._watchForChanges) {
            await this._runWatch(executeOptions);
        }
        else {
            await this._runOnce(executeOptions);
        }
    }
    /**
     * Runs the command in watch mode. Fundamentally is a simple loop:
     * 1) Wait for a change to one or more projects in the selection (skipped initially)
     * 2) Invoke the command on the changed projects, and, if applicable, impacted projects
     *    Uses the same algorithm as --impacted-by
     * 3) Goto (1)
     */
    async _runWatch(options) {
        const { taskSelectorOptions: { buildCacheConfiguration: initialBuildCacheConfiguration, selection: projectsToWatch }, stopwatch, terminal } = options;
        // Use async import so that we don't pay the cost for sync builds
        const { ProjectWatcher } = await Promise.resolve().then(() => __importStar(require('../../logic/ProjectWatcher')));
        const projectWatcher = new ProjectWatcher({
            debounceMilliseconds: 1000,
            rushConfiguration: this.rushConfiguration,
            projectsToWatch,
            terminal
        });
        let isInitialPass = true;
        // Loop until Ctrl+C
        // eslint-disable-next-line no-constant-condition
        while (true) {
            // Report so that the developer can always see that it is in watch mode as the latest console line.
            terminal.writeLine(`Watching for changes to ${projectsToWatch.size} ${projectsToWatch.size === 1 ? 'project' : 'projects'}. Press Ctrl+C to exit.`);
            // On the initial invocation, this promise will return immediately with the full set of projects
            const { changedProjects, state } = await projectWatcher.waitForChange();
            let selection = changedProjects;
            if (stopwatch.state === Stopwatch_1.StopwatchState.Stopped) {
                // Clear and reset the stopwatch so that we only report time from a single execution at a time
                stopwatch.reset();
                stopwatch.start();
            }
            terminal.writeLine(`Detected changes in ${selection.size} project${selection.size === 1 ? '' : 's'}:`);
            const names = [...selection].map((x) => x.packageName).sort();
            for (const name of names) {
                terminal.writeLine(`    ${safe_1.default.cyan(name)}`);
            }
            // If the command ignores dependency order, that means that only the changed projects should be affected
            // That said, running watch for commands that ignore dependency order may have unexpected results
            if (!this._ignoreDependencyOrder) {
                selection = Selection_1.Selection.intersection(Selection_1.Selection.expandAllConsumers(selection), projectsToWatch);
            }
            const executeOptions = {
                taskSelectorOptions: Object.assign(Object.assign({}, options.taskSelectorOptions), { 
                    // Current implementation of the build cache deletes output folders before repopulating them;
                    // this tends to break `webpack --watch`, etc.
                    // Also, skipping writes to the local cache reduces CPU overhead and saves disk usage.
                    buildCacheConfiguration: isInitialPass ? initialBuildCacheConfiguration : undefined, 
                    // Revise down the set of projects to execute the command on
                    selection, 
                    // Pass the PackageChangeAnalyzer from the state differ to save a bit of overhead
                    packageChangeAnalyzer: state }),
                taskRunnerOptions: options.taskRunnerOptions,
                stopwatch,
                // For now, don't run pre-build or post-build in watch mode
                ignoreHooks: true,
                terminal
            };
            try {
                // Delegate the the underlying command, for only the projects that need reprocessing
                await this._runOnce(executeOptions);
            }
            catch (err) {
                // In watch mode, we want to rebuild even if the original build failed.
                if (!(err instanceof node_core_library_1.AlreadyReportedError)) {
                    throw err;
                }
            }
            isInitialPass = false;
        }
    }
    onDefineParameters() {
        if (this._enableParallelism) {
            this._parallelismParameter = this.defineStringParameter({
                parameterLongName: '--parallelism',
                parameterShortName: '-p',
                argumentName: 'COUNT',
                environmentVariable: "RUSH_PARALLELISM" /* RUSH_PARALLELISM */,
                description: 'Specifies the maximum number of concurrent processes to launch during a build.' +
                    ' The COUNT should be a positive integer or else the word "max" to specify a count that is equal to' +
                    ' the number of CPU cores. If this parameter is omitted, then the default value depends on the' +
                    ' operating system and number of CPU cores.'
            });
        }
        this._selectionParameters = new SelectionParameterSet_1.SelectionParameterSet(this.rushConfiguration, this);
        this._verboseParameter = this.defineFlagParameter({
            parameterLongName: '--verbose',
            parameterShortName: '-v',
            description: 'Display the logs during the build, rather than just displaying the build status summary'
        });
        if (this._isIncrementalBuildAllowed) {
            this._changedProjectsOnly = this.defineFlagParameter({
                parameterLongName: '--changed-projects-only',
                parameterShortName: '-c',
                description: 'Normally the incremental build logic will rebuild changed projects as well as' +
                    ' any projects that directly or indirectly depend on a changed project. Specify "--changed-projects-only"' +
                    ' to ignore dependent projects, only rebuilding those projects whose files were changed.' +
                    ' Note that this parameter is "unsafe"; it is up to the developer to ensure that the ignored projects' +
                    ' are okay to ignore.'
            });
        }
        this._ignoreHooksParameter = this.defineFlagParameter({
            parameterLongName: '--ignore-hooks',
            description: `Skips execution of the "eventHooks" scripts defined in rush.json. Make sure you know what you are skipping.`
        });
        this._disableBuildCacheFlag = this.defineFlagParameter({
            parameterLongName: '--disable-build-cache',
            description: '(EXPERIMENTAL) Disables the build cache for this command invocation.'
        });
        this.defineScriptParameters();
    }
    /**
     * Runs a single invocation of the command
     */
    async _runOnce(options) {
        const taskSelector = new TaskSelector_1.TaskSelector(options.taskSelectorOptions);
        // Register all tasks with the task collection
        const taskRunner = new TaskRunner_1.TaskRunner(taskSelector.registerTasks().getOrderedTasks(), options.taskRunnerOptions);
        const { ignoreHooks, stopwatch } = options;
        try {
            await taskRunner.executeAsync();
            stopwatch.stop();
            console.log(safe_1.default.green(`rush ${this.actionName} (${stopwatch.toString()})`));
            if (!ignoreHooks) {
                this._doAfterTask(stopwatch, true);
            }
        }
        catch (error) {
            stopwatch.stop();
            if (error instanceof node_core_library_1.AlreadyReportedError) {
                console.log(`rush ${this.actionName} (${stopwatch.toString()})`);
            }
            else {
                if (error && error.message) {
                    if (this.parser.isDebug) {
                        console.log('Error: ' + error.stack);
                    }
                    else {
                        console.log('Error: ' + error.message);
                    }
                }
                console.log(safe_1.default.red(`rush ${this.actionName} - Errors! (${stopwatch.toString()})`));
            }
            if (!ignoreHooks) {
                this._doAfterTask(stopwatch, false);
            }
            throw new node_core_library_1.AlreadyReportedError();
        }
    }
    _doBeforeTask() {
        if (this.actionName !== RushConstants_1.RushConstants.buildCommandName &&
            this.actionName !== RushConstants_1.RushConstants.rebuildCommandName) {
            // Only collects information for built-in tasks like build or rebuild.
            return;
        }
        SetupChecks_1.SetupChecks.validate(this.rushConfiguration);
        this.eventHooksManager.handle(index_1.Event.preRushBuild, this.parser.isDebug, this._ignoreHooksParameter.value);
    }
    _doAfterTask(stopwatch, success) {
        if (this.actionName !== RushConstants_1.RushConstants.buildCommandName &&
            this.actionName !== RushConstants_1.RushConstants.rebuildCommandName) {
            // Only collects information for built-in tasks like build or rebuild.
            return;
        }
        this._collectTelemetry(stopwatch, success);
        this.parser.flushTelemetry();
        this.eventHooksManager.handle(index_1.Event.postRushBuild, this.parser.isDebug, this._ignoreHooksParameter.value);
    }
    _collectTelemetry(stopwatch, success) {
        const extraData = this._selectionParameters.getTelemetry();
        for (const customParameter of this.customParameters) {
            switch (customParameter.kind) {
                case ts_command_line_1.CommandLineParameterKind.Flag:
                case ts_command_line_1.CommandLineParameterKind.Choice:
                case ts_command_line_1.CommandLineParameterKind.String:
                case ts_command_line_1.CommandLineParameterKind.Integer:
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    extraData[customParameter.longName] = JSON.stringify(customParameter.value);
                    break;
                default:
                    extraData[customParameter.longName] = '?';
            }
        }
        if (this.parser.telemetry) {
            this.parser.telemetry.log({
                name: this.actionName,
                duration: stopwatch.duration,
                result: success ? 'Succeeded' : 'Failed',
                extraData
            });
        }
    }
}
exports.BulkScriptAction = BulkScriptAction;
//# sourceMappingURL=BulkScriptAction.js.map