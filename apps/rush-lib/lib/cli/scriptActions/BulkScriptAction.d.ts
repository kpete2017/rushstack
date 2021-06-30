import { BaseScriptAction, IBaseScriptActionOptions } from './BaseScriptAction';
/**
 * Constructor parameters for BulkScriptAction.
 */
export interface IBulkScriptActionOptions extends IBaseScriptActionOptions {
    enableParallelism: boolean;
    ignoreMissingScript: boolean;
    ignoreDependencyOrder: boolean;
    incremental: boolean;
    allowWarningsInSuccessfulBuild: boolean;
    watchForChanges: boolean;
    disableBuildCache: boolean;
    /**
     * Optional command to run. Otherwise, use the `actionName` as the command to run.
     */
    commandToRun?: string;
}
/**
 * This class implements bulk commands which are run individually for each project in the repo,
 * possibly in parallel.  The action executes a script found in the project's package.json file.
 *
 * @remarks
 * Bulk commands can be defined via common/config/command-line.json.  Rush's predefined "build"
 * and "rebuild" commands are also modeled as bulk commands, because they essentially just
 * execute scripts from package.json in the same as any custom command.
 */
export declare class BulkScriptAction extends BaseScriptAction {
    private readonly _enableParallelism;
    private readonly _ignoreMissingScript;
    private readonly _isIncrementalBuildAllowed;
    private readonly _commandToRun;
    private readonly _watchForChanges;
    private readonly _disableBuildCache;
    private readonly _repoCommandLineConfiguration;
    private readonly _ignoreDependencyOrder;
    private readonly _allowWarningsInSuccessfulBuild;
    private _changedProjectsOnly;
    private _selectionParameters;
    private _verboseParameter;
    private _parallelismParameter;
    private _ignoreHooksParameter;
    private _disableBuildCacheFlag;
    constructor(options: IBulkScriptActionOptions);
    runAsync(): Promise<void>;
    /**
     * Runs the command in watch mode. Fundamentally is a simple loop:
     * 1) Wait for a change to one or more projects in the selection (skipped initially)
     * 2) Invoke the command on the changed projects, and, if applicable, impacted projects
     *    Uses the same algorithm as --impacted-by
     * 3) Goto (1)
     */
    private _runWatch;
    protected onDefineParameters(): void;
    /**
     * Runs a single invocation of the command
     */
    private _runOnce;
    private _doBeforeTask;
    private _doAfterTask;
    private _collectTelemetry;
}
//# sourceMappingURL=BulkScriptAction.d.ts.map