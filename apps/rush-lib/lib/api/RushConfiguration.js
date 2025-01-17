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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RushConfiguration = exports.YarnOptionsConfiguration = exports.PnpmOptionsConfiguration = exports.NpmOptionsConfiguration = exports.PackageManagerOptionsConfigurationBase = void 0;
/* eslint max-lines: off */
const path = __importStar(require("path"));
const semver = __importStar(require("semver"));
const node_core_library_1 = require("@rushstack/node-core-library");
const true_case_path_1 = require("true-case-path");
const Rush_1 = require("../api/Rush");
const RushConfigurationProject_1 = require("./RushConfigurationProject");
const RushConstants_1 = require("../logic/RushConstants");
const ApprovedPackagesPolicy_1 = require("./ApprovedPackagesPolicy");
const EventHooks_1 = require("./EventHooks");
const VersionPolicyConfiguration_1 = require("./VersionPolicyConfiguration");
const EnvironmentConfiguration_1 = require("./EnvironmentConfiguration");
const CommonVersionsConfiguration_1 = require("./CommonVersionsConfiguration");
const Utilities_1 = require("../utilities/Utilities");
const NpmPackageManager_1 = require("./packageManager/NpmPackageManager");
const YarnPackageManager_1 = require("./packageManager/YarnPackageManager");
const PnpmPackageManager_1 = require("./packageManager/PnpmPackageManager");
const ExperimentsConfiguration_1 = require("./ExperimentsConfiguration");
const PackageNameParsers_1 = require("./PackageNameParsers");
const RepoStateFile_1 = require("../logic/RepoStateFile");
const LookupByPath_1 = require("../logic/LookupByPath");
const MINIMUM_SUPPORTED_RUSH_JSON_VERSION = '0.0.0';
const DEFAULT_BRANCH = 'master';
const DEFAULT_REMOTE = 'origin';
/**
 * A list of known config filenames that are expected to appear in the "./common/config/rush" folder.
 * To avoid confusion/mistakes, any extra files will be reported as an error.
 */
const knownRushConfigFilenames = [
    '.npmrc-publish',
    '.npmrc',
    'deploy.json',
    RushConstants_1.RushConstants.artifactoryFilename,
    RushConstants_1.RushConstants.browserApprovedPackagesFilename,
    RushConstants_1.RushConstants.buildCacheFilename,
    RushConstants_1.RushConstants.commandLineFilename,
    RushConstants_1.RushConstants.commonVersionsFilename,
    RushConstants_1.RushConstants.experimentsFilename,
    RushConstants_1.RushConstants.nonbrowserApprovedPackagesFilename,
    RushConstants_1.RushConstants.pinnedVersionsFilename,
    RushConstants_1.RushConstants.repoStateFilename,
    RushConstants_1.RushConstants.versionPoliciesFilename
];
/**
 * Options that all package managers share.
 *
 * @public
 */
class PackageManagerOptionsConfigurationBase {
    /** @internal */
    constructor(json) {
        this.environmentVariables = json.environmentVariables;
    }
}
exports.PackageManagerOptionsConfigurationBase = PackageManagerOptionsConfigurationBase;
/**
 * Options that are only used when the NPM package manager is selected.
 *
 * @remarks
 * It is valid to define these options in rush.json even if the NPM package manager
 * is not being used.
 *
 * @public
 */
class NpmOptionsConfiguration extends PackageManagerOptionsConfigurationBase {
    /** @internal */
    constructor(json) {
        super(json);
    }
}
exports.NpmOptionsConfiguration = NpmOptionsConfiguration;
/**
 * Options that are only used when the PNPM package manager is selected.
 *
 * @remarks
 * It is valid to define these options in rush.json even if the PNPM package manager
 * is not being used.
 *
 * @public
 */
class PnpmOptionsConfiguration extends PackageManagerOptionsConfigurationBase {
    /** @internal */
    constructor(json, commonTempFolder) {
        super(json);
        this.pnpmStore = json.pnpmStore || 'local';
        if (EnvironmentConfiguration_1.EnvironmentConfiguration.pnpmStorePathOverride) {
            this.pnpmStorePath = EnvironmentConfiguration_1.EnvironmentConfiguration.pnpmStorePathOverride;
        }
        else if (this.pnpmStore === 'global') {
            this.pnpmStorePath = '';
        }
        else {
            this.pnpmStorePath = path.resolve(path.join(commonTempFolder, 'pnpm-store'));
        }
        this.strictPeerDependencies = !!json.strictPeerDependencies;
        this.preventManualShrinkwrapChanges = !!json.preventManualShrinkwrapChanges;
        this.useWorkspaces = !!json.useWorkspaces;
    }
}
exports.PnpmOptionsConfiguration = PnpmOptionsConfiguration;
/**
 * Options that are only used when the yarn package manager is selected.
 *
 * @remarks
 * It is valid to define these options in rush.json even if the yarn package manager
 * is not being used.
 *
 * @public
 */
class YarnOptionsConfiguration extends PackageManagerOptionsConfigurationBase {
    /** @internal */
    constructor(json) {
        super(json);
        this.ignoreEngines = !!json.ignoreEngines;
    }
}
exports.YarnOptionsConfiguration = YarnOptionsConfiguration;
/**
 * This represents the Rush configuration for a repository, based on the "rush.json"
 * configuration file.
 * @public
 */
