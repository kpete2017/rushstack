"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublishGit = void 0;
const PublishUtilities_1 = require("./PublishUtilities");
const Utilities_1 = require("../utilities/Utilities");
const DUMMY_BRANCH_NAME = '-branch-name-';
class PublishGit {
    constructor(git, targetBranch) {
        this._targetBranch = targetBranch;
        this._gitPath = git.getGitPathOrThrow();
    }
    checkout(branchName, createBranch = false) {
        const params = ['checkout'];
        if (createBranch) {
            params.push('-b');
        }
        params.push(branchName || DUMMY_BRANCH_NAME);
        PublishUtilities_1.PublishUtilities.execCommand(!!this._targetBranch, this._gitPath, params);
    }
    merge(branchName, verify = false) {
        PublishUtilities_1.PublishUtilities.execCommand(!!this._targetBranch, this._gitPath, [
            'merge',
            branchName,
            '--no-edit',
            ...(verify ? [] : ['--no-verify'])
        ]);
    }
    deleteBranch(branchName, hasRemote = true, verify = false) {
        if (!branchName) {
            branchName = DUMMY_BRANCH_NAME;
        }
        PublishUtilities_1.PublishUtilities.execCommand(!!this._targetBranch, this._gitPath, ['branch', '-d', branchName]);
        if (hasRemote) {
            PublishUtilities_1.PublishUtilities.execCommand(!!this._targetBranch, this._gitPath, [
                'push',
                'origin',
                '--delete',
                branchName,
                ...(verify ? [] : ['--no-verify'])
            ]);
        }
    }
    pull(verify = false) {
        const params = ['pull', 'origin'];
        if (this._targetBranch) {
            params.push(this._targetBranch);
        }
        if (!verify) {
            params.push('--no-verify');
        }
        PublishUtilities_1.PublishUtilities.execCommand(!!this._targetBranch, this._gitPath, params);
    }
    fetch() {
        PublishUtilities_1.PublishUtilities.execCommand(!!this._targetBranch, this._gitPath, ['fetch', 'origin']);
    }
    addChanges(pathspec, workingDirectory) {
        const files = pathspec ? pathspec : '.';
        PublishUtilities_1.PublishUtilities.execCommand(!!this._targetBranch, this._gitPath, ['add', files], workingDirectory ? workingDirectory : process.cwd());
    }
    addTag(shouldExecute, packageName, packageVersion, commitId) {
        // Tagging only happens if we're publishing to real NPM and committing to git.
        const tagName = PublishUtilities_1.PublishUtilities.createTagname(packageName, packageVersion);
        PublishUtilities_1.PublishUtilities.execCommand(!!this._targetBranch && shouldExecute, this._gitPath, [
            'tag',
            '-a',
            tagName,
            '-m',
            `${packageName} v${packageVersion}`,
            ...(commitId ? [commitId] : [])
        ]);
    }
    hasTag(packageConfig) {
        const tagName = PublishUtilities_1.PublishUtilities.createTagname(packageConfig.packageName, packageConfig.packageJson.version);
        const tagOutput = Utilities_1.Utilities.executeCommandAndCaptureOutput(this._gitPath, ['tag', '-l', tagName], packageConfig.projectFolder, PublishUtilities_1.PublishUtilities.getEnvArgs(), true).replace(/(\r\n|\n|\r)/gm, '');
        return tagOutput === tagName;
    }
    commit(commitMessage, verify = false) {
        PublishUtilities_1.PublishUtilities.execCommand(!!this._targetBranch, this._gitPath, [
            'commit',
            '-m',
            commitMessage,
            ...(verify ? [] : ['--no-verify'])
        ]);
    }
    push(branchName, verify = false) {
        PublishUtilities_1.PublishUtilities.execCommand(!!this._targetBranch, this._gitPath, 
        // We append "--no-verify" to prevent Git hooks from running.  For example, people may
        // want to invoke "rush change -v" as a pre-push hook.
        [
            'push',
            'origin',
            `HEAD:${branchName || DUMMY_BRANCH_NAME}`,
            '--follow-tags',
            '--verbose',
            ...(verify ? [] : ['--no-verify'])
        ]);
    }
}
exports.PublishGit = PublishGit;
//# sourceMappingURL=PublishGit.js.map