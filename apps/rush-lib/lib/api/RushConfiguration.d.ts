import { JsonNull, PackageNameParser } from '@rushstack/node-core-library';
import { RushConfigurationProject, IRushConfigurationProjectJson } from './RushConfigurationProject';
import { ApprovedPackagesPolicy } from './ApprovedPackagesPolicy';
import { EventHooks } from './EventHooks';
import { VersionPolicyConfiguration } from './VersionPolicyConfiguration';
import { CommonVersionsConfiguration } from './CommonVersionsConfiguration';
import { PackageManagerName, PackageManager } from './packageManager/PackageManager';
import { ExperimentsConfiguration } from './ExperimentsConfiguration';
import { RepoStateFile } from '../logic/RepoStateFile';
/**
 * Part of IRushConfigurationJson.
 */
export interface IApprovedPackagesPolicyJson {
    reviewCategories?: string[];
    ignoredNpmScopes?: string[];
}
/**
 * Part of IRushConfigurationJson.
 */
export interface IRushGitPolicyJson {
    allowedEmailRegExps?: string[];
    sampleEmail?: string;
    versionBumpCommitMessage?: string;
    changeLogUpdateCommitMessage?: string;
}
/**
 * Part of IRushConfigurationJson.
 * @beta
 */
export interface IEventHooksJson {
    /**
     * The list of scripts to run after every Rush build command finishes
     */
    postRushBuild?: string[];
}
/**
 * Part of IRushConfigurationJson.
 */
export interface IRushRepositoryJson {
    /**
     * The remote url of the repository. This helps "rush change" find the right remote to compare against.
     */
    url?: string;
    /**
     * The default branch name. This tells "rush change" which remote branch to compare against.
     */
    defaultBranch?: string;
    /**
     * The default remote. This tells "rush change" which remote to compare against if the remote URL is not set
     * or if a remote matching the provided remote URL is not found.
     */
    defaultRemote?: string;
}
/**
 * This represents the available PNPM store options
 * @public
 */
export declare type PnpmStoreOptions = 'local' | 'global';
/**
 * Options for the package manager.
 * @public
 */
export interface IPackageManagerOptionsJsonBase {
    /**
     * Environment variables for the package manager
     */
    environmentVariables?: IConfigurationEnvironment;
}
/**
 * A collection of environment variables
 * @public
 */
export interface IConfigurationEnvironment {
    /**
     * Environment variables
     */
    [environmentVariableName: string]: IConfigurationEnvironmentVariable;
}
/**
 * Represents the value of an environment variable, and if the value should be overridden if the variable is set
 * in the parent environment.
 * @public
 */
export interface IConfigurationEnvironmentVariable {
    /**
     * Value of the environment variable
     */
    value: string;
    /**
     * Set to true to override the environment variable even if it is set in the parent environment.
     * The default value is false.
     */
    override?: boolean;
}
/**
 * Part of IRushConfigurationJson.
 * @internal
 */
export interface INpmOptionsJson extends IPackageManagerOptionsJsonBase {
}
/**
 * Part of IRushConfigurationJson.
 * @internal
 */
export interface IPnpmOptionsJson extends IPackageManagerOptionsJsonBase {
    /**
     * The store resolution method for PNPM to use
     */
    pnpmStore?: PnpmStoreOptions;
    /**
     * Should PNPM fail if peer dependencies aren't installed?
     */
    strictPeerDependencies?: boolean;
    /**
     * {@inheritDoc PnpmOptionsConfiguration.preventManualShrinkwrapChanges}
     */
    preventManualShrinkwrapChanges?: boolean;
    /**
     * {@inheritDoc PnpmOptionsConfiguration.useWorkspaces}
     */
    useWorkspaces?: boolean;
}
/**
 * Part of IRushConfigurationJson.
 * @internal
 */
export interface IYarnOptionsJson extends IPackageManagerOptionsJsonBase {
    /**
     * If true, then Rush will add the "--ignore-engines" option when invoking Yarn.
     * This allows "rush install" to succeed if there are dependencies with engines defined in
     * package.json which do not match the current environment.
     *
     * The default value is false.
     */
    ignoreEngines?: boolean;
}
/**
 * Options defining an allowed variant as part of IRushConfigurationJson.
 */
