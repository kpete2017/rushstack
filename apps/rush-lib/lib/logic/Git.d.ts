import gitInfo = require('git-repo-info');
import { RushConfiguration } from '../api/RushConfiguration';
export declare class Git {
    private readonly _rushConfiguration;
    private _checkedGitPath;
    private _gitPath;
    private _checkedGitInfo;
    private _gitInfo;
    private _gitEmailResult;
    constructor(rushConfiguration: RushConfiguration);
    /**
     * Returns the path to the Git binary if found. Otherwise, return undefined.
     */
    get gitPath(): string | undefined;
    getGitPathOrThrow(): string;
    /**
     * Returns true if the Git binary can be found.
     */
    isGitPresent(): boolean;
    /**
     * Returns true if the Git binary was found and the current path is under a Git working tree.
     * @param repoInfo - If provided, do the check based on this Git repo info. If not provided,
     * the result of `this.getGitInfo()` is used.
     */
    isPathUnderGitWorkingTree(repoInfo?: gitInfo.GitRepoInfo): boolean;
    /**
     * If a Git email address is configured and is nonempty, this returns it.
     * Otherwise, undefined is returned.
     */
    tryGetGitEmail(): string | undefined;
    /**
     * If a Git email address is configured and is nonempty, this returns it.
     * Otherwise, configuration instructions are printed to the console,
     * and AlreadyReportedError is thrown.
     */
    getGitEmail(): string;
    /**
     * Get the folder where Git hooks should go for the current working tree.
     * Returns undefined if the current path is not under a Git working tree.
     */
    getHooksFolder(): string | undefined;
    /**
     * Get information about the current Git working tree.
     * Returns undefined if the current path is not under a Git working tree.
     */
    getGitInfo(): Readonly<gitInfo.GitRepoInfo> | undefined;
    getRepositoryRootPath(): string | undefined;
    getChangedFolders(targetBranch: string, shouldFetch?: boolean): string[] | undefined;
    /**
     * @param pathPrefix - An optional path prefix "git diff"s should be filtered by.
     * @returns
     * An array of paths of repo-root-relative paths of files that are different from
     * those in the provided {@param targetBranch}. If a {@param pathPrefix} is provided,
     * this function only returns results under the that path.
     */
    getChangedFiles(targetBranch: string, skipFetch?: boolean, pathPrefix?: string): string[];
    /**
     * Gets the remote default branch that maps to the provided repository url.
     * This method is used by 'Rush change' to find the default remote branch to compare against.
     * If repository url is not provided or if there is no match, returns the default remote's
     * default branch 'origin/master'.
     * If there are more than one matches, returns the first remote's default branch.
     *
     * @param rushConfiguration - rush configuration
     */
    getRemoteDefaultBranch(): string;
    hasUncommittedChanges(): boolean;
    /**
     * The list of files changed but not committed
     */
    getUncommittedChanges(): ReadonlyArray<string>;
    /**
     * Git remotes can use different URL syntaxes; this converts them all to a normalized HTTPS
     * representation for matching purposes.  IF THE INPUT IS NOT ALREADY HTTPS, THE OUTPUT IS
     * NOT NECESSARILY A VALID GIT URL.
     *
     * @example
     * `git@github.com:ExampleOrg/ExampleProject.git` --> `https://github.com/ExampleOrg/ExampleProject`
     */
    static normalizeGitUrlForComparison(gitUrl: string): string;
    private _tryGetGitEmail;
    private _getUntrackedChanges;
    private _getDiffOnHEAD;
    private _tryFetchRemoteBranch;
    private _fetchRemoteBranch;
}
//# sourceMappingURL=Git.d.ts.map