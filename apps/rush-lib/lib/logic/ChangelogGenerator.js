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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangelogGenerator = void 0;
const path = __importStar(require("path"));
const semver = __importStar(require("semver"));
const node_core_library_1 = require("@rushstack/node-core-library");
const PublishUtilities_1 = require("./PublishUtilities");
const ChangeManagement_1 = require("../api/ChangeManagement");
const CHANGELOG_JSON = 'CHANGELOG.json';
const CHANGELOG_MD = 'CHANGELOG.md';
const EOL = '\n';
class ChangelogGenerator {
    /**
     * Updates the appropriate changelogs with the given changes.
     */
    static updateChangelogs(allChanges, allProjects, rushConfiguration, shouldCommit) {
        const updatedChangeLogs = [];
        for (const packageName in allChanges) {
            if (allChanges.hasOwnProperty(packageName)) {
                const project = allProjects.get(packageName);
                if (project && ChangelogGenerator._shouldUpdateChangeLog(project, allChanges)) {
                    const changeLog = ChangelogGenerator.updateIndividualChangelog(allChanges[packageName], project.projectFolder, shouldCommit, rushConfiguration, project.versionPolicy && project.versionPolicy.isLockstepped, project.isMainProject);
                    if (changeLog) {
                        updatedChangeLogs.push(changeLog);
                    }
                }
            }
        }
        return updatedChangeLogs;
    }
    /**
     * Fully regenerate the markdown files based on the current json files.
     */
    static regenerateChangelogs(allProjects, rushConfiguration) {
        allProjects.forEach((project) => {
            const markdownPath = path.resolve(project.projectFolder, CHANGELOG_MD);
            const markdownJSONPath = path.resolve(project.projectFolder, CHANGELOG_JSON);
            if (node_core_library_1.FileSystem.exists(markdownPath)) {
                console.log('Found: ' + markdownPath);
                if (!node_core_library_1.FileSystem.exists(markdownJSONPath)) {
                    throw new Error('A CHANGELOG.md without json: ' + markdownPath);
                }
                const changelog = ChangelogGenerator._getChangelog(project.packageName, project.projectFolder);
                const isLockstepped = !!project.versionPolicy && project.versionPolicy.isLockstepped;
                node_core_library_1.FileSystem.writeFile(path.join(project.projectFolder, CHANGELOG_MD), ChangelogGenerator._translateToMarkdown(changelog, rushConfiguration, isLockstepped));
            }
        });
    }
    /**
     * Updates an individual changelog for a single project.
     */
    static updateIndividualChangelog(change, projectFolder, shouldCommit, rushConfiguration, isLockstepped = false, isMain = true) {
        if (isLockstepped && !isMain) {
            // Early return if the project is lockstepped and does not host change logs
            return undefined;
        }
        const changelog = ChangelogGenerator._getChangelog(change.packageName, projectFolder);
        if (!changelog.entries.some((entry) => entry.version === change.newVersion)) {
            const changelogEntry = {
                version: change.newVersion,
                tag: PublishUtilities_1.PublishUtilities.createTagname(change.packageName, change.newVersion),
                date: new Date().toUTCString(),
                comments: {}
            };
            change.changes.forEach((individualChange) => {
                if (individualChange.comment) {
                    // Initialize the comments array only as necessary.
                    const changeTypeString = ChangeManagement_1.ChangeType[individualChange.changeType];
                    changelogEntry.comments[changeTypeString] = changelogEntry.comments[changeTypeString] || [];
                    const comments = changelogEntry.comments[changeTypeString];
                    const changeLogComment = {
                        comment: individualChange.comment
                    };
                    if (individualChange.author) {
                        changeLogComment.author = individualChange.author;
                    }
                    if (individualChange.commit) {
                        changeLogComment.commit = individualChange.commit;
                    }
                    comments.push(changeLogComment);
                }
            });
            // Add the changelog entry to the start of the list.
            changelog.entries.unshift(changelogEntry);
            const changelogFilename = path.join(projectFolder, CHANGELOG_JSON);
            console.log(`${EOL}* ${shouldCommit ? 'APPLYING' : 'DRYRUN'}: ` +
                `Changelog update for "${change.packageName}@${change.newVersion}".`);
            if (shouldCommit) {
                // Write markdown transform.
                node_core_library_1.JsonFile.save(changelog, changelogFilename);
                node_core_library_1.FileSystem.writeFile(path.join(projectFolder, CHANGELOG_MD), ChangelogGenerator._translateToMarkdown(changelog, rushConfiguration, isLockstepped));
            }
            return changelog;
        }
        // change log not updated.
        return undefined;
    }
    /**
     * Loads the changelog json from disk, or creates a new one if there isn't one.
     */
    static _getChangelog(packageName, projectFolder) {
        const changelogFilename = path.join(projectFolder, CHANGELOG_JSON);
        let changelog = undefined;
        // Try to read the existing changelog.
        if (node_core_library_1.FileSystem.exists(changelogFilename)) {
            changelog = node_core_library_1.JsonFile.load(changelogFilename);
        }
        if (!changelog) {
            changelog = {
                name: packageName,
                entries: []
            };
        }
        else {
            // Force the changelog name to be same as package name.
            // In case the package has been renamed but change log name is not updated.
            changelog.name = packageName;
        }
        return changelog;
    }
    /**
     * Translates the given changelog json object into a markdown string.
     */
    static _translateToMarkdown(changelog, rushConfiguration, isLockstepped = false) {
        let markdown = [
            `# Change Log - ${changelog.name}`,
            '',
            `This log was last generated on ${new Date().toUTCString()} and should not be manually modified.`,
            '',
            ''
        ].join(EOL);
        changelog.entries.forEach((entry, index) => {
            markdown += `## ${entry.version}${EOL}`;
            if (entry.date) {
                markdown += `${entry.date}${EOL}`;
            }
            markdown += EOL;
            let comments = '';
            comments += ChangelogGenerator._getChangeComments('Breaking changes', entry.comments.major);
            comments += ChangelogGenerator._getChangeComments('Minor changes', entry.comments.minor);
            comments += ChangelogGenerator._getChangeComments('Patches', entry.comments.patch);
            if (isLockstepped) {
                // In lockstepped projects, all changes are of type ChangeType.none.
                comments += ChangelogGenerator._getChangeComments('Updates', entry.comments.none);
            }
            if (rushConfiguration.hotfixChangeEnabled) {
                comments += ChangelogGenerator._getChangeComments('Hotfixes', entry.comments.hotfix);
            }
            if (!comments) {
                markdown +=
                    (changelog.entries.length === index + 1 ? '_Initial release_' : '_Version update only_') +
                        EOL +
                        EOL;
            }
            else {
                markdown += comments;
            }
        });
        return markdown;
    }
    /**
     * Helper to return the comments string to be appends to the markdown content.
     */
    static _getChangeComments(title, commentsArray) {
        let comments = '';
        if (commentsArray) {
            comments = `### ${title}${EOL + EOL}`;
            commentsArray.forEach((comment) => {
                comments += `- ${comment.comment}${EOL}`;
            });
            comments += EOL;
        }
        return comments;
    }
    /**
     * Changelogs should only be generated for publishable projects.
     * Do not update changelog or delete the change files for prerelease. Save them for the official release.
     * Unless the package is a hotfix, in which case do delete the change files.
     *
     * @param project
     * @param allChanges
     */
    static _shouldUpdateChangeLog(project, allChanges) {
        return (project.shouldPublish &&
            (!semver.prerelease(project.packageJson.version) ||
                allChanges[project.packageName].changeType === ChangeManagement_1.ChangeType.hotfix));
    }
}
exports.ChangelogGenerator = ChangelogGenerator;
//# sourceMappingURL=ChangelogGenerator.js.map