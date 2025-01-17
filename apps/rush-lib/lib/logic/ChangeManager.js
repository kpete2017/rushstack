"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangeManager = void 0;
const PublishUtilities_1 = require("./PublishUtilities");
const ChangeFiles_1 = require("./ChangeFiles");
const PrereleaseToken_1 = require("./PrereleaseToken");
const ChangelogGenerator_1 = require("./ChangelogGenerator");
/**
 * The class manages change files and controls how changes logged by change files
 * can be applied to package.json and change logs.
 */
class ChangeManager {
    constructor(rushConfiguration, lockStepProjectsToExclude) {
        this._rushConfiguration = rushConfiguration;
        this._lockStepProjectsToExclude = lockStepProjectsToExclude;
    }
    /**
     * Load changes from change files
     * @param changesPath - location of change files
     * @param prereleaseToken - prerelease token
     * @param includeCommitDetails - whether commit details need to be included in changes
     */
    load(changesPath, prereleaseToken = new PrereleaseToken_1.PrereleaseToken(), includeCommitDetails = false) {
        this._allPackages = this._rushConfiguration.projectsByName;
        this._prereleaseToken = prereleaseToken;
        this._changeFiles = new ChangeFiles_1.ChangeFiles(changesPath);
        this._allChanges = PublishUtilities_1.PublishUtilities.findChangeRequests(this._allPackages, this._rushConfiguration, this._changeFiles, includeCommitDetails, this._prereleaseToken, this._lockStepProjectsToExclude);
        this._orderedChanges = PublishUtilities_1.PublishUtilities.sortChangeRequests(this._allChanges);
    }
    hasChanges() {
        return this._orderedChanges && this._orderedChanges.length > 0;
    }
    get changes() {
        return this._orderedChanges;
    }
    get allPackages() {
        return this._allPackages;
    }
    validateChanges(versionConfig) {
        Object.keys(this._allChanges).filter((key) => {
            const projectInfo = this._rushConfiguration.getProjectByName(key);
            if (projectInfo) {
                if (projectInfo.versionPolicy) {
                    const changeInfo = this._allChanges[key];
                    projectInfo.versionPolicy.validate(changeInfo.newVersion, key);
                }
            }
        });
    }
    /**
     * Apply changes to package.json
     * @param shouldCommit - If the value is true, package.json will be updated.
     * If the value is false, package.json and change logs will not be updated. It will only do a dry-run.
     */
    apply(shouldCommit) {
        if (!this.hasChanges()) {
            return;
        }
        // Apply all changes to package.json files.
        const updatedPackages = PublishUtilities_1.PublishUtilities.updatePackages(this._allChanges, this._allPackages, this._rushConfiguration, shouldCommit, this._prereleaseToken, this._lockStepProjectsToExclude);
        return updatedPackages;
    }
    updateChangelog(shouldCommit) {
        // Do not update changelog or delete the change files for prerelease.
        // Save them for the official release.
        if (!this._prereleaseToken.hasValue) {
            // Update changelogs.
            const updatedChangelogs = ChangelogGenerator_1.ChangelogGenerator.updateChangelogs(this._allChanges, this._allPackages, this._rushConfiguration, shouldCommit);
            // Remove the change request files only if "-a" was provided.
            this._changeFiles.deleteAll(shouldCommit, updatedChangelogs);
        }
    }
}
exports.ChangeManager = ChangeManager;
//# sourceMappingURL=ChangeManager.js.map