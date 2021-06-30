import * as child_process from 'child_process';
declare module 'child_process' {
    interface ChildProcess {
        exitCode?: number | null;
    }
}
/**
 * Details about how the `child_process.ChildProcess` was created.
 */
export interface ISubprocessOptions {
    detached: boolean;
}
/**
 * When a child process is created, registering it with the SubprocessTerminator will ensure
 * that the child gets terminated when the current process terminates.
 *
 * @remarks
 * This works by hooking the current process's events for SIGTERM/SIGINT/exit, and ensuring the
 * child process gets terminated in those cases.
 *
 * SubprocessTerminator doesn't do anything on Windows, since by default Windows automatically
 * terminates child processes when their parent is terminated.
 */
export declare class SubprocessTerminator {
    /**
     * Whether the hooks are installed
     */
    private static _initialized;
    /**
     * The list of registered child processes.  Processes are removed from this set if they
     * terminate on their own.
     */
    private static _subprocessesByPid;
    private static readonly _isWindows;
    static readonly RECOMMENDED_OPTIONS: ISubprocessOptions;
    /**
     * Registers a child process so that it will be terminated automatically if the current process
     * is terminated.
     */
    static killProcessTreeOnExit(subprocess: child_process.ChildProcess, subprocessOptions: ISubprocessOptions): void;
    static killProcessTree(subprocess: child_process.ChildProcess, subprocessOptions: ISubprocessOptions): void;
    private static _ensureInitialized;
    private static _cleanupChildProcesses;
    private static _validateSubprocessOptions;
    private static _onExit;
    private static _onTerminateSignal;
    private static _logDebug;
}
//# sourceMappingURL=SubprocessTerminator.d.ts.map