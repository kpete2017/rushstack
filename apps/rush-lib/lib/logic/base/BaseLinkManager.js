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
exports.BaseLinkManager = exports.SymlinkKind = void 0;
const safe_1 = __importDefault(require("colors/safe"));
const fs = __importStar(require("fs"));
const os = __importStar(require("os"));
const path = __importStar(require("path"));
const node_core_library_1 = require("@rushstack/node-core-library");
const Utilities_1 = require("../../utilities/Utilities");
const Stopwatch_1 = require("../../utilities/Stopwatch");
const EnvironmentConfiguration_1 = require("../../api/EnvironmentConfiguration");
const LastLinkFlag_1 = require("../../api/LastLinkFlag");
var SymlinkKind;
(function (SymlinkKind) {
    SymlinkKind[SymlinkKind["File"] = 0] = "File";
    SymlinkKind[SymlinkKind["Directory"] = 1] = "Directory";
})(SymlinkKind = exports.SymlinkKind || (exports.SymlinkKind = {}));
class BaseLinkManager {
    constructor(rushConfiguration) {
        this._rushConfiguration = rushConfiguration;
    }
    static _createSymlink(options) {
        const newLinkFolder = path.dirname(options.newLinkPath);
        node_core_library_1.FileSystem.ensureFolder(newLinkFolder);
        let targetPath;
        if (EnvironmentConfiguration_1.EnvironmentConfiguration.absoluteSymlinks) {
            targetPath = options.linkTargetPath;
        }
        else {
            // Link to the relative path, to avoid going outside containers such as a Docker image
            targetPath = path.relative(fs.realpathSync(newLinkFolder), options.linkTargetPath);
        }
        if (process.platform === 'win32') {
            if (options.symlinkKind === SymlinkKind.Directory) {
                // For directories, we use a Windows "junction".  On Unix, this produces a regular symlink.
                node_core_library_1.FileSystem.createSymbolicLinkJunction({
                    linkTargetPath: targetPath,
                    newLinkPath: options.newLinkPath
                });
            }
            else {
                // For files, we use a Windows "hard link", because creating a symbolic link requires
                // administrator permission.
                // NOTE: We cannot use the relative path for hard links
                node_core_library_1.FileSystem.createHardLink({
                    linkTargetPath: options.linkTargetPath,
                    newLinkPath: options.newLinkPath
                });
            }
        }
        else {
            // However hard links seem to cause build failures on Mac, so for all other operating systems
            // we use symbolic links for this case.
            if (options.symlinkKind === SymlinkKind.Directory) {
                node_core_library_1.FileSystem.createSymbolicLinkFolder({
                    linkTargetPath: targetPath,
                    newLinkPath: options.newLinkPath
                });
            }
            else {
                node_core_library_1.FileSystem.createSymbolicLinkFile({
                    linkTargetPath: targetPath,
                    newLinkPath: options.newLinkPath
                });
            }
        }
    }
    /**
     * For a Package object that represents a top-level Rush project folder
     * (i.e. with source code that we will be building), this clears out its
     * node_modules folder and then recursively creates all the symlinked folders.
     */
    static _createSymlinksForTopLevelProject(localPackage) {
        const localModuleFolder = path.join(localPackage.folderPath, 'node_modules');
        // Sanity check
        if (localPackage.parent) {
            throw new Error('The provided package is not a top-level project');
        }
        // The root-level folder is the project itself, so we simply delete its node_modules
        // to start clean
        console.log('Purging ' + localModuleFolder);
        Utilities_1.Utilities.dangerouslyDeletePath(localModuleFolder);
        if (localPackage.children.length > 0) {
            Utilities_1.Utilities.createFolderWithRetry(localModuleFolder);
            for (const child of localPackage.children) {
                BaseLinkManager._createSymlinksForDependencies(child);
            }
        }
    }
    /**
     * This is a helper function used by createSymlinksForTopLevelProject().
     * It will recursively creates symlinked folders corresponding to each of the
     * Package objects in the provided tree.
     */
    static _createSymlinksForDependencies(localPackage) {
        const localModuleFolder = path.join(localPackage.folderPath, 'node_modules');
        if (!localPackage.symlinkTargetFolderPath) {
            throw new node_core_library_1.InternalError('localPackage.symlinkTargetFolderPath was not assigned');
        }
        // This is special case for when localPackage.name has the form '@scope/name',
        // in which case we need to create the '@scope' folder first.
        const parentFolderPath = path.dirname(localPackage.folderPath);
        if (parentFolderPath && parentFolderPath !== localPackage.folderPath) {
            if (!node_core_library_1.FileSystem.exists(parentFolderPath)) {
                Utilities_1.Utilities.createFolderWithRetry(parentFolderPath);
            }
        }
        if (localPackage.children.length === 0) {
            // If there are no children, then we can symlink the entire folder
            BaseLinkManager._createSymlink({
                linkTargetPath: localPackage.symlinkTargetFolderPath,
                newLinkPath: localPackage.folderPath,
                symlinkKind: SymlinkKind.Directory
            });
        }
        else {
            // If there are children, then we need to symlink each item in the folder individually
            Utilities_1.Utilities.createFolderWithRetry(localPackage.folderPath);
            for (const filename of node_core_library_1.FileSystem.readFolder(localPackage.symlinkTargetFolderPath)) {
                if (filename.toLowerCase() !== 'node_modules') {
                    // Create the symlink
                    let symlinkKind = SymlinkKind.File;
                    const linkSource = path.join(localPackage.folderPath, filename);
                    let linkTarget = path.join(localPackage.symlinkTargetFolderPath, filename);
                    const linkStats = node_core_library_1.FileSystem.getLinkStatistics(linkTarget);
                    if (linkStats.isSymbolicLink()) {
                        const targetStats = node_core_library_1.FileSystem.getStatistics(node_core_library_1.FileSystem.getRealPath(linkTarget));
                        if (targetStats.isDirectory()) {
                            // Neither a junction nor a directory-symlink can have a directory-symlink
                            // as its target; instead, we must obtain the real physical path.
                            // A junction can link to another junction.  Unfortunately, the node 'fs' API
                            // lacks the ability to distinguish between a junction and a directory-symlink
                            // (even though it has the ability to create them both), so the safest policy
                            // is to always make a junction and always to the real physical path.
                            linkTarget = node_core_library_1.FileSystem.getRealPath(linkTarget);
                            symlinkKind = SymlinkKind.Directory;
                        }
                    }
                    else if (linkStats.isDirectory()) {
                        symlinkKind = SymlinkKind.Directory;
                    }
                    BaseLinkManager._createSymlink({
                        linkTargetPath: linkTarget,
                        newLinkPath: linkSource,
                        symlinkKind
                    });
                }
            }
        }
        if (localPackage.children.length > 0) {
            Utilities_1.Utilities.createFolderWithRetry(localModuleFolder);
            for (const child of localPackage.children) {
                BaseLinkManager._createSymlinksForDependencies(child);
            }
        }
    }
    /**
     * Creates node_modules symlinks for all Rush projects defined in the RushConfiguration.
     * @param force - Normally the operation will be skipped if the links are already up to date;
     *   if true, this option forces the links to be recreated.
     */
    async createSymlinksForProjects(force) {
        console.log(os.EOL + safe_1.default.bold('Linking local projects'));
        const stopwatch = Stopwatch_1.Stopwatch.start();
        await this._linkProjects();
        // TODO: Remove when "rush link" and "rush unlink" are deprecated
        LastLinkFlag_1.LastLinkFlagFactory.getCommonTempFlag(this._rushConfiguration).create();
        stopwatch.stop();
        console.log(os.EOL + safe_1.default.green(`Linking finished successfully. (${stopwatch.toString()})`));
        console.log(os.EOL + 'Next you should probably run "rush build" or "rush rebuild"');
    }
}
exports.BaseLinkManager = BaseLinkManager;
//# sourceMappingURL=BaseLinkManager.js.map