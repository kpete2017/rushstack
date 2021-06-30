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
exports.TaskRunner = void 0;
const os = __importStar(require("os"));
const safe_1 = __importDefault(require("colors/safe"));
const terminal_1 = require("@rushstack/terminal");
const stream_collator_1 = require("@rushstack/stream-collator");
const node_core_library_1 = require("@rushstack/node-core-library");
const Stopwatch_1 = require("../../utilities/Stopwatch");
const TaskStatus_1 = require("./TaskStatus");
/**
 * A class which manages the execution of a set of tasks with interdependencies.
 * Initially, and at the end of each task execution, all unblocked tasks
 * are added to a ready queue which is then executed. This is done continually until all
 * tasks are complete, or prematurely fails if any of the tasks fail.
 */
class TaskRunner {
    constructor(orderedTasks, options) {
        this._streamCollator_onWriterActive = (writer) => {
            if (writer) {
                this._completedTasks++;
                // Format a header like this
                //
                // ==[ @rushstack/the-long-thing ]=================[ 1 of 1000 ]==
                // leftPart: "==[ @rushstack/the-long-thing "
                const leftPart = safe_1.default.gray('==[') + ' ' + safe_1.default.cyan(writer.taskName) + ' ';
                const leftPartLength = 4 + writer.taskName.length + 1;
                // rightPart: " 1 of 1000 ]=="
                const completedOfTotal = `${this._completedTasks} of ${this._totalTasks}`;
                const rightPart = ' ' + safe_1.default.white(completedOfTotal) + ' ' + safe_1.default.gray(']==');
                const rightPartLength = 1 + completedOfTotal.length + 4;
                // middlePart: "]=================["
                const twoBracketsLength = 2;
                const middlePartLengthMinusTwoBrackets = Math.max(TaskRunner._ASCII_HEADER_WIDTH - (leftPartLength + rightPartLength + twoBracketsLength), 0);
                const middlePart = safe_1.default.gray(']' + '='.repeat(middlePartLengthMinusTwoBrackets) + '[');
                this._terminal.writeStdoutLine('\n' + leftPart + middlePart + rightPart);
                if (!this._quietMode) {
                    this._terminal.writeStdoutLine('');
                }
            }
        };
        const { quietMode, parallelism, changedProjectsOnly, allowWarningsInSuccessfulBuild, repoCommandLineConfiguration } = options;
        this._tasks = orderedTasks;
        this._buildQueue = orderedTasks.slice(0);
        this._quietMode = quietMode;
        this._hasAnyFailures = false;
        this._hasAnyWarnings = false;
        this._changedProjectsOnly = changedProjectsOnly;
        this._allowWarningsInSuccessfulBuild = allowWarningsInSuccessfulBuild;
        this._repoCommandLineConfiguration = repoCommandLineConfiguration;
        // TERMINAL PIPELINE:
        //
        // streamCollator --> colorsNewlinesTransform --> StdioWritable
        //
        this._outputWritable = options.destination ? options.destination : terminal_1.StdioWritable.instance;
        this._colorsNewlinesTransform = new terminal_1.TextRewriterTransform({
            destination: this._outputWritable,
            normalizeNewlines: "os" /* OsDefault */,
            removeColors: !safe_1.default.enabled
        });
        this._streamCollator = new stream_collator_1.StreamCollator({
            destination: this._colorsNewlinesTransform,
            onWriterActive: this._streamCollator_onWriterActive
        });
        this._terminal = this._streamCollator.terminal;
        const numberOfCores = os.cpus().length;
        if (parallelism) {
            if (parallelism === 'max') {
                this._parallelism = numberOfCores;
            }
            else {
                const parallelismInt = parseInt(parallelism, 10);
                if (isNaN(parallelismInt)) {
                    throw new Error(`Invalid parallelism value of '${parallelism}', expected a number or 'max'`);
                }
                this._parallelism = parallelismInt;
            }
        }
        else {
            // If an explicit parallelism number wasn't provided, then choose a sensible
            // default.
            if (os.platform() === 'win32') {
                // On desktop Windows, some people have complained that their system becomes
                // sluggish if Rush is using all the CPU cores.  Leave one thread for
                // other operations. For CI environments, you can use the "max" argument to use all available cores.
                this._parallelism = Math.max(numberOfCores - 1, 1);
            }
            else {
                // Unix-like operating systems have more balanced scheduling, so default
                // to the number of CPU cores
                this._parallelism = numberOfCores;
            }
        }
    }
    /**
     * Executes all tasks which have been registered, returning a promise which is resolved when all the
     * tasks are completed successfully, or rejects when any task fails.
     */
    async executeAsync() {
        this._currentActiveTasks = 0;
        this._completedTasks = 0;
        this._totalTasks = this._tasks.length;
        if (!this._quietMode) {
            const plural = this._tasks.length === 1 ? '' : 's';
            this._terminal.writeStdoutLine(`Selected ${this._tasks.length} project${plural}:`);
            this._terminal.writeStdoutLine(this._tasks
                .map((x) => `  ${x.name}`)
                .sort()
                .join('\n'));
            this._terminal.writeStdoutLine('');
        }
        this._terminal.writeStdoutLine(`Executing a maximum of ${this._parallelism} simultaneous processes...`);
        await this._startAvailableTasksAsync();
        this._printTaskStatus();
        if (this._hasAnyFailures) {
            this._terminal.writeStderrLine(safe_1.default.red('Projects failed to build.') + '\n');
            throw new node_core_library_1.AlreadyReportedError();
        }
        else if (this._hasAnyWarnings && !this._allowWarningsInSuccessfulBuild) {
            this._terminal.writeStderrLine(safe_1.default.yellow('Projects succeeded with warnings.') + '\n');
            throw new node_core_library_1.AlreadyReportedError();
        }
    }
    /**
     * Pulls the next task with no dependencies off the build queue
     * Removes any non-ready tasks from the build queue (this should only be blocked tasks)
     */
    _getNextTask() {
        for (let i = 0; i < this._buildQueue.length; i++) {
            const task = this._buildQueue[i];
            if (task.status !== TaskStatus_1.TaskStatus.Ready) {
                // It shouldn't be on the queue, remove it
                this._buildQueue.splice(i, 1);
                // Decrement since we modified the array
                i--;
            }
            else if (task.dependencies.size === 0 && task.status === TaskStatus_1.TaskStatus.Ready) {
                // this is a task which is ready to go. remove it and return it
                return this._buildQueue.splice(i, 1)[0];
            }
            // Otherwise task is still waiting
        }
        return undefined; // There are no tasks ready to go at this time
    }
    /**
     * Helper function which finds any tasks which are available to run and begins executing them.
     * It calls the complete callback when all tasks are completed, or rejects if any task fails.
     */
    async _startAvailableTasksAsync() {
        const taskPromises = [];
        let ctask;
        while (this._currentActiveTasks < this._parallelism && (ctask = this._getNextTask())) {
            this._currentActiveTasks++;
            const task = ctask;
            task.status = TaskStatus_1.TaskStatus.Executing;
            task.stopwatch = Stopwatch_1.Stopwatch.start();
            task.collatedWriter = this._streamCollator.registerTask(task.name);
            task.stdioSummarizer = new terminal_1.StdioSummarizer();
            taskPromises.push(this._executeTaskAndChainAsync(task));
        }
        await Promise.all(taskPromises);
    }
    async _executeTaskAndChainAsync(task) {
        const context = {
            repoCommandLineConfiguration: this._repoCommandLineConfiguration,
            stdioSummarizer: task.stdioSummarizer,
            collatedWriter: task.collatedWriter,
            quietMode: this._quietMode
        };
        try {
            const result = await task.builder.executeAsync(context);
            task.stopwatch.stop();
            task.stdioSummarizer.close();
            this._currentActiveTasks--;
            switch (result) {
                case TaskStatus_1.TaskStatus.Success:
                    this._markTaskAsSuccess(task);
                    break;
                case TaskStatus_1.TaskStatus.SuccessWithWarning:
                    this._hasAnyWarnings = true;
                    this._markTaskAsSuccessWithWarning(task);
                    break;
                case TaskStatus_1.TaskStatus.FromCache:
                    this._markTaskAsFromCache(task);
                    break;
                case TaskStatus_1.TaskStatus.Skipped:
                    this._markTaskAsSkipped(task);
                    break;
                case TaskStatus_1.TaskStatus.Failure:
                    this._hasAnyFailures = true;
                    this._markTaskAsFailed(task);
                    break;
            }
        }
        catch (error) {
            task.stdioSummarizer.close();
            this._currentActiveTasks--;
            this._hasAnyFailures = true;
            // eslint-disable-next-line require-atomic-updates
            task.error = error;
            this._markTaskAsFailed(task);
        }
        task.collatedWriter.close();
        await this._startAvailableTasksAsync();
    }
    /**
     * Marks a task as having failed and marks each of its dependents as blocked
     */
    _markTaskAsFailed(task) {
        if (task.error) {
            task.collatedWriter.terminal.writeStderrLine(task.error.message);
        }
        task.collatedWriter.terminal.writeStderrLine(safe_1.default.red(`"${task.name}" failed to build.`));
        task.status = TaskStatus_1.TaskStatus.Failure;
        task.dependents.forEach((dependent) => {
            this._markTaskAsBlocked(dependent, task);
        });
    }
    /**
     * Marks a task and all its dependents as blocked
     */
    _markTaskAsBlocked(blockedTask, failedTask) {
        if (blockedTask.status === TaskStatus_1.TaskStatus.Ready) {
            this._completedTasks++;
            // Note: We cannot write to task.collatedWriter because "blockedTask" will be skipped
            failedTask.collatedWriter.terminal.writeStdoutLine(`"${blockedTask.name}" is blocked by "${failedTask.name}".`);
            blockedTask.status = TaskStatus_1.TaskStatus.Blocked;
            blockedTask.dependents.forEach((dependent) => {
                this._markTaskAsBlocked(dependent, failedTask);
            });
        }
    }
    /**
     * Marks a task as being completed, and removes it from the dependencies list of all its dependents
     */
    _markTaskAsSuccess(task) {
        if (task.builder.hadEmptyScript) {
            task.collatedWriter.terminal.writeStdoutLine(safe_1.default.green(`"${task.name}" had an empty script.`));
        }
        else {
            task.collatedWriter.terminal.writeStdoutLine(safe_1.default.green(`"${task.name}" completed successfully in ${task.stopwatch.toString()}.`));
        }
        task.status = TaskStatus_1.TaskStatus.Success;
        task.dependents.forEach((dependent) => {
            if (!this._changedProjectsOnly) {
                dependent.builder.isIncrementalBuildAllowed = false;
            }
            dependent.dependencies.delete(task);
        });
    }
    /**
     * Marks a task as being completed, but with warnings written to stderr, and removes it from the dependencies
     * list of all its dependents
     */
    _markTaskAsSuccessWithWarning(task) {
        task.collatedWriter.terminal.writeStderrLine(safe_1.default.yellow(`"${task.name}" completed with warnings in ${task.stopwatch.toString()}.`));
        task.status = TaskStatus_1.TaskStatus.SuccessWithWarning;
        task.dependents.forEach((dependent) => {
            if (!this._changedProjectsOnly) {
                dependent.builder.isIncrementalBuildAllowed = false;
            }
            dependent.dependencies.delete(task);
        });
    }
    /**
     * Marks a task as skipped.
     */
    _markTaskAsSkipped(task) {
        task.collatedWriter.terminal.writeStdoutLine(safe_1.default.green(`${task.name} was skipped.`));
        task.status = TaskStatus_1.TaskStatus.Skipped;
        task.dependents.forEach((dependent) => {
            dependent.dependencies.delete(task);
        });
    }
    /**
     * Marks a task as provided by cache.
     */
    _markTaskAsFromCache(task) {
        task.collatedWriter.terminal.writeStdoutLine(safe_1.default.green(`${task.name} was restored from the build cache.`));
        task.status = TaskStatus_1.TaskStatus.FromCache;
        task.dependents.forEach((dependent) => {
            dependent.dependencies.delete(task);
        });
    }
    /**
     * Prints out a report of the status of each project
     */
    _printTaskStatus() {
        const tasksByStatus = {};
        for (const task of this._tasks) {
            switch (task.status) {
                // These are the sections that we will report below
                case TaskStatus_1.TaskStatus.Skipped:
                case TaskStatus_1.TaskStatus.FromCache:
                case TaskStatus_1.TaskStatus.Success:
                case TaskStatus_1.TaskStatus.SuccessWithWarning:
                case TaskStatus_1.TaskStatus.Blocked:
                case TaskStatus_1.TaskStatus.Failure:
                    break;
                default:
                    // This should never happen
                    throw new node_core_library_1.InternalError('Unexpected task status: ' + task.status);
            }
            if (tasksByStatus[task.status]) {
                tasksByStatus[task.status].push(task);
            }
            else {
                tasksByStatus[task.status] = [task];
            }
        }
        // Skip a few lines before we start the summary
        this._terminal.writeStdoutLine('');
        this._terminal.writeStdoutLine('');
        this._terminal.writeStdoutLine('');
        // These are ordered so that the most interesting statuses appear last:
        this._writeCondensedSummary(TaskStatus_1.TaskStatus.Skipped, tasksByStatus, safe_1.default.green, 'These projects were already up to date:');
        this._writeCondensedSummary(TaskStatus_1.TaskStatus.FromCache, tasksByStatus, safe_1.default.green, 'These projects were restored from the build cache:');
        this._writeCondensedSummary(TaskStatus_1.TaskStatus.Success, tasksByStatus, safe_1.default.green, 'These projects completed successfully:');
        this._writeDetailedSummary(TaskStatus_1.TaskStatus.SuccessWithWarning, tasksByStatus, safe_1.default.yellow, 'WARNING');
        this._writeCondensedSummary(TaskStatus_1.TaskStatus.Blocked, tasksByStatus, safe_1.default.white, 'These projects were blocked by dependencies that failed:');
        this._writeDetailedSummary(TaskStatus_1.TaskStatus.Failure, tasksByStatus, safe_1.default.red);
        this._terminal.writeStdoutLine('');
    }
    _writeCondensedSummary(status, tasksByStatus, headingColor, preamble) {
        // Example:
        //
        // ==[ BLOCKED: 4 projects ]==============================================================
        //
        // These projects were blocked by dependencies that failed:
        //   @scope/name
        //   e
        //   k
        const tasks = tasksByStatus[status];
        if (!tasks || tasks.length === 0) {
            return;
        }
        node_core_library_1.Sort.sortBy(tasks, (x) => x.name);
        this._writeSummaryHeader(status, tasks, headingColor);
        this._terminal.writeStdoutLine(preamble);
        const longestTaskName = Math.max(...tasks.map((x) => x.name.length));
        for (const task of tasks) {
            if (task.stopwatch && !task.builder.hadEmptyScript && task.status !== TaskStatus_1.TaskStatus.Skipped) {
                const time = task.stopwatch.toString();
                const padding = ' '.repeat(longestTaskName - task.name.length);
                this._terminal.writeStdoutLine(`  ${task.name}${padding}    ${time}`);
            }
            else {
                this._terminal.writeStdoutLine(`  ${task.name}`);
            }
        }
        this._terminal.writeStdoutLine('');
    }
    _writeDetailedSummary(status, tasksByStatus, headingColor, shortStatusName) {
        // Example:
        //
        // ==[ SUCCESS WITH WARNINGS: 2 projects ]================================
        //
        // --[ WARNINGS: f ]------------------------------------[ 5.07 seconds ]--
        //
        // [eslint] Warning: src/logic/taskRunner/TaskRunner.ts:393:3 ...
        const tasks = tasksByStatus[status];
        if (!tasks || tasks.length === 0) {
            return;
        }
        this._writeSummaryHeader(status, tasks, headingColor);
        if (shortStatusName === undefined) {
            shortStatusName = status;
        }
        for (const task of tasks) {
            // Format a header like this
            //
            // --[ WARNINGS: f ]------------------------------------[ 5.07 seconds ]--
            // leftPart: "--[ WARNINGS: f "
            const subheadingText = `${shortStatusName}: ${task.name}`;
            const leftPart = safe_1.default.gray('--[') + ' ' + headingColor(subheadingText) + ' ';
            const leftPartLength = 4 + subheadingText.length + 1;
            // rightPart: " 5.07 seconds ]--"
            const time = task.stopwatch.toString();
            const rightPart = ' ' + safe_1.default.white(time) + ' ' + safe_1.default.gray(']--');
            const rightPartLength = 1 + time.length + 1 + 3;
            // middlePart: "]----------------------["
            const twoBracketsLength = 2;
            const middlePartLengthMinusTwoBrackets = Math.max(TaskRunner._ASCII_HEADER_WIDTH - (leftPartLength + rightPartLength + twoBracketsLength), 0);
            const middlePart = safe_1.default.gray(']' + '-'.repeat(middlePartLengthMinusTwoBrackets) + '[');
            this._terminal.writeStdoutLine(leftPart + middlePart + rightPart + '\n');
            const details = task.stdioSummarizer.getReport();
            if (details) {
                // Don't write a newline, because the report will always end with a newline
                this._terminal.writeChunk({ text: details, kind: "O" /* Stdout */ });
            }
            this._terminal.writeStdoutLine('');
        }
    }
    _writeSummaryHeader(status, tasks, headingColor) {
        // Format a header like this
        //
        // ==[ FAILED: 2 projects ]================================================
        // "2 projects"
        const projectsText = tasks.length.toString() + (tasks.length === 1 ? ' project' : ' projects');
        const headingText = `${status}: ${projectsText}`;
        // leftPart: "==[ FAILED: 2 projects "
        const leftPart = safe_1.default.gray('==[') + ' ' + headingColor(headingText) + ' ';
        const leftPartLength = 3 + 1 + headingText.length + 1;
        const rightPartLengthMinusBracket = Math.max(TaskRunner._ASCII_HEADER_WIDTH - (leftPartLength + 1), 0);
        // rightPart: "]======================"
        const rightPart = safe_1.default.gray(']' + '='.repeat(rightPartLengthMinusBracket));
        this._terminal.writeStdoutLine(leftPart + rightPart);
        this._terminal.writeStdoutLine('');
    }
}
exports.TaskRunner = TaskRunner;
// Format "======" lines for a shell window with classic 80 columns
TaskRunner._ASCII_HEADER_WIDTH = 79;
//# sourceMappingURL=TaskRunner.js.map