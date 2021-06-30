import { TerminalWritable } from '@rushstack/terminal';
import { Task } from './Task';
import { CommandLineConfiguration } from '../../api/CommandLineConfiguration';
export interface ITaskRunnerOptions {
    quietMode: boolean;
    parallelism: string | undefined;
    changedProjectsOnly: boolean;
    allowWarningsInSuccessfulBuild: boolean;
    repoCommandLineConfiguration: CommandLineConfiguration | undefined;
    destination?: TerminalWritable;
}
/**
 * A class which manages the execution of a set of tasks with interdependencies.
 * Initially, and at the end of each task execution, all unblocked tasks
 * are added to a ready queue which is then executed. This is done continually until all
 * tasks are complete, or prematurely fails if any of the tasks fail.
 */
export declare class TaskRunner {
    private static readonly _ASCII_HEADER_WIDTH;
    private readonly _tasks;
    private readonly _changedProjectsOnly;
    private readonly _allowWarningsInSuccessfulBuild;
    private readonly _buildQueue;
    private readonly _quietMode;
    private readonly _parallelism;
    private readonly _repoCommandLineConfiguration;
    private _hasAnyFailures;
    private _hasAnyWarnings;
    private _currentActiveTasks;
    private _totalTasks;
    private _completedTasks;
    private readonly _outputWritable;
    private readonly _colorsNewlinesTransform;
    private readonly _streamCollator;
    private _terminal;
    constructor(orderedTasks: Task[], options: ITaskRunnerOptions);
    private _streamCollator_onWriterActive;
    /**
     * Executes all tasks which have been registered, returning a promise which is resolved when all the
     * tasks are completed successfully, or rejects when any task fails.
     */
    executeAsync(): Promise<void>;
    /**
     * Pulls the next task with no dependencies off the build queue
     * Removes any non-ready tasks from the build queue (this should only be blocked tasks)
     */
    private _getNextTask;
    /**
     * Helper function which finds any tasks which are available to run and begins executing them.
     * It calls the complete callback when all tasks are completed, or rejects if any task fails.
     */
    private _startAvailableTasksAsync;
    private _executeTaskAndChainAsync;
    /**
     * Marks a task as having failed and marks each of its dependents as blocked
     */
    private _markTaskAsFailed;
    /**
     * Marks a task and all its dependents as blocked
     */
    private _markTaskAsBlocked;
    /**
     * Marks a task as being completed, and removes it from the dependencies list of all its dependents
     */
    private _markTaskAsSuccess;
    /**
     * Marks a task as being completed, but with warnings written to stderr, and removes it from the dependencies
     * list of all its dependents
     */
    private _markTaskAsSuccessWithWarning;
    /**
     * Marks a task as skipped.
     */
    private _markTaskAsSkipped;
    /**
     * Marks a task as provided by cache.
     */
    private _markTaskAsFromCache;
    /**
     * Prints out a report of the status of each project
     */
    private _printTaskStatus;
    private _writeCondensedSummary;
    private _writeDetailedSummary;
    private _writeSummaryHeader;
}
//# sourceMappingURL=TaskRunner.d.ts.map