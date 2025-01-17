import { IEnvironment } from '../utilities/Utilities';
export interface IEnvironmentConfigurationInitializeOptions {
    doNotNormalizePaths?: boolean;
}
/**
 * Names of environment variables used by Rush.
 * @public
 */
export declare const enum EnvironmentVariableNames {
    /**
     * This variable overrides the temporary folder used by Rush.
     * The default value is "common/temp" under the repository root.
     *
     * @remarks This environment variable is not compatible with workspace installs. If attempting
     * to move the PNPM store path, see the `RUSH_PNPM_STORE_PATH` environment variable.
     */
    RUSH_TEMP_FOLDER = "RUSH_TEMP_FOLDER",
    /**
     * This variable overrides the version of Rush that will be installed by
     * the version selector.  The default value is determined by the "rushVersion"
     * field from rush.json.
     */
    RUSH_PREVIEW_VERSION = "RUSH_PREVIEW_VERSION",
    /**
     * If this variable is set to "1", Rush will not fail the build when running a version
     * of Node that does not match the criteria specified in the "nodeSupportedVersionRange"
     * field from rush.json.
     */
    RUSH_ALLOW_UNSUPPORTED_NODEJS = "RUSH_ALLOW_UNSUPPORTED_NODEJS",
    /**
     * Setting this environment variable overrides the value of `allowWarningsInSuccessfulBuild`
     * in the `command-line.json` configuration file. Specify `1` to allow warnings in a successful build,
     * or `0` to disallow them. (See the comments in the command-line.json file for more information).
     */
    RUSH_ALLOW_WARNINGS_IN_SUCCESSFUL_BUILD = "RUSH_ALLOW_WARNINGS_IN_SUCCESSFUL_BUILD",
    /**
     * This variable selects a specific installation variant for Rush to use when installing
     * and linking package dependencies.
     * For more information, see the command-line help for the `--variant` parameter
     * and this article:  https://rushjs.io/pages/advanced/installation_variants/
     */
    RUSH_VARIANT = "RUSH_VARIANT",
    /**
     * Specifies the maximum number of concurrent processes to launch during a build.
     * For more information, see the command-line help for the `--parallelism` parameter for "rush build".
     */
    RUSH_PARALLELISM = "RUSH_PARALLELISM",
    /**
     * If this variable is set to "1", Rush will create symlinks with absolute paths instead
     * of relative paths. This can be necessary when a repository is moved during a build or
     * if parts of a repository are moved into a sandbox.
     */
    RUSH_ABSOLUTE_SYMLINKS = "RUSH_ABSOLUTE_SYMLINKS",
    /**
     * When using PNPM as the package manager, this variable can be used to configure the path that
     * PNPM will use as the store directory.
     *
     * If a relative path is used, then the store path will be resolved relative to the process's
     * current working directory.  An absolute path is recommended.
     */
    RUSH_PNPM_STORE_PATH = "RUSH_PNPM_STORE_PATH",
    /**
     * This environment variable can be used to specify the `--target-folder` parameter
     * for the "rush deploy" command.
     */
    RUSH_DEPLOY_TARGET_FOLDER = "RUSH_DEPLOY_TARGET_FOLDER",
    /**
     * Overrides the location of the `~/.rush` global folder where Rush stores temporary files.
     *
     * @remarks
     *
     * Most of the temporary files created by Rush are stored separately for each monorepo working folder,
     * to avoid issues of concurrency and compatibility between tool versions.  However, a small set
     * of files (e.g. installations of the `@microsoft/rush-lib` engine and the package manager) are stored
     * in a global folder to speed up installations.  The default location is `~/.rush` on POSIX-like
     * operating systems or `C:\Users\YourName` on Windows.
     *
     * Use `RUSH_GLOBAL_FOLDER` to specify a different folder path.  This is useful for example if a Windows
     * group policy forbids executing scripts installed in a user's home directory.
     *
     * POSIX is a registered trademark of the Institute of Electrical and Electronic Engineers, Inc.
     */
    RUSH_GLOBAL_FOLDER = "RUSH_GLOBAL_FOLDER",
    /**
     * Provides a credential for a remote build cache, if configured. Setting this environment variable
     * overrides whatever credential has been saved in the local cloud cache credentials using
     * `rush update-cloud-credentials`.
     *
     * @remarks
     * This credential overrides any cached credentials.
     *
     * If Azure Blob Storage is used to store cache entries, this must be a SAS token serialized as query
     * parameters.
     *
     * For information on SAS tokens, see here: https://docs.microsoft.com/en-us/azure/storage/common/storage-sas-overview
     */
    RUSH_BUILD_CACHE_CREDENTIAL = "RUSH_BUILD_CACHE_CREDENTIAL",
    /**
     * Setting this environment variable overrides the value of `buildCacheEnabled` in the `build-cache.json`
     * configuration file. Specify `1` to enable the build cache or `0` to disable it.
     *
     * If set to `0`, this is equivalent to passing the `--disable-build-cache` flag.
     */
    RUSH_BUILD_CACHE_ENABLED = "RUSH_BUILD_CACHE_ENABLED",
    /**
     * Setting this environment variable overrides the value of `isCacheWriteAllowed` in the `build-cache.json`
     * configuration file. Specify `1` to allow cache write and `0` to disable it.
     */
    RUSH_BUILD_CACHE_WRITE_ALLOWED = "RUSH_BUILD_CACHE_WRITE_ALLOWED",
    /**
     * Allows the git binary path to be explicitly specified.
     */
    RUSH_GIT_BINARY_PATH = "RUSH_GIT_BINARY_PATH",
    /**
     * When Rush executes shell scripts, it sometimes changes the working directory to be a project folder or
     * the repository root folder.  The original working directory (where the Rush command was invoked) is assigned
     * to the the child process's `RUSH_INVOKED_FOLDER` environment variable, in case it is needed by the script.
     *
     * @remarks
     * The `RUSH_INVOKED_FOLDER` variable is the same idea as the `INIT_CWD` variable that package managers
     * assign when they execute lifecycle scripts.
     */
    RUSH_INVOKED_FOLDER = "RUSH_INVOKED_FOLDER"
}
/**
 * Provides Rush-specific environment variable data. All Rush environment variables must start with "RUSH_". This class
 * is designed to be used by RushConfiguration.
 *
 * @remarks
 * Initialize will throw if any unknown parameters are present.
 */
