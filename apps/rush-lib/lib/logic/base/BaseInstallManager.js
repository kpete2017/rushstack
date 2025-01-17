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
exports.BaseInstallManager = void 0;
const safe_1 = __importDefault(require("colors/safe"));
const os = __importStar(require("os"));
const path = __importStar(require("path"));
const semver = __importStar(require("semver"));
const node_core_library_1 = require("@rushstack/node-core-library");
const terminal_1 = require("@rushstack/terminal");
const ApprovedPackagesChecker_1 = require("../ApprovedPackagesChecker");
const EnvironmentConfiguration_1 = require("../../api/EnvironmentConfiguration");
const Git_1 = require("../Git");
const LastInstallFlag_1 = require("../../api/LastInstallFlag");
const LastLinkFlag_1 = require("../../api/LastLinkFlag");
const Rush_1 = require("../../api/Rush");
const RushConstants_1 = require("../RushConstants");
const ShrinkwrapFileFactory_1 = require("../ShrinkwrapFileFactory");
const Utilities_1 = require("../../utilities/Utilities");
const InstallHelpers_1 = require("../installManager/InstallHelpers");
const PolicyValidator_1 = require("../policy/PolicyValidator");
const WebClient_1 = require("../../utilities/WebClient");
const SetupPackageRegistry_1 = require("../setup/SetupPackageRegistry");
const PnpmfileConfiguration_1 = require("../pnpm/PnpmfileConfiguration");
/**
 * This class implements common logic between "rush install" and "rush update".
 */
