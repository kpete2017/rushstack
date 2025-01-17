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
exports.RushConfigurationProject = void 0;
const path = __importStar(require("path"));
const semver = __importStar(require("semver"));
const node_core_library_1 = require("@rushstack/node-core-library");
const PackageJsonEditor_1 = require("./PackageJsonEditor");
const RushConstants_1 = require("../logic/RushConstants");
const PackageNameParsers_1 = require("./PackageNameParsers");
const DependencySpecifier_1 = require("../logic/DependencySpecifier");
const Selection_1 = require("../logic/Selection");
/**
 * This represents the configuration of a project that is built by Rush, based on
 * the Rush.json configuration file.
 * @public
 */
class RushConfigurationProject {
    /** @internal */
    constructor(projectJson, rushConfiguration, tempProjectName) {
        this._rushConfiguration = rushConfiguration;
        this._packageName = projectJson.packageName;
        this._projectRelativeFolder = projectJson.projectFolder;
        // For example, the depth of "a/b/c" would be 3.  The depth of "a" is 1.
        const projectFolderDepth = projectJson.projectFolder.split('/').length;
        if (projectFolderDepth < rushConfiguration.projectFolderMinDepth) {
            throw new Error(`To keep things organized, this repository has a projectFolderMinDepth policy` +
                ` requiring project folders to be at least ${rushConfiguration.projectFolderMinDepth} levels deep.` +
                `  Problem folder: "${projectJson.projectFolder}"`);
        }
        if (projectFolderDepth > rushConfiguration.projectFolderMaxDepth) {
            throw new Error(`To keep things organized, this repository has a projectFolderMaxDepth policy` +
                ` preventing project folders from being deeper than ${rushConfiguration.projectFolderMaxDepth} levels.` +
                `  Problem folder:  "${projectJson.projectFolder}"`);
        }
        this._projectFolder = path.join(rushConfiguration.rushJsonFolder, projectJson.projectFolder);
        if (!node_core_library_1.FileSystem.exists(this._projectFolder)) {
            throw new Error(`Project folder not found: ${projectJson.projectFolder}`);
        }
        this._projectRushConfigFolder = path.join(this._projectFolder, 'config', 'rush');
        this._projectRushTempFolder = path.join(this._projectFolder, RushConstants_1.RushConstants.projectRushFolderName, RushConstants_1.RushConstants.rushTempFolderName);
        // Are we using a package review file?
        if (rushConfiguration.approvedPackagesPolicy.enabled) {
            // If so, then every project needs to have a reviewCategory that was defined
            // by the reviewCategories array.
            if (!projectJson.reviewCategory) {
                throw new Error(`The "approvedPackagesPolicy" feature is enabled rush.json, but a reviewCategory` +
                    ` was not specified for the project "${projectJson.packageName}".`);
            }
            if (!rushConfiguration.approvedPackagesPolicy.reviewCategories.has(projectJson.reviewCategory)) {
                throw new Error(`The project "${projectJson.packageName}" specifies its reviewCategory as` +
                    `"${projectJson.reviewCategory}" which is not one of the defined reviewCategories.`);
            }
            this._reviewCategory = projectJson.reviewCategory;
        }
        const packageJsonFilename = path.join(this._projectFolder, "package.json" /* PackageJson */);
        this._packageJson = node_core_library_1.JsonFile.load(packageJsonFilename);
        if (this._packageJson.name !== this._packageName) {
            throw new Error(`The package name "${this._packageName}" specified in rush.json does not` +
                ` match the name "${this._packageJson.name}" from package.json`);
        }
        this._packageJsonEditor = PackageJsonEditor_1.PackageJsonEditor.fromObject(this._packageJson, packageJsonFilename);
        this._tempProjectName = tempProjectName;
        // The "rushProject.tempProjectName" is guaranteed to be unique name (e.g. by adding the "-2"
        // suffix).  Even after we strip the NPM scope, it will still be unique.
        // Example: "my-project-2"
        this._unscopedTempProjectName = PackageNameParsers_1.PackageNameParsers.permissive.getUnscopedName(tempProjectName);
        this._cyclicDependencyProjects = new Set();
        if (projectJson.cyclicDependencyProjects) {
            for (const cyclicDependencyProject of projectJson.cyclicDependencyProjects) {
                this._cyclicDependencyProjects.add(cyclicDependencyProject);
            }
        }
        this._shouldPublish = !!projectJson.shouldPublish;
        this._skipRushCheck = !!projectJson.skipRushCheck;
        this._consumingProjectNames = new Set();
        this._versionPolicyName = projectJson.versionPolicyName;
        this._publishFolder = this._projectFolder;
        if (projectJson.publishFolder) {
            this._publishFolder = path.join(this._publishFolder, projectJson.publishFolder);
        }
    }
    /**
     * The name of the NPM package.  An error is reported if this name is not
     * identical to packageJson.name.
     *
     * Example: `@scope/MyProject`
     */
    get packageName() {
        return this._packageName;
    }
    /**
     * The full path of the folder that contains the project to be built by Rush.
     *
     * Example: `C:\MyRepo\libraries\my-project`
     */
    get projectFolder() {
        return this._projectFolder;
    }
    /**
     * The relative path of the folder that contains the project to be built by Rush.
     *
     * Example: `libraries/my-project`
     */
    get projectRelativeFolder() {
        return this._projectRelativeFolder;
    }
    /**
     * The project-specific Rush configuration folder.
     *
     * Example: `C:\MyRepo\libraries\my-project\config\rush`
     */
    get projectRushConfigFolder() {
        return this._projectRushConfigFolder;
    }
    /**
     * The project-specific Rush temp folder. This folder is used to store Rush-specific temporary files.
     *
     * Example: `C:\MyRepo\libraries\my-project\.rush\temp`
     */
    get projectRushTempFolder() {
        return this._projectRushTempFolder;
    }
    /**
     * The Rush configuration for the monorepo that the project belongs to.
     */
    get rushConfiguration() {
        return this._rushConfiguration;
    }
    /**
     * The review category name, or undefined if no category was assigned.
     * This name must be one of the valid choices listed in RushConfiguration.reviewCategories.
     */
    get reviewCategory() {
        return this._reviewCategory;
    }
    /**
     * A list of local projects that appear as devDependencies for this project, but cannot be
     * locally linked because it would create a cyclic dependency; instead, the last published
     * version will be installed in the Common folder.
     *
     * These are package names that would be found by RushConfiguration.getProjectByName().
     */
    get cyclicDependencyProjects() {
        return this._cyclicDependencyProjects;
    }
    /**
     * An array of projects within the Rush configuration which directly depend on this package.
     * @deprecated Use `consumingProjectNames` instead, as it has Set semantics, which better reflect the nature
     * of the data.
     */
    get downstreamDependencyProjects() {
        return [...this._consumingProjectNames];
    }
    /**
     * An array of projects within the Rush configuration which this project declares as dependencies.
     * @deprecated Use `dependencyProjects` instead, as it has Set semantics, which better reflect the nature
     * of the data.
     */
    get localDependencyProjects() {
        return [...this.dependencyProjects];
    }
    /**
     * The set of projects within the Rush configuration which this project declares as dependencies.
     *
     * @remarks
     * Can be used recursively to walk the project dependency graph to find all projects that are directly or indirectly
     * referenced from this project.
     */
    get dependencyProjects() {
        if (!this._dependencyProjects) {
            this._dependencyProjects = Selection_1.Selection.union(this._getDependencyProjects(this.packageJson.dependencies), this._getDependencyProjects(this.packageJson.devDependencies), this._getDependencyProjects(this.packageJson.optionalDependencies));
        }
        return this._dependencyProjects;
    }
    /**
     * The set of projects within the Rush configuration which declare this project as a dependency.
     * Excludes those that declare this project as a `cyclicDependencyProject`.
     *
     * @remarks
     * This field is the counterpart to `dependencyProjects`, and can be used recursively to walk the project dependency
     * graph to find all projects which will be impacted by changes to this project.
     */
    get consumingProjects() {
        if (!this._consumingProjects) {
            this._consumingProjects = this._getConsumingProjects();
        }
        return this._consumingProjects;
    }
    /**
     * The parsed NPM "package.json" file from projectFolder.
     * @deprecated Use packageJsonEditor instead
     */
    get packageJson() {
        return this._packageJson;
    }
    /**
     * A useful wrapper around the package.json file for making modifications
     * @beta
     */
    get packageJsonEditor() {
        return this._packageJsonEditor;
    }
    /**
     * The unique name for the temporary project that will be generated in the Common folder.
     * For example, if the project name is `@scope/MyProject`, the temporary project name
     * might be `@rush-temp/MyProject-2`.
     *
     * Example: `@rush-temp/MyProject-2`
     */
    get tempProjectName() {
        return this._tempProjectName;
    }
    /**
     * The unscoped temporary project name
     *
     * Example: `my-project-2`
     */
    get unscopedTempProjectName() {
        return this._unscopedTempProjectName;
    }
    /**
     * A flag which indicates whether changes to this project should be published. This controls
     * whether or not the project would show up when running `rush change`, and whether or not it
     * should be published during `rush publish`.
     */
    get shouldPublish() {
        return this._shouldPublish || !!this._versionPolicyName;
    }
    /**
     * If true, then this project will be ignored by the "rush check" command.
     * The default value is false.
     */
    get skipRushCheck() {
        return this._skipRushCheck;
    }
    /**
     * Name of the version policy used by this project.
     * @beta
     */
    get versionPolicyName() {
        return this._versionPolicyName;
    }
    /**
     * The full path of the folder that will get published by Rush.
     *
     * @remarks
     * By default this is the same as the project folder, but a custom folder can be specified
     * using the the "publishFolder" setting in rush.json.
     *
     * Example: `C:\MyRepo\libraries\my-project\temp\publish`
     */
    get publishFolder() {
        return this._publishFolder;
    }
    /**
     * Version policy of the project
     * @beta
     */
    get versionPolicy() {
        if (!this._versionPolicy) {
            if (this.versionPolicyName && this._rushConfiguration.versionPolicyConfiguration) {
                this._versionPolicy = this._rushConfiguration.versionPolicyConfiguration.getVersionPolicy(this.versionPolicyName);
            }
        }
        return this._versionPolicy;
    }
    /**
     * Indicate whether this project is the main project for the related version policy.
     *
     * False if the project is not for publishing.
     * True if the project is individually versioned or if its lockstep version policy does not specify main project.
     * False if the project is lockstepped and is not the main project for its version policy.
     *
     * @beta
     */
    get isMainProject() {
        if (!this.shouldPublish) {
            return false;
        }
        let isMain = true;
        if (this.versionPolicy && this.versionPolicy.isLockstepped) {
            const lockStepPolicy = this.versionPolicy;
            if (lockStepPolicy.mainProject && lockStepPolicy.mainProject !== this.packageName) {
                isMain = false;
            }
        }
        return isMain;
    }
    /**
     * Compute the local rush projects that this project immediately depends on,
     * according to the specific dependency group from package.json
     */
    _getDependencyProjects(dependencies = {}) {
        const dependencyProjects = new Set();
        for (const dependency of Object.keys(dependencies)) {
            // Skip if we can't find the local project or it's a cyclic dependency
            const localProject = this._rushConfiguration.getProjectByName(dependency);
            if (localProject && !this._cyclicDependencyProjects.has(dependency)) {
                // Set the value if it's a workspace project, or if we have a local project and the semver is satisfied
                const dependencySpecifier = new DependencySpecifier_1.DependencySpecifier(dependency, dependencies[dependency]);
                switch (dependencySpecifier.specifierType) {
                    case DependencySpecifier_1.DependencySpecifierType.Version:
                    case DependencySpecifier_1.DependencySpecifierType.Range:
                        if (semver.satisfies(localProject.packageJson.version, dependencySpecifier.versionSpecifier)) {
                            dependencyProjects.add(localProject);
                        }
                        break;
                    case DependencySpecifier_1.DependencySpecifierType.Workspace:
                        dependencyProjects.add(localProject);
                        break;
                }
            }
        }
        return dependencyProjects;
    }
    /**
     * Compute the local rush projects that declare this project as a dependency
     */
    _getConsumingProjects() {
        const consumingProjects = new Set();
        for (const projectName of this._consumingProjectNames) {
            const localProject = this._rushConfiguration.getProjectByName(projectName);
            if (localProject && localProject.dependencyProjects.has(this)) {
                consumingProjects.add(localProject);
            }
        }
        return consumingProjects;
    }
}
exports.RushConfigurationProject = RushConfigurationProject;
//# sourceMappingURL=RushConfigurationProject.js.map