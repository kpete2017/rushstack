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
exports.PackageChangeAnalyzer = void 0;
const path = __importStar(require("path"));
const safe_1 = __importDefault(require("colors/safe"));
const crypto = __importStar(require("crypto"));
const ignore_1 = __importDefault(require("ignore"));
const package_deps_hash_1 = require("@rushstack/package-deps-hash");
const node_core_library_1 = require("@rushstack/node-core-library");
const RushProjectConfiguration_1 = require("../api/RushProjectConfiguration");
const Git_1 = require("./Git");
const BaseProjectShrinkwrapFile_1 = require("./base/BaseProjectShrinkwrapFile");
const RushConstants_1 = require("./RushConstants");
class PackageChangeAnalyzer {
    constructor(rushConfiguration) {
        /**
         * null === we haven't looked
         * undefined === data isn't available (i.e. - git isn't present)
         */
        this._data = null;
        this._projectStateCache = new Map();
        this._rushConfiguration = rushConfiguration;
        this._git = new Git_1.Git(this._rushConfiguration);
    }
    async getPackageDeps(projectName, terminal) {
        var _a;
        if (this._data === null) {
            this._data = await this._getData(terminal);
        }
        return (_a = this._data) === null || _a === void 0 ? void 0 : _a.get(projectName);
    }
    /**
     * The project state hash is calculated in the following way:
     * - Project dependencies are collected (see PackageChangeAnalyzer.getPackageDeps)
     *   - If project dependencies cannot be collected (i.e. - if Git isn't available),
     *     this function returns `undefined`
     * - The (path separator normalized) repo-root-relative dependencies' file paths are sorted
     * - A SHA1 hash is created and each (sorted) file path is fed into the hash and then its
     *   Git SHA is fed into the hash
     * - A hex digest of the hash is returned
     */
    async getProjectStateHash(projectName, terminal) {
        let projectState = this._projectStateCache.get(projectName);
        if (!projectState) {
            const packageDeps = await this.getPackageDeps(projectName, terminal);
            if (!packageDeps) {
                return undefined;
            }
            else {
                const sortedPackageDepsFiles = Array.from(packageDeps.keys()).sort();
                const hash = crypto.createHash('sha1');
                for (const packageDepsFile of sortedPackageDepsFiles) {
                    hash.update(packageDepsFile);
                    hash.update(RushConstants_1.RushConstants.hashDelimiter);
                    hash.update(packageDeps.get(packageDepsFile));
                    hash.update(RushConstants_1.RushConstants.hashDelimiter);
                }
                projectState = hash.digest('hex');
                this._projectStateCache.set(projectName, projectState);
            }
        }
        return projectState;
    }
    async _getData(terminal) {
        const repoDeps = this._getRepoDeps();
        if (!repoDeps) {
            return undefined;
        }
        const projectHashDeps = new Map();
        const ignoreMatcherForProject = new Map();
        // Initialize maps for each project asynchronously, up to 10 projects concurrently.
        await node_core_library_1.Async.forEachAsync(this._rushConfiguration.projects, async (project) => {
            projectHashDeps.set(project.packageName, new Map());
            ignoreMatcherForProject.set(project.packageName, await this._getIgnoreMatcherForProject(project, terminal));
        }, { concurrency: 10 });
        // Sort each project folder into its own package deps hash
        for (const [filePath, fileHash] of repoDeps) {
            // findProjectForPosixRelativePath uses LookupByPath, for which lookups are O(K)
            // K being the maximum folder depth of any project in rush.json (usually on the order of 3)
            const owningProject = this._rushConfiguration.findProjectForPosixRelativePath(filePath);
            if (owningProject) {
                // At this point, `filePath` is guaranteed to start with `projectRelativeFolder`, so
                // we can safely slice off the first N characters to get the file path relative to the
                // root of the `owningProject`.
                const relativePath = filePath.slice(owningProject.projectRelativeFolder.length + 1);
                const ignoreMatcher = ignoreMatcherForProject.get(owningProject.packageName);
                if (!ignoreMatcher || !ignoreMatcher.ignores(relativePath)) {
                    projectHashDeps.get(owningProject.packageName).set(filePath, fileHash);
                }
            }
        }
        // Currently, only pnpm handles project shrinkwraps
        if (this._rushConfiguration.packageManager === 'pnpm') {
            const projects = [];
            const projectDependencyManifestPaths = [];
            for (const project of this._rushConfiguration.projects) {
                const projectShrinkwrapFilePath = BaseProjectShrinkwrapFile_1.BaseProjectShrinkwrapFile.getFilePathForProject(project);
                const relativeProjectShrinkwrapFilePath = node_core_library_1.Path.convertToSlashes(path.relative(this._rushConfiguration.rushJsonFolder, projectShrinkwrapFilePath));
                if (!node_core_library_1.FileSystem.exists(projectShrinkwrapFilePath)) {
                    throw new Error(`A project dependency file (${relativeProjectShrinkwrapFilePath}) is missing. You may need to run ` +
                        '"rush install" or "rush update".');
                }
                projects.push(project);
                projectDependencyManifestPaths.push(relativeProjectShrinkwrapFilePath);
            }
            const gitPath = this._git.getGitPathOrThrow();
            const hashes = package_deps_hash_1.getGitHashForFiles(projectDependencyManifestPaths, this._rushConfiguration.rushJsonFolder, gitPath);
            for (let i = 0; i < projects.length; i++) {
                const project = projects[i];
                const projectDependencyManifestPath = projectDependencyManifestPaths[i];
                if (!hashes.has(projectDependencyManifestPath)) {
                    throw new node_core_library_1.InternalError(`Expected to get a hash for ${projectDependencyManifestPath}`);
                }
                const hash = hashes.get(projectDependencyManifestPath);
                projectHashDeps.get(project.packageName).set(projectDependencyManifestPath, hash);
            }
        }
        else {
            // Determine the current variant from the link JSON.
            const variant = this._rushConfiguration.currentInstalledVariant;
            // Add the shrinkwrap file to every project's dependencies
            const shrinkwrapFile = node_core_library_1.Path.convertToSlashes(path.relative(this._rushConfiguration.rushJsonFolder, this._rushConfiguration.getCommittedShrinkwrapFilename(variant)));
            for (const project of this._rushConfiguration.projects) {
                const shrinkwrapHash = repoDeps.get(shrinkwrapFile);
                if (shrinkwrapHash) {
                    projectHashDeps.get(project.packageName).set(shrinkwrapFile, shrinkwrapHash);
                }
            }
        }
        return projectHashDeps;
    }
    async _getIgnoreMatcherForProject(project, terminal) {
        const projectConfiguration = await RushProjectConfiguration_1.RushProjectConfiguration.tryLoadForProjectAsync(project, undefined, terminal);
        const ignoreMatcher = ignore_1.default();
        if (projectConfiguration && projectConfiguration.incrementalBuildIgnoredGlobs) {
            ignoreMatcher.add(projectConfiguration.incrementalBuildIgnoredGlobs);
        }
        return ignoreMatcher;
    }
    _getRepoDeps() {
        try {
            if (this._git.isPathUnderGitWorkingTree()) {
                // Load the package deps hash for the whole repository
                const gitPath = this._git.getGitPathOrThrow();
                return package_deps_hash_1.getPackageDeps(this._rushConfiguration.rushJsonFolder, [], gitPath);
            }
            else {
                return undefined;
            }
        }
        catch (e) {
            // If getPackageDeps fails, don't fail the whole build. Treat this case as if we don't know anything about
            // the state of the files in the repo. This can happen if the environment doesn't have Git.
            console.log(safe_1.default.yellow(`Error calculating the state of the repo. (inner error: ${e}). Continuing without diffing files.`));
            return undefined;
        }
    }
}
exports.PackageChangeAnalyzer = PackageChangeAnalyzer;
//# sourceMappingURL=PackageChangeAnalyzer.js.map