export interface IRushVariantOptionsJson {
    variantName: string;
    description: string;
}
/**
 * This represents the JSON data structure for the "rush.json" configuration file.
 * See rush.schema.json for documentation.
 */
export interface IRushConfigurationJson {
    $schema: string;
    npmVersion?: string;
    pnpmVersion?: string;
    yarnVersion?: string;
    rushVersion: string;
    repository?: IRushRepositoryJson;
    nodeSupportedVersionRange?: string;
    suppressNodeLtsWarning?: boolean;
    projectFolderMinDepth?: number;
    projectFolderMaxDepth?: number;
    allowMostlyStandardPackageNames?: boolean;
    approvedPackagesPolicy?: IApprovedPackagesPolicyJson;
    gitPolicy?: IRushGitPolicyJson;
    telemetryEnabled?: boolean;
    projects: IRushConfigurationProjectJson[];
    eventHooks?: IEventHooksJson;
    hotfixChangeEnabled?: boolean;
    npmOptions?: INpmOptionsJson;
    pnpmOptions?: IPnpmOptionsJson;
    yarnOptions?: IYarnOptionsJson;
    ensureConsistentVersions?: boolean;
    variants?: IRushVariantOptionsJson[];
}
/**
 * This represents the JSON data structure for the "current-variant.json" data file.
 */
export interface ICurrentVariantJson {
    variant: string | JsonNull;
}
/**
 * Options that all package managers share.
 *
 * @public
 */
export declare abstract class PackageManagerOptionsConfigurationBase implements IPackageManagerOptionsJsonBase {
    /**
     * Environment variables for the package manager
     */
    readonly environmentVariables?: IConfigurationEnvironment;
    /** @internal */
    protected constructor(json: IPackageManagerOptionsJsonBase);
}
/**
 * Options that are only used when the NPM package manager is selected.
 *
 * @remarks
 * It is valid to define these options in rush.json even if the NPM package manager
 * is not being used.
 *
 * @public
 */
export declare class NpmOptionsConfiguration extends PackageManagerOptionsConfigurationBase {
    /** @internal */
    constructor(json: INpmOptionsJson);
}
/**
 * Options that are only used when the PNPM package manager is selected.
 *
 * @remarks
 * It is valid to define these options in rush.json even if the PNPM package manager
 * is not being used.
 *
 * @public
 */
export declare class PnpmOptionsConfiguration extends PackageManagerOptionsConfigurationBase {
    /**
     * The method used to resolve the store used by PNPM.
     *
     * @remarks
     * Available options:
     *  - local: Use the standard Rush store path: common/temp/pnpm-store
     *  - global: Use PNPM's global store path
     */
    readonly pnpmStore: PnpmStoreOptions;
    /**
     * The path for PNPM to use as the store directory.
     *
     * Will be overridden by environment variable RUSH_PNPM_STORE_PATH
     */
    readonly pnpmStorePath: string;
    /**
     * If true, then Rush will add the "--strict-peer-dependencies" option when invoking PNPM.
     *
     * @remarks
     * This causes "rush install" to fail if there are unsatisfied peer dependencies, which is
     * an invalid state that can cause build failures or incompatible dependency versions.
     * (For historical reasons, JavaScript package managers generally do not treat this invalid state
     * as an error.)
     *
     * The default value is false.  (For now.)
     */
    readonly strictPeerDependencies: boolean;
    /**
     * If true, then `rush install` will report an error if manual modifications
     * were made to the PNPM shrinkwrap file without running `rush update` afterwards.
     *
     * @remarks
     * This feature protects against accidental inconsistencies that may be introduced
     * if the PNPM shrinkwrap file (`pnpm-lock.yaml`) is manually edited.  When this
     * feature is enabled, `rush update` will write a hash of the shrinkwrap contents to repo-state.json,
     * and then `rush update` and `rush install` will validate the hash.  Note that this does not prohibit
     * manual modifications, but merely requires `rush update` be run
     * afterwards, ensuring that PNPM can report or repair any potential inconsistencies.
     *
     * To temporarily disable this validation when invoking `rush install`, use the
     * `--bypass-policy` command-line parameter.
     *
     * The default value is false.
     */
    readonly preventManualShrinkwrapChanges: boolean;
    /**
     * If true, then Rush will use the workspaces feature to install and link packages when invoking PNPM.
     *
     * @remarks
     * The default value is false.  (For now.)
     */
    readonly useWorkspaces: boolean;
    /** @internal */
    constructor(json: IPnpmOptionsJson, commonTempFolder: string);
}
/**
 * Options that are only used when the yarn package manager is selected.
 *
 * @remarks
 * It is valid to define these options in rush.json even if the yarn package manager
 * is not being used.
 *
 * @public
 */
