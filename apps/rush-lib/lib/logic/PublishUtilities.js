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
exports.PublishUtilities = void 0;
/**
 * This file contains a set of helper functions that are unit tested and used with the PublishAction,
 * which itself is a thin wrapper around these helpers.
 */
const os_1 = require("os");
const path = __importStar(require("path"));
const semver = __importStar(require("semver"));
const child_process_1 = require("child_process");
const node_core_library_1 = require("@rushstack/node-core-library");
const ChangeManagement_1 = require("../api/ChangeManagement");
const Utilities_1 = require("../utilities/Utilities");
const DependencySpecifier_1 = require("./DependencySpecifier");
const Git_1 = require("./Git");
class PublishUtilities {
    /**
     * Finds change requests in the given folder.
     * @param changesPath Path to the changes folder.
     * @returns Dictionary of all change requests, keyed by package name.
     */
    static findChangeRequests(allPackages, rushConfiguration, changeFiles, includeCommitDetails, prereleaseToken, projectsToExclude) {
        const allChanges = {};
        console.log(`Finding changes in: ${changeFiles.getChangesPath()}`);
        const files = changeFiles.getFiles();
        // Add the minimum changes defined by the change descriptions.
        files.forEach((fullPath) => {
            const changeRequest = node_core_library_1.JsonFile.load(fullPath);
            if (includeCommitDetails) {
                const git = new Git_1.Git(rushConfiguration);
                PublishUtilities._updateCommitDetails(git, fullPath, changeRequest.changes);
            }
            for (const change of changeRequest.changes) {
                PublishUtilities._addChange(change, allChanges, allPackages, rushConfiguration, prereleaseToken, projectsToExclude);
            }
        });
        // For each requested package change, ensure downstream dependencies are also updated.
        for (const packageName in allChanges) {
            if (allChanges.hasOwnProperty(packageName)) {
                PublishUtilities._updateDownstreamDependencies(allChanges[packageName], allChanges, allPackages, rushConfiguration, prereleaseToken, projectsToExclude);
            }
        }
        // Update orders so that downstreams are marked to come after upstreams.
        for (const packageName in allChanges) {
            if (allChanges.hasOwnProperty(packageName)) {
                const change = allChanges[packageName];
                const project = allPackages.get(packageName);
                const pkg = project.packageJson;
                const deps = project._consumingProjectNames;
                // Write the new version expected for the change.
                const skipVersionBump = PublishUtilities._shouldSkipVersionBump(project, prereleaseToken, projectsToExclude);
                if (skipVersionBump) {
                    change.newVersion = pkg.version;
                }
                else {
                    // For hotfix changes, do not re-write new version
                    change.newVersion =
                        change.changeType >= ChangeManagement_1.ChangeType.patch
                            ? semver.inc(pkg.version, PublishUtilities._getReleaseType(change.changeType))
                            : change.changeType === ChangeManagement_1.ChangeType.hotfix
                                ? change.newVersion
                                : pkg.version;
                }
                if (deps) {
                    for (const depName of deps) {
                        const depChange = allChanges[depName];
                        if (depChange) {
                            depChange.order = Math.max(change.order + 1, depChange.order);
                        }
                    }
                }
            }
        }
        return allChanges;
    }
    /**
     * Given the changes hash, flattens them into a sorted array based on their dependency order.
     * @params allChanges - hash of change requests.
     * @returns Sorted array of change requests.
     */
    static sortChangeRequests(allChanges) {
        return Object.keys(allChanges)
            .map((key) => allChanges[key])
            .sort((a, b) => a.order === b.order ? a.packageName.localeCompare(b.packageName) : a.order < b.order ? -1 : 1);
    }
    /**
     * Given a single change request, updates the package json file with updated versions on disk.
     */
    static updatePackages(allChanges, allPackages, rushConfiguration, shouldCommit, prereleaseToken, projectsToExclude) {
        const updatedPackages = new Map();
        Object.keys(allChanges).forEach((packageName) => {
            const updatedPackage = PublishUtilities._writePackageChanges(allChanges[packageName], allChanges, allPackages, rushConfiguration, shouldCommit, prereleaseToken, projectsToExclude);
            updatedPackages.set(updatedPackage.name, updatedPackage);
        });
        return updatedPackages;
    }
    /**
     * Returns the generated tagname to use for a published commit, given package name and version.
     */
    static createTagname(packageName, version) {
        return packageName + '_v' + version;
    }
    static isRangeDependency(version) {
        const LOOSE_PKG_REGEX = />=?(?:\d+\.){2}\d+(\-[0-9A-Za-z-.]*)?\s+<(?:\d+\.){2}\d+/;
        return LOOSE_PKG_REGEX.test(version);
    }
    static getEnvArgs() {
        const env = {};
        // Copy existing process.env values (for nodist)
        Object.keys(process.env).forEach((key) => {
            env[key] = process.env[key];
        });
        return env;
    }
    /**
     * @param secretSubstring -- if specified, a substring to be replaced by `<<SECRET>>` to avoid printing secrets
     * on the console
     */
    static execCommand(shouldExecute, command, args = [], workingDirectory = process.cwd(), environment, secretSubstring) {
        let relativeDirectory = path.relative(process.cwd(), workingDirectory);
        if (relativeDirectory) {
            relativeDirectory = `(${relativeDirectory})`;
        }
        let commandArgs = args.join(' ');
        if (secretSubstring && secretSubstring.length > 0) {
            // Avoid printing the NPM publish token on the console when displaying the commandArgs
            commandArgs = node_core_library_1.Text.replaceAll(commandArgs, secretSubstring, '<<SECRET>>');
        }
        console.log(`${os_1.EOL}* ${shouldExecute ? 'EXECUTING' : 'DRYRUN'}: ${command} ${commandArgs} ${relativeDirectory}`);
        if (shouldExecute) {
            Utilities_1.Utilities.executeCommand({
                command,
                args,
                workingDirectory,
                environment,
                suppressOutput: false,
                keepEnvironment: true
            });
        }
    }
    static getNewDependencyVersion(dependencies, dependencyName, newProjectVersion) {
        const currentDependencySpecifier = new DependencySpecifier_1.DependencySpecifier(dependencyName, dependencies[dependencyName]);
        const currentDependencyVersion = currentDependencySpecifier.versionSpecifier;
        let newDependencyVersion;
        if (currentDependencyVersion === '*') {
            newDependencyVersion = '*';
        }
        else if (PublishUtilities.isRangeDependency(currentDependencyVersion)) {
            newDependencyVersion = PublishUtilities._getNewRangeDependency(newProjectVersion);
        }
        else if (currentDependencyVersion.lastIndexOf('~', 0) === 0) {
            newDependencyVersion = '~' + newProjectVersion;
        }
        else if (currentDependencyVersion.lastIndexOf('^', 0) === 0) {
            newDependencyVersion = '^' + newProjectVersion;
        }
        else {
            newDependencyVersion = newProjectVersion;
        }
        return currentDependencySpecifier.specifierType === DependencySpecifier_1.DependencySpecifierType.Workspace
            ? `workspace:${newDependencyVersion}`
            : newDependencyVersion;
    }
    static _getReleaseType(changeType) {
        switch (changeType) {
            case ChangeManagement_1.ChangeType.major:
                return 'major';
            case ChangeManagement_1.ChangeType.minor:
                return 'minor';
            case ChangeManagement_1.ChangeType.patch:
                return 'patch';
            case ChangeManagement_1.ChangeType.hotfix:
                return 'prerelease';
            default:
                throw new Error(`Wrong change type ${changeType}`);
        }
    }
    static _getNewRangeDependency(newVersion) {
        let upperLimit = newVersion;
        if (semver.prerelease(newVersion)) {
            // Remove the prerelease first, then bump major.
            upperLimit = semver.inc(newVersion, 'patch');
        }
        upperLimit = semver.inc(upperLimit, 'major');
        return `>=${newVersion} <${upperLimit}`;
    }
    static _shouldSkipVersionBump(project, prereleaseToken, projectsToExclude) {
        // Suffix does not bump up the version.
        // Excluded projects do not bump up version.
        return ((prereleaseToken && prereleaseToken.isSuffix) ||
            (projectsToExclude && projectsToExclude.has(project.packageName)) ||
            !project.shouldPublish);
    }
    static _updateCommitDetails(git, filename, changes) {
        try {
            const gitPath = git.getGitPathOrThrow();
            const fileLog = child_process_1.execSync(`${gitPath} log -n 1 ${filename}`, {
                cwd: path.dirname(filename)
            }).toString();
            const author = fileLog.match(/Author: (.*)/)[1];
            const commit = fileLog.match(/commit (.*)/)[1];
            changes.forEach((change) => {
                change.author = author;
                change.commit = commit;
            });
        }
        catch (e) {
            /* no-op, best effort. */
        }
    }
    static _writePackageChanges(change, allChanges, allPackages, rushConfiguration, shouldCommit, prereleaseToken, projectsToExclude) {
        const project = allPackages.get(change.packageName);
        const pkg = project.packageJson;
        const shouldSkipVersionBump = !project.shouldPublish || (!!projectsToExclude && projectsToExclude.has(change.packageName));
        const newVersion = shouldSkipVersionBump
            ? pkg.version
            : PublishUtilities._getChangeInfoNewVersion(change, prereleaseToken);
        if (!shouldSkipVersionBump) {
            console.log(`${os_1.EOL}* ${shouldCommit ? 'APPLYING' : 'DRYRUN'}: ${ChangeManagement_1.ChangeType[change.changeType]} update ` +
                `for ${change.packageName} to ${newVersion}`);
        }
        else {
            console.log(`${os_1.EOL}* ${shouldCommit ? 'APPLYING' : 'DRYRUN'}: update for ${change.packageName} at ${newVersion}`);
        }
        const packagePath = path.join(project.projectFolder, "package.json" /* PackageJson */);
        pkg.version = newVersion;
        // Update the package's dependencies.
        PublishUtilities._updateDependencies(pkg.name, pkg.dependencies, allChanges, allPackages, rushConfiguration, prereleaseToken, projectsToExclude);
        // Update the package's dev dependencies.
        PublishUtilities._updateDependencies(pkg.name, pkg.devDependencies, allChanges, allPackages, rushConfiguration, prereleaseToken, projectsToExclude);
        // Update the package's peer dependencies.
        PublishUtilities._updateDependencies(pkg.name, pkg.peerDependencies, allChanges, allPackages, rushConfiguration, prereleaseToken, projectsToExclude);
        change.changes.forEach((subChange) => {
            if (subChange.comment) {
                console.log(` - [${ChangeManagement_1.ChangeType[subChange.changeType]}] ${subChange.comment}`);
            }
        });
        if (shouldCommit) {
            node_core_library_1.JsonFile.save(pkg, packagePath, { updateExistingFile: true });
        }
        return pkg;
    }
    static _isCyclicDependency(allPackages, packageName, dependencyName) {
        const packageConfig = allPackages.get(packageName);
        return !!packageConfig && packageConfig.cyclicDependencyProjects.has(dependencyName);
    }
    static _updateDependencies(packageName, dependencies, allChanges, allPackages, rushConfiguration, prereleaseToken, projectsToExclude) {
        if (dependencies) {
            Object.keys(dependencies).forEach((depName) => {
                if (!PublishUtilities._isCyclicDependency(allPackages, packageName, depName)) {
                    const depChange = allChanges[depName];
                    if (!depChange) {
                        return;
                    }
                    const depProject = allPackages.get(depName);
                    if (!depProject.shouldPublish || (projectsToExclude && projectsToExclude.has(depName))) {
                        // No version change.
                        return;
                    }
                    else if (prereleaseToken &&
                        prereleaseToken.hasValue &&
                        prereleaseToken.isPartialPrerelease &&
                        depChange.changeType < ChangeManagement_1.ChangeType.hotfix) {
                        // For partial prereleases, do not version bump dependencies with the `prereleaseToken`
                        // value unless an actual change (hotfix, patch, minor, major) has occurred
                        return;
                    }
                    else if (depChange && prereleaseToken && prereleaseToken.hasValue) {
                        // TODO: treat prerelease version the same as non-prerelease version.
                        // For prerelease, the newVersion needs to be appended with prerelease name.
                        // And dependency should specify the specific prerelease version.
                        const currentSpecifier = new DependencySpecifier_1.DependencySpecifier(depName, dependencies[depName]);
                        const newVersion = PublishUtilities._getChangeInfoNewVersion(depChange, prereleaseToken);
                        dependencies[depName] =
                            currentSpecifier.specifierType === DependencySpecifier_1.DependencySpecifierType.Workspace
                                ? `workspace:${newVersion}`
                                : newVersion;
                    }
                    else if (depChange && depChange.changeType >= ChangeManagement_1.ChangeType.hotfix) {
                        PublishUtilities._updateDependencyVersion(packageName, dependencies, depName, depChange, allChanges, allPackages, rushConfiguration);
                    }
                }
            });
        }
    }
    /**
     * Gets the new version from the ChangeInfo.
     * The value of newVersion in ChangeInfo remains unchanged when the change type is dependency,
     * However, for pre-release build, it won't pick up the updated pre-released dependencies. That is why
     * this function should return a pre-released patch for that case. The exception to this is when we're
     * running a partial pre-release build. In this case, only user-changed packages should update.
     */
    static _getChangeInfoNewVersion(change, prereleaseToken) {
        let newVersion = change.newVersion;
        if (prereleaseToken && prereleaseToken.hasValue) {
            if (prereleaseToken.isPartialPrerelease && change.changeType <= ChangeManagement_1.ChangeType.hotfix) {
                return newVersion;
            }
            if (prereleaseToken.isPrerelease && change.changeType === ChangeManagement_1.ChangeType.dependency) {
                newVersion = semver.inc(newVersion, 'patch');
            }
            return `${newVersion}-${prereleaseToken.name}`;
        }
        else {
            return newVersion;
        }
    }
    /**
     * Adds the given change to the allChanges map.
     *
     * @returns true if the change caused the dependency change type to increase.
     */
    static _addChange(change, allChanges, allPackages, rushConfiguration, prereleaseToken, projectsToExclude) {
        let hasChanged = false;
        const packageName = change.packageName;
        const project = allPackages.get(packageName);
        if (!project) {
            console.log(`The package ${packageName} was requested for publishing but does not exist. Skip this change.`);
            return false;
        }
        const pkg = project.packageJson;
        let currentChange;
        // If the given change does not have a changeType, derive it from the "type" string.
        if (change.changeType === undefined) {
            change.changeType = node_core_library_1.Enum.tryGetValueByKey(ChangeManagement_1.ChangeType, change.type);
        }
        if (!allChanges[packageName]) {
            hasChanged = true;
            currentChange = allChanges[packageName] = {
                packageName,
                changeType: change.changeType,
                order: 0,
                changes: [change]
            };
        }
        else {
            currentChange = allChanges[packageName];
            const oldChangeType = currentChange.changeType;
            if (oldChangeType === ChangeManagement_1.ChangeType.hotfix && change.changeType > oldChangeType) {
                throw new Error(`Cannot apply ${this._getReleaseType(change.changeType)} change after hotfix on same package`);
            }
            if (change.changeType === ChangeManagement_1.ChangeType.hotfix && oldChangeType > change.changeType) {
                throw new Error(`Cannot apply hotfix alongside ${this._getReleaseType(oldChangeType)} change on same package`);
            }
            currentChange.changeType = Math.max(currentChange.changeType, change.changeType);
            currentChange.changes.push(change);
            hasChanged = hasChanged || oldChangeType !== currentChange.changeType;
        }
        const skipVersionBump = PublishUtilities._shouldSkipVersionBump(project, prereleaseToken, projectsToExclude);
        if (skipVersionBump) {
            currentChange.newVersion = pkg.version;
            hasChanged = false;
            currentChange.changeType = ChangeManagement_1.ChangeType.none;
        }
        else {
            if (change.changeType === ChangeManagement_1.ChangeType.hotfix) {
                const prereleaseComponents = semver.prerelease(pkg.version);
                if (!rushConfiguration.hotfixChangeEnabled) {
                    throw new Error(`Cannot add hotfix change; hotfixChangeEnabled is false in configuration.`);
                }
                currentChange.newVersion = pkg.version;
                if (!prereleaseComponents) {
                    currentChange.newVersion += '-hotfix';
                }
                currentChange.newVersion = semver.inc(currentChange.newVersion, 'prerelease');
            }
            else {
                // When there are multiple changes of this package, the final value of new version
                // should not depend on the order of the changes.
                let packageVersion = pkg.version;
                if (currentChange.newVersion && semver.gt(currentChange.newVersion, pkg.version)) {
                    packageVersion = currentChange.newVersion;
                }
                currentChange.newVersion =
                    change.changeType >= ChangeManagement_1.ChangeType.patch
                        ? semver.inc(pkg.version, PublishUtilities._getReleaseType(currentChange.changeType))
                        : packageVersion;
            }
            // If hotfix change, force new range dependency to be the exact new version
            currentChange.newRangeDependency =
                change.changeType === ChangeManagement_1.ChangeType.hotfix
                    ? currentChange.newVersion
                    : PublishUtilities._getNewRangeDependency(currentChange.newVersion);
        }
        return hasChanged;
    }
    static _updateDownstreamDependencies(change, allChanges, allPackages, rushConfiguration, prereleaseToken, projectsToExclude) {
        const packageName = change.packageName;
        const downstream = allPackages.get(packageName).consumingProjects;
        // Iterate through all downstream dependencies for the package.
        if (downstream) {
            if (change.changeType >= ChangeManagement_1.ChangeType.hotfix || (prereleaseToken && prereleaseToken.hasValue)) {
                for (const dependency of downstream) {
                    const pkg = dependency.packageJson;
                    PublishUtilities._updateDownstreamDependency(pkg.name, pkg.dependencies, change, allChanges, allPackages, rushConfiguration, prereleaseToken, projectsToExclude);
                    PublishUtilities._updateDownstreamDependency(pkg.name, pkg.devDependencies, change, allChanges, allPackages, rushConfiguration, prereleaseToken, projectsToExclude);
                }
            }
        }
    }
    static _updateDownstreamDependency(parentPackageName, dependencies, change, allChanges, allPackages, rushConfiguration, prereleaseToken, projectsToExclude) {
        if (dependencies &&
            dependencies[change.packageName] &&
            !PublishUtilities._isCyclicDependency(allPackages, parentPackageName, change.packageName)) {
            const requiredVersion = new DependencySpecifier_1.DependencySpecifier(change.packageName, dependencies[change.packageName]);
            const isWorkspaceWildcardVersion = requiredVersion.specifierType === DependencySpecifier_1.DependencySpecifierType.Workspace &&
                requiredVersion.versionSpecifier === '*';
            const alwaysUpdate = (!!prereleaseToken && prereleaseToken.hasValue && !allChanges.hasOwnProperty(parentPackageName)) ||
                isWorkspaceWildcardVersion;
            // If the version range exists and has not yet been updated to this version, update it.
            if (requiredVersion.versionSpecifier !== change.newRangeDependency || alwaysUpdate) {
                let changeType;
                // Propagate hotfix changes to dependencies
                if (change.changeType === ChangeManagement_1.ChangeType.hotfix) {
                    changeType = ChangeManagement_1.ChangeType.hotfix;
                }
                else {
                    // Either it already satisfies the new version, or doesn't.
                    // If not, the downstream dep needs to be republished.
                    // The downstream dep will also need to be republished if using `workspace:*` as this will publish
                    // as the exact version.
                    changeType =
                        semver.satisfies(change.newVersion, requiredVersion.versionSpecifier) &&
                            !isWorkspaceWildcardVersion
                            ? ChangeManagement_1.ChangeType.dependency
                            : ChangeManagement_1.ChangeType.patch;
                }
                const hasChanged = PublishUtilities._addChange({
                    packageName: parentPackageName,
                    changeType
                }, allChanges, allPackages, rushConfiguration, prereleaseToken, projectsToExclude);
                if (hasChanged || alwaysUpdate) {
                    // Only re-evaluate downstream dependencies if updating the parent package's dependency
                    // caused a version bump.
                    PublishUtilities._updateDownstreamDependencies(allChanges[parentPackageName], allChanges, allPackages, rushConfiguration, prereleaseToken, projectsToExclude);
                }
            }
        }
    }
    static _updateDependencyVersion(packageName, dependencies, dependencyName, dependencyChange, allChanges, allPackages, rushConfiguration) {
        let currentDependencyVersion = dependencies[dependencyName];
        let newDependencyVersion = PublishUtilities.getNewDependencyVersion(dependencies, dependencyName, dependencyChange.newVersion);
        dependencies[dependencyName] = newDependencyVersion;
        // "*" is a special case for workspace ranges, since it will publish using the exact
        // version of the local dependency, so we need to modify what we write for our change
        // comment
        const currentDependencySpecifier = new DependencySpecifier_1.DependencySpecifier(dependencyName, currentDependencyVersion);
        currentDependencyVersion =
            currentDependencySpecifier.specifierType === DependencySpecifier_1.DependencySpecifierType.Workspace &&
                currentDependencySpecifier.versionSpecifier === '*'
                ? undefined
                : currentDependencySpecifier.versionSpecifier;
        const newDependencySpecifier = new DependencySpecifier_1.DependencySpecifier(dependencyName, newDependencyVersion);
        newDependencyVersion =
            newDependencySpecifier.specifierType === DependencySpecifier_1.DependencySpecifierType.Workspace &&
                newDependencySpecifier.versionSpecifier === '*'
                ? dependencyChange.newVersion
                : newDependencySpecifier.versionSpecifier;
        // Add dependency version update comment.
        PublishUtilities._addChange({
            packageName: packageName,
            changeType: ChangeManagement_1.ChangeType.dependency,
            comment: `Updating dependency "${dependencyName}" ` +
                (currentDependencyVersion ? `from \`${currentDependencyVersion}\` ` : '') +
                `to \`${newDependencyVersion}\``
        }, allChanges, allPackages, rushConfiguration);
    }
}
exports.PublishUtilities = PublishUtilities;
//# sourceMappingURL=PublishUtilities.js.map