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
exports.RepoStateFile = void 0;
const path = __importStar(require("path"));
const node_core_library_1 = require("@rushstack/node-core-library");
const PnpmShrinkwrapFile_1 = require("./pnpm/PnpmShrinkwrapFile");
/**
 * This file is used to track the state of various Rush-related features. It is generated
 * and updated by Rush.
 *
 * @public
 */
class RepoStateFile {
    constructor(repoStateJson, isValid, filePath, variant) {
        this._modified = false;
        this._repoStateFilePath = filePath;
        this._variant = variant;
        this._isValid = isValid;
        if (repoStateJson) {
            this._pnpmShrinkwrapHash = repoStateJson.pnpmShrinkwrapHash;
            this._preferredVersionsHash = repoStateJson.preferredVersionsHash;
        }
    }
    /**
     * Get the absolute file path of the repo-state.json file.
     */
    get filePath() {
        return this._repoStateFilePath;
    }
    /**
     * The hash of the pnpm shrinkwrap file at the end of the last update.
     */
    get pnpmShrinkwrapHash() {
        return this._pnpmShrinkwrapHash;
    }
    /**
     * The hash of all preferred versions at the end of the last update.
     */
    get preferredVersionsHash() {
        return this._preferredVersionsHash;
    }
    /**
     * If false, the repo-state.json file is not valid and its values cannot be relied upon
     */
    get isValid() {
        return this._isValid;
    }
    /**
     * Loads the repo-state.json data from the specified file path.
     * If the file has not been created yet, then an empty object is returned.
     *
     * @param jsonFilename - The path to the repo-state.json file.
     * @param variant - The variant currently being used by Rush.
     */
    static loadFromFile(jsonFilename, variant) {
        let fileContents;
        try {
            fileContents = node_core_library_1.FileSystem.readFile(jsonFilename);
        }
        catch (error) {
            if (!node_core_library_1.FileSystem.isNotExistError(error)) {
                throw error;
            }
        }
        let foundMergeConflictMarker = false;
        let repoStateJson = undefined;
        if (fileContents) {
            try {
                repoStateJson = node_core_library_1.JsonFile.parseString(fileContents);
            }
            catch (error) {
                // Look for a Git merge conflict marker. PNPM gracefully handles merge conflicts in pnpm-lock.yaml,
                // so a user should be able to just run "rush update" if they get conflicts in pnpm-lock.yaml
                // and repo-state.json and have Rush update both.
                for (let nextNewlineIndex = 0; nextNewlineIndex > -1; nextNewlineIndex = fileContents.indexOf('\n', nextNewlineIndex + 1)) {
                    if (fileContents.substr(nextNewlineIndex + 1, 7) === '<<<<<<<') {
                        foundMergeConflictMarker = true;
                        repoStateJson = {
                            preferredVersionsHash: 'INVALID',
                            pnpmShrinkwrapHash: 'INVALID'
                        };
                        break;
                    }
                }
            }
            if (repoStateJson) {
                this._jsonSchema.validateObject(repoStateJson, jsonFilename);
            }
        }
        return new RepoStateFile(repoStateJson, !foundMergeConflictMarker, jsonFilename, variant);
    }
    /**
     * Refresh the data contained in repo-state.json using the current state
     * of the Rush repo, and save the file if changes were made.
     *
     * @param rushConfiguration - The Rush configuration for the repo.
     *
     * @returns true if the file was modified, otherwise false.
     */
    refreshState(rushConfiguration) {
        // Only support saving the pnpm shrinkwrap hash if it was enabled
        const preventShrinkwrapChanges = rushConfiguration.packageManager === 'pnpm' &&
            rushConfiguration.pnpmOptions &&
            rushConfiguration.pnpmOptions.preventManualShrinkwrapChanges;
        if (preventShrinkwrapChanges) {
            const pnpmShrinkwrapFile = PnpmShrinkwrapFile_1.PnpmShrinkwrapFile.loadFromFile(rushConfiguration.getCommittedShrinkwrapFilename(this._variant), rushConfiguration.pnpmOptions);
            if (pnpmShrinkwrapFile) {
                const shrinkwrapFileHash = pnpmShrinkwrapFile.getShrinkwrapHash(rushConfiguration.experimentsConfiguration.configuration);
                if (this._pnpmShrinkwrapHash !== shrinkwrapFileHash) {
                    this._pnpmShrinkwrapHash = shrinkwrapFileHash;
                    this._modified = true;
                }
            }
        }
        else if (this._pnpmShrinkwrapHash !== undefined) {
            this._pnpmShrinkwrapHash = undefined;
            this._modified = true;
        }
        // Currently, only support saving the preferred versions hash if using workspaces
        const useWorkspaces = rushConfiguration.pnpmOptions && rushConfiguration.pnpmOptions.useWorkspaces;
        if (useWorkspaces) {
            const commonVersions = rushConfiguration.getCommonVersions(this._variant);
            const preferredVersionsHash = commonVersions.getPreferredVersionsHash();
            if (this._preferredVersionsHash !== preferredVersionsHash) {
                this._preferredVersionsHash = preferredVersionsHash;
                this._modified = true;
            }
        }
        else if (this._preferredVersionsHash !== undefined) {
            this._preferredVersionsHash = undefined;
            this._modified = true;
        }
        // Now that the file has been refreshed, we know its contents are valid
        this._isValid = true;
        return this._saveIfModified();
    }
    /**
     * Writes the "repo-state.json" file to disk, using the filename that was passed to loadFromFile().
     */
    _saveIfModified() {
        if (this._modified) {
            const content = '// DO NOT MODIFY THIS FILE MANUALLY BUT DO COMMIT IT. It is generated and used by Rush.' +
                `${"\n" /* Lf */}${this._serialize()}`;
            node_core_library_1.FileSystem.writeFile(this._repoStateFilePath, content);
            this._modified = false;
            return true;
        }
        return false;
    }
    _serialize() {
        // We need to set these one-by-one, since JsonFile.stringify does not like undefined values
        const repoStateJson = {};
        if (this._pnpmShrinkwrapHash) {
            repoStateJson.pnpmShrinkwrapHash = this._pnpmShrinkwrapHash;
        }
        if (this._preferredVersionsHash) {
            repoStateJson.preferredVersionsHash = this._preferredVersionsHash;
        }
        return node_core_library_1.JsonFile.stringify(repoStateJson, { newlineConversion: "\n" /* Lf */ });
    }
}
exports.RepoStateFile = RepoStateFile;
RepoStateFile._jsonSchema = node_core_library_1.JsonSchema.fromFile(path.join(__dirname, '../schemas/repo-state.schema.json'));
//# sourceMappingURL=RepoStateFile.js.map