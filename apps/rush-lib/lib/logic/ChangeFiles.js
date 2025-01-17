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
exports.ChangeFiles = void 0;
const path = __importStar(require("path"));
const os_1 = require("os");
const node_core_library_1 = require("@rushstack/node-core-library");
const Utilities_1 = require("../utilities/Utilities");
const glob = node_core_library_1.Import.lazy('glob', require);
/**
 * This class represents the collection of change files existing in the repo and provides operations
 * for those change files.
 */
class ChangeFiles {
    constructor(changesPath) {
        this._changesPath = changesPath;
    }
    /**
     * Validate if the newly added change files match the changed packages.
     */
    static validate(newChangeFilePaths, changedPackages, rushConfiguration) {
        const schema = node_core_library_1.JsonSchema.fromFile(path.resolve(__dirname, '..', 'schemas', 'change-file.schema.json'));
        const projectsWithChangeDescriptions = new Set();
        newChangeFilePaths.forEach((filePath) => {
            console.log(`Found change file: ${filePath}`);
            const changeFile = node_core_library_1.JsonFile.loadAndValidate(filePath, schema);
            if (rushConfiguration.hotfixChangeEnabled) {
                if (changeFile && changeFile.changes) {
                    for (const change of changeFile.changes) {
                        if (change.type !== 'none' && change.type !== 'hotfix') {
                            throw new Error(`Change file ${filePath} specifies a type of '${change.type}' ` +
                                `but only 'hotfix' and 'none' change types may be used in a branch with 'hotfixChangeEnabled'.`);
                        }
                    }
                }
            }
            if (changeFile && changeFile.changes) {
                changeFile.changes.forEach((change) => projectsWithChangeDescriptions.add(change.packageName));
            }
            else {
                throw new Error(`Invalid change file: ${filePath}`);
            }
        });
        const projectsMissingChangeDescriptions = new Set(changedPackages);
        projectsWithChangeDescriptions.forEach((name) => projectsMissingChangeDescriptions.delete(name));
        if (projectsMissingChangeDescriptions.size > 0) {
            const projectsMissingChangeDescriptionsArray = [];
            projectsMissingChangeDescriptions.forEach((name) => projectsMissingChangeDescriptionsArray.push(name));
            throw new Error([
                'The following projects have been changed and require change descriptions, but change descriptions were not ' +
                    'detected for them:',
                ...projectsMissingChangeDescriptionsArray.map((projectName) => `- ${projectName}`),
                'To resolve this error, run "rush change." This will generate change description files that must be ' +
                    'committed to source control.'
            ].join(os_1.EOL));
        }
    }
    static getChangeComments(newChangeFilePaths) {
        const changes = new Map();
        newChangeFilePaths.forEach((filePath) => {
            console.log(`Found change file: ${filePath}`);
            const changeRequest = node_core_library_1.JsonFile.load(filePath);
            if (changeRequest && changeRequest.changes) {
                changeRequest.changes.forEach((change) => {
                    if (!changes.get(change.packageName)) {
                        changes.set(change.packageName, []);
                    }
                    if (change.comment && change.comment.length) {
                        changes.get(change.packageName).push(change.comment);
                    }
                });
            }
            else {
                throw new Error(`Invalid change file: ${filePath}`);
            }
        });
        return changes;
    }
    /**
     * Get the array of absolute paths of change files.
     */
    getFiles() {
        if (!this._files) {
            this._files = glob.sync(`${this._changesPath}/**/*.json`) || [];
        }
        return this._files;
    }
    /**
     * Get the path of changes folder.
     */
    getChangesPath() {
        return this._changesPath;
    }
    /**
     * Delete all change files
     */
    deleteAll(shouldDelete, updatedChangelogs) {
        if (updatedChangelogs) {
            // Skip changes files if the package's change log is not updated.
            const packagesToInclude = new Set();
            updatedChangelogs.forEach((changelog) => {
                packagesToInclude.add(changelog.name);
            });
            const filesToDelete = this.getFiles().filter((filePath) => {
                const changeRequest = node_core_library_1.JsonFile.load(filePath);
                for (const changeInfo of changeRequest.changes) {
                    if (!packagesToInclude.has(changeInfo.packageName)) {
                        return false;
                    }
                }
                return true;
            });
            return this._deleteFiles(filesToDelete, shouldDelete);
        }
        else {
            // Delete all change files.
            return this._deleteFiles(this.getFiles(), shouldDelete);
        }
    }
    _deleteFiles(files, shouldDelete) {
        if (files.length) {
            console.log(`${os_1.EOL}* ${shouldDelete ? 'DELETING:' : 'DRYRUN: Deleting'} ${files.length} change file(s).`);
            for (const filePath of files) {
                console.log(` - ${filePath}`);
                if (shouldDelete) {
                    Utilities_1.Utilities.deleteFile(filePath);
                }
            }
        }
        return files.length;
    }
}
exports.ChangeFiles = ChangeFiles;
//# sourceMappingURL=ChangeFiles.js.map