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
exports.SetupChecks = void 0;
const safe_1 = __importDefault(require("colors/safe"));
const path = __importStar(require("path"));
const semver = __importStar(require("semver"));
const node_core_library_1 = require("@rushstack/node-core-library");
const terminal_1 = require("@rushstack/terminal");
const RushConstants_1 = require("../logic/RushConstants");
// Refuses to run at all if the PNPM version is older than this, because there
// are known bugs or missing features in earlier releases.
const MINIMUM_SUPPORTED_NPM_VERSION = '4.5.0';
// Refuses to run at all if the PNPM version is older than this, because there
// are known bugs or missing features in earlier releases.
const MINIMUM_SUPPORTED_PNPM_VERSION = '5.0.0';
/**
 * Validate that the developer's setup is good.
 *
 * These checks are invoked prior to the following commands:
 * - rush install
 * - rush update
 * - rush build
 * - rush rebuild
 */
class SetupChecks {
    static validate(rushConfiguration) {
        // NOTE: The Node.js version is also checked in rush/src/start.ts
        const errorMessage = SetupChecks._validate(rushConfiguration);
        if (errorMessage) {
            console.error(safe_1.default.red(terminal_1.PrintUtilities.wrapWords(errorMessage)));
            throw new node_core_library_1.AlreadyReportedError();
        }
    }
    static _validate(rushConfiguration) {
        // Check for outdated tools
        if (rushConfiguration.packageManager === 'pnpm') {
            if (semver.lt(rushConfiguration.packageManagerToolVersion, MINIMUM_SUPPORTED_PNPM_VERSION)) {
                return (`The rush.json file requests PNPM version ` +
                    rushConfiguration.packageManagerToolVersion +
                    `, but PNPM ${MINIMUM_SUPPORTED_PNPM_VERSION} is the minimum supported by Rush.`);
            }
        }
        else if (rushConfiguration.packageManager === 'npm') {
            if (semver.lt(rushConfiguration.packageManagerToolVersion, MINIMUM_SUPPORTED_NPM_VERSION)) {
                return (`The rush.json file requests NPM version ` +
                    rushConfiguration.packageManagerToolVersion +
                    `, but NPM ${MINIMUM_SUPPORTED_NPM_VERSION} is the minimum supported by Rush.`);
            }
        }
        SetupChecks._checkForPhantomFolders(rushConfiguration);
    }
    static _checkForPhantomFolders(rushConfiguration) {
        const phantomFolders = [];
        const seenFolders = new Set();
        // Check from the real parent of the common/temp folder
        const commonTempParent = path.dirname(node_core_library_1.FileSystem.getRealPath(rushConfiguration.commonTempFolder));
        SetupChecks._collectPhantomFoldersUpwards(commonTempParent, phantomFolders, seenFolders);
        // Check from the real folder containing rush.json
        const realRushJsonFolder = node_core_library_1.FileSystem.getRealPath(rushConfiguration.rushJsonFolder);
        SetupChecks._collectPhantomFoldersUpwards(realRushJsonFolder, phantomFolders, seenFolders);
        if (phantomFolders.length > 0) {
            if (phantomFolders.length === 1) {
                console.log(safe_1.default.yellow(terminal_1.PrintUtilities.wrapWords('Warning: A phantom "node_modules" folder was found. This defeats Rush\'s protection against' +
                    ' NPM phantom dependencies and may cause confusing build errors. It is recommended to' +
                    ' delete this folder:')));
            }
            else {
                console.log(safe_1.default.yellow(terminal_1.PrintUtilities.wrapWords('Warning: Phantom "node_modules" folders were found. This defeats Rush\'s protection against' +
                    ' NPM phantom dependencies and may cause confusing build errors. It is recommended to' +
                    ' delete these folders:')));
            }
            for (const folder of phantomFolders) {
                console.log(safe_1.default.yellow(`"${folder}"`));
            }
            console.log(); // add a newline
        }
    }
    /**
     * Checks "folder" and each of its parents to see if it contains a node_modules folder.
     * The bad folders will be added to phantomFolders.
     * The seenFolders set is used to avoid duplicates.
     */
    static _collectPhantomFoldersUpwards(folder, phantomFolders, seenFolders) {
        // Stop if we reached a folder that we already analyzed
        while (!seenFolders.has(folder)) {
            seenFolders.add(folder);
            // If there is a node_modules folder under this folder, add it to the list of bad folders
            const nodeModulesFolder = path.join(folder, RushConstants_1.RushConstants.nodeModulesFolderName);
            if (node_core_library_1.FileSystem.exists(nodeModulesFolder)) {
                // Collect the names of files/folders in that node_modules folder
                const filenames = node_core_library_1.FileSystem.readFolder(nodeModulesFolder).filter((x) => !x.startsWith('.'));
                let ignore = false;
                if (filenames.length === 0) {
                    // If the node_modules folder is completely empty, then it's not a concern
                    ignore = true;
                }
                else if (filenames.length === 1 && filenames[0] === 'vso-task-lib') {
                    // Special case:  The Azure DevOps build agent installs the "vso-task-lib" NPM package
                    // in a top-level path such as:
                    //
                    //   /home/vsts/work/node_modules/vso-task-lib
                    //
                    // It is always the only package in that node_modules folder.  The "vso-task-lib" package
                    // is now deprecated, so it is unlikely to be a real dependency of any modern project.
                    // To avoid false alarms, we ignore this specific case.
                    ignore = true;
                }
                if (!ignore) {
                    phantomFolders.push(nodeModulesFolder);
                }
            }
            // Walk upwards
            const parentFolder = path.dirname(folder);
            if (!parentFolder || parentFolder === folder) {
                // If path.dirname() returns its own input, then means we reached the root
                break;
            }
            folder = parentFolder;
        }
    }
}
exports.SetupChecks = SetupChecks;
//# sourceMappingURL=SetupChecks.js.map