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
exports.IndividualVersionPolicy = exports.LockStepVersionPolicy = exports.VersionPolicy = exports.VersionPolicyDefinitionName = exports.BumpType = void 0;
const semver = __importStar(require("semver"));
const node_core_library_1 = require("@rushstack/node-core-library");
const VersionPolicyConfiguration_1 = require("./VersionPolicyConfiguration");
const lodash = node_core_library_1.Import.lazy('lodash', require);
/**
 * Type of version bumps
 * @beta
 */
var BumpType;
(function (BumpType) {
    // No version bump
    BumpType[BumpType["none"] = 0] = "none";
    // Prerelease version bump
    BumpType[BumpType["prerelease"] = 1] = "prerelease";
    // Patch version bump
    BumpType[BumpType["patch"] = 2] = "patch";
    // Preminor version bump
    BumpType[BumpType["preminor"] = 3] = "preminor";
    // Minor version bump
    BumpType[BumpType["minor"] = 4] = "minor";
    // Major version bump
    BumpType[BumpType["major"] = 5] = "major";
})(BumpType = exports.BumpType || (exports.BumpType = {}));
/**
 * Version policy base type names
 * @beta
 */
var VersionPolicyDefinitionName;
(function (VersionPolicyDefinitionName) {
    VersionPolicyDefinitionName[VersionPolicyDefinitionName["lockStepVersion"] = 0] = "lockStepVersion";
    VersionPolicyDefinitionName[VersionPolicyDefinitionName["individualVersion"] = 1] = "individualVersion";
})(VersionPolicyDefinitionName = exports.VersionPolicyDefinitionName || (exports.VersionPolicyDefinitionName = {}));
/**
 * This is the base class for version policy which controls how versions get bumped.
 * @beta
 */
class VersionPolicy {
    /**
     * @internal
     */
    constructor(versionPolicyJson) {
        this._policyName = versionPolicyJson.policyName;
        this._definitionName = node_core_library_1.Enum.getValueByKey(VersionPolicyDefinitionName, versionPolicyJson.definitionName);
        this._exemptFromRushChange = versionPolicyJson.exemptFromRushChange || false;
        const jsonDependencies = versionPolicyJson.dependencies || {};
        this._versionFormatForCommit = jsonDependencies.versionFormatForCommit || VersionPolicyConfiguration_1.VersionFormatForCommit.original;
        this._versionFormatForPublish =
            jsonDependencies.versionFormatForPublish || VersionPolicyConfiguration_1.VersionFormatForPublish.original;
    }
    /**
     * Loads from version policy json
     *
     * @param versionPolicyJson - version policy Json
     *
     * @internal
     */
    static load(versionPolicyJson) {
        const definition = node_core_library_1.Enum.getValueByKey(VersionPolicyDefinitionName, versionPolicyJson.definitionName);
        if (definition === VersionPolicyDefinitionName.lockStepVersion) {
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            return new LockStepVersionPolicy(versionPolicyJson);
        }
        else if (definition === VersionPolicyDefinitionName.individualVersion) {
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            return new IndividualVersionPolicy(versionPolicyJson);
        }
        return undefined;
    }
    /**
     * Version policy name
     */
    get policyName() {
        return this._policyName;
    }
    /**
     * Version policy definition name
     */
    get definitionName() {
        return this._definitionName;
    }
    /**
     * Whether it is a lockstepped version policy
     */
    get isLockstepped() {
        return this.definitionName === VersionPolicyDefinitionName.lockStepVersion;
    }
    /**
     * Determines if a version policy wants to opt out of changelog files.
     */
    get exemptFromRushChange() {
        return this._exemptFromRushChange;
    }
    /**
     * Tells the version policy to modify any dependencies in the target package
     * to values used for publishing.
     */
    setDependenciesBeforePublish(packageName, configuration) {
        if (this._versionFormatForPublish === VersionPolicyConfiguration_1.VersionFormatForPublish.exact) {
            const project = configuration.getProjectByName(packageName);
            const packageJsonEditor = project.packageJsonEditor;
            for (const dependency of packageJsonEditor.dependencyList) {
                const rushDependencyProject = configuration.getProjectByName(dependency.name);
                if (rushDependencyProject) {
                    const dependencyVersion = rushDependencyProject.packageJson.version;
                    dependency.setVersion(dependencyVersion);
                }
            }
            packageJsonEditor.saveIfModified();
        }
    }
    /**
     * Tells the version policy to modify any dependencies in the target package
     * to values used for checked-in source.
     */
    setDependenciesBeforeCommit(packageName, configuration) {
        if (this._versionFormatForCommit === VersionPolicyConfiguration_1.VersionFormatForCommit.wildcard) {
            const project = configuration.getProjectByName(packageName);
            const packageJsonEditor = project.packageJsonEditor;
            for (const dependency of packageJsonEditor.dependencyList) {
                const rushDependencyProject = configuration.getProjectByName(dependency.name);
                if (rushDependencyProject) {
                    dependency.setVersion('*');
                }
            }
            packageJsonEditor.saveIfModified();
        }
    }
}
exports.VersionPolicy = VersionPolicy;
/**
 * This policy indicates all related projects should use the same version.
 * @beta
 */
