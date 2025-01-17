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
exports.VersionPolicyConfiguration = exports.VersionFormatForCommit = exports.VersionFormatForPublish = void 0;
const path = __importStar(require("path"));
const node_core_library_1 = require("@rushstack/node-core-library");
const VersionPolicy_1 = require("./VersionPolicy");
/**
 * @beta
 */
var VersionFormatForPublish;
(function (VersionFormatForPublish) {
    VersionFormatForPublish["original"] = "original";
    VersionFormatForPublish["exact"] = "exact";
})(VersionFormatForPublish = exports.VersionFormatForPublish || (exports.VersionFormatForPublish = {}));
/**
 * @beta
 */
var VersionFormatForCommit;
(function (VersionFormatForCommit) {
    VersionFormatForCommit["wildcard"] = "wildcard";
    VersionFormatForCommit["original"] = "original";
})(VersionFormatForCommit = exports.VersionFormatForCommit || (exports.VersionFormatForCommit = {}));
/**
 * Use this class to load and save the "common/config/rush/version-policies.json" config file.
 * This config file configures how different groups of projects will be published by Rush,
 * and how their version numbers will be determined.
 * @beta
 */
class VersionPolicyConfiguration {
    /**
     * @internal
     */
    constructor(jsonFileName) {
        this._jsonFileName = jsonFileName;
        this._versionPolicies = new Map();
        this._loadFile();
    }
    /**
     * Validate the version policy configuration against the rush config
     */
    validate(projectsByName) {
        if (!this.versionPolicies) {
            return;
        }
        this.versionPolicies.forEach((policy) => {
            const lockStepPolicy = policy;
            if (lockStepPolicy.mainProject && !projectsByName.get(lockStepPolicy.mainProject)) {
                throw new Error(`Version policy \"${policy.policyName}\" has a non-existing mainProject:` +
                    ` ${lockStepPolicy.mainProject}.`);
            }
        });
    }
    /**
     * Gets the version policy by its name.
     * Throws error if the version policy is not found.
     * @param policyName - Name of the version policy
     */
    getVersionPolicy(policyName) {
        const policy = this._versionPolicies.get(policyName);
        if (!policy) {
            throw new Error(`Failed to find version policy by name \'${policyName}\'`);
        }
        return policy;
    }
    /**
     * Gets all the version policies
     */
    get versionPolicies() {
        return this._versionPolicies;
    }
    /**
     * Bumps up versions for the specified version policy or all version policies
     *
     * @param versionPolicyName - version policy name
     * @param bumpType - bump type to override what policy has defined.
     * @param identifier - prerelease identifier to override what policy has defined.
     * @param shouldCommit - should save to disk
     */
    bump(versionPolicyName, bumpType, identifier, shouldCommit) {
        if (versionPolicyName) {
            const policy = this.versionPolicies.get(versionPolicyName);
            if (policy) {
                policy.bump(bumpType, identifier);
            }
        }
        else {
            this.versionPolicies.forEach((versionPolicy) => {
                if (versionPolicy) {
                    versionPolicy.bump(bumpType, identifier);
                }
            });
        }
        this._saveFile(!!shouldCommit);
    }
    /**
     * Updates the version directly for the specified version policy
     * @param versionPolicyName - version policy name
     * @param newVersion - new version
     */
    update(versionPolicyName, newVersion) {
        const policy = this.versionPolicies.get(versionPolicyName);
        if (!policy || !policy.isLockstepped) {
            throw new Error(`Lockstep Version policy with name "${versionPolicyName}" cannot be found`);
        }
        const lockStepVersionPolicy = policy;
        if (lockStepVersionPolicy.update(newVersion)) {
            this._saveFile(true);
        }
    }
    _loadFile() {
        if (!node_core_library_1.FileSystem.exists(this._jsonFileName)) {
            return;
        }
        const versionPolicyJson = node_core_library_1.JsonFile.loadAndValidate(this._jsonFileName, VersionPolicyConfiguration._jsonSchema);
        versionPolicyJson.forEach((policyJson) => {
            const policy = VersionPolicy_1.VersionPolicy.load(policyJson);
            if (policy) {
                this._versionPolicies.set(policy.policyName, policy);
            }
        });
    }
    _saveFile(shouldCommit) {
        const versionPolicyJson = [];
        this.versionPolicies.forEach((versionPolicy) => {
            versionPolicyJson.push(versionPolicy._json);
        });
        if (shouldCommit) {
            node_core_library_1.JsonFile.save(versionPolicyJson, this._jsonFileName, { updateExistingFile: true });
        }
    }
}
exports.VersionPolicyConfiguration = VersionPolicyConfiguration;
VersionPolicyConfiguration._jsonSchema = node_core_library_1.JsonSchema.fromFile(path.join(__dirname, '../schemas/version-policies.schema.json'));
//# sourceMappingURL=VersionPolicyConfiguration.js.map