import { IPackageJson } from '@rushstack/node-core-library';
import { IVersionPolicyJson, ILockStepVersionJson, IIndividualVersionJson } from './VersionPolicyConfiguration';
import { RushConfiguration } from './RushConfiguration';
/**
 * Type of version bumps
 * @beta
 */
export declare enum BumpType {
    'none' = 0,
    'prerelease' = 1,
    'patch' = 2,
    'preminor' = 3,
    'minor' = 4,
    'major' = 5
}
/**
 * Version policy base type names
 * @beta
 */
export declare enum VersionPolicyDefinitionName {
    'lockStepVersion' = 0,
    'individualVersion' = 1
}
/**
 * This is the base class for version policy which controls how versions get bumped.
 * @beta
 */
export declare abstract class VersionPolicy {
    private _policyName;
    private _definitionName;
    private _exemptFromRushChange;
    private _versionFormatForCommit;
    private _versionFormatForPublish;
    /**
     * @internal
     */
    constructor(versionPolicyJson: IVersionPolicyJson);
    /**
     * Loads from version policy json
     *
     * @param versionPolicyJson - version policy Json
     *
     * @internal
     */
    static load(versionPolicyJson: IVersionPolicyJson): VersionPolicy | undefined;
    /**
     * Version policy name
     */
    get policyName(): string;
    /**
     * Version policy definition name
     */
    get definitionName(): VersionPolicyDefinitionName;
    /**
     * Whether it is a lockstepped version policy
     */
    get isLockstepped(): boolean;
    /**
     * Determines if a version policy wants to opt out of changelog files.
     */
    get exemptFromRushChange(): boolean;
    /**
     * Returns an updated package json that satisfies the policy.
     *
     * @param project - package json
     * @param force - force update even when the project version is higher than the policy version.
     */
    abstract ensure(project: IPackageJson, force?: boolean): IPackageJson | undefined;
    /**
     * Bumps version based on the policy
     *
     * @param bumpType - (optional) override bump type
     * @param identifier - (optional) override prerelease Id
     */
    abstract bump(bumpType?: BumpType, identifier?: string): void;
    /**
     * Serialized json for the policy
     *
     * @internal
     */
    abstract get _json(): IVersionPolicyJson;
    /**
     * Validates the specified version and throws if the version does not satisfy the policy.
     *
     * @param versionString - version string
     * @param packageName - package name
     */
    abstract validate(versionString: string, packageName: string): void;
    /**
     * Tells the version policy to modify any dependencies in the target package
     * to values used for publishing.
     */
    setDependenciesBeforePublish(packageName: string, configuration: RushConfiguration): void;
    /**
     * Tells the version policy to modify any dependencies in the target package
     * to values used for checked-in source.
     */
    setDependenciesBeforeCommit(packageName: string, configuration: RushConfiguration): void;
}
/**
 * This policy indicates all related projects should use the same version.
 * @beta
 */
export declare class LockStepVersionPolicy extends VersionPolicy {
    private _version;
    private _nextBump;
    private _mainProject;
    /**
     * @internal
     */
    constructor(versionPolicyJson: ILockStepVersionJson);
    /**
     * The value of the lockstep version
     */
    get version(): string;
    /**
     * The type of bump for next bump.
     */
    get nextBump(): BumpType;
    /**
     * The main project for the version policy.
     *
     * If the value is provided, change logs will only be generated in that project.
     * If the value is not provided, change logs will be hosted in each project associated with the policy.
     */
    get mainProject(): string | undefined;
    /**
     * Serialized json for this policy
     *
     * @internal
     */
    get _json(): ILockStepVersionJson;
    /**
     * Returns an updated package json that satisfies the version policy.
     *
     * @param project - input package json
     * @param force - force update even when the project version is higher than the policy version.
     */
    ensure(project: IPackageJson, force?: boolean): IPackageJson | undefined;
    /**
     * Bumps the version of the lockstep policy
     *
     * @param bumpType - Overwrite bump type in version-policy.json with the provided value.
     * @param identifier - Prerelease identifier if bump type is prerelease.
     */
    bump(bumpType?: BumpType, identifier?: string): void;
    /**
     * Updates the version of the policy directly with a new value
     * @param newVersionString - New version
     */
    update(newVersionString: string): boolean;
    /**
     * Validates the specified version and throws if the version does not satisfy lockstep version.
     *
     * @param versionString - version string
     * @param packageName - package name
     */
    validate(versionString: string, packageName: string): void;
    private _updatePackageVersion;
    private _getReleaseType;
}
/**
 * This policy indicates all related projects get version bump driven by their own changes.
 * @beta
 */
export declare class IndividualVersionPolicy extends VersionPolicy {
    private _lockedMajor;
    /**
     * @internal
     */
    constructor(versionPolicyJson: IIndividualVersionJson);
    /**
     * The major version that has been locked
     */
    get lockedMajor(): number | undefined;
    /**
     * Serialized json for this policy
     *
     * @internal
     */
    get _json(): IIndividualVersionJson;
    /**
     * Returns an updated package json that satisfies the version policy.
     *
     * @param project - input package json
     * @param force - force update even when the project version is higher than the policy version.
     */
    ensure(project: IPackageJson, force?: boolean): IPackageJson | undefined;
    /**
     * Bumps version.
     * Individual version policy lets change files drive version bump. This method currently does not do anything.
     *
     * @param bumpType - bump type
     * @param identifier - prerelease id
     */
    bump(bumpType?: BumpType, identifier?: string): void;
    /**
     * Validates the specified version and throws if the version does not satisfy the policy.
     *
     * @param versionString - version string
     * @param packageName - package name
     */
    validate(versionString: string, packageName: string): void;
}
//# sourceMappingURL=VersionPolicy.d.ts.map