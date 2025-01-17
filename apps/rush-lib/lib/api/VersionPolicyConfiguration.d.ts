import { VersionPolicy, BumpType } from './VersionPolicy';
import { RushConfigurationProject } from './RushConfigurationProject';
/**
 * @beta
 */
export interface IVersionPolicyJson {
    policyName: string;
    definitionName: string;
    dependencies?: IVersionPolicyDependencyJson;
    exemptFromRushChange?: boolean;
}
/**
 * @beta
 */
export interface ILockStepVersionJson extends IVersionPolicyJson {
    version: string;
    nextBump: string;
    mainProject?: string;
}
/**
 * @beta
 */
export interface IIndividualVersionJson extends IVersionPolicyJson {
    lockedMajor?: number;
}
/**
 * @beta
 */
export declare enum VersionFormatForPublish {
    original = "original",
    exact = "exact"
}
/**
 * @beta
 */
export declare enum VersionFormatForCommit {
    wildcard = "wildcard",
    original = "original"
}
/**
 * @beta
 */
export interface IVersionPolicyDependencyJson {
    versionFormatForPublish?: VersionFormatForPublish;
    versionFormatForCommit?: VersionFormatForCommit;
}
/**
 * Use this class to load and save the "common/config/rush/version-policies.json" config file.
 * This config file configures how different groups of projects will be published by Rush,
 * and how their version numbers will be determined.
 * @beta
 */
export declare class VersionPolicyConfiguration {
    private static _jsonSchema;
    private _versionPolicies;
    private _jsonFileName;
    /**
     * @internal
     */
    constructor(jsonFileName: string);
    /**
     * Validate the version policy configuration against the rush config
     */
    validate(projectsByName: Map<string, RushConfigurationProject>): void;
    /**
     * Gets the version policy by its name.
     * Throws error if the version policy is not found.
     * @param policyName - Name of the version policy
     */
    getVersionPolicy(policyName: string): VersionPolicy;
    /**
     * Gets all the version policies
     */
    get versionPolicies(): Map<string, VersionPolicy>;
    /**
     * Bumps up versions for the specified version policy or all version policies
     *
     * @param versionPolicyName - version policy name
     * @param bumpType - bump type to override what policy has defined.
     * @param identifier - prerelease identifier to override what policy has defined.
     * @param shouldCommit - should save to disk
     */
    bump(versionPolicyName?: string, bumpType?: BumpType, identifier?: string, shouldCommit?: boolean): void;
    /**
     * Updates the version directly for the specified version policy
     * @param versionPolicyName - version policy name
     * @param newVersion - new version
     */
    update(versionPolicyName: string, newVersion: string): void;
    private _loadFile;
    private _saveFile;
}
//# sourceMappingURL=VersionPolicyConfiguration.d.ts.map