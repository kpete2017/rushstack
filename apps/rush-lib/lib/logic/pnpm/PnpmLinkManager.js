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
exports.PnpmLinkManager = void 0;
const os = __importStar(require("os"));
const path = __importStar(require("path"));
const crypto = __importStar(require("crypto"));
const uriEncode = require("strict-uri-encode");
const link_bins_1 = __importDefault(require("@pnpm/link-bins"));
const semver = __importStar(require("semver"));
const safe_1 = __importDefault(require("colors/safe"));
const node_core_library_1 = require("@rushstack/node-core-library");
const BaseLinkManager_1 = require("../base/BaseLinkManager");
const BasePackage_1 = require("../base/BasePackage");
const RushConstants_1 = require("../../logic/RushConstants");
const PnpmShrinkwrapFile_1 = require("./PnpmShrinkwrapFile");
// special flag for debugging, will print extra diagnostic information,
// but comes with performance cost
const DEBUG = false;
class PnpmLinkManager extends BaseLinkManager_1.BaseLinkManager {
    constructor() {
        super(...arguments);
        this._pnpmVersion = new semver.SemVer(this._rushConfiguration.packageManagerToolVersion);
    }
    /**
     * @override
     */
    async createSymlinksForProjects(force) {
        const useWorkspaces = this._rushConfiguration.pnpmOptions && this._rushConfiguration.pnpmOptions.useWorkspaces;
        if (useWorkspaces) {
            console.log(safe_1.default.red('Linking is not supported when using workspaces. Run "rush install" or "rush update" ' +
                'to restore project node_modules folders.'));
            throw new node_core_library_1.AlreadyReportedError();
        }
        await super.createSymlinksForProjects(force);
    }
    async _linkProjects() {
        if (this._rushConfiguration.projects.length > 0) {
            // Use shrinkwrap from temp as the committed shrinkwrap may not always be up to date
            // See https://github.com/microsoft/rushstack/issues/1273#issuecomment-492779995
            const pnpmShrinkwrapFile = PnpmShrinkwrapFile_1.PnpmShrinkwrapFile.loadFromFile(this._rushConfiguration.tempShrinkwrapFilename, this._rushConfiguration.pnpmOptions);
            if (!pnpmShrinkwrapFile) {
                throw new node_core_library_1.InternalError(`Cannot load shrinkwrap at "${this._rushConfiguration.tempShrinkwrapFilename}"`);
            }
            for (const rushProject of this._rushConfiguration.projects) {
                await this._linkProject(rushProject, pnpmShrinkwrapFile);
            }
        }
        else {
            console.log(safe_1.default.yellow('\nWarning: Nothing to do. Please edit rush.json and add at least one project' +
                ' to the "projects" section.\n'));
        }
    }
    /**
     * This is called once for each local project from Rush.json.
     * @param project             The local project that we will create symlinks for
     * @param rushLinkJson        The common/temp/rush-link.json output file
     */
    async _linkProject(project, pnpmShrinkwrapFile) {
        console.log(os.EOL + 'LINKING: ' + project.packageName);
        // first, read the temp package.json information
        // Example: "project1"
        const unscopedTempProjectName = this._rushConfiguration.packageNameParser.getUnscopedName(project.tempProjectName);
        // Example: "C:\MyRepo\common\temp\projects\project1
        const extractedFolder = path.join(this._rushConfiguration.commonTempFolder, RushConstants_1.RushConstants.rushTempProjectsFolderName, unscopedTempProjectName);
        // Example: "C:\MyRepo\common\temp\projects\project1\package.json"
        const packageJsonFilename = path.join(extractedFolder, "package.json" /* PackageJson */);
        // Example: "C:\MyRepo\common\temp\node_modules\@rush-temp\project1"
        const installFolderName = path.join(this._rushConfiguration.commonTempFolder, RushConstants_1.RushConstants.nodeModulesFolderName, RushConstants_1.RushConstants.rushTempNpmScope, unscopedTempProjectName);
        const commonPackage = BasePackage_1.BasePackage.createVirtualTempPackage(packageJsonFilename, installFolderName);
        const localPackage = BasePackage_1.BasePackage.createLinkedPackage(project.packageName, commonPackage.version, project.projectFolder);
        // now that we have the temp package.json, we can go ahead and link up all the direct dependencies
        // first, start with the rush dependencies, we just need to link to the project folder
        for (const dependencyName of Object.keys(commonPackage.packageJson.rushDependencies || {})) {
            const matchedRushPackage = this._rushConfiguration.getProjectByName(dependencyName);
            if (matchedRushPackage) {
                // We found a suitable match, so place a new local package that
                // symlinks to the Rush project
                const matchedVersion = matchedRushPackage.packageJsonEditor.version;
                // e.g. "C:\my-repo\project-a\node_modules\project-b" if project-b is a rush dependency of project-a
                const newLocalFolderPath = path.join(localPackage.folderPath, 'node_modules', dependencyName);
                const newLocalPackage = BasePackage_1.BasePackage.createLinkedPackage(dependencyName, matchedVersion, newLocalFolderPath);
                newLocalPackage.symlinkTargetFolderPath = matchedRushPackage.projectFolder;
                localPackage.children.push(newLocalPackage);
            }
            else {
                throw new node_core_library_1.InternalError(`Cannot find dependency "${dependencyName}" for "${project.packageName}" in the Rush configuration`);
            }
        }
        // Iterate through all the regular dependencies
        // With npm, it's possible for two different projects to have dependencies on
        // the same version of the same library, but end up with different implementations
        // of that library, if the library is installed twice and with different secondary
        // dependencies.The NpmLinkManager recursively links dependency folders to try to
        // honor this. Since PNPM always uses the same physical folder to represent a given
        // version of a library, we only need to link directly to the folder that PNPM has chosen,
        // and it will have a consistent set of secondary dependencies.
        // each of these dependencies should be linked in a special folder that pnpm
        // creates for the installed version of each .TGZ package, all we need to do
        // is re-use that symlink in order to get linked to whatever PNPM thought was
        // appropriate. This folder is usually something like:
        // C:\{uri-encoded-path-to-tgz}\node_modules\{package-name}
        // e.g.:
        //   file:projects/bentleyjs-core.tgz
        //   file:projects/build-tools.tgz_dc21d88642e18a947127a751e00b020a
        //   file:projects/imodel-from-geojson.tgz_request@2.88.0
        const tempProjectDependencyKey = pnpmShrinkwrapFile.getTempProjectDependencyKey(project.tempProjectName);
        if (!tempProjectDependencyKey) {
            throw new Error(`Cannot get dependency key for temp project: ${project.tempProjectName}`);
        }
        // e.g.: file:projects/project-name.tgz
        const tarballEntry = pnpmShrinkwrapFile.getTarballPath(tempProjectDependencyKey);
        if (!tarballEntry) {
            throw new node_core_library_1.InternalError(`Cannot find tarball path for "${project.tempProjectName}" in shrinkwrap.`);
        }
        // e.g.: projects\api-documenter.tgz
        const relativePathToTgzFile = tarballEntry.slice(`file:`.length);
        // e.g.: C:\wbt\common\temp\projects\api-documenter.tgz
        const absolutePathToTgzFile = path.resolve(this._rushConfiguration.commonTempFolder, relativePathToTgzFile);
        // The folder name in `.local` is constructed as:
        //   UriEncode(absolutePathToTgzFile) + _suffix
        //
        // Note that _suffix is not encoded. The tarball attribute of the package 'file:projects/project-name.tgz_suffix'
        // holds the tarball path 'file:projects/project-name.tgz', which can be used for the constructing the folder name.
        //
        // '_suffix' is extracted by stripping the tarball path from top level dependency value.
        // tarball path = 'file:projects/project-name.tgz'
        // top level dependency = 'file:projects/project-name.tgz_suffix'
        // e.g.:
        //   '' [empty string]
        //   _jsdom@11.12.0
        //   _2a665c89609864b4e75bc5365d7f8f56
        const folderNameSuffix = tarballEntry && tarballEntry.length < tempProjectDependencyKey.length
            ? tempProjectDependencyKey.slice(tarballEntry.length)
            : '';
        // e.g.: C:\wbt\common\temp\node_modules\.local\C%3A%2Fwbt%2Fcommon%2Ftemp%2Fprojects%2Fapi-documenter.tgz\node_modules
        const pathToLocalInstallation = this._getPathToLocalInstallation(absolutePathToTgzFile, folderNameSuffix);
        const parentShrinkwrapEntry = pnpmShrinkwrapFile.getShrinkwrapEntryFromTempProjectDependencyKey(tempProjectDependencyKey);
        if (!parentShrinkwrapEntry) {
            throw new node_core_library_1.InternalError(`Cannot find shrinkwrap entry using dependency key for temp project: ${project.tempProjectName}`);
        }
        for (const dependencyName of Object.keys(commonPackage.packageJson.dependencies || {})) {
            const newLocalPackage = this._createLocalPackageForDependency(project, parentShrinkwrapEntry, localPackage, pathToLocalInstallation, dependencyName);
            localPackage.addChild(newLocalPackage);
        }
        // TODO: Rush does not currently handle optional dependencies of projects. This should be uncommented when
        // support is added
        // for (const dependencyName of Object.keys(commonPackage.packageJson!.optionalDependencies || {})) {
        //   const newLocalPackage: BasePackage | undefined = this._createLocalPackageForDependency(
        //     project,
        //     parentShrinkwrapEntry,
        //     localPackage,
        //     pathToLocalInstallation,
        //     dependencyName,
        //     true); // isOptional
        //   if (newLocalPackage) {
        //     localPackage.addChild(newLocalPackage);
        //   }
        // }
        if (DEBUG) {
            localPackage.printTree();
        }
        await pnpmShrinkwrapFile.getProjectShrinkwrap(project).updateProjectShrinkwrapAsync();
        PnpmLinkManager._createSymlinksForTopLevelProject(localPackage);
        // Also symlink the ".bin" folder
        const projectFolder = path.join(localPackage.folderPath, 'node_modules');
        const projectBinFolder = path.join(localPackage.folderPath, 'node_modules', '.bin');
        await link_bins_1.default(projectFolder, projectBinFolder, {
            warn: (msg) => console.warn(safe_1.default.yellow(msg))
        });
    }
    _getPathToLocalInstallation(absolutePathToTgzFile, folderSuffix) {
        if (this._pnpmVersion.major >= 6) {
            // PNPM 6 changed formatting to replace all ':' and '/' chars with '+'. Additionally, folder names > 120
            // are trimmed and hashed. NOTE: PNPM internally uses fs.realpath.native, which will cause additional
            // issues in environments that do not support long paths.
            // See https://github.com/pnpm/pnpm/releases/tag/v6.0.0
            // e.g.:
            //   C++dev+imodeljs+imodeljs+common+temp+projects+presentation-integration-tests.tgz_jsdom@11.12.0
            //   C++dev+imodeljs+imodeljs+common+temp+projects+presentation-integrat_089eb799caf0f998ab34e4e1e9254956
            const specialCharRegex = /\/|:/g;
            const escapedLocalPath = node_core_library_1.Path.convertToSlashes(absolutePathToTgzFile).replace(specialCharRegex, '+');
            let folderName = `local+${escapedLocalPath}${folderSuffix}`;
            if (folderName.length > 120) {
                folderName = `${folderName.substring(0, 50)}_${crypto
                    .createHash('md5')
                    .update(folderName)
                    .digest('hex')}`;
            }
            return path.join(this._rushConfiguration.commonTempFolder, RushConstants_1.RushConstants.nodeModulesFolderName, '.pnpm', folderName, RushConstants_1.RushConstants.nodeModulesFolderName);
        }
        else {
            // e.g.:
            //   C%3A%2Fwbt%2Fcommon%2Ftemp%2Fprojects%2Fapi-documenter.tgz
            //   C%3A%2Fdev%2Fimodeljs%2Fimodeljs%2Fcommon%2Ftemp%2Fprojects%2Fpresentation-integration-tests.tgz_jsdom@11.12.0
            //   C%3A%2Fdev%2Fimodeljs%2Fimodeljs%2Fcommon%2Ftemp%2Fprojects%2Fbuild-tools.tgz_2a665c89609864b4e75bc5365d7f8f56
            const folderNameInLocalInstallationRoot = uriEncode(node_core_library_1.Path.convertToSlashes(absolutePathToTgzFile)) + folderSuffix;
            // See https://github.com/pnpm/pnpm/releases/tag/v4.0.0
            return path.join(this._rushConfiguration.commonTempFolder, RushConstants_1.RushConstants.nodeModulesFolderName, '.pnpm', 'local', folderNameInLocalInstallationRoot, RushConstants_1.RushConstants.nodeModulesFolderName);
        }
    }
    _createLocalPackageForDependency(project, parentShrinkwrapEntry, localPackage, pathToLocalInstallation, dependencyName, isOptional = false) {
        // the dependency we are looking for should have already created a symlink here
        // FYI dependencyName might contain an NPM scope, here it gets converted into a filesystem folder name
        // e.g. if the dependency is supi:
        // "C:\wbt\common\temp\node_modules\.local\C%3A%2Fwbt%2Fcommon%2Ftemp%2Fprojects%2Fapi-documenter.tgz\node_modules\supi"
        const dependencyLocalInstallationSymlink = path.join(pathToLocalInstallation, dependencyName);
        if (!node_core_library_1.FileSystem.exists(dependencyLocalInstallationSymlink)) {
            // if this occurs, it is a bug in Rush algorithm or unexpected PNPM behavior
            throw new node_core_library_1.InternalError(`Cannot find installed dependency "${dependencyName}" in "${pathToLocalInstallation}"`);
        }
        if (!node_core_library_1.FileSystem.getLinkStatistics(dependencyLocalInstallationSymlink).isSymbolicLink()) {
            // if this occurs, it is a bug in Rush algorithm or unexpected PNPM behavior
            throw new node_core_library_1.InternalError(`Dependency "${dependencyName}" is not a symlink in "${pathToLocalInstallation}`);
        }
        // read the version number from the shrinkwrap entry and return if no version is specified
        // and the dependency is optional
        const version = isOptional
            ? (parentShrinkwrapEntry.optionalDependencies || {})[dependencyName]
            : (parentShrinkwrapEntry.dependencies || {})[dependencyName];
        if (!version) {
            if (!isOptional) {
                throw new node_core_library_1.InternalError(`Cannot find shrinkwrap entry dependency "${dependencyName}" for temp project: ` +
                    `${project.tempProjectName}`);
            }
            return;
        }
        const newLocalFolderPath = path.join(localPackage.folderPath, 'node_modules', dependencyName);
        const newLocalPackage = BasePackage_1.BasePackage.createLinkedPackage(dependencyName, version, newLocalFolderPath);
        // The dependencyLocalInstallationSymlink is just a symlink to another folder. To reduce the number of filesystem
        // reads that are needed, we will link to where that symlink pointed, rather than linking to a link.
        newLocalPackage.symlinkTargetFolderPath = node_core_library_1.FileSystem.getRealPath(dependencyLocalInstallationSymlink);
        return newLocalPackage;
    }
}
exports.PnpmLinkManager = PnpmLinkManager;
//# sourceMappingURL=PnpmLinkManager.js.map