class LockStepVersionPolicy extends VersionPolicy {
    /**
     * @internal
     */
    constructor(versionPolicyJson) {
        super(versionPolicyJson);
        this._version = new semver.SemVer(versionPolicyJson.version);
        this._nextBump = node_core_library_1.Enum.getValueByKey(BumpType, versionPolicyJson.nextBump);
        this._mainProject = versionPolicyJson.mainProject;
    }
    /**
     * The value of the lockstep version
     */
    get version() {
        return this._version.format();
    }
    /**
     * The type of bump for next bump.
     */
    get nextBump() {
        return this._nextBump;
    }
    /**
     * The main project for the version policy.
     *
     * If the value is provided, change logs will only be generated in that project.
     * If the value is not provided, change logs will be hosted in each project associated with the policy.
     */
    get mainProject() {
        return this._mainProject;
    }
    /**
     * Serialized json for this policy
     *
     * @internal
     */
    get _json() {
        const json = {
            policyName: this.policyName,
            definitionName: VersionPolicyDefinitionName[this.definitionName],
            version: this.version,
            nextBump: BumpType[this.nextBump]
        };
        if (this._mainProject) {
            json.mainProject = this._mainProject;
        }
        return json;
    }
    /**
     * Returns an updated package json that satisfies the version policy.
     *
     * @param project - input package json
     * @param force - force update even when the project version is higher than the policy version.
     */
    ensure(project, force) {
        const packageVersion = new semver.SemVer(project.version);
        const compareResult = packageVersion.compare(this._version);
        if (compareResult === 0) {
            return undefined;
        }
        else if (compareResult > 0 && !force) {
            const errorMessage = `Version ${project.version} in package ${project.name}` +
                ` is higher than locked version ${this._version.format()}.`;
            throw new Error(errorMessage);
        }
        return this._updatePackageVersion(project, this._version);
    }
    /**
     * Bumps the version of the lockstep policy
     *
     * @param bumpType - Overwrite bump type in version-policy.json with the provided value.
     * @param identifier - Prerelease identifier if bump type is prerelease.
     */
    bump(bumpType, identifier) {
        this._version.inc(this._getReleaseType(bumpType || this.nextBump), identifier);
    }
    /**
     * Updates the version of the policy directly with a new value
     * @param newVersionString - New version
     */
    update(newVersionString) {
        const newVersion = new semver.SemVer(newVersionString);
        if (!newVersion || this._version === newVersion) {
            return false;
        }
        this._version = newVersion;
        return true;
    }
    /**
     * Validates the specified version and throws if the version does not satisfy lockstep version.
     *
     * @param versionString - version string
     * @param packageName - package name
     */
    validate(versionString, packageName) {
        const versionToTest = new semver.SemVer(versionString, false);
        if (this._version.compare(versionToTest) !== 0) {
            throw new Error(`Invalid version ${versionString} in ${packageName}`);
        }
    }
    _updatePackageVersion(project, newVersion) {
        const updatedProject = lodash.cloneDeep(project);
        updatedProject.version = newVersion.format();
        return updatedProject;
    }
    _getReleaseType(bumpType) {
        // Eventually we should just use ReleaseType and get rid of bump type.
        return BumpType[bumpType];
    }
}
exports.LockStepVersionPolicy = LockStepVersionPolicy;
/**
 * This policy indicates all related projects get version bump driven by their own changes.
 * @beta
 */
class IndividualVersionPolicy extends VersionPolicy {
    /**
     * @internal
     */
    constructor(versionPolicyJson) {
        super(versionPolicyJson);
        this._lockedMajor = versionPolicyJson.lockedMajor;
    }
    /**
     * The major version that has been locked
     */
    get lockedMajor() {
        return this._lockedMajor;
    }
    /**
     * Serialized json for this policy
     *
     * @internal
     */
    get _json() {
        const json = {
            policyName: this.policyName,
            definitionName: VersionPolicyDefinitionName[this.definitionName]
        };
        if (this.lockedMajor !== undefined) {
            json.lockedMajor = this.lockedMajor;
        }
        return json;
    }
    /**
     * Returns an updated package json that satisfies the version policy.
     *
     * @param project - input package json
     * @param force - force update even when the project version is higher than the policy version.
     */
    ensure(project, force) {
        if (this.lockedMajor) {
            const version = new semver.SemVer(project.version);
            if (version.major < this.lockedMajor) {
                const updatedProject = lodash.cloneDeep(project);
                updatedProject.version = `${this._lockedMajor}.0.0`;
                return updatedProject;
            }
            else if (version.major > this.lockedMajor) {
                const errorMessage = `Version ${project.version} in package ${project.name}` +
                    ` is higher than locked major version ${this._lockedMajor}.`;
                throw new Error(errorMessage);
            }
        }
        return undefined;
    }
    /**
     * Bumps version.
     * Individual version policy lets change files drive version bump. This method currently does not do anything.
     *
     * @param bumpType - bump type
     * @param identifier - prerelease id
     */
    bump(bumpType, identifier) {
        // individual version policy lets change files drive version bump.
    }
    /**
     * Validates the specified version and throws if the version does not satisfy the policy.
     *
     * @param versionString - version string
     * @param packageName - package name
     */
    validate(versionString, packageName) {
        const versionToTest = new semver.SemVer(versionString, false);
        if (this._lockedMajor !== undefined) {
            if (this._lockedMajor !== versionToTest.major) {
                throw new Error(`Invalid major version ${versionString} in ${packageName}`);
            }
        }
    }
}
exports.IndividualVersionPolicy = IndividualVersionPolicy;
//# sourceMappingURL=VersionPolicy.js.map