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
exports.UnlinkManager = void 0;
const safe_1 = __importDefault(require("colors/safe"));
const path = __importStar(require("path"));
const node_core_library_1 = require("@rushstack/node-core-library");
const Utilities_1 = require("../utilities/Utilities");
const BaseProjectShrinkwrapFile_1 = require("./base/BaseProjectShrinkwrapFile");
const LastLinkFlag_1 = require("../api/LastLinkFlag");
/**
 * This class implements the logic for "rush unlink"
 */
class UnlinkManager {
    constructor(rushConfiguration) {
        this._rushConfiguration = rushConfiguration;
    }
    /**
     * Delete flag file and all the existing node_modules symlinks and all
     * project/.rush/temp/shrinkwrap-deps.json files
     *
     * Returns true if anything was deleted.
     */
    unlink(force = false) {
        const useWorkspaces = this._rushConfiguration.pnpmOptions && this._rushConfiguration.pnpmOptions.useWorkspaces;
        if (!force && useWorkspaces) {
            console.log(safe_1.default.red('Unlinking is not supported when using workspaces. Run "rush purge" to remove ' +
                'project node_modules folders.'));
            throw new node_core_library_1.AlreadyReportedError();
        }
        LastLinkFlag_1.LastLinkFlagFactory.getCommonTempFlag(this._rushConfiguration).clear();
        return this._deleteProjectFiles();
    }
    /**
     * Delete:
     *  - all the node_modules symlinks of configured Rush projects
     *  - all of the project/.rush/temp/shrinkwrap-deps.json files of configured Rush projects
     *
     * Returns true if anything was deleted
     * */
    _deleteProjectFiles() {
        let didDeleteAnything = false;
        for (const rushProject of this._rushConfiguration.projects) {
            const localModuleFolder = path.join(rushProject.projectFolder, 'node_modules');
            if (node_core_library_1.FileSystem.exists(localModuleFolder)) {
                console.log(`Purging ${localModuleFolder}`);
                Utilities_1.Utilities.dangerouslyDeletePath(localModuleFolder);
                didDeleteAnything = true;
            }
            const projectShrinkwrapFilePath = BaseProjectShrinkwrapFile_1.BaseProjectShrinkwrapFile.getFilePathForProject(rushProject);
            if (node_core_library_1.FileSystem.exists(projectShrinkwrapFilePath)) {
                console.log(`Deleting ${projectShrinkwrapFilePath}`);
                node_core_library_1.FileSystem.deleteFile(projectShrinkwrapFilePath);
                didDeleteAnything = true;
            }
        }
        return didDeleteAnything;
    }
}
exports.UnlinkManager = UnlinkManager;
//# sourceMappingURL=UnlinkManager.js.map