class RushConfiguration {
    /**
     * Use RushConfiguration.loadFromConfigurationFile() or Use RushConfiguration.loadFromDefaultLocation()
     * instead.
     */
    constructor(rushConfigurationJson, rushJsonFilename) {
        this._rushConfigurationJson = rushConfigurationJson;
        EnvironmentConfiguration_1.EnvironmentConfiguration.initialize();
        if (rushConfigurationJson.nodeSupportedVersionRange) {
            if (!semver.validRange(rushConfigurationJson.nodeSupportedVersionRange)) {
                throw new Error('Error parsing the node-semver expression in the "nodeSupportedVersionRange"' +
                    ` field from rush.json: "${rushConfigurationJson.nodeSupportedVersionRange}"`);
            }
            if (!semver.satisfies(process.version, rushConfigurationJson.nodeSupportedVersionRange)) {
                const message = `Your dev environment is running Node.js version ${process.version} which does` +
                    ` not meet the requirements for building this repository.  (The rush.json configuration` +
                    ` requires nodeSupportedVersionRange="${rushConfigurationJson.nodeSupportedVersionRange}")`;
                if (EnvironmentConfiguration_1.EnvironmentConfiguration.allowUnsupportedNodeVersion) {
                    console.warn(message);
                }
                else {
                    throw new Error(message);
                }
            }
        }
        this._rushJsonFile = rushJsonFilename;
        this._rushJsonFolder = path.dirname(rushJsonFilename);
        this._commonFolder = path.resolve(path.join(this._rushJsonFolder, RushConstants_1.RushConstants.commonFolderName));
        this._commonRushConfigFolder = path.join(this._commonFolder, 'config', 'rush');
        this._commonTempFolder =
            EnvironmentConfiguration_1.EnvironmentConfiguration.rushTempFolderOverride ||
                path.join(this._commonFolder, RushConstants_1.RushConstants.rushTempFolderName);
        this._commonScriptsFolder = path.join(this._commonFolder, 'scripts');
        this._npmCacheFolder = path.resolve(path.join(this._commonTempFolder, 'npm-cache'));
        this._npmTmpFolder = path.resolve(path.join(this._commonTempFolder, 'npm-tmp'));
        this._yarnCacheFolder = path.resolve(path.join(this._commonTempFolder, 'yarn-cache'));
        this._changesFolder = path.join(this._commonFolder, RushConstants_1.RushConstants.changeFilesFolderName);
        this._currentVariantJsonFilename = path.join(this._commonTempFolder, 'current-variant.json');
        this._suppressNodeLtsWarning = !!rushConfigurationJson.suppressNodeLtsWarning;
        this._ensureConsistentVersions = !!rushConfigurationJson.ensureConsistentVersions;
        const experimentsConfigFile = path.join(this._commonRushConfigFolder, RushConstants_1.RushConstants.experimentsFilename);
        this._experimentsConfiguration = new ExperimentsConfiguration_1.ExperimentsConfiguration(experimentsConfigFile);
        this._npmOptions = new NpmOptionsConfiguration(rushConfigurationJson.npmOptions || {});
        this._pnpmOptions = new PnpmOptionsConfiguration(rushConfigurationJson.pnpmOptions || {}, this._commonTempFolder);
        this._yarnOptions = new YarnOptionsConfiguration(rushConfigurationJson.yarnOptions || {});
        // TODO: Add an actual "packageManager" field in rush.json
        const packageManagerFields = [];
        if (rushConfigurationJson.npmVersion) {
            this._packageManager = 'npm';
            this._packageManagerConfigurationOptions = this._npmOptions;
            packageManagerFields.push('npmVersion');
        }
        if (rushConfigurationJson.pnpmVersion) {
            this._packageManager = 'pnpm';
            this._packageManagerConfigurationOptions = this._pnpmOptions;
            packageManagerFields.push('pnpmVersion');
        }
        if (rushConfigurationJson.yarnVersion) {
            this._packageManager = 'yarn';
            this._packageManagerConfigurationOptions = this._yarnOptions;
            packageManagerFields.push('yarnVersion');
        }
        if (packageManagerFields.length === 0) {
            throw new Error(`The rush.json configuration must specify one of: npmVersion, pnpmVersion, or yarnVersion`);
        }
        if (packageManagerFields.length > 1) {
            throw new Error(`The rush.json configuration cannot specify both ${packageManagerFields[0]}` +
                ` and ${packageManagerFields[1]} `);
        }
        if (this._packageManager === 'npm') {
            this._packageManagerToolVersion = rushConfigurationJson.npmVersion;
            this._packageManagerWrapper = new NpmPackageManager_1.NpmPackageManager(this._packageManagerToolVersion);
        }
        else if (this._packageManager === 'pnpm') {
            this._packageManagerToolVersion = rushConfigurationJson.pnpmVersion;
            this._packageManagerWrapper = new PnpmPackageManager_1.PnpmPackageManager(this._packageManagerToolVersion);
        }
        else {
            this._packageManagerToolVersion = rushConfigurationJson.yarnVersion;
            this._packageManagerWrapper = new YarnPackageManager_1.YarnPackageManager(this._packageManagerToolVersion);
        }
        this._shrinkwrapFilename = this._packageManagerWrapper.shrinkwrapFilename;
        this._tempShrinkwrapFilename = path.join(this._commonTempFolder, this._shrinkwrapFilename);
        this._packageManagerToolFilename = path.resolve(path.join(this._commonTempFolder, `${this.packageManager}-local`, 'node_modules', '.bin', `${this.packageManager}`));
        /// From "C:\repo\common\temp\pnpm-lock.yaml" --> "C:\repo\common\temp\pnpm-lock-preinstall.yaml"
        const parsedPath = path.parse(this._tempShrinkwrapFilename);
        this._tempShrinkwrapPreinstallFilename = path.join(parsedPath.dir, parsedPath.name + '-preinstall' + parsedPath.ext);
        RushConfiguration._validateCommonRushConfigFolder(this._commonRushConfigFolder, this._packageManagerWrapper, this._experimentsConfiguration);
        this._projectFolderMinDepth =
            rushConfigurationJson.projectFolderMinDepth !== undefined
                ? rushConfigurationJson.projectFolderMinDepth
                : 1;
        if (this._projectFolderMinDepth < 1) {
            throw new Error('Invalid projectFolderMinDepth; the minimum possible value is 1');
        }
        this._projectFolderMaxDepth =
            rushConfigurationJson.projectFolderMaxDepth !== undefined
                ? rushConfigurationJson.projectFolderMaxDepth
                : 2;
        if (this._projectFolderMaxDepth < this._projectFolderMinDepth) {
            throw new Error('The projectFolderMaxDepth cannot be smaller than the projectFolderMinDepth');
        }
        this._allowMostlyStandardPackageNames = !!rushConfigurationJson.allowMostlyStandardPackageNames;
        this._packageNameParser = this._allowMostlyStandardPackageNames
            ? PackageNameParsers_1.PackageNameParsers.mostlyStandard
            : PackageNameParsers_1.PackageNameParsers.rushDefault;
        this._approvedPackagesPolicy = new ApprovedPackagesPolicy_1.ApprovedPackagesPolicy(this, rushConfigurationJson);
        this._gitAllowedEmailRegExps = [];
        this._gitSampleEmail = '';
        if (rushConfigurationJson.gitPolicy) {
            if (rushConfigurationJson.gitPolicy.sampleEmail) {
                this._gitSampleEmail = rushConfigurationJson.gitPolicy.sampleEmail;
            }
            if (rushConfigurationJson.gitPolicy.allowedEmailRegExps) {
                this._gitAllowedEmailRegExps = rushConfigurationJson.gitPolicy.allowedEmailRegExps;
                if (this._gitSampleEmail.trim().length < 1) {
                    throw new Error('The rush.json file is missing the "sampleEmail" option, ' +
                        'which is required when using "allowedEmailRegExps"');
                }
            }
            if (rushConfigurationJson.gitPolicy.versionBumpCommitMessage) {
                this._gitVersionBumpCommitMessage = rushConfigurationJson.gitPolicy.versionBumpCommitMessage;
            }
            if (rushConfigurationJson.gitPolicy.changeLogUpdateCommitMessage) {
                this._gitChangeLogUpdateCommitMessage = rushConfigurationJson.gitPolicy.changeLogUpdateCommitMessage;
            }
        }
        this._hotfixChangeEnabled = false;
        if (rushConfigurationJson.hotfixChangeEnabled) {
            this._hotfixChangeEnabled = rushConfigurationJson.hotfixChangeEnabled;
        }
        if (!rushConfigurationJson.repository) {
            rushConfigurationJson.repository = {};
        }
        this._repositoryUrl = rushConfigurationJson.repository.url;
        this._repositoryDefaultBranch = rushConfigurationJson.repository.defaultBranch || DEFAULT_BRANCH;
        this._repositoryDefaultRemote = rushConfigurationJson.repository.defaultRemote || DEFAULT_REMOTE;
        this._telemetryEnabled = !!rushConfigurationJson.telemetryEnabled;
        this._eventHooks = new EventHooks_1.EventHooks(rushConfigurationJson.eventHooks || {});
        this._versionPolicyConfigurationFilePath = path.join(this._commonRushConfigFolder, RushConstants_1.RushConstants.versionPoliciesFilename);
        this._versionPolicyConfiguration = new VersionPolicyConfiguration_1.VersionPolicyConfiguration(this._versionPolicyConfigurationFilePath);
        this._variants = new Set();
        if (rushConfigurationJson.variants) {
            for (const variantOptions of rushConfigurationJson.variants) {
                const { variantName } = variantOptions;
                if (this._variants.has(variantName)) {
                    throw new Error(`Duplicate variant named '${variantName}' specified in configuration.`);
                }
                this._variants.add(variantName);
            }
        }
        const pathTree = new LookupByPath_1.LookupByPath();
        for (const project of this.projects) {
            const relativePath = node_core_library_1.Path.convertToSlashes(project.projectRelativeFolder);
            pathTree.setItem(relativePath, project);
        }
        this._projectByRelativePath = pathTree;
    }
    _initializeAndValidateLocalProjects() {
        this._projects = [];
        this._projectsByName = new Map();
        // We sort the projects array in alphabetical order.  This ensures that the packages
        // are processed in a deterministic order by the various Rush algorithms.
        const sortedProjectJsons = this._rushConfigurationJson.projects.slice(0);
        sortedProjectJsons.sort((a, b) => a.packageName.localeCompare(b.packageName));
        const tempNamesByProject = RushConfiguration._generateTempNamesForProjects(sortedProjectJsons);
        for (const projectJson of sortedProjectJsons) {
            const tempProjectName = tempNamesByProject.get(projectJson);
            if (tempProjectName) {
                const project = new RushConfigurationProject_1.RushConfigurationProject(projectJson, this, tempProjectName);
                this._projects.push(project);
                if (this._projectsByName.has(project.packageName)) {
                    throw new Error(`The project name "${project.packageName}" was specified more than once` +
                        ` in the rush.json configuration file.`);
                }
                this._projectsByName.set(project.packageName, project);
            }
        }
        for (const project of this._projects) {
            project.cyclicDependencyProjects.forEach((cyclicDependencyProject) => {
                if (!this.getProjectByName(cyclicDependencyProject)) {
                    throw new Error(`In rush.json, the "${cyclicDependencyProject}" project does not exist,` +
                        ` but was referenced by the cyclicDependencyProjects for ${project.packageName}`);
                }
            });
            // Compute the downstream dependencies within the list of Rush projects.
            this._populateDownstreamDependencies(project.packageJson.dependencies, project.packageName);
            this._populateDownstreamDependencies(project.packageJson.devDependencies, project.packageName);
            this._populateDownstreamDependencies(project.packageJson.optionalDependencies, project.packageName);
            this._versionPolicyConfiguration.validate(this.projectsByName);
        }
    }
    /**
     * Loads the configuration data from an Rush.json configuration file and returns
     * an RushConfiguration object.
     */
    static loadFromConfigurationFile(rushJsonFilename) {
        let resolvedRushJsonFilename = path.resolve(rushJsonFilename);
        // Load the rush.json before we fix the casing. If the case is wrong on a case-sensitive filesystem,
        // the next line show throw.
        const rushConfigurationJson = node_core_library_1.JsonFile.load(resolvedRushJsonFilename);
        try {
            resolvedRushJsonFilename = true_case_path_1.trueCasePathSync(resolvedRushJsonFilename);
        }
        catch (error) {
            /* ignore errors from true-case-path */
        }
        // Check the Rush version *before* we validate the schema, since if the version is outdated
        // then the schema may have changed. This should no longer be a problem after Rush 4.0 and the C2R wrapper,
        // but we'll validate anyway.
        const expectedRushVersion = rushConfigurationJson.rushVersion;
        const rushJsonBaseName = path.basename(resolvedRushJsonFilename);
        // If the version is missing or malformed, fall through and let the schema handle it.
        if (expectedRushVersion && semver.valid(expectedRushVersion)) {
            // Make sure the requested version isn't too old
            if (semver.lt(expectedRushVersion, MINIMUM_SUPPORTED_RUSH_JSON_VERSION)) {
                throw new Error(`${rushJsonBaseName} is version ${expectedRushVersion}, which is too old for this tool. ` +
                    `The minimum supported version is ${MINIMUM_SUPPORTED_RUSH_JSON_VERSION}.`);
            }
            // Make sure the requested version isn't too new.
            //
            // If the major/minor versions are the same, then we consider the file to be compatible.
            // This is somewhat lax, e.g. "5.0.2-dev.3" will be assumed to be loadable by rush-lib 5.0.0.
            //
            // IMPORTANT: Whenever a breaking change is introduced for one of the config files, we must
            // increment the minor version number for Rush.
            if (semver.major(Rush_1.Rush.version) !== semver.major(expectedRushVersion) ||
                semver.minor(Rush_1.Rush.version) !== semver.minor(expectedRushVersion)) {
                // If the major/minor are different, then make sure it's an older version.
                if (semver.lt(Rush_1.Rush.version, expectedRushVersion)) {
                    throw new Error(`Unable to load ${rushJsonBaseName} because its RushVersion is` +
                        ` ${rushConfigurationJson.rushVersion}, whereas @microsoft/rush-lib is version ${Rush_1.Rush.version}.` +
                        ` Consider upgrading the library.`);
                }
            }
        }
        RushConfiguration._jsonSchema.validateObject(rushConfigurationJson, resolvedRushJsonFilename);
        return new RushConfiguration(rushConfigurationJson, resolvedRushJsonFilename);
    }
    static loadFromDefaultLocation(options) {
        const rushJsonLocation = RushConfiguration.tryFindRushJsonLocation(options);
        if (rushJsonLocation) {
            return RushConfiguration.loadFromConfigurationFile(rushJsonLocation);
        }
        else {
            throw Utilities_1.Utilities.getRushConfigNotFoundError();
        }
    }
    /**
     * Find the rush.json location and return the path, or undefined if a rush.json can't be found.
     */
    static tryFindRushJsonLocation(options) {
        const optionsIn = options || {};
        const verbose = optionsIn.showVerbose || false;
        let currentFolder = optionsIn.startingFolder || process.cwd();
        // Look upwards at parent folders until we find a folder containing rush.json
        for (let i = 0; i < 10; ++i) {
            const rushJsonFilename = path.join(currentFolder, 'rush.json');
            if (node_core_library_1.FileSystem.exists(rushJsonFilename)) {
                if (i > 0 && verbose) {
                    console.log('Found configuration in ' + rushJsonFilename);
                }
                if (verbose) {
                    console.log('');
                }
                return rushJsonFilename;
            }
            const parentFolder = path.dirname(currentFolder);
            if (parentFolder === currentFolder) {
                break;
            }
            currentFolder = parentFolder;
        }
        return undefined;
    }
    /**
     * This generates the unique names that are used to create temporary projects
     * in the Rush common folder.
     * NOTE: sortedProjectJsons is sorted by the caller.
     */
    static _generateTempNamesForProjects(sortedProjectJsons) {
        const tempNamesByProject = new Map();
        const usedTempNames = new Set();
        // NOTE: projectJsons was already sorted in alphabetical order by the caller.
        for (const projectJson of sortedProjectJsons) {
            // If the name is "@ms/MyProject", extract the "MyProject" part
            const unscopedName = PackageNameParsers_1.PackageNameParsers.permissive.getUnscopedName(projectJson.packageName);
            // Generate a unique like name "@rush-temp/MyProject", or "@rush-temp/MyProject-2" if
            // there is a naming conflict
            let counter = 0;
            let tempProjectName = `${RushConstants_1.RushConstants.rushTempNpmScope}/${unscopedName}`;
            while (usedTempNames.has(tempProjectName)) {
                ++counter;
                tempProjectName = `${RushConstants_1.RushConstants.rushTempNpmScope}/${unscopedName}-${counter}`;
            }
            usedTempNames.add(tempProjectName);
            tempNamesByProject.set(projectJson, tempProjectName);
        }
        return tempNamesByProject;
    }
    /**
     * If someone adds a config file in the "common/rush/config" folder, it would be a bad
     * experience for Rush to silently ignore their file simply because they misspelled the
     * filename, or maybe it's an old format that's no longer supported.  The
     * _validateCommonRushConfigFolder() function makes sure that this folder only contains
     * recognized config files.
     */
    static _validateCommonRushConfigFolder(commonRushConfigFolder, packageManagerWrapper, experiments) {
        if (!node_core_library_1.FileSystem.exists(commonRushConfigFolder)) {
            console.log(`Creating folder: ${commonRushConfigFolder}`);
            node_core_library_1.FileSystem.ensureFolder(commonRushConfigFolder);
            return;
        }
        for (const filename of node_core_library_1.FileSystem.readFolder(commonRushConfigFolder)) {
            // Ignore things that aren't actual files
            const stat = node_core_library_1.FileSystem.getLinkStatistics(path.join(commonRushConfigFolder, filename));
            if (!stat.isFile() && !stat.isSymbolicLink()) {
                continue;
            }
            // Ignore harmless file extensions
            const fileExtension = path.extname(filename);
            if (['.bak', '.disabled', '.md', '.old', '.orig'].indexOf(fileExtension) >= 0) {
                continue;
            }
            // Ignore hidden files such as ".DS_Store"
            if (filename.startsWith('.')) {
                continue;
            }
            if (filename.startsWith('deploy-') && fileExtension === '.json') {
                // Ignore "rush deploy" files, which use the naming pattern "deploy-<scenario-name>.json".
                continue;
            }
            const knownSet = new Set(knownRushConfigFilenames.map((x) => x.toUpperCase()));
            // Add the shrinkwrap filename for the package manager to the known set.
            knownSet.add(packageManagerWrapper.shrinkwrapFilename.toUpperCase());
            // If the package manager is pnpm, then also add the pnpm file to the known set.
            if (packageManagerWrapper.packageManager === 'pnpm') {
                knownSet.add(packageManagerWrapper.pnpmfileFilename.toUpperCase());
            }
            // Is the filename something we know?  If not, report an error.
            if (!knownSet.has(filename.toUpperCase())) {
                throw new Error(`An unrecognized file "${filename}" was found in the Rush config folder:` +
                    ` ${commonRushConfigFolder}`);
            }
        }
        const pinnedVersionsFilename = path.join(commonRushConfigFolder, RushConstants_1.RushConstants.pinnedVersionsFilename);
        if (node_core_library_1.FileSystem.exists(pinnedVersionsFilename)) {
            throw new Error('The "pinned-versions.json" config file is no longer supported;' +
                ' please move your settings to the "preferredVersions" field of a "common-versions.json" config file.' +
                ` (See the ${RushConstants_1.RushConstants.rushWebSiteUrl} documentation for details.)\n\n` +
                pinnedVersionsFilename);
        }
    }
    /**
     * The name of the package manager being used to install dependencies
     */
    get packageManager() {
        return this._packageManager;
    }
    /**
     * {@inheritdoc PackageManager}
     *
     * @privateremarks
     * In the next major breaking API change, we will rename this property to "packageManager" and eliminate the
     * old property with that name.
     *
     * @beta
     */
    get packageManagerWrapper() {
        return this._packageManagerWrapper;
    }
    /**
     * Gets the JSON data structure for the "rush.json" configuration file.
     *
     * @internal
     */
    get rushConfigurationJson() {
        return this._rushConfigurationJson;
    }
    /**
     * The absolute path to the "rush.json" configuration file that was loaded to construct this object.
     */
    get rushJsonFile() {
        return this._rushJsonFile;
    }
    /**
     * The absolute path of the folder that contains rush.json for this project.
     */
    get rushJsonFolder() {
        return this._rushJsonFolder;
    }
    /**
     * The folder that contains all change files.
     */
    get changesFolder() {
        return this._changesFolder;
    }
    /**
     * The fully resolved path for the "common" folder where Rush will store settings that
     * affect all Rush projects.  This is always a subfolder of the folder containing "rush.json".
     * Example: `C:\MyRepo\common`
     */
    get commonFolder() {
        return this._commonFolder;
    }
    /**
     * The folder where Rush's additional config files are stored.  This folder is always a
     * subfolder called `config\rush` inside the common folder.  (The `common\config` folder
     * is reserved for configuration files used by other tools.)  To avoid confusion or mistakes,
     * Rush will report an error if this this folder contains any unrecognized files.
     *
     * Example: `C:\MyRepo\common\config\rush`
     */
    get commonRushConfigFolder() {
        return this._commonRushConfigFolder;
    }
    /**
     * The folder where temporary files will be stored.  This is always a subfolder called "temp"
     * under the common folder.
     * Example: `C:\MyRepo\common\temp`
     */
    get commonTempFolder() {
        return this._commonTempFolder;
    }
    /**
     * The folder where automation scripts are stored.  This is always a subfolder called "scripts"
     * under the common folder.
     * Example: `C:\MyRepo\common\scripts`
     */
    get commonScriptsFolder() {
        return this._commonScriptsFolder;
    }
    /**
     * The fully resolved path for the "autoinstallers" folder.
     * Example: `C:\MyRepo\common\autoinstallers`
     */
    get commonAutoinstallersFolder() {
        return path.join(this._commonFolder, 'autoinstallers');
    }
    /**
     * The local folder that will store the NPM package cache.  Rush does not rely on the
     * npm's default global cache folder, because npm's caching implementation does not
     * reliably handle multiple processes.  (For example, if a build box is running
     * "rush install" simultaneously for two different working folders, it may fail randomly.)
     *
     * Example: `C:\MyRepo\common\temp\npm-cache`
     */
    get npmCacheFolder() {
        return this._npmCacheFolder;
    }
    /**
     * The local folder where npm's temporary files will be written during installation.
     * Rush does not rely on the global default folder, because it may be on a different
     * hard disk.
     *
     * Example: `C:\MyRepo\common\temp\npm-tmp`
     */
    get npmTmpFolder() {
        return this._npmTmpFolder;
    }
    /**
     * The local folder that will store the Yarn package cache.
     *
     * Example: `C:\MyRepo\common\temp\yarn-cache`
     */
    get yarnCacheFolder() {
        return this._yarnCacheFolder;
    }
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
    get committedShrinkwrapFilename() {
        return this.getCommittedShrinkwrapFilename();
    }
    /**
     * The filename (without any path) of the shrinkwrap file that is used by the package manager.
     * @remarks
     * This property merely reports the filename; the file itself may not actually exist.
     * Example: `npm-shrinkwrap.json` or `pnpm-lock.yaml`
     */
    get shrinkwrapFilename() {
        return this._shrinkwrapFilename;
    }
    /**
     * The full path of the temporary shrinkwrap file that is used during "rush install".
     * This file may get rewritten by the package manager during installation.
     * @remarks
     * This property merely reports the filename; the file itself may not actually exist.
     * Example: `C:\MyRepo\common\temp\npm-shrinkwrap.json` or `C:\MyRepo\common\temp\pnpm-lock.yaml`
     */
    get tempShrinkwrapFilename() {
        return this._tempShrinkwrapFilename;
    }
    /**
     * The full path of a backup copy of tempShrinkwrapFilename. This backup copy is made
     * before installation begins, and can be compared to determine how the package manager
     * modified tempShrinkwrapFilename.
     * @remarks
     * This property merely reports the filename; the file itself may not actually exist.
     * Example: `C:\MyRepo\common\temp\npm-shrinkwrap-preinstall.json`
     * or `C:\MyRepo\common\temp\pnpm-lock-preinstall.yaml`
     */
    get tempShrinkwrapPreinstallFilename() {
        return this._tempShrinkwrapPreinstallFilename;
    }
    /**
     * Returns an English phrase such as "shrinkwrap file" that can be used in logging messages
     * to refer to the shrinkwrap file using appropriate terminology for the currently selected
     * package manager.
     */
    get shrinkwrapFilePhrase() {
        if (this._packageManager === 'yarn') {
            // Eventually we'd like to be consistent with Yarn's terminology of calling this a "lock file",
            // but a lot of Rush documentation uses "shrinkwrap" file and would all need to be updated.
            return 'shrinkwrap file (yarn.lock)';
        }
        else {
            return 'shrinkwrap file';
        }
    }
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
    get rushLinkJsonFilename() {
        throw new Error('The "rush-link.json" file was removed in Rush 5.30.0. Use ' +
            'RushConfigurationProject.localDependencyProjects instead.');
    }
    /**
     * The filename of the variant dependency data file.  By default this is
     * called 'current-variant.json' resides in the Rush common folder.
     * Its data structure is defined by ICurrentVariantJson.
     *
     * Example: `C:\MyRepo\common\temp\current-variant.json`
     */
    get currentVariantJsonFilename() {
        return this._currentVariantJsonFilename;
    }
    /**
     * The version of the locally installed NPM tool.  (Example: "1.2.3")
     */
    get packageManagerToolVersion() {
        return this._packageManagerToolVersion;
    }
    /**
     * The absolute path to the locally installed NPM tool.  If "rush install" has not
     * been run, then this file may not exist yet.
     * Example: `C:\MyRepo\common\temp\npm-local\node_modules\.bin\npm`
     */
    get packageManagerToolFilename() {
        return this._packageManagerToolFilename;
    }
    /**
     * The minimum allowable folder depth for the projectFolder field in the rush.json file.
     * This setting provides a way for repository maintainers to discourage nesting of project folders
     * that makes the directory tree more difficult to navigate.  The default value is 2,
     * which implements a standard 2-level hierarchy of <categoryFolder>/<projectFolder>/package.json.
     */
    get projectFolderMinDepth() {
        return this._projectFolderMinDepth;
    }
    /**
     * The maximum allowable folder depth for the projectFolder field in the rush.json file.
     * This setting provides a way for repository maintainers to discourage nesting of project folders
     * that makes the directory tree more difficult to navigate.  The default value is 2,
     * which implements on a standard convention of <categoryFolder>/<projectFolder>/package.json.
     */
    get projectFolderMaxDepth() {
        return this._projectFolderMaxDepth;
    }
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
    get allowMostlyStandardPackageNames() {
        return this._allowMostlyStandardPackageNames;
    }
    /**
     * The "approvedPackagesPolicy" settings.
     */
    get approvedPackagesPolicy() {
        return this._approvedPackagesPolicy;
    }
    /**
     * [Part of the "gitPolicy" feature.]
     * A list of regular expressions describing allowable email patterns for Git commits.
     * They are case-insensitive anchored JavaScript RegExps.
     * Example: `".*@example\.com"`
     * This array will never be undefined.
     */
    get gitAllowedEmailRegExps() {
        return this._gitAllowedEmailRegExps;
    }
    /**
     * [Part of the "gitPolicy" feature.]
     * An example valid email address that conforms to one of the allowedEmailRegExps.
     * Example: `"foxtrot@example\.com"`
     * This will never be undefined, and will always be nonempty if gitAllowedEmailRegExps is used.
     */
    get gitSampleEmail() {
        return this._gitSampleEmail;
    }
    /**
     * [Part of the "gitPolicy" feature.]
     * The commit message to use when committing changes during 'rush publish'
     */
    get gitVersionBumpCommitMessage() {
        return this._gitVersionBumpCommitMessage;
    }
    /**
     * [Part of the "gitPolicy" feature.]
     * The commit message to use when committing change log files 'rush version'
     */
    get gitChangeLogUpdateCommitMessage() {
        return this._gitChangeLogUpdateCommitMessage;
    }
    /**
     * [Part of the "hotfixChange" feature.]
     * Enables creating hotfix changes
     */
    get hotfixChangeEnabled() {
        return this._hotfixChangeEnabled;
    }
    /**
     * The remote url of the repository. This helps "rush change" find the right remote to compare against.
     */
    get repositoryUrl() {
        return this._repositoryUrl;
    }
    /**
     * The default branch name. This tells "rush change" which remote branch to compare against.
     */
    get repositoryDefaultBranch() {
        return this._repositoryDefaultBranch;
    }
    /**
     * The default remote. This tells "rush change" which remote to compare against if the remote URL is not set
     * or if a remote matching the provided remote URL is not found.
     */
    get repositoryDefaultRemote() {
        return this._repositoryDefaultRemote;
    }
    /**
     * The default fully-qualified git remote branch of the repository. This helps "rush change" find the right branch to compare against.
     */
    get repositoryDefaultFullyQualifiedRemoteBranch() {
        return `${this.repositoryDefaultRemote}/${this.repositoryDefaultBranch}`;
    }
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
    get suppressNodeLtsWarning() {
        return this._suppressNodeLtsWarning;
    }
    /**
     * If true, then consistent version specifiers for dependencies will be enforced.
     * I.e. "rush check" is run before some commands.
     */
    get ensureConsistentVersions() {
        return this._ensureConsistentVersions;
    }
    /**
     * Indicates whether telemetry collection is enabled for Rush runs.
     * @beta
     */
    get telemetryEnabled() {
        return this._telemetryEnabled;
    }
    get projects() {
        if (!this._projects) {
            this._initializeAndValidateLocalProjects();
        }
        return this._projects;
    }
    get projectsByName() {
        if (!this._projectsByName) {
            this._initializeAndValidateLocalProjects();
        }
        return this._projectsByName;
    }
    /**
     * {@inheritDoc NpmOptionsConfiguration}
     */
    get npmOptions() {
        return this._npmOptions;
    }
    /**
     * {@inheritDoc PnpmOptionsConfiguration}
     */
    get pnpmOptions() {
        return this._pnpmOptions;
    }
    /**
     * {@inheritDoc YarnOptionsConfiguration}
     */
    get yarnOptions() {
        return this._yarnOptions;
    }
    /**
     * The configuration options used by the current package manager.
     * @remarks
     * For package manager specific variants, reference {@link RushConfiguration.npmOptions | npmOptions},
     * {@link RushConfiguration.pnpmOptions | pnpmOptions}, or {@link RushConfiguration.yarnOptions | yarnOptions}.
     */
    get packageManagerOptions() {
        return this._packageManagerConfigurationOptions;
    }
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
    get commonVersions() {
        return this.getCommonVersions();
    }
    /**
     * Gets the currently-installed variant, if an installation has occurred.
     * For Rush operations which do not take a --variant parameter, this method
     * determines which variant, if any, was last specified when performing "rush install"
     * or "rush update".
     */
    get currentInstalledVariant() {
        let variant;
        if (node_core_library_1.FileSystem.exists(this._currentVariantJsonFilename)) {
            const currentVariantJson = node_core_library_1.JsonFile.load(this._currentVariantJsonFilename);
            variant = currentVariantJson.variant || undefined;
        }
        return variant;
    }
    /**
     * The rush hooks. It allows customized scripts to run at the specified point.
     * @beta
     */
    get eventHooks() {
        return this._eventHooks;
    }
    /**
     * The rush hooks. It allows customized scripts to run at the specified point.
     */
    get packageNameParser() {
        return this._packageNameParser;
    }
    /**
     * Gets the path to the common-versions.json config file for a specific variant.
     * @param variant - The name of the current variant in use by the active command.
     */
    getCommonVersionsFilePath(variant) {
        const commonVersionsFilename = path.join(this.commonRushConfigFolder, ...(variant ? [RushConstants_1.RushConstants.rushVariantsFolderName, variant] : []), RushConstants_1.RushConstants.commonVersionsFilename);
        return commonVersionsFilename;
    }
    /**
     * Gets the settings from the common-versions.json config file for a specific variant.
     * @param variant - The name of the current variant in use by the active command.
     */
    getCommonVersions(variant) {
        if (!this._commonVersionsConfigurations) {
            this._commonVersionsConfigurations = new Map();
        }
        // Use an empty string as the key when no variant provided. Anything else would possibly conflict
        // with a varient created by the user
        const variantKey = variant || '';
        let commonVersionsConfiguration = this._commonVersionsConfigurations.get(variantKey);
        if (!commonVersionsConfiguration) {
            const commonVersionsFilename = this.getCommonVersionsFilePath(variant);
            commonVersionsConfiguration = CommonVersionsConfiguration_1.CommonVersionsConfiguration.loadFromFile(commonVersionsFilename);
            this._commonVersionsConfigurations.set(variantKey, commonVersionsConfiguration);
        }
        return commonVersionsConfiguration;
    }
    /**
     * Returns a map of all direct dependencies that only have a single semantic version specifier.
     * @param variant - The name of the current variant in use by the active command.
     *
     * @returns A map of dependency name --\> version specifier for implicitly preferred versions.
     */
    getImplicitlyPreferredVersions(variant) {
        if (!this._implicitlyPreferredVersions) {
            this._implicitlyPreferredVersions = new Map();
        }
        // Use an empty string as the key when no variant provided. Anything else would possibly conflict
        // with a varient created by the user
        const variantKey = variant || '';
        let implicitlyPreferredVersions = this._implicitlyPreferredVersions.get(variantKey);
        if (!implicitlyPreferredVersions) {
            // First, collect all the direct dependencies of all local projects, and their versions:
            // direct dependency name --> set of version specifiers
            const versionsForDependencies = new Map();
            // Only generate implicitly preferred versions for variants that request it
            const commonVersionsConfiguration = this.getCommonVersions(variant);
            const useImplicitlyPreferredVersions = commonVersionsConfiguration.implicitlyPreferredVersions !== undefined
                ? commonVersionsConfiguration.implicitlyPreferredVersions
                : true;
            if (useImplicitlyPreferredVersions) {
                for (const project of this.projects) {
                    this._collectVersionsForDependencies(versionsForDependencies, [...project.packageJsonEditor.dependencyList, ...project.packageJsonEditor.devDependencyList], project.cyclicDependencyProjects, variant);
                }
                // If any dependency has more than one version, then filter it out (since we don't know which version
                // should be preferred).  What remains will be the list of preferred dependencies.
                // dependency --> version specifier
                const implicitlyPreferred = new Map();
                for (const [dep, versions] of versionsForDependencies) {
                    if (versions.size === 1) {
                        const version = Array.from(versions)[0];
                        implicitlyPreferred.set(dep, version);
                    }
                }
                implicitlyPreferredVersions = implicitlyPreferred;
            }
            else {
                implicitlyPreferredVersions = new Map();
            }
            this._implicitlyPreferredVersions.set(variantKey, implicitlyPreferredVersions);
        }
        return implicitlyPreferredVersions;
    }
    /**
     * Gets the path to the repo-state.json file for a specific variant.
     * @param variant - The name of the current variant in use by the active command.
     */
    getRepoStateFilePath(variant) {
        const repoStateFilename = path.join(this.commonRushConfigFolder, ...(variant ? [RushConstants_1.RushConstants.rushVariantsFolderName, variant] : []), RushConstants_1.RushConstants.repoStateFilename);
        return repoStateFilename;
    }
    /**
     * Gets the contents from the repo-state.json file for a specific variant.
     * @param variant - The name of the current variant in use by the active command.
     */
    getRepoState(variant) {
        const repoStateFilename = this.getRepoStateFilePath(variant);
        return RepoStateFile_1.RepoStateFile.loadFromFile(repoStateFilename, variant);
    }
    /**
     * Gets the committed shrinkwrap file name for a specific variant.
     * @param variant - The name of the current variant in use by the active command.
     */
    getCommittedShrinkwrapFilename(variant) {
        if (variant) {
            if (!this._variants.has(variant)) {
                throw new Error(`Invalid variant name '${variant}'. The provided variant parameter needs to be ` +
                    `one of the following from rush.json: ` +
                    `${Array.from(this._variants.values())
                        .map((name) => `"${name}"`)
                        .join(', ')}.`);
            }
        }
        const variantConfigFolderPath = this._getVariantConfigFolderPath(variant);
        return path.join(variantConfigFolderPath, this._shrinkwrapFilename);
    }
    /**
     * Gets the absolute path for "pnpmfile.js" for a specific variant.
     * @param variant - The name of the current variant in use by the active command.
     * @remarks
     * The file path is returned even if PNPM is not configured as the package manager.
     */
    getPnpmfilePath(variant) {
        const variantConfigFolderPath = this._getVariantConfigFolderPath(variant);
        return path.join(variantConfigFolderPath, this.packageManagerWrapper.pnpmfileFilename);
    }
    /**
     * Looks up a project in the projectsByName map.  If the project is not found,
     * then undefined is returned.
     */
    getProjectByName(projectName) {
        return this.projectsByName.get(projectName);
    }
    /**
     * This is used e.g. by command-line interfaces such as "rush build --to example".
     * If "example" is not a project name, then it also looks for a scoped name
     * like `@something/example`.  If exactly one project matches this heuristic, it
     * is returned.  Otherwise, undefined is returned.
     */
    findProjectByShorthandName(shorthandProjectName) {
        // Is there an exact match?
        let result = this.projectsByName.get(shorthandProjectName);
        if (result) {
            return result;
        }
        // Is there an approximate match?
        for (const project of this.projects) {
            if (this.packageNameParser.getUnscopedName(project.packageName) === shorthandProjectName) {
                if (result) {
                    // Ambiguous -- there is more than one match
                    return undefined;
                }
                else {
                    result = project;
                }
            }
        }
        return result;
    }
    /**
     * Looks up a project by its RushConfigurationProject.tempProjectName field.
     * @returns The found project, or undefined if no match was found.
     */
    findProjectByTempName(tempProjectName) {
        // Is there an approximate match?
        for (const project of this.projects) {
            if (project.tempProjectName === tempProjectName) {
                return project;
            }
        }
        return undefined;
    }
    /**
     * Finds the project that owns the specified POSIX relative path (e.g. apps/rush-lib).
     * The path is case-sensitive, so will only return a project if its projectRelativePath matches the casing.
     * @returns The found project, or undefined if no match was found
     */
    findProjectForPosixRelativePath(posixRelativePath) {
        return this._projectByRelativePath.findChildPath(posixRelativePath);
    }
    /**
     * @beta
     */
    get versionPolicyConfiguration() {
        return this._versionPolicyConfiguration;
    }
    /**
     * @beta
     */
    get versionPolicyConfigurationFilePath() {
        return this._versionPolicyConfigurationFilePath;
    }
    /**
     * This configuration object contains settings repo maintainers have specified to enable
     * and disable experimental Rush features.
     *
     * @beta
     */
    get experimentsConfiguration() {
        return this._experimentsConfiguration;
    }
    /**
     * Returns the project for which the specified path is underneath that project's folder.
     * If the path is not under any project's folder, returns undefined.
     */
    tryGetProjectForPath(currentFolderPath) {
        const resolvedPath = path.resolve(currentFolderPath);
        for (const project of this.projects) {
            if (node_core_library_1.Path.isUnderOrEqual(resolvedPath, project.projectFolder)) {
                return project;
            }
        }
        return undefined;
    }
    _collectVersionsForDependencies(versionsForDependencies, dependencies, cyclicDependencies, variant) {
        const commonVersions = this.getCommonVersions(variant);
        const allowedAlternativeVersions = commonVersions.allowedAlternativeVersions;
        for (const dependency of dependencies) {
            const alternativesForThisDependency = allowedAlternativeVersions.get(dependency.name) || [];
            // For each dependency, collectImplicitlyPreferredVersions() is collecting the set of all version specifiers
            // that appear across the repo.  If there is only one version specifier, then that's the "preferred" one.
            // However, there are a few cases where additional version specifiers can be safely ignored.
            let ignoreVersion = false;
            // 1. If the version specifier was listed in "allowedAlternativeVersions", then it's never a candidate.
            //    (Even if it's the only version specifier anywhere in the repo, we still ignore it, because
            //    otherwise the rule would be difficult to explain.)
            if (alternativesForThisDependency.indexOf(dependency.version) > 0) {
                ignoreVersion = true;
            }
            else {
                // Is it a local project?
                const localProject = this.getProjectByName(dependency.name);
                if (localProject) {
                    // 2. If it's a symlinked local project, then it's not a candidate, because the package manager will
                    //    never even see it.
                    // However there are two ways that a local project can NOT be symlinked:
                    // - if the local project doesn't satisfy the referenced semver specifier; OR
                    // - if the local project was specified in "cyclicDependencyProjects" in rush.json
                    if (!cyclicDependencies.has(dependency.name) &&
                        semver.satisfies(localProject.packageJsonEditor.version, dependency.version)) {
                        ignoreVersion = true;
                    }
                }
                if (!ignoreVersion) {
                    let versionForDependency = versionsForDependencies.get(dependency.name);
                    if (!versionForDependency) {
                        versionForDependency = new Set();
                        versionsForDependencies.set(dependency.name, versionForDependency);
                    }
                    versionForDependency.add(dependency.version);
                }
            }
        }
    }
    _populateDownstreamDependencies(dependencies, packageName) {
        if (!dependencies) {
            return;
        }
        Object.keys(dependencies).forEach((dependencyName) => {
            const depProject = this.projectsByName.get(dependencyName);
            if (depProject) {
                depProject._consumingProjectNames.add(packageName);
            }
        });
    }
    _getVariantConfigFolderPath(variant) {
        if (variant) {
            if (!this._variants.has(variant)) {
                throw new Error(`Invalid variant name '${variant}'. The provided variant parameter needs to be ` +
                    `one of the following from rush.json: ` +
                    `${Array.from(this._variants.values())
                        .map((name) => `"${name}"`)
                        .join(', ')}.`);
            }
        }
        return path.join(this._commonRushConfigFolder, ...(variant ? [RushConstants_1.RushConstants.rushVariantsFolderName, variant] : []));
    }
}
exports.RushConfiguration = RushConfiguration;
RushConfiguration._jsonSchema = node_core_library_1.JsonSchema.fromFile(path.join(__dirname, '../schemas/rush.schema.json'));
//# sourceMappingURL=RushConfiguration.js.map