class BaseInstallManager {
    constructor(rushConfiguration, rushGlobalFolder, purgeManager, options) {
        this._npmSetupValidated = false;
        this._syncNpmrcAlreadyCalled = false;
        this._rushConfiguration = rushConfiguration;
        this._rushGlobalFolder = rushGlobalFolder;
        this._installRecycler = purgeManager.commonTempFolderRecycler;
        this._options = options;
        this._commonTempInstallFlag = LastInstallFlag_1.LastInstallFlagFactory.getCommonTempFlag(rushConfiguration);
        this._commonTempLinkFlag = LastLinkFlag_1.LastLinkFlagFactory.getCommonTempFlag(rushConfiguration);
    }
    get rushConfiguration() {
        return this._rushConfiguration;
    }
    get rushGlobalFolder() {
        return this._rushGlobalFolder;
    }
    get installRecycler() {
        return this._installRecycler;
    }
    get options() {
        return this._options;
    }
    async doInstallAsync() {
        const isFilteredInstall = this.options.pnpmFilterArguments.length > 0;
        const useWorkspaces = this.rushConfiguration.pnpmOptions && this.rushConfiguration.pnpmOptions.useWorkspaces;
        // Prevent filtered installs when workspaces is disabled
        if (isFilteredInstall && !useWorkspaces) {
            console.log();
            console.log(safe_1.default.red('Project filtering arguments can only be used when running in a workspace environment. Run the ' +
                'command again without specifying these arguments.'));
            throw new node_core_library_1.AlreadyReportedError();
        }
        // Prevent update when using a filter, as modifications to the shrinkwrap shouldn't be saved
        if (this.options.allowShrinkwrapUpdates && isFilteredInstall) {
            console.log();
            console.log(safe_1.default.red('Project filtering arguments cannot be used when running "rush update". Run the command again ' +
                'without specifying these arguments.'));
            throw new node_core_library_1.AlreadyReportedError();
        }
        const { shrinkwrapIsUpToDate, variantIsUpToDate } = await this.prepareAsync();
        console.log(os.EOL + safe_1.default.bold(`Checking installation in "${this.rushConfiguration.commonTempFolder}"`));
        // This marker file indicates that the last "rush install" completed successfully.
        // Always perform a clean install if filter flags were provided. Additionally, if
        // "--purge" was specified, or if the last install was interrupted, then we will
        // need to perform a clean install.  Otherwise, we can do an incremental install.
        const cleanInstall = isFilteredInstall || !this._commonTempInstallFlag.checkValidAndReportStoreIssues();
        // Allow us to defer the file read until we need it
        const canSkipInstall = () => {
            // Based on timestamps, can we skip this install entirely?
            const outputStats = node_core_library_1.FileSystem.getStatistics(this._commonTempInstallFlag.path);
            return this.canSkipInstall(outputStats.mtime);
        };
        if (cleanInstall || !shrinkwrapIsUpToDate || !variantIsUpToDate || !canSkipInstall()) {
            console.log();
            await this.validateNpmSetup();
            let publishedRelease;
            try {
                publishedRelease = await this._checkIfReleaseIsPublished();
            }
            catch (_a) {
                // If the user is working in an environment that can't reach the registry,
                // don't bother them with errors.
            }
            if (publishedRelease === false) {
                console.log(safe_1.default.yellow('Warning: This release of the Rush tool was unpublished; it may be unstable.'));
            }
            // Delete the successful install file to indicate the install transaction has started
            this._commonTempInstallFlag.clear();
            // Since we're going to be tampering with common/node_modules, delete the "rush link" flag file if it exists;
            // this ensures that a full "rush link" is required next time
            this._commonTempLinkFlag.clear();
            // Perform the actual install
            await this.installAsync(cleanInstall);
            if (this.options.allowShrinkwrapUpdates && !shrinkwrapIsUpToDate) {
                // Copy (or delete) common\temp\pnpm-lock.yaml --> common\config\rush\pnpm-lock.yaml
                Utilities_1.Utilities.syncFile(this._rushConfiguration.tempShrinkwrapFilename, this._rushConfiguration.getCommittedShrinkwrapFilename(this.options.variant));
            }
            else {
                // TODO: Validate whether the package manager updated it in a nontrivial way
            }
            // Always update the state file if running "rush update"
            if (this.options.allowShrinkwrapUpdates) {
                if (this.rushConfiguration.getRepoState(this.options.variant).refreshState(this.rushConfiguration)) {
                    console.log(safe_1.default.yellow(`${RushConstants_1.RushConstants.repoStateFilename} has been modified and must be committed to source control.`));
                }
            }
            // Create the marker file to indicate a successful install if it's not a filtered install
            if (!isFilteredInstall) {
                this._commonTempInstallFlag.create();
            }
        }
        else {
            console.log('Installation is already up-to-date.');
        }
        // Perform any post-install work the install manager requires
        await this.postInstallAsync();
        console.log('');
    }
    canSkipInstall(lastModifiedDate) {
        // Based on timestamps, can we skip this install entirely?
        const potentiallyChangedFiles = [];
        // Consider the timestamp on the node_modules folder; if someone tampered with it
        // or deleted it entirely, then we can't skip this install
        potentiallyChangedFiles.push(path.join(this.rushConfiguration.commonTempFolder, RushConstants_1.RushConstants.nodeModulesFolderName));
        // Additionally, if they pulled an updated shrinkwrap file from Git,
        // then we can't skip this install
        potentiallyChangedFiles.push(this.rushConfiguration.getCommittedShrinkwrapFilename(this.options.variant));
        // Add common-versions.json file to the potentially changed files list.
        potentiallyChangedFiles.push(this.rushConfiguration.getCommonVersionsFilePath(this.options.variant));
        if (this.rushConfiguration.packageManager === 'pnpm') {
            // If the repo is using pnpmfile.js, consider that also
            const pnpmFileFilename = this.rushConfiguration.getPnpmfilePath(this.options.variant);
            if (node_core_library_1.FileSystem.exists(pnpmFileFilename)) {
                potentiallyChangedFiles.push(pnpmFileFilename);
            }
        }
        return Utilities_1.Utilities.isFileTimestampCurrent(lastModifiedDate, potentiallyChangedFiles);
    }
    async prepareAsync() {
        // Check the policies
        PolicyValidator_1.PolicyValidator.validatePolicy(this._rushConfiguration, this.options);
        // Git hooks are only installed if the repo opts in by including files in /common/git-hooks
        const hookSource = path.join(this._rushConfiguration.commonFolder, 'git-hooks');
        const git = new Git_1.Git(this.rushConfiguration);
        const hookDestination = git.getHooksFolder();
        if (node_core_library_1.FileSystem.exists(hookSource) && hookDestination) {
            const allHookFilenames = node_core_library_1.FileSystem.readFolder(hookSource);
            // Ignore the ".sample" file(s) in this folder.
            const hookFilenames = allHookFilenames.filter((x) => !/\.sample$/.test(x));
            if (hookFilenames.length > 0) {
                console.log(os.EOL + safe_1.default.bold('Found files in the "common/git-hooks" folder.'));
                // Clear the currently installed git hooks and install fresh copies
                node_core_library_1.FileSystem.ensureEmptyFolder(hookDestination);
                // Only copy files that look like Git hook names
                const filteredHookFilenames = hookFilenames.filter((x) => /^[a-z\-]+/.test(x));
                for (const filename of filteredHookFilenames) {
                    // Copy the file.  Important: For Bash scripts, the EOL must not be CRLF.
                    const hookFileContent = node_core_library_1.FileSystem.readFile(path.join(hookSource, filename));
                    node_core_library_1.FileSystem.writeFile(path.join(hookDestination, filename), hookFileContent, {
                        convertLineEndings: "\n" /* Lf */
                    });
                    node_core_library_1.FileSystem.changePosixModeBits(path.join(hookDestination, filename), 
                    // eslint-disable-next-line no-bitwise
                    256 /* UserRead */ | 64 /* UserExecute */);
                }
                console.log('Successfully installed these Git hook scripts: ' + filteredHookFilenames.join(', ') + os.EOL);
            }
        }
        const approvedPackagesChecker = new ApprovedPackagesChecker_1.ApprovedPackagesChecker(this._rushConfiguration);
        if (approvedPackagesChecker.approvedPackagesFilesAreOutOfDate) {
            if (this._options.allowShrinkwrapUpdates) {
                approvedPackagesChecker.rewriteConfigFiles();
                console.log(safe_1.default.yellow('Approved package files have been updated. These updates should be committed to source control'));
            }
            else {
                throw new Error(`Approved packages files are out-of date. Run "rush update" to update them.`);
            }
        }
        // Ensure that the package manager is installed
        await InstallHelpers_1.InstallHelpers.ensureLocalPackageManager(this._rushConfiguration, this._rushGlobalFolder, this._options.maxInstallAttempts);
        let shrinkwrapFile = undefined;
        // (If it's a full update, then we ignore the shrinkwrap from Git since it will be overwritten)
        if (!this.options.fullUpgrade) {
            try {
                shrinkwrapFile = ShrinkwrapFileFactory_1.ShrinkwrapFileFactory.getShrinkwrapFile(this._rushConfiguration.packageManager, this._rushConfiguration.packageManagerOptions, this._rushConfiguration.getCommittedShrinkwrapFilename(this.options.variant));
            }
            catch (ex) {
                console.log();
                console.log(`Unable to load the ${this._rushConfiguration.shrinkwrapFilePhrase}: ${ex.message}`);
                if (!this.options.allowShrinkwrapUpdates) {
                    console.log();
                    console.log(safe_1.default.red('You need to run "rush update" to fix this problem'));
                    throw new node_core_library_1.AlreadyReportedError();
                }
                shrinkwrapFile = undefined;
            }
        }
        // Write a file indicating which variant is being installed.
        // This will be used by bulk scripts to determine the correct Shrinkwrap file to track.
        const currentVariantJsonFilename = this._rushConfiguration.currentVariantJsonFilename;
        const currentVariantJson = {
            variant: this.options.variant || null
        };
        // Determine if the variant is already current by updating current-variant.json.
        // If nothing is written, the variant has not changed.
        const variantIsUpToDate = !node_core_library_1.JsonFile.save(currentVariantJson, currentVariantJsonFilename, {
            onlyIfChanged: true
        });
        if (this.options.variant) {
            console.log();
            console.log(safe_1.default.bold(`Using variant '${this.options.variant}' for installation.`));
        }
        else if (!variantIsUpToDate && !this.options.variant) {
            console.log();
            console.log(safe_1.default.bold('Using the default variant for installation.'));
        }
        // Also copy down the committed .npmrc file, if there is one
        // "common\config\rush\.npmrc" --> "common\temp\.npmrc"
        // Also ensure that we remove any old one that may be hanging around
        Utilities_1.Utilities.syncNpmrc(this._rushConfiguration.commonRushConfigFolder, this._rushConfiguration.commonTempFolder);
        this._syncNpmrcAlreadyCalled = true;
        // Shim support for pnpmfile in. This shim will call back into the variant-specific pnpmfile.
        // Additionally when in workspaces, the shim implements support for common versions.
        if (this.rushConfiguration.packageManager === 'pnpm') {
            await PnpmfileConfiguration_1.PnpmfileConfiguration.writeCommonTempPnpmfileShimAsync(this.rushConfiguration, this.options);
        }
        // Allow for package managers to do their own preparation and check that the shrinkwrap is up to date
        // eslint-disable-next-line prefer-const
        let { shrinkwrapIsUpToDate, shrinkwrapWarnings } = await this.prepareCommonTempAsync(shrinkwrapFile);
        shrinkwrapIsUpToDate = shrinkwrapIsUpToDate && !this.options.recheckShrinkwrap;
        this._syncTempShrinkwrap(shrinkwrapFile);
        // Write out the reported warnings
        if (shrinkwrapWarnings.length > 0) {
            console.log();
            console.log(safe_1.default.yellow(terminal_1.PrintUtilities.wrapWords(`The ${this.rushConfiguration.shrinkwrapFilePhrase} contains the following issues:`)));
            for (const shrinkwrapWarning of shrinkwrapWarnings) {
                console.log(safe_1.default.yellow('  ' + shrinkwrapWarning));
            }
            console.log();
        }
        // Force update if the shrinkwrap is out of date
        if (!shrinkwrapIsUpToDate) {
            if (!this.options.allowShrinkwrapUpdates) {
                console.log();
                console.log(safe_1.default.red(`The ${this.rushConfiguration.shrinkwrapFilePhrase} is out of date. You need to run "rush update".`));
                throw new node_core_library_1.AlreadyReportedError();
            }
        }
        return { shrinkwrapIsUpToDate, variantIsUpToDate };
    }
    /**
     * Used when invoking the NPM tool.  Appends the common configuration options
     * to the command-line.
     */
    pushConfigurationArgs(args, options) {
        if (this._rushConfiguration.packageManager === 'npm') {
            if (semver.lt(this._rushConfiguration.packageManagerToolVersion, '5.0.0')) {
                // NOTE:
                //
                // When using an npm version older than v5.0.0, we do NOT install optional dependencies for
                // Rush, because npm does not generate the shrinkwrap file consistently across platforms.
                //
                // Consider the "fsevents" package. This is a Mac specific package
                // which is an optional second-order dependency. Optional dependencies work by attempting to install
                // the package, but removes the package if the install failed.
                // This means that someone running generate on a Mac WILL have fsevents included in their shrinkwrap.
                // When someone using Windows attempts to install from the shrinkwrap, the install will fail.
                //
                // If someone generates the shrinkwrap using Windows, then fsevents will NOT be listed in the shrinkwrap.
                // When someone using Mac attempts to install from the shrinkwrap, they will NOT have the
                // optional dependency installed.
                //
                // This issue has been fixed as of npm v5.0.0: https://github.com/npm/npm/releases/tag/v5.0.0
                //
                // For more context, see https://github.com/microsoft/rushstack/issues/761#issuecomment-428689600
                args.push('--no-optional');
            }
            args.push('--cache', this._rushConfiguration.npmCacheFolder);
            args.push('--tmp', this._rushConfiguration.npmTmpFolder);
            if (options.collectLogFile) {
                args.push('--verbose');
            }
        }
        else if (this._rushConfiguration.packageManager === 'pnpm') {
            // Only explicitly define the store path if `pnpmStore` is using the default, or has been set to
            // 'local'.  If `pnpmStore` = 'global', then allow PNPM to use the system's default
            // path.  In all cases, this will be overridden by RUSH_PNPM_STORE_PATH
            if (this._rushConfiguration.pnpmOptions.pnpmStore === 'local' ||
                EnvironmentConfiguration_1.EnvironmentConfiguration.pnpmStorePathOverride) {
                args.push('--store', this._rushConfiguration.pnpmOptions.pnpmStorePath);
            }
            const { configuration: experiments } = this._rushConfiguration.experimentsConfiguration;
            if (experiments.usePnpmFrozenLockfileForRushInstall && !this._options.allowShrinkwrapUpdates) {
                args.push('--frozen-lockfile');
            }
            else if (experiments.usePnpmPreferFrozenLockfileForRushUpdate) {
                // In workspaces, we want to avoid unnecessary lockfile churn
                args.push('--prefer-frozen-lockfile');
            }
            else {
                // Ensure that Rush's tarball dependencies get synchronized properly with the pnpm-lock.yaml file.
                // See this GitHub issue: https://github.com/pnpm/pnpm/issues/1342
                args.push('--no-prefer-frozen-lockfile');
            }
            if (options.collectLogFile) {
                args.push('--reporter', 'ndjson');
            }
            if (options.networkConcurrency) {
                args.push('--network-concurrency', options.networkConcurrency.toString());
            }
            if (this._rushConfiguration.pnpmOptions.strictPeerDependencies) {
                args.push('--strict-peer-dependencies');
            }
        }
        else if (this._rushConfiguration.packageManager === 'yarn') {
            args.push('--link-folder', 'yarn-link');
            args.push('--cache-folder', this._rushConfiguration.yarnCacheFolder);
            // Without this option, Yarn will sometimes stop and ask for user input on STDIN
            // (e.g. "Which command would you like to run?").
            args.push('--non-interactive');
            if (options.networkConcurrency) {
                args.push('--network-concurrency', options.networkConcurrency.toString());
            }
            if (this._rushConfiguration.yarnOptions.ignoreEngines) {
                args.push('--ignore-engines');
            }
        }
    }
    async _checkIfReleaseIsPublished() {
        const lastCheckFile = path.join(this._rushGlobalFolder.nodeSpecificPath, 'rush-' + Rush_1.Rush.version, 'last-check.flag');
        if (node_core_library_1.FileSystem.exists(lastCheckFile)) {
            let cachedResult = undefined;
            try {
                // NOTE: mtimeMs is not supported yet in Node.js 6.x
                const nowMs = new Date().getTime();
                const ageMs = nowMs - node_core_library_1.FileSystem.getStatistics(lastCheckFile).mtime.getTime();
                const HOUR = 60 * 60 * 1000;
                // Is the cache too old?
                if (ageMs < 24 * HOUR) {
                    // No, read the cached result
                    cachedResult = node_core_library_1.JsonFile.load(lastCheckFile);
                }
            }
            catch (e) {
                // Unable to parse file
            }
            if (cachedResult === 'error') {
                throw new Error('Unable to contact server');
            }
            if (cachedResult === true || cachedResult === false) {
                return cachedResult;
            }
        }
        // Before we start the network operation, record a failed state.  If the process exits for some reason,
        // this will record the error.  It will also update the timestamp to prevent other Rush instances
        // from attempting to update the file.
        await node_core_library_1.JsonFile.saveAsync('error', lastCheckFile, { ensureFolderExists: true });
        try {
            // For this check we use the official registry, not the private registry
            const publishedRelease = await this._queryIfReleaseIsPublishedAsync('https://registry.npmjs.org:443');
            // Cache the result
            await node_core_library_1.JsonFile.saveAsync(publishedRelease, lastCheckFile, { ensureFolderExists: true });
            return publishedRelease;
        }
        catch (error) {
            await node_core_library_1.JsonFile.saveAsync('error', lastCheckFile, { ensureFolderExists: true });
            throw error;
        }
    }
    // Helper for checkIfReleaseIsPublished()
    async _queryIfReleaseIsPublishedAsync(registryUrl) {
        let queryUrl = registryUrl;
        if (queryUrl[-1] !== '/') {
            queryUrl += '/';
        }
        // Note that the "@" symbol does not normally get URL-encoded
        queryUrl += RushConstants_1.RushConstants.rushPackageName.replace('/', '%2F');
        const webClient = new WebClient_1.WebClient();
        webClient.userAgent = `pnpm/? npm/? node/${process.version} ${os.platform()} ${os.arch()}`;
        webClient.accept = 'application/vnd.npm.install-v1+json; q=1.0, application/json; q=0.8, */*';
        const response = await webClient.fetchAsync(queryUrl);
        if (!response.ok) {
            throw new Error('Failed to query');
        }
        const data = await response.json();
        let url;
        try {
            if (!data.versions[Rush_1.Rush.version]) {
                // Version was not published
                return false;
            }
            url = data.versions[Rush_1.Rush.version].dist.tarball;
            if (!url) {
                throw new Error(`URL not found`);
            }
        }
        catch (e) {
            throw new Error('Error parsing response');
        }
        // Make sure the tarball wasn't deleted from the CDN
        webClient.accept = '*/*';
        const response2 = await webClient.fetchAsync(url);
        if (!response2.ok) {
            if (response2.status === 404) {
                return false;
            }
            else {
                throw new Error('Failed to fetch');
            }
        }
        return true;
    }
    _syncTempShrinkwrap(shrinkwrapFile) {
        if (shrinkwrapFile) {
            Utilities_1.Utilities.syncFile(this._rushConfiguration.getCommittedShrinkwrapFilename(this.options.variant), this.rushConfiguration.tempShrinkwrapFilename);
            Utilities_1.Utilities.syncFile(this._rushConfiguration.getCommittedShrinkwrapFilename(this.options.variant), this.rushConfiguration.tempShrinkwrapPreinstallFilename);
        }
        else {
            // Otherwise delete the temporary file
            node_core_library_1.FileSystem.deleteFile(this.rushConfiguration.tempShrinkwrapFilename);
            if (this.rushConfiguration.packageManager === 'pnpm') {
                // Workaround for https://github.com/pnpm/pnpm/issues/1890
                //
                // When "rush update --full" is run, rush deletes common/temp/pnpm-lock.yaml so that
                // a new lockfile can be generated. But because of the above bug "pnpm install" would
                // respect "common/temp/node_modules/.pnpm-lock.yaml" and thus would not generate a
                // new lockfile. Deleting this file in addition to deleting common/temp/pnpm-lock.yaml
                // ensures that a new lockfile will be generated with "rush update --full".
                const pnpmPackageManager = this.rushConfiguration
                    .packageManagerWrapper;
                node_core_library_1.FileSystem.deleteFile(path.join(this.rushConfiguration.commonTempFolder, pnpmPackageManager.internalShrinkwrapRelativePath));
            }
        }
    }
    async validateNpmSetup() {
        if (this._npmSetupValidated) {
            return;
        }
        if (!this.options.bypassPolicy) {
            const setupPackageRegistry = new SetupPackageRegistry_1.SetupPackageRegistry({
                rushConfiguration: this.rushConfiguration,
                isDebug: this.options.debug,
                syncNpmrcAlreadyCalled: this._syncNpmrcAlreadyCalled
            });
            const valid = await setupPackageRegistry.checkOnly();
            if (!valid) {
                console.error();
                console.error(safe_1.default.red('ERROR: NPM credentials are missing or expired'));
                console.error();
                console.error(safe_1.default.bold('==> Please run "rush setup" to update your NPM token.  (Or append "--bypass-policy" to proceed anyway.)'));
                throw new node_core_library_1.AlreadyReportedError();
            }
        }
        this._npmSetupValidated = true;
    }
}
exports.BaseInstallManager = BaseInstallManager;
//# sourceMappingURL=BaseInstallManager.js.map