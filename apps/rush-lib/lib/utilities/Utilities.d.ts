/// <reference types="node" />
import * as child_process from 'child_process';
import type * as stream from 'stream';
import { RushConfiguration } from '../api/RushConfiguration';
export interface IEnvironment {
    [environmentVariableName: string]: string | undefined;
}
/**
 * Options for Utilities.executeCommand().
 */
export interface IExecuteCommandOptions {
    command: string;
    args: string[];
    workingDirectory: string;
    environment?: IEnvironment;
    suppressOutput?: boolean;
    keepEnvironment?: boolean;
}
/**
 * Options for Utilities.installPackageInDirectory().
 */
export interface IInstallPackageInDirectoryOptions {
    directory: string;
    packageName: string;
    version: string;
    tempPackageTitle: string;
    maxInstallAttempts: number;
    commonRushConfigFolder: string | undefined;
    suppressOutput?: boolean;
}
export interface ILifecycleCommandOptions {
    /**
     * The rush configuration, if the command is running in a rush repo.
     */
    rushConfiguration: RushConfiguration | undefined;
    /**
     * Working directory for running the command
     */
    workingDirectory: string;
    /**
     * The folder containing a local .npmrc, which will be used for the INIT_CWD environment variable
     */
    initCwd: string;
    /**
     * If true, suppress the process's output, but if there is a nonzero exit code then print stderr
     */
    handleOutput: boolean;
    /**
     * Options for what should be added to the PATH variable
     */
    environmentPathOptions: IEnvironmentPathOptions;
}
export interface IEnvironmentPathOptions {
    /**
     * If true, include <project root>/node_modules/.bin in the PATH. If both this and
     * {@link IEnvironmentPathOptions.includeRepoBin} are set, this path will take precedence.
     */
    includeProjectBin?: boolean;
    /**
     * If true, include <repo root>/common/temp/node_modules/.bin in the PATH.
     */
    includeRepoBin?: boolean;
    /**
     * Additional folders to be prepended to the search PATH.
     */
    additionalPathFolders?: string[] | undefined;
}
export interface IDisposable {
    dispose(): void;
}
export declare class Utilities {
    /**
     * Get the user's home directory. On windows this looks something like "C:\users\username\" and on UNIX
     * this looks something like "/home/username/"
     */
    static getHomeFolder(): string;
    /**
     * Node.js equivalent of performance.now().
     */
    static getTimeInMs(): number;
    /**
     * Returns the values from a Set<T>
     */
    static getSetAsArray<T>(set: Set<T>): T[];
    /**
     * Retries a function until a timeout is reached. The function is expected to throw if it failed and
     *  should be retried.
     */
    static retryUntilTimeout<TResult>(fn: () => TResult, maxWaitTimeMs: number, getTimeoutError: (innerError: Error) => Error, fnName: string): TResult;
    /**
     * Creates the specified folder by calling FileSystem.ensureFolder(), but using a
     * retry loop to recover from temporary locks that may be held by other processes.
     * If the folder already exists, no error occurs.
     */
    static createFolderWithRetry(folderName: string): void;
    /**
     * Determines if the path points to a file and that it exists.
     */
    static fileExists(filePath: string): boolean;
    /**
     * Determines if a path points to a directory and that it exists.
     */
    static directoryExists(directoryPath: string): boolean;
    /**
     * BE VERY CAREFUL CALLING THIS FUNCTION!
     * If you specify the wrong folderPath (e.g. "/"), it could potentially delete your entire
     * hard disk.
     */
    static dangerouslyDeletePath(folderPath: string): void;
    /**
     * Attempts to delete a file. If it does not exist, or the path is not a file, it no-ops.
     */
    static deleteFile(filePath: string): void;
    static isFileTimestampCurrent(dateToCompare: Date, inputFilenames: string[]): boolean;
    /**
     * Executes the command with the specified command-line parameters, and waits for it to complete.
     * The current directory will be set to the specified workingDirectory.
     */
    static executeCommand(options: IExecuteCommandOptions): void;
    /**
     * Executes the command with the specified command-line parameters, and waits for it to complete.
     * The current directory will be set to the specified workingDirectory.
     */
    static executeCommandAndCaptureOutput(command: string, args: string[], workingDirectory: string, environment?: IEnvironment, keepEnvironment?: boolean): string;
    /**
     * Attempts to run Utilities.executeCommand() up to maxAttempts times before giving up.
     */
    static executeCommandWithRetry(options: IExecuteCommandOptions, maxAttempts: number, retryCallback?: () => void): void;
    /**
     * Executes the command using cmd if running on windows, or using sh if running on a non-windows OS.
     * @param command - the command to run on shell
     * @param options - options for how the command should be run
     */
    static executeLifecycleCommand(command: string, options: ILifecycleCommandOptions): number;
    /**
     * Executes the command using cmd if running on windows, or using sh if running on a non-windows OS.
     * @param command - the command to run on shell
     * @param options - options for how the command should be run
     */
    static executeLifecycleCommandAsync(command: string, options: ILifecycleCommandOptions): child_process.ChildProcess;
    /**
     * Utility to determine if the app should restrict writing to the console.
     */
    static shouldRestrictConsoleOutput(): boolean;
    /**
     * For strings passed to a shell command, this adds appropriate escaping
     * to avoid misinterpretation of spaces or special characters.
     *
     * Example: 'hello there' --> '"hello there"'
     */
    static escapeShellParameter(parameter: string): string;
    /**
     * Installs a package by name and version in the specified directory.
     */
    static installPackageInDirectory(options: IInstallPackageInDirectoryOptions): void;
    /**
     * As a workaround, copyAndTrimNpmrcFile() copies the .npmrc file to the target folder, and also trims
     * unusable lines from the .npmrc file.
     *
     * Why are we trimming the .npmrc lines?  NPM allows environment variables to be specified in
     * the .npmrc file to provide different authentication tokens for different registry.
     * However, if the environment variable is undefined, it expands to an empty string, which
     * produces a valid-looking mapping with an invalid URL that causes an error.  Instead,
     * we'd prefer to skip that line and continue looking in other places such as the user's
     * home directory.
     *
     * IMPORTANT: THIS CODE SHOULD BE KEPT UP TO DATE WITH _copyAndTrimNpmrcFile() FROM scripts/install-run.ts
     */
    static copyAndTrimNpmrcFile(sourceNpmrcPath: string, targetNpmrcPath: string): void;
    /**
     * Copies the file "sourcePath" to "destinationPath", overwriting the target file location.
     * If the source file does not exist, then the target file is deleted.
     */
    static syncFile(sourcePath: string, destinationPath: string): void;
    /**
     * syncNpmrc() copies the .npmrc file to the target folder, and also trims unusable lines from the .npmrc file.
     * If the source .npmrc file not exist, then syncNpmrc() will delete an .npmrc that is found in the target folder.
     *
     * IMPORTANT: THIS CODE SHOULD BE KEPT UP TO DATE WITH _syncNpmrc() FROM scripts/install-run.ts
     */
    static syncNpmrc(sourceNpmrcFolder: string, targetNpmrcFolder: string, useNpmrcPublish?: boolean): void;
    static getRushConfigNotFoundError(): Error;
    static getPackageDepsFilenameForCommand(command: string): string;
    static usingAsync<TDisposable extends IDisposable>(getDisposableAsync: () => Promise<TDisposable> | IDisposable, doActionAsync: (disposable: TDisposable) => Promise<void> | void): Promise<void>;
    static readStreamToBufferAsync(stream: stream.Readable): Promise<Buffer>;
    private static _executeLifecycleCommandInternal;
    /**
     * Returns a process.env environment suitable for executing lifecycle scripts.
     * @param initialEnvironment - an existing environment to copy instead of process.env
     *
     * @remarks
     * Rush._assignRushInvokedFolder() assigns the `RUSH_INVOKED_FOLDER` variable globally
     * via the parent process's environment.
     */
    private static _createEnvironmentForRushCommand;
    /**
     * Prepend the node_modules/.bin folder under the specified folder to the specified PATH variable. For example,
     * if `rootDirectory` is "/foobar" and `existingPath` is "/bin", this function will return
     * "/foobar/node_modules/.bin:/bin"
     */
    private static _prependNodeModulesBinToPath;
    /**
     * Executes the command with the specified command-line parameters, and waits for it to complete.
     * The current directory will be set to the specified workingDirectory.
     */
    private static _executeCommandInternal;
    private static _processResult;
}
//# sourceMappingURL=Utilities.d.ts.map