export declare class EnvironmentConfiguration {
    private static _hasBeenInitialized;
    private static _rushTempFolderOverride;
    private static _absoluteSymlinks;
    private static _allowUnsupportedNodeVersion;
    private static _allowWarningsInSuccessfulBuild;
    private static _pnpmStorePathOverride;
    private static _rushGlobalFolderOverride;
    private static _buildCacheCredential;
    private static _buildCacheEnabled;
    private static _buildCacheWriteAllowed;
    private static _gitBinaryPath;
    /**
     * An override for the common/temp folder path.
     */
    static get rushTempFolderOverride(): string | undefined;
    /**
     * If "1", create symlinks with absolute paths instead of relative paths.
     * See {@link EnvironmentVariableNames.RUSH_ABSOLUTE_SYMLINKS}
     */
    static get absoluteSymlinks(): boolean;
    /**
     * If this environment variable is set to "1", the Node.js version check will print a warning
     * instead of causing a hard error if the environment's Node.js version doesn't match the
     * version specifier in `rush.json`'s "nodeSupportedVersionRange" property.
     *
     * See {@link EnvironmentVariableNames.RUSH_ALLOW_UNSUPPORTED_NODEJS}.
     */
    static get allowUnsupportedNodeVersion(): boolean;
    /**
     * Setting this environment variable overrides the value of `allowWarningsInSuccessfulBuild`
     * in the `command-line.json` configuration file. Specify `1` to allow warnings in a successful build,
     * or `0` to disallow them. (See the comments in the command-line.json file for more information).
     */
    static get allowWarningsInSuccessfulBuild(): boolean;
    /**
     * An override for the PNPM store path, if `pnpmStore` configuration is set to 'path'
     * See {@link EnvironmentVariableNames.RUSH_PNPM_STORE_PATH}
     */
    static get pnpmStorePathOverride(): string | undefined;
    /**
     * Overrides the location of the `~/.rush` global folder where Rush stores temporary files.
     * See {@link EnvironmentVariableNames.RUSH_GLOBAL_FOLDER}
     */
    static get rushGlobalFolderOverride(): string | undefined;
    /**
     * Provides a credential for reading from and writing to a remote build cache, if configured.
     * See {@link EnvironmentVariableNames.RUSH_BUILD_CACHE_CREDENTIAL}
     */
    static get buildCacheCredential(): string | undefined;
    /**
     * If set, enables or disables the cloud build cache feature.
     * See {@link EnvironmentVariableNames.RUSH_BUILD_CACHE_ENABLED}
     */
    static get buildCacheEnabled(): boolean | undefined;
    /**
     * If set, enables or disables writing to the cloud build cache.
     * See {@link EnvironmentVariableNames.RUSH_BUILD_CACHE_WRITE_ALLOWED}
     */
    static get buildCacheWriteAllowed(): boolean | undefined;
    /**
     * Allows the git binary path to be explicitly provided.
     * See {@link EnvironmentVariableNames.RUSH_GIT_BINARY_PATH}
     */
    static get gitBinaryPath(): string | undefined;
    /**
     * The front-end RushVersionSelector relies on `RUSH_GLOBAL_FOLDER`, so its value must be read before
     * `EnvironmentConfiguration` is initialized (and actually before the correct version of `EnvironmentConfiguration`
     * is even installed). Thus we need to read this environment variable differently from all the others.
     * @internal
     */
    static _getRushGlobalFolderOverride(processEnv: IEnvironment): string | undefined;
    /**
     * Reads and validates environment variables. If any are invalid, this function will throw.
     */
    static initialize(options?: IEnvironmentConfigurationInitializeOptions): void;
    /**
     * Resets EnvironmentConfiguration into an un-initialized state.
     */
    static reset(): void;
    private static _ensureInitialized;
    static parseBooleanEnvironmentVariable(name: string, value: string | undefined): boolean | undefined;
    /**
     * Given a path to a folder (that may or may not exist), normalize the path, including casing,
     * to the first existing parent folder in the path.
     *
     * If no existing path can be found (for example, if the root is a volume that doesn't exist),
     * this function returns undefined.
     *
     * @example
     * If the following path exists on disk: C:\Folder1\folder2\
     * _normalizeFirstExistingFolderPath('c:\\folder1\\folder2\\temp\\subfolder')
     * returns 'C:\\Folder1\\folder2\\temp\\subfolder'
     */
    private static _normalizeDeepestParentFolderPath;
}
//# sourceMappingURL=EnvironmentConfiguration.d.ts.map