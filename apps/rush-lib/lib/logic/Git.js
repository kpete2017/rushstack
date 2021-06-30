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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Git = void 0;
const gitInfo = require("git-repo-info");
const os = __importStar(require("os"));
const path = __importStar(require("path"));
const url = __importStar(require("url"));
const safe_1 = __importDefault(require("colors/safe"));
const node_core_library_1 = require("@rushstack/node-core-library");
const Utilities_1 = require("../utilities/Utilities");
const GitEmailPolicy_1 = require("./policy/GitEmailPolicy");
const EnvironmentConfiguration_1 = require("../api/EnvironmentConfiguration");
class Git {
    constructor(rushConfiguration) {
        this._checkedGitPath = false;
        this._checkedGitInfo = false;
        this._gitEmailResult = undefined;
        this._rushConfiguration = rushConfiguration;
    }
    /**
     * Returns the path to the Git binary if found. Otherwise, return undefined.
     */
    get gitPath() {
        if (!this._checkedGitPath) {
            this._gitPath = EnvironmentConfiguration_1.EnvironmentConfiguration.gitBinaryPath || node_core_library_1.Executable.tryResolve('git');
            this._checkedGitPath = true;
        }
        return this._gitPath;
    }
    getGitPathOrThrow() {
        const gitPath = this.gitPath;
        if (!gitPath) {
            throw new Error('Git is not present');
        }
        else {
            return gitPath;
        }
    }
    /**
     * Returns true if the Git binary can be found.
     */
    isGitPresent() {
        return !!this.gitPath;
    }
    /**
     * Returns true if the Git binary was found and the current path is under a Git working tree.
     * @param repoInfo - If provided, do the check based on this Git repo info. If not provided,
     * the result of `this.getGitInfo()` is used.
     */
    isPathUnderGitWorkingTree(repoInfo) {
        if (this.isGitPresent()) {
            // Do we even have a Git binary?
            if (!repoInfo) {
                repoInfo = this.getGitInfo();
            }
            return !!(repoInfo && repoInfo.sha);
        }
        else {
            return false;
        }
    }
    /**
     * If a Git email address is configured and is nonempty, this returns it.
     * Otherwise, undefined is returned.
     */
    tryGetGitEmail() {
        const emailResult = this._tryGetGitEmail();
        if (emailResult.result !== undefined && emailResult.result.length > 0) {
            return emailResult.result;
        }
        return undefined;
    }
    /**
     * If a Git email address is configured and is nonempty, this returns it.
     * Otherwise, configuration instructions are printed to the console,
     * and AlreadyReportedError is thrown.
     */
    getGitEmail() {
        // Determine the user's account
        // Ex: "bob@example.com"
        const emailResult = this._tryGetGitEmail();
        if (emailResult.error) {
            console.log([
                `Error: ${emailResult.error.message}`,
                'Unable to determine your Git configuration using this command:',
                '',
                '    git config user.email',
                ''
            ].join(os.EOL));
            throw new node_core_library_1.AlreadyReportedError();
        }
        if (emailResult.result === undefined || emailResult.result.length === 0) {
            console.log([
                'This operation requires that a Git email be specified.',
                '',
                `If you didn't configure your email yet, try something like this:`,
                '',
                ...GitEmailPolicy_1.GitEmailPolicy.getEmailExampleLines(this._rushConfiguration),
                ''
            ].join(os.EOL));
            throw new node_core_library_1.AlreadyReportedError();
        }
        return emailResult.result;
    }
    /**
     * Get the folder where Git hooks should go for the current working tree.
     * Returns undefined if the current path is not under a Git working tree.
     */
    getHooksFolder() {
        const repoInfo = this.getGitInfo();
        if (repoInfo && repoInfo.worktreeGitDir) {
            return path.join(repoInfo.worktreeGitDir, 'hooks');
        }
        return undefined;
    }
    /**
     * Get information about the current Git working tree.
     * Returns undefined if the current path is not under a Git working tree.
     */
    getGitInfo() {
        if (!this._checkedGitInfo) {
            let repoInfo;
            try {
                // gitInfo() shouldn't usually throw, but wrapping in a try/catch just in case
                repoInfo = gitInfo();
            }
            catch (ex) {
                // if there's an error, assume we're not in a Git working tree
            }
            if (repoInfo && this.isPathUnderGitWorkingTree(repoInfo)) {
                this._gitInfo = repoInfo;
            }
            this._checkedGitInfo = true;
        }
        return this._gitInfo;
    }
    getRepositoryRootPath() {
        const gitPath = this.getGitPathOrThrow();
        const output = node_core_library_1.Executable.spawnSync(gitPath, [
            'rev-parse',
            '--show-toplevel'
        ]);
        if (output.status !== 0) {
            return undefined;
        }
        else {
            return output.stdout.trim();
        }
    }
    getChangedFolders(targetBranch, shouldFetch = false) {
        if (shouldFetch) {
            this._fetchRemoteBranch(targetBranch);
        }
        const gitPath = this.getGitPathOrThrow();
        const output = Utilities_1.Utilities.executeCommandAndCaptureOutput(gitPath, ['diff', `${targetBranch}...`, '--dirstat=files,0'], this._rushConfiguration.rushJsonFolder);
        const lines = output.split('\n');
        const result = [];
        for (const line of lines) {
            if (line) {
                const delimiterIndex = line.indexOf('%');
                if (delimiterIndex > 0 && delimiterIndex + 1 < line.length) {
                    result.push(line.substring(delimiterIndex + 1).trim());
                }
            }
        }
        return result;
    }
    /**
     * @param pathPrefix - An optional path prefix "git diff"s should be filtered by.
     * @returns
     * An array of paths of repo-root-relative paths of files that are different from
     * those in the provided {@param targetBranch}. If a {@param pathPrefix} is provided,
     * this function only returns results under the that path.
     */
    getChangedFiles(targetBranch, skipFetch = false, pathPrefix) {
        if (!skipFetch) {
            this._fetchRemoteBranch(targetBranch);
        }
        const gitPath = this.getGitPathOrThrow();
        const output = Utilities_1.Utilities.executeCommandAndCaptureOutput(gitPath, ['diff', `${targetBranch}...`, '--name-only', '--no-renames', '--diff-filter=A'], this._rushConfiguration.rushJsonFolder);
        return output
            .split('\n')
            .map((line) => {
            if (line) {
                const trimmedLine = line.trim();
                if (!pathPrefix || node_core_library_1.Path.isUnderOrEqual(trimmedLine, pathPrefix)) {
                    return trimmedLine;
                }
            }
            else {
                return undefined;
            }
        })
            .filter((line) => {
            return line && line.length > 0;
        });
    }
    /**
     * Gets the remote default branch that maps to the provided repository url.
     * This method is used by 'Rush change' to find the default remote branch to compare against.
     * If repository url is not provided or if there is no match, returns the default remote's
     * default branch 'origin/master'.
     * If there are more than one matches, returns the first remote's default branch.
     *
     * @param rushConfiguration - rush configuration
     */
    getRemoteDefaultBranch() {
        const repositoryUrl = this._rushConfiguration.repositoryUrl;
        if (repositoryUrl) {
            const gitPath = this.getGitPathOrThrow();
            const output = Utilities_1.Utilities.executeCommandAndCaptureOutput(gitPath, ['remote'], this._rushConfiguration.rushJsonFolder).trim();
            // Apply toUpperCase() for a case-insensitive comparison
            const normalizedRepositoryUrl = Git.normalizeGitUrlForComparison(repositoryUrl).toUpperCase();
            const matchingRemotes = output.split('\n').filter((remoteName) => {
                if (remoteName) {
                    const remoteUrl = Utilities_1.Utilities.executeCommandAndCaptureOutput(gitPath, ['remote', 'get-url', remoteName], this._rushConfiguration.rushJsonFolder).trim();
                    if (!remoteUrl) {
                        return false;
                    }
                    // Also apply toUpperCase() for a case-insensitive comparison
                    const normalizedRemoteUrl = Git.normalizeGitUrlForComparison(remoteUrl).toUpperCase();
                    if (normalizedRemoteUrl === normalizedRepositoryUrl) {
                        return true;
                    }
                }
                return false;
            });
            if (matchingRemotes.length > 0) {
                if (matchingRemotes.length > 1) {
                    console.log(`More than one git remote matches the repository URL. Using the first remote (${matchingRemotes[0]}).`);
                }
                return `${matchingRemotes[0]}/${this._rushConfiguration.repositoryDefaultBranch}`;
            }
            else {
                console.log(safe_1.default.yellow(`Unable to find a git remote matching the repository URL (${repositoryUrl}). ` +
                    'Detected changes are likely to be incorrect.'));
                return this._rushConfiguration.repositoryDefaultFullyQualifiedRemoteBranch;
            }
        }
        else {
            console.log(safe_1.default.yellow('A git remote URL has not been specified in rush.json. Setting the baseline remote URL is recommended.'));
            return this._rushConfiguration.repositoryDefaultFullyQualifiedRemoteBranch;
        }
    }
    hasUncommittedChanges() {
        return this.getUncommittedChanges().length > 0;
    }
    /**
     * The list of files changed but not committed
     */
    getUncommittedChanges() {
        const changes = [];
        changes.push(...this._getUntrackedChanges());
        changes.push(...this._getDiffOnHEAD());
        return changes.filter((change) => {
            return change.trim().length > 0;
        });
    }
    /**
     * Git remotes can use different URL syntaxes; this converts them all to a normalized HTTPS
     * representation for matching purposes.  IF THE INPUT IS NOT ALREADY HTTPS, THE OUTPUT IS
     * NOT NECESSARILY A VALID GIT URL.
     *
     * @example
     * `git@github.com:ExampleOrg/ExampleProject.git` --> `https://github.com/ExampleOrg/ExampleProject`
     */
    static normalizeGitUrlForComparison(gitUrl) {
        // Git URL formats are documented here: https://www.git-scm.com/docs/git-clone#_git_urls
        let result = gitUrl.trim();
        // [user@]host.xz:path/to/repo.git/
        // "This syntax is only recognized if there are no slashes before the first colon. This helps
        // differentiate a local path that contains a colon."
        //
        // Match patterns like this:
        //   user@host.ext:path/to/repo
        //   host.ext:path/to/repo
        //   localhost:/~user/path/to/repo
        //
        // But not:
        //   http://blah
        //   c:/windows/path.txt
        //
        const scpLikeSyntaxRegExp = /^(?:[^@:\/]+\@)?([^:\/]{2,})\:((?!\/\/).+)$/;
        // Example: "user@host.ext:path/to/repo"
        const scpLikeSyntaxMatch = scpLikeSyntaxRegExp.exec(gitUrl);
        if (scpLikeSyntaxMatch) {
            // Example: "host.ext"
            const host = scpLikeSyntaxMatch[1];
            // Example: "path/to/repo"
            const path = scpLikeSyntaxMatch[2];
            if (path.startsWith('/')) {
                result = `https://${host}${path}`;
            }
            else {
                result = `https://${host}/${path}`;
            }
        }
        const parsedUrl = url.parse(result);
        // Only convert recognized schemes
        switch (parsedUrl.protocol) {
            case 'http:':
            case 'https:':
            case 'ssh:':
            case 'ftp:':
            case 'ftps:':
            case 'git:':
            case 'git+http:':
            case 'git+https:':
            case 'git+ssh:':
            case 'git+ftp:':
            case 'git+ftps:':
                // Assemble the parts we want:
                result = `https://${parsedUrl.host}${parsedUrl.pathname}`;
                break;
        }
        // Trim ".git" or ".git/" from the end
        result = result.replace(/.git\/?$/, '');
        return result;
    }
    _tryGetGitEmail() {
        if (this._gitEmailResult === undefined) {
            const gitPath = this.getGitPathOrThrow();
            try {
                this._gitEmailResult = {
                    result: Utilities_1.Utilities.executeCommandAndCaptureOutput(gitPath, ['config', 'user.email'], this._rushConfiguration.rushJsonFolder).trim()
                };
            }
            catch (e) {
                this._gitEmailResult = {
                    error: e
                };
            }
        }
        return this._gitEmailResult;
    }
    _getUntrackedChanges() {
        const gitPath = this.getGitPathOrThrow();
        const output = Utilities_1.Utilities.executeCommandAndCaptureOutput(gitPath, ['ls-files', '--exclude-standard', '--others'], this._rushConfiguration.rushJsonFolder);
        return output.trim().split('\n');
    }
    _getDiffOnHEAD() {
        const gitPath = this.getGitPathOrThrow();
        const output = Utilities_1.Utilities.executeCommandAndCaptureOutput(gitPath, ['diff', 'HEAD', '--name-only'], this._rushConfiguration.rushJsonFolder);
        return output.trim().split('\n');
    }
    _tryFetchRemoteBranch(remoteBranchName) {
        const firstSlashIndex = remoteBranchName.indexOf('/');
        if (firstSlashIndex === -1) {
            throw new Error(`Unexpected git remote branch format: ${remoteBranchName}. ` +
                'Expected branch to be in the <remote>/<branch name> format.');
        }
        const remoteName = remoteBranchName.substr(0, firstSlashIndex);
        const branchName = remoteBranchName.substr(firstSlashIndex + 1);
        const gitPath = this.getGitPathOrThrow();
        const spawnResult = node_core_library_1.Executable.spawnSync(gitPath, ['fetch', remoteName, branchName], {
            stdio: 'ignore'
        });
        return spawnResult.status === 0;
    }
    _fetchRemoteBranch(remoteBranchName) {
        console.log(`Checking for updates to ${remoteBranchName}...`);
        const fetchResult = this._tryFetchRemoteBranch(remoteBranchName);
        if (!fetchResult) {
            console.log(safe_1.default.yellow(`Error fetching git remote branch ${remoteBranchName}. Detected changed files may be incorrect.`));
        }
    }
}
exports.Git = Git;
//# sourceMappingURL=Git.js.map