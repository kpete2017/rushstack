import { IPackageJson } from '@rushstack/node-core-library';
import { BumpType } from '../api/VersionPolicy';
import { ChangeFile } from '../api/ChangeFile';
import { RushConfiguration } from '../api/RushConfiguration';
import { VersionPolicyConfiguration } from '../api/VersionPolicyConfiguration';
export declare class VersionManager {
    private _rushConfiguration;
    private _userEmail;
    private _versionPolicyConfiguration;
    private _updatedProjects;
    private _changeFiles;
    constructor(rushConfiguration: RushConfiguration, userEmail: string, versionPolicyConfiguration: VersionPolicyConfiguration);
    /**
     * Ensures project versions follow the provided version policy. If version policy is not
     * provided, all projects will have their version checked according to the associated version policy.
     * package.json files will be updated if needed.
     * This method does not commit changes.
     * @param versionPolicyName -- version policy name
     * @param shouldCommit -- should update files to disk
     * @param force -- update even when project version is higher than policy version.
     */
    ensure(versionPolicyName?: string, shouldCommit?: boolean, force?: boolean): void;
    /**
     * Bumps versions following version policies.
     *
     * @param lockStepVersionPolicyName - a specified lock step version policy name. Without this value,
     * versions for all lock step policies and all individual policies will be bumped.
     * With this value, only the specified lock step policy will be bumped along with all individual policies.
     * @param bumpType - overrides the default bump type and only works for lock step policy
     * @param identifier - overrides the prerelease identifier and only works for lock step policy
     * @param shouldCommit - whether the changes will be written to disk
     */
    bumpAsync(lockStepVersionPolicyName?: string, bumpType?: BumpType, identifier?: string, shouldCommit?: boolean): Promise<void>;
    get updatedProjects(): Map<string, IPackageJson>;
    get changeFiles(): Map<string, ChangeFile>;
    private _ensure;
    private _getLockStepProjects;
    private _updateVersionsByPolicy;
    private _isPrerelease;
    private _addChangeInfo;
    private _updateDependencies;
    private _updateProjectAllDependencies;
    private _updateProjectDependencies;
    private _shouldTrackDependencyChange;
    private _trackDependencyChange;
    private _addChange;
    private _updatePackageJsonFiles;
    private _createChangeInfo;
}
//# sourceMappingURL=VersionManager.d.ts.map