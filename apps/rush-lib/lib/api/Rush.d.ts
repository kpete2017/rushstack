/**
 * Options to pass to the rush "launch" functions.
 *
 * @public
 */
export interface ILaunchOptions {
    /**
     * True if the tool was invoked from within a project with a rush.json file, otherwise false. We
     * consider a project without a rush.json to be "unmanaged" and we'll print that to the command line when
     * the tool is executed. This is mainly used for debugging purposes.
     */
    isManaged: boolean;
    /**
     * If true, the wrapper process already printed a warning that the version of Node.js hasn't been tested
     * with this version of Rush, so we shouldn't print a similar error.
     */
    alreadyReportedNodeTooNewError?: boolean;
}
/**
 * General operations for the Rush engine.
 *
 * @public
 */
export declare class Rush {
    private static _version;
    /**
     * This API is used by the `@microsoft/rush` front end to launch the "rush" command-line.
     * Third-party tools should not use this API.  Instead, they should execute the "rush" binary
     * and start a new Node.js process.
     *
     * @param launcherVersion - The version of the `@microsoft/rush` wrapper used to call invoke the CLI.
     *
     * @remarks
     * Earlier versions of the rush frontend used a different API contract. In the old contract,
     * the second argument was the `isManaged` value of the {@link ILaunchOptions} object.
     *
     * Even though this API isn't documented, it is still supported for legacy compatibility.
     */
    static launch(launcherVersion: string, arg: ILaunchOptions): void;
    /**
     * This API is used by the `@microsoft/rush` front end to launch the "rushx" command-line.
     * Third-party tools should not use this API.  Instead, they should execute the "rushx" binary
     * and start a new Node.js process.
     *
     * @param launcherVersion - The version of the `@microsoft/rush` wrapper used to call invoke the CLI.
     */
    static launchRushX(launcherVersion: string, options: ILaunchOptions): void;
    /**
     * The currently executing version of the "rush-lib" library.
     * This is the same as the Rush tool version for that release.
     */
    static get version(): string;
    /**
     * Assign the `RUSH_INVOKED_FOLDER` environment variable during startup.  This is only applied when
     * Rush is invoked via the CLI, not via the `@microsoft/rush-lib` automation API.
     *
     * @remarks
     * Modifying the parent process's environment is not a good design.  The better design is (1) to consolidate
     * Rush's code paths that invoke scripts, and (2) to pass down the invoked folder with each code path,
     * so that it can finally be applied in a centralized helper like `Utilities._createEnvironmentForRushCommand()`.
     * The natural time to do that refactoring is when we rework `Utilities.executeCommand()` to use
     * `Executable.spawn()` or rushell.
     */
    private static _assignRushInvokedFolder;
    /**
     * This function normalizes legacy options to the current {@link ILaunchOptions} object.
     */
    private static _normalizeLaunchOptions;
    private static _printStartupBanner;
}
//# sourceMappingURL=Rush.d.ts.map