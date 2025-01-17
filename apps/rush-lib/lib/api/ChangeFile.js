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
exports.ChangeFile = void 0;
const path = __importStar(require("path"));
const node_core_library_1 = require("@rushstack/node-core-library");
const Git_1 = require("../logic/Git");
/**
 * This class represents a single change file.
 */
class ChangeFile {
    /**
     * @internal
     */
    constructor(changeFileData, rushConfiguration) {
        if (!changeFileData) {
            throw new Error(`changeFileData does not have a value`);
        }
        if (!rushConfiguration) {
            throw new Error(`rushConfiguration does not have a value`);
        }
        this._changeFileData = changeFileData;
        this._rushConfiguration = rushConfiguration;
    }
    /**
     * Adds a change entry into the change file
     * @param data - change information
     */
    addChange(data) {
        this._changeFileData.changes.push(data);
    }
    /**
     * Gets all the change entries about the specified package from the change file.
     * @param packageName - package name
     */
    getChanges(packageName) {
        const changes = [];
        for (const info of this._changeFileData.changes) {
            if (info.packageName === packageName) {
                changes.push(info);
            }
        }
        return changes;
    }
    /**
     * Writes the change file to disk in sync mode.
     * Returns the file path.
     * @returns the path to the file that was written (based on generatePath())
     */
    writeSync() {
        const filePath = this.generatePath();
        node_core_library_1.JsonFile.save(this._changeFileData, filePath, {
            ensureFolderExists: true
        });
        return filePath;
    }
    /**
     * Generates a file path for storing the change file to disk.
     * Note that this value may change if called twice in a row,
     * as it is partially based on the current date/time.
     */
    generatePath() {
        let branch = undefined;
        const git = new Git_1.Git(this._rushConfiguration);
        const repoInfo = git.getGitInfo();
        branch = repoInfo && repoInfo.branch;
        if (!branch) {
            console.log('Could not automatically detect git branch name, using timestamp instead.');
        }
        // example filename: yourbranchname_2017-05-01-20-20.json
        const filename = branch
            ? this._escapeFilename(`${branch}_${this._getTimestamp()}.json`)
            : `${this._getTimestamp()}.json`;
        const filePath = path.join(this._rushConfiguration.changesFolder, ...this._changeFileData.packageName.split('/'), filename);
        return filePath;
    }
    /**
     * Gets the current time, formatted as YYYY-MM-DD-HH-MM
     * Optionally will include seconds
     */
    _getTimestamp(useSeconds = false) {
        // Create a date string with the current time
        // dateString === "2016-10-19T22:47:49.606Z"
        const dateString = new Date().toJSON();
        // Parse out 2 capture groups, the date and the time
        const dateParseRegex = /([0-9]{4}-[0-9]{2}-[0-9]{2}).*([0-9]{2}:[0-9]{2}:[0-9]{2})/;
        // matches[1] === "2016-10-19"
        // matches[2] === "22:47:49"
        const matches = dateString.match(dateParseRegex);
        if (matches) {
            // formattedDate === "2016-10-19"
            const formattedDate = matches[1];
            let formattedTime;
            if (useSeconds) {
                // formattedTime === "22-47-49"
                formattedTime = matches[2].replace(':', '-');
            }
            else {
                // formattedTime === "22-47"
                const timeParts = matches[2].split(':');
                formattedTime = `${timeParts[0]}-${timeParts[1]}`;
            }
            return `${formattedDate}-${formattedTime}`;
        }
        return undefined;
    }
    _escapeFilename(filename, replacer = '-') {
        // Removes / ? < > \ : * | ", really anything that isn't a letter, number, '.' '_' or '-'
        const badCharacters = /[^a-zA-Z0-9._-]/g;
        return filename.replace(badCharacters, replacer);
    }
}
exports.ChangeFile = ChangeFile;
//# sourceMappingURL=ChangeFile.js.map