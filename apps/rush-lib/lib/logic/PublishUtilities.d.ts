import { IPackageJson } from '@rushstack/node-core-library';
import { IChangeInfo } from '../api/ChangeManagement';
import { RushConfigurationProject } from '../api/RushConfigurationProject';
import { IEnvironment } from '../utilities/Utilities';
import { PrereleaseToken } from './PrereleaseToken';
import { ChangeFiles } from './ChangeFiles';
import { RushConfiguration } from '../api/RushConfiguration';
export interface IChangeInfoHash {
    [key: string]: IChangeInfo;
}
export declare class PublishUtilities {
    /**
     * Finds change requests in the given folder.
     * @param changesPath Path to the changes folder.
     * @returns Dictionary of all change requests, keyed by package name.
     */
    static findChangeRequests(allPackages: Map<string, RushConfigurationProject>, rushConfiguration: RushConfiguration, changeFiles: ChangeFiles, includeCommitDetails?: boolean, prereleaseToken?: PrereleaseToken, projectsToExclude?: Set<string>): IChangeInfoHash;
    /**
     * Given the changes hash, flattens them into a sorted array based on their dependency order.
     * @params allChanges - hash of change requests.
     * @returns Sorted array of change requests.
     */
    static sortChangeRequests(allChanges: IChangeInfoHash): IChangeInfo[];
    /**
     * Given a single change request, updates the package json file with updated versions on disk.
     */
    static updatePackages(allChanges: IChangeInfoHash, allPackages: Map<string, RushConfigurationProject>, rushConfiguration: RushConfiguration, shouldCommit: boolean, prereleaseToken?: PrereleaseToken, projectsToExclude?: Set<string>): Map<string, IPackageJson>;
    /**
     * Returns the generated tagname to use for a published commit, given package name and version.
     */
    static createTagname(packageName: string, version: string): string;
    static isRangeDependency(version: string): boolean;
    static getEnvArgs(): {
        [key: string]: string | undefined;
    };
    /**
     * @param secretSubstring -- if specified, a substring to be replaced by `<<SECRET>>` to avoid printing secrets
     * on the console
     */
    static execCommand(shouldExecute: boolean, command: string, args?: string[], workingDirectory?: string, environment?: IEnvironment, secretSubstring?: string): void;
    static getNewDependencyVersion(dependencies: {
        [key: string]: string;
    }, dependencyName: string, newProjectVersion: string): string;
    private static _getReleaseType;
    private static _getNewRangeDependency;
    private static _shouldSkipVersionBump;
    private static _updateCommitDetails;
    private static _writePackageChanges;
    private static _isCyclicDependency;
    private static _updateDependencies;
    /**
     * Gets the new version from the ChangeInfo.
     * The value of newVersion in ChangeInfo remains unchanged when the change type is dependency,
     * However, for pre-release build, it won't pick up the updated pre-released dependencies. That is why
     * this function should return a pre-released patch for that case. The exception to this is when we're
     * running a partial pre-release build. In this case, only user-changed packages should update.
     */
    private static _getChangeInfoNewVersion;
    /**
     * Adds the given change to the allChanges map.
     *
     * @returns true if the change caused the dependency change type to increase.
     */
    private static _addChange;
    private static _updateDownstreamDependencies;
    private static _updateDownstreamDependency;
    private static _updateDependencyVersion;
}
//# sourceMappingURL=PublishUtilities.d.ts.map