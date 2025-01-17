import { RushConfigurationProject } from '../api/RushConfigurationProject';
import { Git } from './Git';
export declare class PublishGit {
    private readonly _targetBranch;
    private readonly _gitPath;
    constructor(git: Git, targetBranch: string | undefined);
    checkout(branchName: string | undefined, createBranch?: boolean): void;
    merge(branchName: string, verify?: boolean): void;
    deleteBranch(branchName: string | undefined, hasRemote?: boolean, verify?: boolean): void;
    pull(verify?: boolean): void;
    fetch(): void;
    addChanges(pathspec?: string, workingDirectory?: string): void;
    addTag(shouldExecute: boolean, packageName: string, packageVersion: string, commitId: string | undefined): void;
    hasTag(packageConfig: RushConfigurationProject): boolean;
    commit(commitMessage: string, verify?: boolean): void;
    push(branchName: string | undefined, verify?: boolean): void;
}
//# sourceMappingURL=PublishGit.d.ts.map