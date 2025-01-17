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
exports.PackageJsonUpdater = void 0;
const safe_1 = __importDefault(require("colors/safe"));
const semver = __importStar(require("semver"));
const InstallManagerFactory_1 = require("./InstallManagerFactory");
const VersionMismatchFinder_1 = require("./versionMismatch/VersionMismatchFinder");
const PurgeManager_1 = require("./PurgeManager");
const Utilities_1 = require("../utilities/Utilities");
const VersionMismatchFinderProject_1 = require("./versionMismatch/VersionMismatchFinderProject");
const RushConstants_1 = require("./RushConstants");
const InstallHelpers_1 = require("./installManager/InstallHelpers");
/**
 * A helper class for managing the dependencies of various package.json files.
 * @internal
 */
class PackageJsonUpdater {
    constructor(rushConfiguration, rushGlobalFolder) {
        this._rushConfiguration = rushConfiguration;
        this._rushGlobalFolder = rushGlobalFolder;
    }
    /**
     * Adds a dependency to a particular project. The core business logic for "rush add".
     */
    async doRushAdd(options) {
        const { projects, packageName, initialVersion, devDependency, updateOtherPackages, skipUpdate, debugInstall, rangeStyle, variant } = options;
        const implicitlyPinned = this._rushConfiguration.getImplicitlyPreferredVersions(variant);
        const purgeManager = new PurgeManager_1.PurgeManager(this._rushConfiguration, this._rushGlobalFolder);
        const installManagerOptions = {
            debug: debugInstall,
            allowShrinkwrapUpdates: true,
            bypassPolicy: false,
            noLink: false,
            fullUpgrade: false,
            recheckShrinkwrap: false,
            networkConcurrency: undefined,
            collectLogFile: false,
            variant: variant,
            maxInstallAttempts: RushConstants_1.RushConstants.defaultMaxInstallAttempts,
            pnpmFilterArguments: []
        };
        const installManager = InstallManagerFactory_1.InstallManagerFactory.getInstallManager(this._rushConfiguration, this._rushGlobalFolder, purgeManager, installManagerOptions);
        const version = await this._getNormalizedVersionSpec(projects, installManager, packageName, initialVersion, implicitlyPinned.get(packageName), rangeStyle);
        console.log();
        console.log(safe_1.default.green(`Updating projects to use `) + packageName + '@' + safe_1.default.cyan(version));
        console.log();
        const allPackageUpdates = [];
        for (const project of projects) {
            const currentProjectUpdate = {
                project: new VersionMismatchFinderProject_1.VersionMismatchFinderProject(project),
                packageName,
                newVersion: version,
                dependencyType: devDependency ? "devDependencies" /* Dev */ : undefined
            };
            this.updateProject(currentProjectUpdate);
            const otherPackageUpdates = [];
            if (this._rushConfiguration.ensureConsistentVersions || updateOtherPackages) {
                // we need to do a mismatch check
                const mismatchFinder = VersionMismatchFinder_1.VersionMismatchFinder.getMismatches(this._rushConfiguration, {
                    variant: variant
                });
                const mismatches = mismatchFinder.getMismatches().filter((mismatch) => {
                    return !projects.find((proj) => proj.packageName === mismatch);
                });
                if (mismatches.length) {
                    if (!updateOtherPackages) {
                        throw new Error(`Adding '${packageName}@${version}' to ${project.packageName}` +
                            ` causes mismatched dependencies. Use the "--make-consistent" flag to update other packages to use` +
                            ` this version, or do not specify a SemVer range.`);
                    }
                    // otherwise we need to go update a bunch of other projects
                    const mismatchedVersions = mismatchFinder.getVersionsOfMismatch(packageName);
                    if (mismatchedVersions) {
                        for (const mismatchedVersion of mismatchedVersions) {
                            for (const consumer of mismatchFinder.getConsumersOfMismatch(packageName, mismatchedVersion)) {
                                if (consumer instanceof VersionMismatchFinderProject_1.VersionMismatchFinderProject) {
                                    otherPackageUpdates.push({
                                        project: consumer,
                                        packageName: packageName,
                                        newVersion: version
                                    });
                                }
                            }
                        }
                    }
                }
            }
            this.updateProjects(otherPackageUpdates);
            allPackageUpdates.push(currentProjectUpdate, ...otherPackageUpdates);
        }
        for (const { project } of allPackageUpdates) {
            if (project.saveIfModified()) {
                console.log(safe_1.default.green('Wrote ') + project.filePath);
            }
        }
        if (!skipUpdate) {
            console.log();
            console.log(safe_1.default.green('Running "rush update"'));
            console.log();
            try {
                await installManager.doInstallAsync();
            }
            finally {
                purgeManager.deleteAll();
            }
        }
    }
    /**
     * Updates several projects' package.json files
     */
    updateProjects(projectUpdates) {
        for (const update of projectUpdates) {
            this.updateProject(update);
        }
    }
    /**
     * Updates a single project's package.json file
     */
    updateProject(options) {
        let { dependencyType } = options;
        const { project, packageName, newVersion } = options;
        const oldDependency = project.tryGetDependency(packageName);
        const oldDevDependency = project.tryGetDevDependency(packageName);
        const oldDependencyType = oldDevDependency
            ? oldDevDependency.dependencyType
            : oldDependency
                ? oldDependency.dependencyType
                : undefined;
        dependencyType = dependencyType || oldDependencyType || "dependencies" /* Regular */;
        project.addOrUpdateDependency(packageName, newVersion, dependencyType);
    }
    /**
     * Selects an appropriate version number for a particular package, given an optional initial SemVer spec.
     * If ensureConsistentVersions, tries to pick a version that will be consistent.
     * Otherwise, will choose the latest semver matching the initialSpec and append the proper range style.
     * @param projects - the projects which will have their package.json's updated
     * @param packageName - the name of the package to be used
     * @param initialSpec - a semver pattern that should be used to find the latest version matching the spec
     * @param implicitlyPinnedVersion - the implicitly preferred (aka common/primary) version of the package in use
     * @param rangeStyle - if this version is selected by querying registry, then this range specifier is prepended to
     *   the selected version.
     */
    async _getNormalizedVersionSpec(projects, installManager, packageName, initialSpec, implicitlyPinnedVersion, rangeStyle) {
        console.log(safe_1.default.gray(`Determining new version for dependency: ${packageName}`));
        if (initialSpec) {
            console.log(`Specified version selector: ${safe_1.default.cyan(initialSpec)}`);
        }
        else {
            console.log(`No version selector was specified, so the version will be determined automatically.`);
        }
        console.log();
        // determine if the package is a project in the local repository and if the version exists
        const localProject = this._tryGetLocalProject(packageName, projects);
        // if ensureConsistentVersions => reuse the pinned version
        // else, query the registry and use the latest that satisfies semver spec
        if (initialSpec && implicitlyPinnedVersion && initialSpec === implicitlyPinnedVersion) {
            console.log(safe_1.default.green('Assigning "') +
                safe_1.default.cyan(initialSpec) +
                safe_1.default.green(`" for "${packageName}" because it matches what other projects are using in this repo.`));
            return initialSpec;
        }
        if (this._rushConfiguration.ensureConsistentVersions && !initialSpec && implicitlyPinnedVersion) {
            console.log(`Assigning the version range "${safe_1.default.cyan(implicitlyPinnedVersion)}" for "${packageName}" because` +
                ` it is already used by other projects in this repo.`);
            return implicitlyPinnedVersion;
        }
        await InstallHelpers_1.InstallHelpers.ensureLocalPackageManager(this._rushConfiguration, this._rushGlobalFolder, RushConstants_1.RushConstants.defaultMaxInstallAttempts);
        const useWorkspaces = !!(this._rushConfiguration.pnpmOptions && this._rushConfiguration.pnpmOptions.useWorkspaces);
        const workspacePrefix = 'workspace:';
        // Trim 'workspace:' notation from the spec, since we're going to be tweaking the range
        if (useWorkspaces && initialSpec && initialSpec.startsWith(workspacePrefix)) {
            initialSpec = initialSpec.substring(workspacePrefix.length).trim();
        }
        let selectedVersion;
        let selectedVersionPrefix = '';
        if (initialSpec && initialSpec !== 'latest') {
            console.log(safe_1.default.gray('Finding versions that satisfy the selector: ') + initialSpec);
            console.log();
            if (localProject !== undefined) {
                const version = localProject.packageJson.version;
                if (semver.satisfies(version, initialSpec)) {
                    // For workspaces, assume that specifying the exact version means you always want to consume
                    // the local project. Otherwise, use the exact local package version
                    if (useWorkspaces) {
                        selectedVersion = initialSpec === version ? '*' : initialSpec;
                        selectedVersionPrefix = workspacePrefix;
                    }
                    else {
                        selectedVersion = version;
                    }
                }
                else {
                    throw new Error(`The dependency being added ("${packageName}") is a project in the local Rush repository, ` +
                        `but the version specifier provided (${initialSpec}) does not match the local project's version ` +
                        `(${version}). Correct the version specifier, omit a version specifier, or include "${packageName}" as a ` +
                        `cyclicDependencyProject if it is intended for "${packageName}" to come from an external feed and not ` +
                        'from the local Rush repository.');
                }
            }
            else {
                console.log(`Querying registry for all versions of "${packageName}"...`);
                let commandArgs;
                if (this._rushConfiguration.packageManager === 'yarn') {
                    commandArgs = ['info', packageName, 'versions', '--json'];
                }
                else {
                    commandArgs = ['view', packageName, 'versions', '--json'];
                }
                const allVersions = Utilities_1.Utilities.executeCommandAndCaptureOutput(this._rushConfiguration.packageManagerToolFilename, commandArgs, this._rushConfiguration.commonTempFolder);
                let versionList;
                if (this._rushConfiguration.packageManager === 'yarn') {
                    versionList = JSON.parse(allVersions).data;
                }
                else {
                    versionList = JSON.parse(allVersions);
                }
                console.log(safe_1.default.gray(`Found ${versionList.length} available versions.`));
                for (const version of versionList) {
                    if (semver.satisfies(version, initialSpec)) {
                        selectedVersion = initialSpec;
                        console.log(`Found a version that satisfies ${initialSpec}: ${safe_1.default.cyan(version)}`);
                        break;
                    }
                }
                if (!selectedVersion) {
                    throw new Error(`Unable to find a version of "${packageName}" that satisfies` +
                        ` the version specifier "${initialSpec}"`);
                }
            }
        }
        else {
            if (!this._rushConfiguration.ensureConsistentVersions) {
                console.log(safe_1.default.gray(`The "ensureConsistentVersions" policy is NOT active, so we will assign the latest version.`));
                console.log();
            }
            if (localProject !== undefined) {
                // For workspaces, assume that no specified version range means you always want to consume
                // the local project. Otherwise, use the exact local package version
                if (useWorkspaces) {
                    selectedVersion = '*';
                    selectedVersionPrefix = workspacePrefix;
                }
                else {
                    selectedVersion = localProject.packageJson.version;
                }
            }
            else {
                console.log(`Querying NPM registry for latest version of "${packageName}"...`);
                let commandArgs;
                if (this._rushConfiguration.packageManager === 'yarn') {
                    commandArgs = ['info', packageName, 'dist-tags.latest', '--silent'];
                }
                else {
                    commandArgs = ['view', `${packageName}@latest`, 'version'];
                }
                selectedVersion = Utilities_1.Utilities.executeCommandAndCaptureOutput(this._rushConfiguration.packageManagerToolFilename, commandArgs, this._rushConfiguration.commonTempFolder).trim();
            }
            console.log();
            console.log(`Found latest version: ${safe_1.default.cyan(selectedVersion)}`);
        }
        console.log();
        let reasonForModification = '';
        if (selectedVersion !== '*') {
            switch (rangeStyle) {
                case "caret" /* Caret */: {
                    selectedVersionPrefix += '^';
                    reasonForModification = ' because the "--caret" flag was specified';
                    break;
                }
                case "exact" /* Exact */: {
                    reasonForModification = ' because the "--exact" flag was specified';
                    break;
                }
                case "tilde" /* Tilde */: {
                    selectedVersionPrefix += '~';
                    break;
                }
                case "passthrough" /* Passthrough */: {
                    break;
                }
                default: {
                    throw new Error(`Unexpected SemVerStyle ${rangeStyle}.`);
                }
            }
        }
        const normalizedVersion = selectedVersionPrefix + selectedVersion;
        console.log(safe_1.default.gray(`Assigning version "${normalizedVersion}" for "${packageName}"${reasonForModification}.`));
        return normalizedVersion;
    }
    _collectAllDownstreamDependencies(project) {
        const allProjectDownstreamDependencies = new Set();
        const collectDependencies = (rushProject) => {
            for (const downstreamDependencyProject of rushProject.downstreamDependencyProjects) {
                const foundProject = this._rushConfiguration.projectsByName.get(downstreamDependencyProject);
                if (!foundProject) {
                    continue;
                }
                if (foundProject.cyclicDependencyProjects.has(rushProject.packageName)) {
                    continue;
                }
                if (!allProjectDownstreamDependencies.has(foundProject)) {
                    allProjectDownstreamDependencies.add(foundProject);
                    collectDependencies(foundProject);
                }
            }
        };
        collectDependencies(project);
        return allProjectDownstreamDependencies;
    }
    /**
     * Given a package name, this function returns a {@see RushConfigurationProject} if the package is a project
     * in the local Rush repo and is not marked as cyclic for any of the projects.
     *
     * @remarks
     * This function throws an error if adding the discovered local project as a dependency
     * would create a dependency cycle, or if it would be added to multiple projects.
     */
    _tryGetLocalProject(packageName, projects) {
        const foundProject = this._rushConfiguration.projectsByName.get(packageName);
        if (foundProject === undefined) {
            return undefined;
        }
        if (projects.length > 1) {
            throw new Error(`"rush add" does not support adding a local project as a dependency to multiple projects at once.`);
        }
        const project = projects[0];
        if (project.cyclicDependencyProjects.has(foundProject.packageName)) {
            return undefined;
        }
        // Are we attempting to add this project to itself?
        if (project === foundProject) {
            throw new Error('Unable to add a project as a dependency of itself unless the dependency is listed as a cyclic dependency ' +
                `in rush.json. This command attempted to add "${foundProject.packageName}" as a dependency of itself.`);
        }
        // Are we attempting to create a cycle?
        const downstreamDependencies = this._collectAllDownstreamDependencies(project);
        if (downstreamDependencies.has(foundProject)) {
            throw new Error(`Adding "${foundProject.packageName}" as a direct or indirect dependency of ` +
                `"${project.packageName}" would create a dependency cycle.`);
        }
        return foundProject;
    }
}
exports.PackageJsonUpdater = PackageJsonUpdater;
//# sourceMappingURL=PackageJsonUpdater.js.map