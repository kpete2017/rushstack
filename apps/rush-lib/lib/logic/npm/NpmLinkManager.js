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
exports.NpmLinkManager = void 0;
const safe_1 = __importDefault(require("colors/safe"));
const os = __importStar(require("os"));
const path = __importStar(require("path"));
const semver = __importStar(require("semver"));
const tar = __importStar(require("tar"));
const readPackageTree = require("read-package-tree");
const node_core_library_1 = require("@rushstack/node-core-library");
const RushConstants_1 = require("../../logic/RushConstants");
const Utilities_1 = require("../../utilities/Utilities");
const NpmPackage_1 = require("./NpmPackage");
const PackageLookup_1 = require("../PackageLookup");
const BaseLinkManager_1 = require("../base/BaseLinkManager");
class NpmLinkManager extends BaseLinkManager_1.BaseLinkManager {
    async _linkProjects() {
        const npmPackage = await node_core_library_1.LegacyAdapters.convertCallbackToPromise(readPackageTree, this._rushConfiguration.commonTempFolder);
        const commonRootPackage = NpmPackage_1.NpmPackage.createFromNpm(npmPackage);
        const commonPackageLookup = new PackageLookup_1.PackageLookup();
        commonPackageLookup.loadTree(commonRootPackage);
        for (const rushProject of this._rushConfiguration.projects) {
            console.log(os.EOL + 'LINKING: ' + rushProject.packageName);
            this._linkProject(rushProject, commonRootPackage, commonPackageLookup);
        }
    }
    /**
     * This is called once for each local project from Rush.json.
     * @param project             The local project that we will create symlinks for
     * @param commonRootPackage   The common/temp/package.json package
     * @param commonPackageLookup A dictionary for finding packages under common/temp/node_modules
     */
    _linkProject(project, commonRootPackage, commonPackageLookup) {
        let commonProjectPackage = commonRootPackage.getChildByName(project.tempProjectName);
        if (!commonProjectPackage) {
            // Normally we would expect the temp project to have been installed into the common\node_modules
            // folder.  However, if it was recently added, "rush install" doesn't technically require
            // this, as long as its dependencies can be found at the root of the NPM shrinkwrap file.
            // This avoids the need to run "rush generate" unnecessarily.
            // Example: "project1"
            const unscopedTempProjectName = this._rushConfiguration.packageNameParser.getUnscopedName(project.tempProjectName);
            // Example: "C:\MyRepo\common\temp\projects\project1
            const extractedFolder = path.join(this._rushConfiguration.commonTempFolder, RushConstants_1.RushConstants.rushTempProjectsFolderName, unscopedTempProjectName);
            // Example: "C:\MyRepo\common\temp\projects\project1.tgz"
            const tarballFile = path.join(this._rushConfiguration.commonTempFolder, RushConstants_1.RushConstants.rushTempProjectsFolderName, unscopedTempProjectName + '.tgz');
            // Example: "C:\MyRepo\common\temp\projects\project1\package.json"
            const packageJsonFilename = path.join(extractedFolder, 'package', "package.json" /* PackageJson */);
            Utilities_1.Utilities.createFolderWithRetry(extractedFolder);
            tar.extract({
                cwd: extractedFolder,
                file: tarballFile,
                sync: true
            });
            // Example: "C:\MyRepo\common\temp\node_modules\@rush-temp\project1"
            const installFolderName = path.join(this._rushConfiguration.commonTempFolder, RushConstants_1.RushConstants.nodeModulesFolderName, RushConstants_1.RushConstants.rushTempNpmScope, unscopedTempProjectName);
            commonProjectPackage = NpmPackage_1.NpmPackage.createVirtualTempPackage(packageJsonFilename, installFolderName);
            // remove the extracted tarball contents
            node_core_library_1.FileSystem.deleteFile(packageJsonFilename);
            node_core_library_1.FileSystem.deleteFile(extractedFolder);
            commonRootPackage.addChild(commonProjectPackage);
        }
        // TODO: Validate that the project's package.json still matches the common folder
        const localProjectPackage = NpmPackage_1.NpmPackage.createLinkedNpmPackage(project.packageJsonEditor.name, commonProjectPackage.version, commonProjectPackage.dependencies, project.projectFolder);
        const queue = [];
        queue.push({
            commonPackage: commonProjectPackage,
            localPackage: localProjectPackage,
            cyclicSubtreeRoot: undefined
        });
        for (;;) {
            const queueItem = queue.shift();
            if (!queueItem) {
                break;
            }
            // A project from somewhere under "common/temp/node_modules"
            const commonPackage = queueItem.commonPackage;
            // A symlinked virtual package somewhere under "this-project/node_modules",
            // where "this-project" corresponds to the "project" parameter for linkProject().
            const localPackage = queueItem.localPackage;
            // If we encounter a dependency listed in cyclicDependencyProjects, this will be set to the root
            // of the localPackage subtree where we will stop creating local links.
            const cyclicSubtreeRoot = queueItem.cyclicSubtreeRoot;
            // NOTE: It's important that this traversal follows the dependencies in the Common folder,
            // because for Rush projects this will be the union of
            // devDependencies / dependencies / optionalDependencies.
            for (const dependency of commonPackage.dependencies) {
                let startingCyclicSubtree = false;
                // Should this be a "local link" to a top-level Rush project (i.e. versus a regular link
                // into the Common folder)?
                const matchedRushPackage = this._rushConfiguration.getProjectByName(dependency.name);
                if (matchedRushPackage) {
                    const matchedVersion = matchedRushPackage.packageJsonEditor.version;
                    // The dependency name matches an Rush project, but are there any other reasons not
                    // to create a local link?
                    if (cyclicSubtreeRoot) {
                        // DO NOT create a local link, because this is part of an existing
                        // cyclicDependencyProjects subtree
                    }
                    else if (project.cyclicDependencyProjects.has(dependency.name)) {
                        // DO NOT create a local link, because we are starting a new
                        // cyclicDependencyProjects subtree
                        startingCyclicSubtree = true;
                    }
                    else if (dependency.kind !== NpmPackage_1.PackageDependencyKind.LocalLink &&
                        !semver.satisfies(matchedVersion, dependency.versionRange)) {
                        // DO NOT create a local link, because the local project's version isn't SemVer compatible.
                        // (Note that in order to make version bumping work as expected, we ignore SemVer for
                        // immediate dependencies of top-level projects, indicated by PackageDependencyKind.LocalLink.
                        // Is this wise?)
                        console.log(safe_1.default.yellow(`Rush will not locally link ${dependency.name} for ${localPackage.name}` +
                            ` because the requested version "${dependency.versionRange}" is incompatible` +
                            ` with the local version ${matchedVersion}`));
                    }
                    else {
                        // Yes, it is compatible, so create a symlink to the Rush project.
                        // Is the dependency already resolved?
                        const resolution = localPackage.resolveOrCreate(dependency.name);
                        if (!resolution.found || resolution.found.version !== matchedVersion) {
                            // We did not find a suitable match, so place a new local package that
                            // symlinks to the Rush project
                            const newLocalFolderPath = path.join(resolution.parentForCreate.folderPath, 'node_modules', dependency.name);
                            const newLocalPackage = NpmPackage_1.NpmPackage.createLinkedNpmPackage(dependency.name, matchedVersion, 
                            // Since matchingRushProject does not have a parent, its dependencies are
                            // guaranteed to be already fully resolved inside its node_modules folder.
                            [], newLocalFolderPath);
                            newLocalPackage.symlinkTargetFolderPath = matchedRushPackage.projectFolder;
                            resolution.parentForCreate.addChild(newLocalPackage);
                            // (There are no dependencies, so we do not need to push it onto the queue.)
                        }
                        continue;
                    }
                }
                // We can't symlink to an Rush project, so instead we will symlink to a folder
                // under the "Common" folder
                const commonDependencyPackage = commonPackage.resolve(dependency.name);
                if (commonDependencyPackage) {
                    // This is the version that was chosen when "npm install" ran in the common folder
                    const effectiveDependencyVersion = commonDependencyPackage.version;
                    // Is the dependency already resolved?
                    let resolution;
                    if (!cyclicSubtreeRoot || !matchedRushPackage) {
                        // Perform normal module resolution.
                        resolution = localPackage.resolveOrCreate(dependency.name);
                    }
                    else {
                        // We are inside a cyclicDependencyProjects subtree (i.e. cyclicSubtreeRoot != undefined),
                        // and the dependency is a local project (i.e. matchedRushPackage != undefined), so
                        // we use a special module resolution strategy that places everything under the
                        // cyclicSubtreeRoot.
                        resolution = localPackage.resolveOrCreate(dependency.name, cyclicSubtreeRoot);
                    }
                    if (!resolution.found || resolution.found.version !== effectiveDependencyVersion) {
                        // We did not find a suitable match, so place a new local package
                        const newLocalFolderPath = path.join(resolution.parentForCreate.folderPath, 'node_modules', commonDependencyPackage.name);
                        const newLocalPackage = NpmPackage_1.NpmPackage.createLinkedNpmPackage(commonDependencyPackage.name, commonDependencyPackage.version, commonDependencyPackage.dependencies, newLocalFolderPath);
                        const commonPackageFromLookup = commonPackageLookup.getPackage(newLocalPackage.nameAndVersion);
                        if (!commonPackageFromLookup) {
                            throw new Error(`The ${localPackage.name}@${localPackage.version} package was not found` +
                                ` in the common folder`);
                        }
                        newLocalPackage.symlinkTargetFolderPath = commonPackageFromLookup.folderPath;
                        let newCyclicSubtreeRoot = cyclicSubtreeRoot;
                        if (startingCyclicSubtree) {
                            // If we are starting a new subtree, then newLocalPackage will be its root
                            // NOTE: cyclicSubtreeRoot is guaranteed to be undefined here, since we never start
                            // a new tree inside an existing tree
                            newCyclicSubtreeRoot = newLocalPackage;
                        }
                        resolution.parentForCreate.addChild(newLocalPackage);
                        queue.push({
                            commonPackage: commonDependencyPackage,
                            localPackage: newLocalPackage,
                            cyclicSubtreeRoot: newCyclicSubtreeRoot
                        });
                    }
                }
                else {
                    if (dependency.kind !== NpmPackage_1.PackageDependencyKind.Optional) {
                        throw new Error(`The dependency "${dependency.name}" needed by "${localPackage.name}"` +
                            ` was not found in the common folder -- do you need to run "rush install"?`);
                    }
                    else {
                        console.log('Skipping optional dependency: ' + dependency.name);
                    }
                }
            }
        }
        // When debugging, you can uncomment this line to dump the data structure
        // to the console:
        // localProjectPackage.printTree();
        NpmLinkManager._createSymlinksForTopLevelProject(localProjectPackage);
        // Also symlink the ".bin" folder
        if (localProjectPackage.children.length > 0) {
            const commonBinFolder = path.join(this._rushConfiguration.commonTempFolder, 'node_modules', '.bin');
            const projectBinFolder = path.join(localProjectPackage.folderPath, 'node_modules', '.bin');
            if (node_core_library_1.FileSystem.exists(commonBinFolder)) {
                NpmLinkManager._createSymlink({
                    linkTargetPath: commonBinFolder,
                    newLinkPath: projectBinFolder,
                    symlinkKind: BaseLinkManager_1.SymlinkKind.Directory
                });
            }
        }
    }
}
exports.NpmLinkManager = NpmLinkManager;
//# sourceMappingURL=NpmLinkManager.js.map