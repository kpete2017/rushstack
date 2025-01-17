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
exports.PurgeManager = void 0;
const safe_1 = __importDefault(require("colors/safe"));
const path = __importStar(require("path"));
const AsyncRecycler_1 = require("../utilities/AsyncRecycler");
const RushConstants_1 = require("../logic/RushConstants");
/**
 * This class implements the logic for "rush purge"
 */
class PurgeManager {
    constructor(rushConfiguration, rushGlobalFolder) {
        this._rushConfiguration = rushConfiguration;
        this._rushGlobalFolder = rushGlobalFolder;
        const commonAsyncRecyclerPath = path.join(this._rushConfiguration.commonTempFolder, RushConstants_1.RushConstants.rushRecyclerFolderName);
        this._commonTempFolderRecycler = new AsyncRecycler_1.AsyncRecycler(commonAsyncRecyclerPath);
        const rushUserAsyncRecyclerPath = path.join(this._rushGlobalFolder.path, RushConstants_1.RushConstants.rushRecyclerFolderName);
        this._rushUserFolderRecycler = new AsyncRecycler_1.AsyncRecycler(rushUserAsyncRecyclerPath);
    }
    /**
     * Performs the AsyncRecycler.deleteAll() operation.  This should be called before
     * the PurgeManager instance is disposed.
     */
    deleteAll() {
        this._commonTempFolderRecycler.deleteAll();
        this._rushUserFolderRecycler.deleteAll();
    }
    get commonTempFolderRecycler() {
        return this._commonTempFolderRecycler;
    }
    /**
     * Delete everything from the common/temp folder
     */
    purgeNormal() {
        // Delete everything under common\temp except for the recycler folder itself
        console.log('Purging ' + this._rushConfiguration.commonTempFolder);
        this._commonTempFolderRecycler.moveAllItemsInFolder(this._rushConfiguration.commonTempFolder, this._getMembersToExclude(this._rushConfiguration.commonTempFolder, true));
    }
    /**
     * In addition to performing the purgeNormal() operation, this method also cleans the
     * .rush folder in the user's home directory.
     */
    purgeUnsafe() {
        this.purgeNormal();
        // We will delete everything under ~/.rush/ except for the recycler folder itself
        console.log('Purging ' + this._rushGlobalFolder.path);
        // If Rush itself is running under a folder such as  ~/.rush/node-v4.5.6/rush-1.2.3,
        // we cannot delete that folder.
        // First purge the node-specific folder, e.g. ~/.rush/node-v4.5.6/* except for rush-1.2.3:
        this._rushUserFolderRecycler.moveAllItemsInFolder(this._rushGlobalFolder.nodeSpecificPath, this._getMembersToExclude(this._rushGlobalFolder.nodeSpecificPath, true));
        // Then purge the the global folder, e.g. ~/.rush/* except for node-v4.5.6
        this._rushUserFolderRecycler.moveAllItemsInFolder(this._rushGlobalFolder.path, this._getMembersToExclude(this._rushGlobalFolder.path, false));
        if (this._rushConfiguration.packageManager === 'pnpm' &&
            this._rushConfiguration.pnpmOptions.pnpmStore === 'global' &&
            this._rushConfiguration.pnpmOptions.pnpmStorePath) {
            console.warn(safe_1.default.yellow(`Purging the global pnpm-store`));
            this._rushUserFolderRecycler.moveAllItemsInFolder(this._rushConfiguration.pnpmOptions.pnpmStorePath);
        }
    }
    _getMembersToExclude(folderToRecycle, showWarning) {
        // Don't recycle the recycler
        const membersToExclude = [RushConstants_1.RushConstants.rushRecyclerFolderName];
        // If the current process is running inside one of the folders, don't recycle that either
        // Example: "/home/user/.rush/rush-1.2.3/lib/example.js"
        const currentFolderPath = path.resolve(__dirname);
        // Example:
        // folderToRecycle = "/home/user/.rush/node-v4.5.6"
        // relative =  "rush-1.2.3/lib/example.js"
        const relative = path.relative(folderToRecycle, currentFolderPath);
        // (The result can be an absolute path if the two folders are on different drive letters)
        if (!path.isAbsolute(relative)) {
            // Get the first path segment:
            const firstPart = relative.split(/[\\\/]/)[0];
            if (firstPart.length > 0 && firstPart !== '..') {
                membersToExclude.push(firstPart);
                if (showWarning) {
                    // Warn that we won't dispose this folder
                    console.log(safe_1.default.yellow("The active process's folder will not be deleted: " + path.join(folderToRecycle, firstPart)));
                }
            }
        }
        return membersToExclude;
    }
}
exports.PurgeManager = PurgeManager;
//# sourceMappingURL=PurgeManager.js.map