/**
 * This class provides global folders that are used for rush's internal install locations.
 *
 * @internal
 */
export declare class RushGlobalFolder {
    private _rushGlobalFolder;
    private _rushNodeSpecificUserFolder;
    /**
     * The global folder where Rush stores temporary files.
     *
     * @remarks
     *
     * Most of the temporary files created by Rush are stored separately for each monorepo working folder,
     * to avoid issues of concurrency and compatibility between tool versions.  However, a small set
     * of files (e.g. installations of the `@microsoft/rush-lib` engine and the package manager) are stored
     * in a global folder to speed up installations.  The default location is `~/.rush` on POSIX-like
     * operating systems or `C:\Users\YourName` on Windows.
     *
     * You can use the {@link EnvironmentVariableNames.RUSH_GLOBAL_FOLDER} environment  variable to specify
     * a different folder path.  This is useful for example if a Windows group policy forbids executing scripts
     * installed in a user's home directory.
     *
     * POSIX is a registered trademark of the Institute of Electrical and Electronic Engineers, Inc.
     */
    get path(): string;
    /**
     * The absolute path to Rush's storage in the home directory for the current user and node version.
     * On Windows, it would be something like `C:\Users\YourName\.rush\node-v3.4.5`.
     */
    get nodeSpecificPath(): string;
    constructor();
}
//# sourceMappingURL=RushGlobalFolder.d.ts.map