export declare class YarnOptionsConfiguration extends PackageManagerOptionsConfigurationBase {
    /**
     * If true, then Rush will add the "--ignore-engines" option when invoking Yarn.
     * This allows "rush install" to succeed if there are dependencies with engines defined in
     * package.json which do not match the current environment.
     *
     * The default value is false.
     */
    readonly ignoreEngines: boolean;
    /** @internal */
    constructor(json: IYarnOptionsJson);
}
/**
 * Options for `RushConfiguration.tryFindRushJsonLocation`.
 * @public
 */
export interface ITryFindRushJsonLocationOptions {
    /**
     * Whether to show verbose console messages.  Defaults to false.
     */
    showVerbose?: boolean;
    /**
     * The folder path where the search will start.  Defaults tot he current working directory.
     */
    startingFolder?: string;
}
/**
 * This represents the Rush configuration for a repository, based on the "rush.json"
 * configuration file.
 * @public
 */
export declare class RushConfiguration {
    private static _jsonSchema;
    private _rushJsonFile;
    private _rushJsonFolder;
    private _changesFolder;
    private _commonFolder;
    private _commonTempFolder;
    private _commonScriptsFolder;
    private _commonRushConfigFolder;
    private _packageManager;
    private _packageManagerWrapper;
    private _npmCacheFolder;
    private _npmTmpFolder;
    private _yarnCacheFolder;
    private _shrinkwrapFilename;
    private _tempShrinkwrapFilename;
    private _tempShrinkwrapPreinstallFilename;
    private _currentVariantJsonFilename;
    private _packageManagerToolVersion;
    private _packageManagerToolFilename;
    private _projectFolderMinDepth;
    private _projectFolderMaxDepth;
    private _allowMostlyStandardPackageNames;
    private _ensureConsistentVersions;
    private _suppressNodeLtsWarning;
    private _variants;
    private _projectByRelativePath;
    private _approvedPackagesPolicy;
    private _gitAllowedEmailRegExps;
    private _gitSampleEmail;
    private _gitVersionBumpCommitMessage;
    private _gitChangeLogUpdateCommitMessage;
    private _hotfixChangeEnabled;
    private _repositoryUrl;
    private _repositoryDefaultBranch;
    private _repositoryDefaultRemote;
    private _npmOptions;
    private _pnpmOptions;
    private _yarnOptions;
    private _packageManagerConfigurationOptions;
    private _eventHooks;
    private readonly _packageNameParser;
    private _telemetryEnabled;
    private _projects;
    private _projectsByName;
    private _commonVersionsConfigurations;
    private _implicitlyPreferredVersions;
    private _versionPolicyConfiguration;
    private _versionPolicyConfigurationFilePath;
    private _experimentsConfiguration;
    private readonly _rushConfigurationJson;
    /**
     * Use RushConfiguration.loadFromConfigurationFile() or Use RushConfiguration.loadFromDefaultLocation()
     * instead.
     */
    private constructor();
    private _initializeAndValidateLocalProjects;
    /**
     * Loads the configuration data from an Rush.json configuration file and returns
     * an RushConfiguration object.
     */
    static loadFromConfigurationFile(rushJsonFilename: string): RushConfiguration;
    static loadFromDefaultLocation(options?: ITryFindRushJsonLocationOptions): RushConfiguration;
    /**
     * Find the rush.json location and return the path, or undefined if a rush.json can't be found.
     */
    static tryFindRushJsonLocation(options?: ITryFindRushJsonLocationOptions): string | undefined;
    /**
     * This generates the unique names that are used to create temporary projects
     * in the Rush common folder.
     * NOTE: sortedProjectJsons is sorted by the caller.
     */
    private static _generateTempNamesForProjects;
    /**
     * If someone adds a config file in the "common/rush/config" folder, it would be a bad
     * experience for Rush to silently ignore their file simply because they misspelled the
     * filename, or maybe it's an old format that's no longer supported.  The
     * _validateCommonRushConfigFolder() function makes sure that this folder only contains
     * recognized config files.
     */
    private static _validateCommonRushConfigFolder;
    /**
     * The name of the package manager being used to install dependencies
     */
    get packageManager(): PackageManagerName;
    /**
     * {@inheritdoc PackageManager}
     *
     * @privateremarks
     * In the next major breaking API change, we will rename this property to "packageManager" and eliminate the
     * old property with that name.
     *
     * @beta
     */
    get packageManagerWrapper(): PackageManager;
    /**
     * Gets the JSON data structure for the "rush.json" configuration file.
     *
     * @internal
     */
    get rushConfigurationJson(): IRushConfigurationJson;
    /**
     * The absolute path to the "rush.json" configuration file that was loaded to construct this object.
     */
    get rushJsonFile(): string;
    /**
     * The absolute path of the folder that contains rush.json for this project.
     */
    get rushJsonFolder(): string;
    /**
     * The folder that contains all change files.
     */
    get changesFolder(): string;
    /**
     * The fully resolved path for the "common" folder where Rush will store settings that
     * affect all Rush projects.  This is always a subfolder of the folder containing "rush.json".
     * Example: `C:\MyRepo\common`
     */
    get commonFolder(): string;
    /**
     * The folder where Rush's additional config files are stored.  This folder is always a
     * subfolder called `config\rush` inside the common folder.  (The `common\config` folder
     * is reserved for configuration files used by other tools.)  To avoid confusion or mistakes,
     * Rush will report an error if this this folder contains any unrecognized files.
     *
     * Example: `C:\MyRepo\common\config\rush`
     */
    get commonRushConfigFolder(): string;
    /**
     * The folder where temporary files will be stored.  This is always a subfolder called "temp"
     * under the common folder.
     * Example: `C:\MyRepo\common\temp`
     */
    get commonTempFolder(): string;
    /**
     * The folder where automation scripts are stored.  This is always a subfolder called "scripts"
     * under the common folder.
     * Example: `C:\MyRepo\common\scripts`
     */
    get commonScriptsFolder(): string;
    /**
     * The fully resolved path for the "autoinstallers" folder.
     * Example: `C:\MyRepo\common\autoinstallers`
     */
    get commonAutoinstallersFolder(): string;
    /**
     * The local folder that will store the NPM package cache.  Rush does not rely on the
     * npm's default global cache folder, because npm's caching implementation does not
     * reliably handle multiple processes.  (For example, if a build box is running
     * "rush install" simultaneously for two different working folders, it may fail randomly.)
     *
     * Example: `C:\MyRepo\common\temp\npm-cache`
     */
    get npmCacheFolder(): string;
    /**
     * The local folder where npm's temporary files will be written during installation.
     * Rush does not rely on the global default folder, because it may be on a different
     * hard disk.
     *
     * Example: `C:\MyRepo\common\temp\npm-tmp`
     */
    get npmTmpFolder(): string;
    /**
     * The local folder that will store the Yarn package cache.
     *
     * Example: `C:\MyRepo\common\temp\yarn-cache`
     */
    get yarnCacheFolder(): string;
    /**
     * The full path of the shrinkwrap file that is tracked by Git.  (The "rush install"
     * command uses a temporary copy, whose path is tempShrinkwrapFilename.)
     * @remarks
     * This property merely reports the filename; the file itself may not actually exist.
     * Example: `C:\MyRepo\common\npm-shrinkwrap.json` or `C:\MyRepo\common\pnpm-lock.yaml`
     *
     * @deprecated Use `getCommittedShrinkwrapFilename` instead, which gets the correct common
     * shrinkwrap file name for a given active variant.
     */
    get committedShrinkwrapFilename(): string;
    /**
     * The filename (without any path) of the shrinkwrap file that is used by the package manager.
     * @remarks
     * This property merely reports the filename; the file itself may not actually exist.
     * Example: `npm-shrinkwrap.json` or `pnpm-lock.yaml`
     */
    get shrinkwrapFilename(): string;
    /**
     * The full path of the temporary shrinkwrap file that is used during "rush install".
     * This file may get rewritten by the package manager during installation.
     * @remarks
     * This property merely reports the filename; the file itself may not actually exist.
     * Example: `C:\MyRepo\common\temp\npm-shrinkwrap.json` or `C:\MyRepo\common\temp\pnpm-lock.yaml`
     */
    get tempShrinkwrapFilename(): string;
    /**
     * The full path of a backup copy of tempShrinkwrapFilename. This backup copy is made
     * before installation begins, and can be compared to determine how the package manager
     * modified tempShrinkwrapFilename.
     * @remarks
     * This property merely reports the filename; the file itself may not actually exist.
     * Example: `C:\MyRepo\common\temp\npm-shrinkwrap-preinstall.json`
     * or `C:\MyRepo\common\temp\pnpm-lock-preinstall.yaml`
     */
    get tempShrinkwrapPreinstallFilename(): string;
    /**
     * Returns an English phrase such as "shrinkwrap file" that can be used in logging messages
     * to refer to the shrinkwrap file using appropriate terminology for the currently selected
     * package manager.
     */
    get shrinkwrapFilePhrase(): string;
    /**
     * The filename of the build dependency data file.  By default this is
     * called 'rush-link.json' resides in the Rush common folder.
     * Its data structure is defined by IRushLinkJson.
     *
     * Example: `C:\MyRepo\common\temp\rush-link.json`
     *
     * @deprecated The "rush-link.json" file was removed in Rush 5.30.0.
     * Use `RushConfigurationProject.localDependencyProjects` instead.
     */
    get rushLinkJsonFilename(): string;
    /**
     * The filename of the variant dependency data file.  By default this is
     * called 'current-variant.json' resides in the Rush common folder.
     * Its data structure is defined by ICurrentVariantJson.
     *
     * Example: `C:\MyRepo\common\temp\current-variant.json`
     */
    get currentVariantJsonFilename(): string;
    /**
     * The version of the locally installed NPM tool.  (Example: "1.2.3")
     */
    get packageManagerToolVersion(): string;
    /**
     * The absolute path to the locally installed NPM tool.  If "rush install" has not
     * been run, then this file may not exist yet.
     * Example: `C:\MyRepo\common\temp\npm-local\node_modules\.bin\npm`
     */
    get packageManagerToolFilename(): string;
    /**
     * The minimum allowable folder depth for the projectFolder field in the rush.json file.
     * This setting provides a way for repository maintainers to discourage nesting of project folders
     * that makes the directory tree more difficult to navigate.  The default value is 2,
     * which implements a standard 2-level hierarchy of <categoryFolder>/<projectFolder>/package.json.
     */
    get projectFolderMinDepth(): number;
    /**
     * The maximum allowable folder depth for the projectFolder field in the rush.json file.
     * This setting provides a way for repository maintainers to discourage nesting of project folders
     * that makes the directory tree more difficult to navigate.  The default value is 2,
     * which implements on a standard convention of <categoryFolder>/<projectFolder>/package.json.
     */
    get projectFolderMaxDepth(): number;
    /**
     * Today the npmjs.com registry enforces fairly strict naming rules for packages, but in the early
     * days there was no standard and hardly any enforcement.  A few large legacy projects are still using
     * nonstandard package names, and private registries sometimes allow it.  Set "allowMostlyStandardPackageNames"
     * to true to relax Rush's enforcement of package names.  This allows upper case letters and in the future may
     * relax other rules, however we want to minimize these exceptions.  Many popular tools use certain punctuation
     * characters as delimiters, based on the assumption that they will never appear in a package name; thus if we relax
     * the rules too much it is likely to cause very confusing malfunctions.
     *
     * The default value is false.
     */
    get allowMostlyStandardPackageNames(): boolean;
    /**
     * The "approvedPackagesPolicy" settings.
     */
    get approvedPackagesPolicy(): ApprovedPackagesPolicy;
    /**
     * [Part of the "gitPolicy" feature.]
     * A list of regular expressions describing allowable email patterns for Git commits.
     * They are case-insensitive anchored JavaScript RegExps.
     * Example: `".*@example\.com"`
     * This array will never be undefined.
     */
    get gitAllowedEmailRegExps(): string[];
    /**
     * [Part of the "gitPolicy" feature.]
     * An example valid email address that conforms to one of the allowedEmailRegExps.
     * Example: `"foxtrot@example\.com"`
     * This will never be undefined, and will always be nonempty if gitAllowedEmailRegExps is used.
     */
    get gitSampleEmail(): string;
    /**
     * [Part of the "gitPolicy" feature.]
     * The commit message to use when committing changes during 'rush publish'
     */
    get gitVersionBumpCommitMessage(): string | undefined;
    /**
     * [Part of the "gitPolicy" feature.]
     * The commit message to use when committing change log files 'rush version'
     */
    get gitChangeLogUpdateCommitMessage(): string | undefined;
    /**
     * [Part of the "hotfixChange" feature.]
     * Enables creating hotfix changes
     */
    get hotfixChangeEnabled(): boolean;
    /**
     * The remote url of the repository. This helps "rush change" find the right remote to compare against.
     */
    get repositoryUrl(): string | undefined;
    /**
     * The default branch name. This tells "rush change" which remote branch to compare against.
     */
    get repositoryDefaultBranch(): string;
    /**
     * The default remote. This tells "rush change" which remote to compare against if the remote URL is not set
     * or if a remote matching the provided remote URL is not found.
     */
    get repositoryDefaultRemote(): string;
    /**
     * The default fully-qualified git remote branch of the repository. This helps "rush change" find the right branch to compare against.
     */
    get repositoryDefaultFullyQualifiedRemoteBranch(): string;
    /**
     * Odd-numbered major versions of Node.js are experimental.  Even-numbered releases
     * spend six months in a stabilization period before the first Long Term Support (LTS) version.
     * For example, 8.9.0 was the first LTS version of Node.js 8.  Pre-LTS versions are not recommended
     * for production usage because they frequently have bugs.  They may cause Rush itself
     * to malfunction.
     *
     * Rush normally prints a warning if it detects a pre-LTS Node.js version.  If you are testing
     * pre-LTS versions in preparation for supporting the first LTS version, you can use this setting
     * to disable Rush's warning.
     */
    get suppressNodeLtsWarning(): boolean;
    /**
     * If true, then consistent version specifiers for dependencies will be enforced.
     * I.e. "rush check" is run before some commands.
     */
    get ensureConsistentVersions(): boolean;
    /**
     * Indicates whether telemetry collection is enabled for Rush runs.
     * @beta
     */
    get telemetryEnabled(): boolean;
    get projects(): RushConfigurationProject[];
    get projectsByName(): Map<string, RushConfigurationProject>;
    /**
     * {@inheritDoc NpmOptionsConfiguration}
     */
    get npmOptions(): NpmOptionsConfiguration;
    /**
     * {@inheritDoc PnpmOptionsConfiguration}
     */
    get pnpmOptions(): PnpmOptionsConfiguration;
    /**
     * {@inheritDoc YarnOptionsConfiguration}
     */
    get yarnOptions(): YarnOptionsConfiguration;
    /**
     * The configuration options used by the current package manager.
     * @remarks
     * For package manager specific variants, reference {@link RushConfiguration.npmOptions | npmOptions},
     * {@link RushConfiguration.pnpmOptions | pnpmOptions}, or {@link RushConfiguration.yarnOptions | yarnOptions}.
     */
    get packageManagerOptions(): PackageManagerOptionsConfigurationBase;
    /**
     * Settings from the common-versions.json config file.
     * @remarks
     * If the common-versions.json file is missing, this property will not be undefined.
     * Instead it will be initialized in an empty state, and calling CommonVersionsConfiguration.save()
     * will create the file.
     *
     * @deprecated Use `getCommonVersions` instead, which gets the correct common version data
     * for a given active variant.
     */
    get commonVersions(): CommonVersionsConfiguration;
    /**
     * Gets the currently-installed variant, if an installation has occurred.
     * For Rush operations which do not take a --variant parameter, this method
     * determines which variant, if any, was last specified when performing "rush install"
     * or "rush update".
     */
    get currentInstalledVariant(): string | undefined;
    /**
     * The rush hooks. It allows customized scripts to run at the specified point.
     * @beta
     */
    get eventHooks(): EventHooks;
    /**
     * The rush hooks. It allows customized scripts to run at the specified point.
     */
    get packageNameParser(): PackageNameParser;
    /**
     * Gets the path to the common-versions.json config file for a specific variant.
     * @param variant - The name of the current variant in use by the active command.
     */
    getCommonVersionsFilePath(variant?: string | undefined): string;
    /**
     * Gets the settings from the common-versions.json config file for a specific variant.
     * @param variant - The name of the current variant in use by the active command.
     */
    getCommonVersions(variant?: string | undefined): CommonVersionsConfiguration;
    /**
     * Returns a map of all direct dependencies that only have a single semantic version specifier.
     * @param variant - The name of the current variant in use by the active command.
     *
     * @returns A map of dependency name --\> version specifier for implicitly preferred versions.
     */
    getImplicitlyPreferredVersions(variant?: string | undefined): Map<string, string>;
    /**
     * Gets the path to the repo-state.json file for a specific variant.
     * @param variant - The name of the current variant in use by the active command.
     */
    getRepoStateFilePath(variant?: string | undefined): string;
    /**
     * Gets the contents from the repo-state.json file for a specific variant.
     * @param variant - The name of the current variant in use by the active command.
     */
    getRepoState(variant?: string | undefined): RepoStateFile;
    /**
     * Gets the committed shrinkwrap file name for a specific variant.
     * @param variant - The name of the current variant in use by the active command.
     */
    getCommittedShrinkwrapFilename(variant?: string | undefined): string;
    /**
     * Gets the absolute path for "pnpmfile.js" for a specific variant.
     * @param variant - The name of the current variant in use by the active command.
     * @remarks
     * The file path is returned even if PNPM is not configured as the package manager.
     */
    getPnpmfilePath(variant?: string | undefined): string;
    /**
     * Looks up a project in the projectsByName map.  If the project is not found,
     * then undefined is returned.
     */
    getProjectByName(projectName: string): RushConfigurationProject | undefined;
    /**
     * This is used e.g. by command-line interfaces such as "rush build --to example".
     * If "example" is not a project name, then it also looks for a scoped name
     * like `@something/example`.  If exactly one project matches this heuristic, it
     * is returned.  Otherwise, undefined is returned.
     */
    findProjectByShorthandName(shorthandProjectName: string): RushConfigurationProject | undefined;
    /**
     * Looks up a project by its RushConfigurationProject.tempProjectName field.
     * @returns The found project, or undefined if no match was found.
     */
    findProjectByTempName(tempProjectName: string): RushConfigurationProject | undefined;
    /**
     * Finds the project that owns the specified POSIX relative path (e.g. apps/rush-lib).
     * The path is case-sensitive, so will only return a project if its projectRelativePath matches the casing.
     * @returns The found project, or undefined if no match was found
     */
    findProjectForPosixRelativePath(posixRelativePath: string): RushConfigurationProject | undefined;
    /**
     * @beta
     */
    get versionPolicyConfiguration(): VersionPolicyConfiguration;
    /**
     * @beta
     */
    get versionPolicyConfigurationFilePath(): string;
    /**
     * This configuration object contains settings repo maintainers have specified to enable
     * and disable experimental Rush features.
     *
     * @beta
     */
    get experimentsConfiguration(): ExperimentsConfiguration;
    /**
     * Returns the project for which the specified path is underneath that project's folder.
     * If the path is not under any project's folder, returns undefined.
     */
    tryGetProjectForPath(currentFolderPath: string): RushConfigurationProject | undefined;
    private _collectVersionsForDependencies;
    private _populateDownstreamDependencies;
    private _getVariantConfigFolderPath;
}
//# sourceMappingURL=RushConfiguration.d.ts.map