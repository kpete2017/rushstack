import { IPackageJson } from '@rushstack/node-core-library';
import { IChangeInfo } from '../api/ChangeManagement';
import { RushConfiguration } from '../api/RushConfiguration';
import { RushConfigurationProject } from '../api/RushConfigurationProject';
import { VersionPolicyConfiguration } from '../api/VersionPolicyConfiguration';
import { PrereleaseToken } from './PrereleaseToken';
/**
 * The class manages change files and controls how changes logged by change files
 * can be applied to package.json and change logs.
 */
export declare class ChangeManager {
    private _prereleaseToken;
    private _orderedChanges;
    private _allPackages;
    private _allChanges;
    private _changeFiles;
    private _rushConfiguration;
    private _lockStepProjectsToExclude;
    constructor(rushConfiguration: RushConfiguration, lockStepProjectsToExclude?: Set<string> | undefined);
    /**
     * Load changes from change files
     * @param changesPath - location of change files
     * @param prereleaseToken - prerelease token
     * @param includeCommitDetails - whether commit details need to be included in changes
     */
    load(changesPath: string, prereleaseToken?: PrereleaseToken, includeCommitDetails?: boolean): void;
    hasChanges(): boolean;
    get changes(): IChangeInfo[];
    get allPackages(): Map<string, RushConfigurationProject>;
    validateChanges(versionConfig: VersionPolicyConfiguration): void;
    /**
     * Apply changes to package.json
     * @param shouldCommit - If the value is true, package.json will be updated.
     * If the value is false, package.json and change logs will not be updated. It will only do a dry-run.
     */
    apply(shouldCommit: boolean): Map<string, IPackageJson> | undefined;
    updateChangelog(shouldCommit: boolean): void;
}
//# sourceMappingURL=ChangeManager.d.ts.map