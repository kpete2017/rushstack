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
exports.RushInstallManager = void 0;
const glob = __importStar(require("glob"));
const safe_1 = __importDefault(require("colors/safe"));
const fs = __importStar(require("fs"));
const os = __importStar(require("os"));
const path = __importStar(require("path"));
const semver = __importStar(require("semver"));
const ssri = __importStar(require("ssri"));
const node_core_library_1 = require("@rushstack/node-core-library");
const terminal_1 = require("@rushstack/terminal");
const BaseInstallManager_1 = require("../base/BaseInstallManager");
const RushConstants_1 = require("../../logic/RushConstants");
const Stopwatch_1 = require("../../utilities/Stopwatch");
const Utilities_1 = require("../../utilities/Utilities");
const DependencySpecifier_1 = require("../DependencySpecifier");
const InstallHelpers_1 = require("./InstallHelpers");
const TempProjectHelper_1 = require("../TempProjectHelper");
const LinkManagerFactory_1 = require("../LinkManagerFactory");
const globEscape = require('glob-escape'); // No @types/glob-escape package exists
/**
 * This class implements common logic between "rush install" and "rush update".
 */
class RushInstallManager extends BaseInstallManager_1.BaseInstallManager {
    constructor(rushConfiguration, rushGlobalFolder, purgeManager, options) {
        super(rushConfiguration, rushGlobalFolder, purgeManager, options);
        this._tempProjectHelper = new TempProjectHelper_1.TempProjectHelper(this.rushConfiguration);
    }
    /**
     * Regenerates the common/package.json and all temp_modules projects.
     * If shrinkwrapFile is provided, this function also validates whether it contains
     * everything we need to install and returns true if so; in all other cases,
     * the return value is false.
     *
     * @override
     */
    async prepareCommonTempAsync(shrinkwrapFile) {
        const stopwatch = Stopwatch_1.Stopwatch.start();
        // Example: "C:\MyRepo\common\temp\projects"
        const tempProjectsFolder = path.join(this.rushConfiguration.commonTempFolder, RushConstants_1.RushConstants.rushTempProjectsFolderName);
        console.log(os.EOL + safe_1.default.bold('Updating temp projects in ' + tempProjectsFolder));
        Utilities_1.Utilities.createFolderWithRetry(tempProjectsFolder);
        const shrinkwrapWarnings = [];
        // We will start with the assumption that it's valid, and then set it to false if
        // any of the checks fail
        let shrinkwrapIsUpToDate = true;
        if (!shrinkwrapFile) {
            shrinkwrapIsUpToDate = false;
        }
        else if (shrinkwrapFile.isWorkspaceCompatible && !this.options.fullUpgrade) {
            console.log();
            console.log(safe_1.default.red('The shrinkwrap file had previously been updated to support workspaces. Run "rush update --full" ' +
                'to update the shrinkwrap file.'));
            throw new node_core_library_1.AlreadyReportedError();
        }
        // dependency name --> version specifier
        const allExplicitPreferredVersions = this.rushConfiguration
            .getCommonVersions(this.options.variant)
            .getAllPreferredVersions();
        if (shrinkwrapFile) {
            // Check any (explicitly) preferred dependencies first
            allExplicitPreferredVersions.forEach((version, dependency) => {
                const dependencySpecifier = new DependencySpecifier_1.DependencySpecifier(dependency, version);
                if (!shrinkwrapFile.hasCompatibleTopLevelDependency(dependencySpecifier)) {
                    shrinkwrapWarnings.push(`Missing dependency "${dependency}" (${version}) required by the preferred versions from ` +
                        RushConstants_1.RushConstants.commonVersionsFilename);
                    shrinkwrapIsUpToDate = false;
                }
            });
            if (this._findMissingTempProjects(shrinkwrapFile)) {
                // If any Rush project's tarball is missing from the shrinkwrap file, then we need to update
                // the shrinkwrap file.
                shrinkwrapIsUpToDate = false;
            }
            // If there are orphaned projects, we need to update
            const orphanedProjects = shrinkwrapFile.findOrphanedProjects(this.rushConfiguration);
            if (orphanedProjects.length > 0) {
                for (const orhpanedProject of orphanedProjects) {
                    shrinkwrapWarnings.push(`Your ${this.rushConfiguration.shrinkwrapFilePhrase} references "${orhpanedProject}" ` +
                        'which was not found in rush.json');
                }
                shrinkwrapIsUpToDate = false;
            }
        }
        // dependency name --> version specifier
        const commonDependencies = new Map([
            ...allExplicitPreferredVersions,
            ...this.rushConfiguration.getImplicitlyPreferredVersions(this.options.variant)
        ]);
        // To make the common/package.json file more readable, sort alphabetically
        // according to rushProject.tempProjectName instead of packageName.
        const sortedRushProjects = this.rushConfiguration.projects.slice(0);
        node_core_library_1.Sort.sortBy(sortedRushProjects, (x) => x.tempProjectName);
        for (const rushProject of sortedRushProjects) {
            const packageJson = rushProject.packageJsonEditor;
            // Example: "C:\MyRepo\common\temp\projects\my-project-2.tgz"
            const tarballFile = this._tempProjectHelper.getTarballFilePath(rushProject);
            // Example: dependencies["@rush-temp/my-project-2"] = "file:./projects/my-project-2.tgz"
            commonDependencies.set(rushProject.tempProjectName, `file:./${RushConstants_1.RushConstants.rushTempProjectsFolderName}/${rushProject.unscopedTempProjectName}.tgz`);
            const tempPackageJson = {
                name: rushProject.tempProjectName,
                version: '0.0.0',
                private: true,
                dependencies: {}
            };
            // Collect pairs of (packageName, packageVersion) to be added as dependencies of the @rush-temp package.json
            const tempDependencies = new Map();
            // These can be regular, optional, or peer dependencies (but NOT dev dependencies).
            // (A given packageName will never appear more than once in this list.)
            for (const dependency of packageJson.dependencyList) {
                if (this.options.fullUpgrade && this._revertWorkspaceNotation(dependency)) {
                    shrinkwrapIsUpToDate = false;
                }
                // If there are any optional dependencies, copy directly into the optionalDependencies field.
                if (dependency.dependencyType === "optionalDependencies" /* Optional */) {
                    if (!tempPackageJson.optionalDependencies) {
                        tempPackageJson.optionalDependencies = {};
                    }
                    tempPackageJson.optionalDependencies[dependency.name] = dependency.version;
                }
                else {
                    tempDependencies.set(dependency.name, dependency.version);
                }
            }
            for (const dependency of packageJson.devDependencyList) {
                if (this.options.fullUpgrade && this._revertWorkspaceNotation(dependency)) {
                    shrinkwrapIsUpToDate = false;
                }
                // If there are devDependencies, we need to merge them with the regular dependencies.  If the same
                // library appears in both places, then the dev dependency wins (because presumably it's saying what you
                // want right now for development, not the range that you support for consumers).
                tempDependencies.set(dependency.name, dependency.version);
            }
            node_core_library_1.Sort.sortMapKeys(tempDependencies);
            for (const [packageName, packageVersion] of tempDependencies.entries()) {
                const dependencySpecifier = new DependencySpecifier_1.DependencySpecifier(packageName, packageVersion);
                // Is there a locally built Rush project that could satisfy this dependency?
                // If so, then we will symlink to the project folder rather than to common/temp/node_modules.
                // In this case, we don't want "npm install" to process this package, but we do need
                // to record this decision for linking later, so we add it to a special 'rushDependencies' field.
                const localProject = this.rushConfiguration.getProjectByName(packageName);
                if (localProject) {
                    // Don't locally link if it's listed in the cyclicDependencyProjects
                    if (!rushProject.cyclicDependencyProjects.has(packageName)) {
                        // Also, don't locally link if the SemVer doesn't match
                        const localProjectVersion = localProject.packageJsonEditor.version;
                        if (semver.satisfies(localProjectVersion, packageVersion)) {
                            // We will locally link this package, so instead add it to our special "rushDependencies"
                            // field in the package.json file.
                            if (!tempPackageJson.rushDependencies) {
                                tempPackageJson.rushDependencies = {};
                            }
                            tempPackageJson.rushDependencies[packageName] = packageVersion;
                            continue;
                        }
                    }
                }
                // We will NOT locally link this package; add it as a regular dependency.
                tempPackageJson.dependencies[packageName] = packageVersion;
                if (shrinkwrapFile &&
                    !shrinkwrapFile.tryEnsureCompatibleDependency(dependencySpecifier, rushProject.tempProjectName)) {
                    shrinkwrapWarnings.push(`Missing dependency "${packageName}" (${packageVersion}) required by "${rushProject.packageName}"`);
                    shrinkwrapIsUpToDate = false;
                }
            }
            if (this.rushConfiguration.packageManager === 'yarn') {
                // This feature is only implemented by the Yarn package manager
                if (packageJson.resolutionsList.length > 0) {
                    tempPackageJson.resolutions = packageJson.saveToObject().resolutions;
                }
            }
            // Example: "C:\MyRepo\common\temp\projects\my-project-2"
            const tempProjectFolder = this._tempProjectHelper.getTempProjectFolder(rushProject);
            // Example: "C:\MyRepo\common\temp\projects\my-project-2\package.json"
            const tempPackageJsonFilename = path.join(tempProjectFolder, "package.json" /* PackageJson */);
            // we only want to overwrite the package if the existing tarball's package.json is different from tempPackageJson
            let shouldOverwrite = true;
            try {
                // if the tarball and the temp file still exist, then compare the contents
                if (node_core_library_1.FileSystem.exists(tarballFile) && node_core_library_1.FileSystem.exists(tempPackageJsonFilename)) {
                    // compare the extracted package.json with the one we are about to write
                    const oldBuffer = node_core_library_1.FileSystem.readFileToBuffer(tempPackageJsonFilename);
                    const newBuffer = Buffer.from(node_core_library_1.JsonFile.stringify(tempPackageJson));
                    if (Buffer.compare(oldBuffer, newBuffer) === 0) {
                        shouldOverwrite = false;
                    }
                }
            }
            catch (error) {
                // ignore the error, we will go ahead and create a new tarball
            }
            if (shouldOverwrite) {
                try {
                    // ensure the folder we are about to zip exists
                    Utilities_1.Utilities.createFolderWithRetry(tempProjectFolder);
                    // remove the old tarball & old temp package json, this is for any cases where new tarball creation
                    // fails, and the shouldOverwrite logic is messed up because the my-project-2\package.json
                    // exists and is updated, but the tarball is not accurate
                    node_core_library_1.FileSystem.deleteFile(tarballFile);
                    node_core_library_1.FileSystem.deleteFile(tempPackageJsonFilename);
                    // write the expected package.json file into the zip staging folder
                    node_core_library_1.JsonFile.save(tempPackageJson, tempPackageJsonFilename);
                    // Delete the existing tarball and create a new one
                    this._tempProjectHelper.createTempProjectTarball(rushProject);
                    console.log(`Updating ${tarballFile}`);
                }
                catch (error) {
                    console.log(safe_1.default.yellow(error));
                    // delete everything in case of any error
                    node_core_library_1.FileSystem.deleteFile(tarballFile);
                    node_core_library_1.FileSystem.deleteFile(tempPackageJsonFilename);
                }
            }
            // When using frozen shrinkwrap, we need to validate that the tarball integrities are up-to-date
            // with the shrinkwrap file, since these will cause install to fail.
            if (shrinkwrapFile &&
                this.rushConfiguration.packageManager === 'pnpm' &&
                this.rushConfiguration.experimentsConfiguration.configuration.usePnpmFrozenLockfileForRushInstall) {
                const pnpmShrinkwrapFile = shrinkwrapFile;
                const tarballIntegrityValid = await this._validateRushProjectTarballIntegrityAsync(pnpmShrinkwrapFile, rushProject);
                if (!tarballIntegrityValid) {
                    shrinkwrapIsUpToDate = false;
                    shrinkwrapWarnings.push(`Invalid or missing tarball integrity hash in shrinkwrap for "${rushProject.packageName}"`);
                }
            }
            // Save the package.json if we modified the version references and warn that the package.json was modified
            if (packageJson.saveIfModified()) {
                console.log(safe_1.default.yellow(`"${rushProject.packageName}" depends on one or more local packages which used "workspace:" ` +
                    'notation. The package.json has been modified and must be committed to source control.'));
            }
        }
        // Remove the workspace file if it exists
        if (this.rushConfiguration.packageManager === 'pnpm') {
            const workspaceFilePath = path.join(this.rushConfiguration.commonTempFolder, 'pnpm-workspace.yaml');
            try {
                await node_core_library_1.FileSystem.deleteFileAsync(workspaceFilePath);
            }
            catch (e) {
                if (!node_core_library_1.FileSystem.isNotExistError(e)) {
                    throw e;
                }
            }
        }
        // Write the common package.json
        InstallHelpers_1.InstallHelpers.generateCommonPackageJson(this.rushConfiguration, commonDependencies);
        stopwatch.stop();
        console.log(`Finished creating temporary modules (${stopwatch.toString()})`);
        return { shrinkwrapIsUpToDate, shrinkwrapWarnings };
    }
    _revertWorkspaceNotation(dependency) {
        const specifier = new DependencySpecifier_1.DependencySpecifier(dependency.name, dependency.version);
        if (specifier.specifierType !== DependencySpecifier_1.DependencySpecifierType.Workspace) {
            return false;
        }
        // Replace workspace notation with the supplied version range
        if (specifier.versionSpecifier === '*') {
            // When converting to workspaces, exact package versions are replaced with a '*', so undo this
            const localProject = this.rushConfiguration.getProjectByName(specifier.packageName);
            if (!localProject) {
                throw new node_core_library_1.InternalError(`Could not find local project with package name ${specifier.packageName}`);
            }
            dependency.setVersion(localProject.packageJson.version);
        }
        else {
            dependency.setVersion(specifier.versionSpecifier);
        }
        return true;
    }
    async _validateRushProjectTarballIntegrityAsync(shrinkwrapFile, rushProject) {
        if (shrinkwrapFile) {
            const tempProjectDependencyKey = shrinkwrapFile.getTempProjectDependencyKey(rushProject.tempProjectName);
            if (!tempProjectDependencyKey) {
                return false;
            }
            const parentShrinkwrapEntry = shrinkwrapFile.getShrinkwrapEntryFromTempProjectDependencyKey(tempProjectDependencyKey);
            const newIntegrity = (await ssri.fromStream(fs.createReadStream(this._tempProjectHelper.getTarballFilePath(rushProject)))).toString();
            if (!parentShrinkwrapEntry.resolution || parentShrinkwrapEntry.resolution.integrity !== newIntegrity) {
                return false;
            }
        }
        return true;
    }
    /**
     * Check whether or not the install is already valid, and therefore can be skipped.
     *
     * @override
     */
    canSkipInstall(lastModifiedDate) {
        if (!super.canSkipInstall(lastModifiedDate)) {
            return false;
        }
        const potentiallyChangedFiles = [];
        // Also consider timestamps for all the temp tarballs. (createTempModulesAndCheckShrinkwrap() will
        // carefully preserve these timestamps unless something has changed.)
        // Example: "C:\MyRepo\common\temp\projects\my-project-2.tgz"
        potentiallyChangedFiles.push(...this.rushConfiguration.projects.map((x) => {
            return this._tempProjectHelper.getTarballFilePath(x);
        }));
        return Utilities_1.Utilities.isFileTimestampCurrent(lastModifiedDate, potentiallyChangedFiles);
    }
    /**
     * Runs "npm/pnpm/yarn install" in the "common/temp" folder.
     *
     * @override
     */
    async installAsync(cleanInstall) {
        // Since we are actually running npm/pnpm/yarn install, recreate all the temp project tarballs.
        // This ensures that any existing tarballs with older header bits will be regenerated.
        // It is safe to assume that temp project pacakge.jsons already exist.
        for (const rushProject of this.rushConfiguration.projects) {
            this._tempProjectHelper.createTempProjectTarball(rushProject);
        }
        // NOTE: The PNPM store is supposed to be transactionally safe, so we don't delete it automatically.
        // The user must request that via the command line.
        if (cleanInstall) {
            if (this.rushConfiguration.packageManager === 'npm') {
                console.log(`Deleting the "npm-cache" folder`);
                // This is faster and more thorough than "npm cache clean"
                this.installRecycler.moveFolder(this.rushConfiguration.npmCacheFolder);
                console.log(`Deleting the "npm-tmp" folder`);
                this.installRecycler.moveFolder(this.rushConfiguration.npmTmpFolder);
            }
        }
        // Example: "C:\MyRepo\common\temp\npm-local\node_modules\.bin\npm"
        const packageManagerFilename = this.rushConfiguration.packageManagerToolFilename;
        const packageManagerEnv = InstallHelpers_1.InstallHelpers.getPackageManagerEnvironment(this.rushConfiguration, this.options);
        const commonNodeModulesFolder = path.join(this.rushConfiguration.commonTempFolder, RushConstants_1.RushConstants.nodeModulesFolderName);
        // Is there an existing "node_modules" folder to consider?
        if (node_core_library_1.FileSystem.exists(commonNodeModulesFolder)) {
            // Should we delete the entire "node_modules" folder?
            if (cleanInstall) {
                // YES: Delete "node_modules"
                // Explain to the user why we are hosing their node_modules folder
                console.log('Deleting files from ' + commonNodeModulesFolder);
                this.installRecycler.moveFolder(commonNodeModulesFolder);
                Utilities_1.Utilities.createFolderWithRetry(commonNodeModulesFolder);
            }
            else {
                // NO: Prepare to do an incremental install in the "node_modules" folder
                // note: it is not necessary to run "prune" with pnpm
                if (this.rushConfiguration.packageManager === 'npm') {
                    console.log(`Running "${this.rushConfiguration.packageManager} prune"` +
                        ` in ${this.rushConfiguration.commonTempFolder}`);
                    const args = ['prune'];
                    this.pushConfigurationArgs(args, this.options);
                    Utilities_1.Utilities.executeCommandWithRetry({
                        command: packageManagerFilename,
                        args: args,
                        workingDirectory: this.rushConfiguration.commonTempFolder,
                        environment: packageManagerEnv
                    }, this.options.maxInstallAttempts);
                    // Delete the (installed image of) the temp projects, since "npm install" does not
                    // detect changes for "file:./" references.
                    // We recognize the temp projects by their names, which always start with "rush-".
                    // Example: "C:\MyRepo\common\temp\node_modules\@rush-temp"
                    const pathToDeleteWithoutStar = path.join(commonNodeModulesFolder, RushConstants_1.RushConstants.rushTempNpmScope);
                    console.log(`Deleting ${pathToDeleteWithoutStar}\\*`);
                    // Glob can't handle Windows paths
                    const normalizedpathToDeleteWithoutStar = node_core_library_1.Text.replaceAll(pathToDeleteWithoutStar, '\\', '/');
                    // Example: "C:/MyRepo/common/temp/node_modules/@rush-temp/*"
                    for (const tempModulePath of glob.sync(globEscape(normalizedpathToDeleteWithoutStar) + '/*')) {
                        // We could potentially use AsyncRecycler here, but in practice these folders tend
                        // to be very small
                        Utilities_1.Utilities.dangerouslyDeletePath(tempModulePath);
                    }
                }
            }
        }
        if (this.rushConfiguration.packageManager === 'yarn') {
            // Yarn does not correctly detect changes to a tarball, so we need to forcibly clear its cache
            const yarnRushTempCacheFolder = path.join(this.rushConfiguration.yarnCacheFolder, 'v2', 'npm-@rush-temp');
            if (node_core_library_1.FileSystem.exists(yarnRushTempCacheFolder)) {
                console.log('Deleting ' + yarnRushTempCacheFolder);
                Utilities_1.Utilities.dangerouslyDeletePath(yarnRushTempCacheFolder);
            }
        }
        // Run "npm install" in the common folder
        const installArgs = ['install'];
        this.pushConfigurationArgs(installArgs, this.options);
        console.log(os.EOL +
            safe_1.default.bold(`Running "${this.rushConfiguration.packageManager} install" in` +
                ` ${this.rushConfiguration.commonTempFolder}`) +
            os.EOL);
        // If any diagnostic options were specified, then show the full command-line
        if (this.options.debug || this.options.collectLogFile || this.options.networkConcurrency) {
            console.log(os.EOL +
                safe_1.default.green('Invoking package manager: ') +
                node_core_library_1.FileSystem.getRealPath(packageManagerFilename) +
                ' ' +
                installArgs.join(' ') +
                os.EOL);
        }
        try {
            Utilities_1.Utilities.executeCommandWithRetry({
                command: packageManagerFilename,
                args: installArgs,
                workingDirectory: this.rushConfiguration.commonTempFolder,
                environment: packageManagerEnv,
                suppressOutput: false
            }, this.options.maxInstallAttempts, () => {
                if (this.rushConfiguration.packageManager === 'pnpm') {
                    console.log(safe_1.default.yellow(`Deleting the "node_modules" folder`));
                    this.installRecycler.moveFolder(commonNodeModulesFolder);
                    // Leave the pnpm-store as is for the retry. This ensures that packages that have already
                    // been downloaded need not be downloaded again, thereby potentially increasing the chances
                    // of a subsequent successful install.
                    Utilities_1.Utilities.createFolderWithRetry(commonNodeModulesFolder);
                }
            });
        }
        catch (error) {
            // All the install attempts failed.
            if (this.rushConfiguration.packageManager === 'pnpm' &&
                this.rushConfiguration.pnpmOptions.pnpmStore === 'local') {
                // If the installation has failed even after the retries, then pnpm store may
                // have got into a corrupted, irrecoverable state. Delete the store so that a
                // future install can create the store afresh.
                console.log(safe_1.default.yellow(`Deleting the "pnpm-store" folder`));
                this.installRecycler.moveFolder(this.rushConfiguration.pnpmOptions.pnpmStorePath);
            }
            throw error;
        }
        if (this.rushConfiguration.packageManager === 'npm') {
            console.log(os.EOL + safe_1.default.bold('Running "npm shrinkwrap"...'));
            const npmArgs = ['shrinkwrap'];
            this.pushConfigurationArgs(npmArgs, this.options);
            Utilities_1.Utilities.executeCommand({
                command: this.rushConfiguration.packageManagerToolFilename,
                args: npmArgs,
                workingDirectory: this.rushConfiguration.commonTempFolder
            });
            console.log('"npm shrinkwrap" completed' + os.EOL);
            this._fixupNpm5Regression();
        }
    }
    async postInstallAsync() {
        if (!this.options.noLink) {
            const linkManager = LinkManagerFactory_1.LinkManagerFactory.getLinkManager(this.rushConfiguration);
            await linkManager.createSymlinksForProjects(false);
        }
        else {
            console.log(os.EOL + safe_1.default.yellow('Since "--no-link" was specified, you will need to run "rush link" manually.'));
        }
    }
    /**
     * This is a workaround for a bug introduced in NPM 5 (and still unfixed as of NPM 5.5.1):
     * https://github.com/npm/npm/issues/19006
     *
     * The regression is that "npm install" sets the package.json "version" field for the
     * @rush-temp projects to a value like "file:projects/example.tgz", when it should be "0.0.0".
     * This causes linking to fail later, when read-package-tree tries to parse the bad version.
     * The error looks like this:
     *
     * ERROR: Failed to parse package.json for foo: Invalid version: "file:projects/example.tgz"
     *
     * Our workaround is to rewrite the package.json files for each of the @rush-temp projects
     * in the node_modules folder, after "npm install" completes.
     */
    _fixupNpm5Regression() {
        const pathToDeleteWithoutStar = path.join(this.rushConfiguration.commonTempFolder, 'node_modules', RushConstants_1.RushConstants.rushTempNpmScope);
        // Glob can't handle Windows paths
        const normalizedPathToDeleteWithoutStar = node_core_library_1.Text.replaceAll(pathToDeleteWithoutStar, '\\', '/');
        let anyChanges = false;
        // Example: "C:/MyRepo/common/temp/node_modules/@rush-temp/*/package.json"
        for (const packageJsonPath of glob.sync(globEscape(normalizedPathToDeleteWithoutStar) + '/*/package.json')) {
            // Example: "C:/MyRepo/common/temp/node_modules/@rush-temp/example/package.json"
            const packageJsonObject = node_core_library_1.JsonFile.load(packageJsonPath);
            // The temp projects always use "0.0.0" as their version
            packageJsonObject.version = '0.0.0';
            if (node_core_library_1.JsonFile.save(packageJsonObject, packageJsonPath, { onlyIfChanged: true })) {
                anyChanges = true;
            }
        }
        if (anyChanges) {
            console.log(os.EOL + safe_1.default.yellow(terminal_1.PrintUtilities.wrapWords(`Applied workaround for NPM 5 bug`)) + os.EOL);
        }
    }
    /**
     * Checks for temp projects that exist in the shrinkwrap file, but don't exist
     * in rush.json.  This might occur, e.g. if a project was recently deleted or renamed.
     *
     * @returns true if orphans were found, or false if everything is okay
     */
    _findMissingTempProjects(shrinkwrapFile) {
        const tempProjectNames = new Set(shrinkwrapFile.getTempProjectNames());
        for (const rushProject of this.rushConfiguration.projects) {
            if (!tempProjectNames.has(rushProject.tempProjectName)) {
                console.log(os.EOL +
                    safe_1.default.yellow(terminal_1.PrintUtilities.wrapWords(`Your ${this.rushConfiguration.shrinkwrapFilePhrase} is missing the project "${rushProject.packageName}".`)) +
                    os.EOL);
                return true; // found one
            }
        }
        return false; // none found
    }
}
exports.RushInstallManager = RushInstallManager;
//# sourceMappingURL=RushInstallManager.js.map