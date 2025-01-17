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
exports.WorkspaceInstallManager = void 0;
const safe_1 = __importDefault(require("colors/safe"));
const os = __importStar(require("os"));
const path = __importStar(require("path"));
const semver = __importStar(require("semver"));
const node_core_library_1 = require("@rushstack/node-core-library");
const BaseInstallManager_1 = require("../base/BaseInstallManager");
const DependencySpecifier_1 = require("../DependencySpecifier");
const PnpmWorkspaceFile_1 = require("../pnpm/PnpmWorkspaceFile");
const RushConstants_1 = require("../../logic/RushConstants");
const Utilities_1 = require("../../utilities/Utilities");
const InstallHelpers_1 = require("./InstallHelpers");
const LastLinkFlag_1 = require("../../api/LastLinkFlag");
const EnvironmentConfiguration_1 = require("../../api/EnvironmentConfiguration");
const ShrinkwrapFileFactory_1 = require("../ShrinkwrapFileFactory");
/**
 * This class implements common logic between "rush install" and "rush update".
 */
class WorkspaceInstallManager extends BaseInstallManager_1.BaseInstallManager {
    /**
     * @override
     */
    async doInstallAsync() {
        // TODO: Remove when "rush link" and "rush unlink" are deprecated
        if (this.options.noLink) {
            console.log(safe_1.default.red('The "--no-link" option was provided but is not supported when using workspaces. Run the command again ' +
                'without specifying this argument.'));
            throw new node_core_library_1.AlreadyReportedError();
        }
        await super.doInstallAsync();
    }
    /**
     * Regenerates the common/temp/package.json and related workspace files.
     * If shrinkwrapFile is provided, this function also validates whether it contains
     * everything we need to install and returns true if so; in all other cases,
     * the return value is false.
     *
     * @override
     */
    async prepareCommonTempAsync(shrinkwrapFile) {
        // Block use of the RUSH_TEMP_FOLDER environment variable
        if (EnvironmentConfiguration_1.EnvironmentConfiguration.rushTempFolderOverride !== undefined) {
            throw new Error('The RUSH_TEMP_FOLDER environment variable is not compatible with workspace installs. If attempting ' +
                'to move the PNPM store path, see the `RUSH_PNPM_STORE_PATH` environment variable.');
        }
        console.log(os.EOL + safe_1.default.bold('Updating workspace files in ' + this.rushConfiguration.commonTempFolder));
        const shrinkwrapWarnings = [];
        // We will start with the assumption that it's valid, and then set it to false if
        // any of the checks fail
        let shrinkwrapIsUpToDate = true;
        if (!shrinkwrapFile) {
            shrinkwrapIsUpToDate = false;
        }
        else {
            if (!shrinkwrapFile.isWorkspaceCompatible && !this.options.fullUpgrade) {
                console.log();
                console.log(safe_1.default.red('The shrinkwrap file has not been updated to support workspaces. Run "rush update --full" to update ' +
                    'the shrinkwrap file.'));
                throw new node_core_library_1.AlreadyReportedError();
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
        // If preferred versions have been updated, or if the repo-state.json is invalid,
        // we can't be certain of the state of the shrinkwrap
        const repoState = this.rushConfiguration.getRepoState(this.options.variant);
        if (!repoState.isValid) {
            shrinkwrapWarnings.push(`The ${RushConstants_1.RushConstants.repoStateFilename} file is invalid. There may be a merge conflict marker in the file.`);
            shrinkwrapIsUpToDate = false;
        }
        else {
            const commonVersions = this.rushConfiguration.getCommonVersions(this.options.variant);
            if (repoState.preferredVersionsHash !== commonVersions.getPreferredVersionsHash()) {
                shrinkwrapWarnings.push(`Preferred versions from ${RushConstants_1.RushConstants.commonVersionsFilename} have been modified.`);
                shrinkwrapIsUpToDate = false;
            }
        }
        // To generate the workspace file, we will add each project to the file as we loop through and validate
        const workspaceFile = new PnpmWorkspaceFile_1.PnpmWorkspaceFile(path.join(this.rushConfiguration.commonTempFolder, 'pnpm-workspace.yaml'));
        // Loop through the projects and add them to the workspace file. While we're at it, also validate that
        // referenced workspace projects are valid, and check if the shrinkwrap file is already up-to-date.
        for (const rushProject of this.rushConfiguration.projects) {
            const packageJson = rushProject.packageJsonEditor;
            workspaceFile.addPackage(rushProject.projectFolder);
            for (const { name, version, dependencyType } of [
                ...packageJson.dependencyList,
                ...packageJson.devDependencyList
            ]) {
                // Allow the package manager to handle peer dependency resolution, since this is simply a constraint
                // enforced by the package manager. Additionally, peer dependencies are simply a version constraint
                // and do not need to be converted to workspaces protocol.
                if (dependencyType === "peerDependencies" /* Peer */) {
                    continue;
                }
                const dependencySpecifier = new DependencySpecifier_1.DependencySpecifier(name, version);
                // Is there a locally built Rush project that could satisfy this dependency?
                const referencedLocalProject = this.rushConfiguration.getProjectByName(name);
                // Validate that local projects are referenced with workspace notation. If not, and it is not a
                // cyclic dependency, then it needs to be updated to specify `workspace:*` explicitly. Currently only
                // supporting versions and version ranges for specifying a local project.
                if ((dependencySpecifier.specifierType === DependencySpecifier_1.DependencySpecifierType.Version ||
                    dependencySpecifier.specifierType === DependencySpecifier_1.DependencySpecifierType.Range) &&
                    referencedLocalProject &&
                    !rushProject.cyclicDependencyProjects.has(name)) {
                    // Make sure that this version is intended to target a local package. If not, then we will fail since it
                    // is not explicitly specified as a cyclic dependency.
                    if (!semver.satisfies(referencedLocalProject.packageJsonEditor.version, dependencySpecifier.versionSpecifier)) {
                        console.log();
                        console.log(safe_1.default.red(`"${rushProject.packageName}" depends on package "${name}" (${version}) which exists ` +
                            'within the workspace but cannot be fulfilled with the specified version range. Either ' +
                            'specify a valid version range, or add the package as a cyclic dependency.'));
                        throw new node_core_library_1.AlreadyReportedError();
                    }
                    if (!this.options.allowShrinkwrapUpdates) {
                        console.log();
                        console.log(safe_1.default.red(`"${rushProject.packageName}" depends on package "${name}" (${version}) which exists within ` +
                            'the workspace. Run "rush update" to update workspace references for this package.'));
                        throw new node_core_library_1.AlreadyReportedError();
                    }
                    if (this.options.fullUpgrade) {
                        // We will update to `workspace` notation. If the version specified is a range, then use the provided range.
                        // Otherwise, use `workspace:*` to ensure we're always using the workspace package.
                        const workspaceRange = !!semver.validRange(dependencySpecifier.versionSpecifier) &&
                            !semver.valid(dependencySpecifier.versionSpecifier)
                            ? dependencySpecifier.versionSpecifier
                            : '*';
                        packageJson.addOrUpdateDependency(name, `workspace:${workspaceRange}`, dependencyType);
                        shrinkwrapIsUpToDate = false;
                        continue;
                    }
                }
                else if (dependencySpecifier.specifierType === DependencySpecifier_1.DependencySpecifierType.Workspace) {
                    // Already specified as a local project. Allow the package manager to validate this
                    continue;
                }
            }
            // Save the package.json if we modified the version references and warn that the package.json was modified
            if (packageJson.saveIfModified()) {
                console.log(safe_1.default.yellow(`"${rushProject.packageName}" depends on one or more workspace packages which did not use "workspace:" ` +
                    'notation. The package.json has been modified and must be committed to source control.'));
            }
            // Now validate that the shrinkwrap file matches what is in the package.json
            if (shrinkwrapFile === null || shrinkwrapFile === void 0 ? void 0 : shrinkwrapFile.isWorkspaceProjectModified(rushProject, this.options.variant)) {
                shrinkwrapWarnings.push(`Dependencies of project "${rushProject.packageName}" do not match the current shinkwrap.`);
                shrinkwrapIsUpToDate = false;
            }
        }
        // Write the common package.json
        InstallHelpers_1.InstallHelpers.generateCommonPackageJson(this.rushConfiguration);
        // Save the generated workspace file. Don't update the file timestamp unless the content has changed,
        // since "rush install" will consider this timestamp
        workspaceFile.save(workspaceFile.workspaceFilename, { onlyIfChanged: true });
        return { shrinkwrapIsUpToDate, shrinkwrapWarnings };
    }
    canSkipInstall(lastModifiedDate) {
        if (!super.canSkipInstall(lastModifiedDate)) {
            return false;
        }
        const potentiallyChangedFiles = [];
        if (this.rushConfiguration.packageManager === 'pnpm') {
            // Add workspace file. This file is only modified when workspace packages change.
            const pnpmWorkspaceFilename = path.join(this.rushConfiguration.commonTempFolder, 'pnpm-workspace.yaml');
            if (node_core_library_1.FileSystem.exists(pnpmWorkspaceFilename)) {
                potentiallyChangedFiles.push(pnpmWorkspaceFilename);
            }
        }
        // Also consider timestamps for all the project node_modules folders, as well as the package.json
        // files
        // Example: [ "C:\MyRepo\projects\projectA\node_modules", "C:\MyRepo\projects\projectA\package.json" ]
        potentiallyChangedFiles.push(...this.rushConfiguration.projects.map((x) => {
            return path.join(x.projectFolder, RushConstants_1.RushConstants.nodeModulesFolderName);
        }), ...this.rushConfiguration.projects.map((x) => {
            return path.join(x.projectFolder, "package.json" /* PackageJson */);
        }));
        // NOTE: If any of the potentiallyChangedFiles does not exist, then isFileTimestampCurrent()
        // returns false.
        return Utilities_1.Utilities.isFileTimestampCurrent(lastModifiedDate, potentiallyChangedFiles);
    }
    /**
     * Runs "npm install" in the common folder.
     */
    async installAsync(cleanInstall) {
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
            // Ensure that node_modules folders exist after install, since the timestamps on these folders are used
            // to determine if the install can be skipped
            const projectNodeModulesFolders = [
                path.join(this.rushConfiguration.commonTempFolder, RushConstants_1.RushConstants.nodeModulesFolderName),
                ...this.rushConfiguration.projects.map((x) => {
                    return path.join(x.projectFolder, RushConstants_1.RushConstants.nodeModulesFolderName);
                })
            ];
            for (const nodeModulesFolder of projectNodeModulesFolders) {
                node_core_library_1.FileSystem.ensureFolder(nodeModulesFolder);
            }
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
        console.log('');
    }
    async postInstallAsync() {
        // Grab the temp shrinkwrap, as this was the most recently completed install. It may also be
        // more up-to-date than the checked-in shrinkwrap since filtered installs are not written back.
        const tempShrinkwrapFile = ShrinkwrapFileFactory_1.ShrinkwrapFileFactory.getShrinkwrapFile(this.rushConfiguration.packageManager, this.rushConfiguration.pnpmOptions, this.rushConfiguration.tempShrinkwrapFilename);
        // Write or delete all project shrinkwraps related to the install
        await Promise.all(this.rushConfiguration.projects.map(async (x) => {
            var _a;
            await ((_a = tempShrinkwrapFile.getProjectShrinkwrap(x)) === null || _a === void 0 ? void 0 : _a.updateProjectShrinkwrapAsync());
        }));
        // TODO: Remove when "rush link" and "rush unlink" are deprecated
        LastLinkFlag_1.LastLinkFlagFactory.getCommonTempFlag(this.rushConfiguration).create();
    }
    /**
     * Used when invoking the NPM tool.  Appends the common configuration options
     * to the command-line.
     */
    pushConfigurationArgs(args, options) {
        super.pushConfigurationArgs(args, options);
        // Add workspace-specific args
        if (this.rushConfiguration.packageManager === 'pnpm') {
            args.push('--recursive');
            args.push('--link-workspace-packages', 'false');
            for (const arg of this.options.pnpmFilterArguments) {
                args.push(arg);
            }
        }
    }
}
exports.WorkspaceInstallManager = WorkspaceInstallManager;
//# sourceMappingURL=WorkspaceInstallManager.js.map