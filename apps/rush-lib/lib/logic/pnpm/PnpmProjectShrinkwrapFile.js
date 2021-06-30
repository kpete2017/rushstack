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
exports.PnpmProjectShrinkwrapFile = void 0;
const crypto = __importStar(require("crypto"));
const node_core_library_1 = require("@rushstack/node-core-library");
const BaseProjectShrinkwrapFile_1 = require("../base/BaseProjectShrinkwrapFile");
const RushConstants_1 = require("../RushConstants");
/**
 *
 */
class PnpmProjectShrinkwrapFile extends BaseProjectShrinkwrapFile_1.BaseProjectShrinkwrapFile {
    /**
     * Generate and write the project shrinkwrap file to <project>/.rush/temp/shrinkwrap-deps.json.
     * @returns True if the project shrinkwrap was created or updated, false otherwise.
     */
    async updateProjectShrinkwrapAsync() {
        const projectShrinkwrapMap = this.shrinkwrapFile.isWorkspaceCompatible
            ? this.generateWorkspaceProjectShrinkwrapMap()
            : this.generateLegacyProjectShrinkwrapMap();
        return projectShrinkwrapMap ? this.saveAsync(projectShrinkwrapMap) : this.deleteIfExistsAsync();
    }
    generateWorkspaceProjectShrinkwrapMap() {
        // Obtain the workspace importer from the shrinkwrap, which lists resolved dependencies
        const importerKey = this.shrinkwrapFile.getImporterKeyByPath(this.project.rushConfiguration.commonTempFolder, this.project.projectFolder);
        const importer = this.shrinkwrapFile.getImporter(importerKey);
        if (!importer) {
            // It's not in here. This is possible when perfoming filtered installs
            return undefined;
        }
        // Only select the importer dependencies that are non-local since we already handle local
        // project changes
        const externalDependencies = [
            ...Object.entries(importer.dependencies || {}),
            ...Object.entries(importer.devDependencies || {}),
            ...Object.entries(importer.optionalDependencies || {})
        ].filter((d) => d[1].indexOf('link:') === -1);
        const projectShrinkwrapMap = new Map();
        for (const [name, version] of externalDependencies) {
            // Add to the manifest and provide all the parent dependencies
            this._addDependencyRecursive(projectShrinkwrapMap, name, version, {
                dependencies: Object.assign(Object.assign({}, importer.dependencies), importer.devDependencies),
                optionalDependencies: Object.assign({}, importer.optionalDependencies)
            });
        }
        return projectShrinkwrapMap;
    }
    generateLegacyProjectShrinkwrapMap() {
        const tempProjectDependencyKey = this.shrinkwrapFile.getTempProjectDependencyKey(this.project.tempProjectName);
        if (!tempProjectDependencyKey) {
            throw new Error(`Cannot get dependency key for temp project: ${this.project.tempProjectName}`);
        }
        const parentShrinkwrapEntry = this.shrinkwrapFile.getShrinkwrapEntryFromTempProjectDependencyKey(tempProjectDependencyKey);
        // Only select the shrinkwrap dependencies that are non-local since we already handle local
        // project changes
        const externalDependencies = [
            ...Object.entries(parentShrinkwrapEntry.dependencies || {}),
            ...Object.entries(parentShrinkwrapEntry.optionalDependencies || {})
        ].filter((d) => d[0].indexOf('@rush-temp/') === -1);
        const projectShrinkwrapMap = new Map();
        for (const [name, version] of externalDependencies) {
            this._addDependencyRecursive(projectShrinkwrapMap, name, version, parentShrinkwrapEntry);
        }
        // Since peer dependencies within on external packages may be hoisted up to the top-level package,
        // we need to resolve and add these dependencies directly
        this._resolveAndAddPeerDependencies(projectShrinkwrapMap, parentShrinkwrapEntry);
        return projectShrinkwrapMap;
    }
    _addDependencyRecursive(projectShrinkwrapMap, name, version, parentShrinkwrapEntry, throwIfShrinkwrapEntryMissing = true) {
        var _a;
        const shrinkwrapEntry = this.shrinkwrapFile.getShrinkwrapEntry(name, version);
        if (!shrinkwrapEntry) {
            if (throwIfShrinkwrapEntryMissing) {
                throw new node_core_library_1.InternalError(`Unable to find dependency ${name} with version ${version} in shrinkwrap.`);
            }
            return;
        }
        const specifier = `${name}@${version}`;
        let integrity = (_a = shrinkwrapEntry === null || shrinkwrapEntry === void 0 ? void 0 : shrinkwrapEntry.resolution) === null || _a === void 0 ? void 0 : _a.integrity;
        if (!integrity) {
            // git dependency specifiers do not have an integrity entry. Instead, they specify the tarball field.
            // So instead, we will hash the contents of the dependency entry and use that as the integrity hash.
            // Ex:
            // github.com/chfritz/node-xmlrpc/948db2fbd0260e5d56ed5ba58df0f5b6599bbe38:
            //   ...
            //   resolution:
            //     tarball: 'https://codeload.github.com/chfritz/node-xmlrpc/tar.gz/948db2fbd0260e5d56ed5ba58df0f5b6599bbe38'
            const sha256Digest = crypto
                .createHash('sha256')
                .update(JSON.stringify(shrinkwrapEntry))
                .digest('hex');
            integrity = `${name}@${version}:${sha256Digest}:`;
        }
        const existingSpecifier = projectShrinkwrapMap.get(specifier);
        if (existingSpecifier) {
            if (existingSpecifier !== integrity) {
                throw new Error(`Collision: ${specifier} already exists in with a different integrity`);
            }
            return;
        }
        // Add the current dependency
        projectShrinkwrapMap.set(specifier, integrity);
        // Add the dependencies of the dependency
        for (const [name, version] of Object.entries(shrinkwrapEntry.dependencies || {})) {
            this._addDependencyRecursive(projectShrinkwrapMap, name, version, shrinkwrapEntry);
        }
        // Add the optional dependencies of the dependency, and don't blow up if they don't exist
        for (const [name, version] of Object.entries(shrinkwrapEntry.optionalDependencies || {})) {
            this._addDependencyRecursive(projectShrinkwrapMap, name, version, shrinkwrapEntry, 
            /* throwIfShrinkwrapEntryMissing */ false);
        }
        // When using workspaces, hoisting of peer dependencies to a singular top-level project is not possible.
        // Therefore, all packages that are consumed should be specified in the dependency tree. Given this, there
        // is no need to look for peer dependencies, since it is simply a constraint to be validated by the
        // package manager.
        if (!this.shrinkwrapFile.isWorkspaceCompatible) {
            this._resolveAndAddPeerDependencies(projectShrinkwrapMap, shrinkwrapEntry, parentShrinkwrapEntry);
        }
    }
    _resolveAndAddPeerDependencies(projectShrinkwrapMap, shrinkwrapEntry, parentShrinkwrapEntry) {
        var _a, _b, _c;
        for (const peerDependencyName of Object.keys(shrinkwrapEntry.peerDependencies || {})) {
            // Skip peer dependency resolution of local package peer dependencies
            if (peerDependencyName.indexOf(RushConstants_1.RushConstants.rushTempNpmScope) !== -1) {
                continue;
            }
            // Check to see if the peer dependency is satisfied with the current shrinkwrap
            // entry. If not, check the parent shrinkwrap entry. Finally, if neither have
            // the specified dependency, check that the parent mentions the dependency in
            // it's own peer dependencies. If it is, we can rely on the package manager and
            // make the assumption that we've already found it further up the stack.
            if (((_a = shrinkwrapEntry.dependencies) === null || _a === void 0 ? void 0 : _a.hasOwnProperty(peerDependencyName)) || ((_b = parentShrinkwrapEntry === null || parentShrinkwrapEntry === void 0 ? void 0 : parentShrinkwrapEntry.dependencies) === null || _b === void 0 ? void 0 : _b.hasOwnProperty(peerDependencyName)) || ((_c = parentShrinkwrapEntry === null || parentShrinkwrapEntry === void 0 ? void 0 : parentShrinkwrapEntry.peerDependencies) === null || _c === void 0 ? void 0 : _c.hasOwnProperty(peerDependencyName))) {
                continue;
            }
            // As a last attempt, check if it's been hoisted up as a top-level dependency. If
            // we can't find it, we can assume that it's already been provided somewhere up the
            // dependency tree.
            const topLevelDependencySpecifier = this.shrinkwrapFile.getTopLevelDependencyVersion(peerDependencyName);
            if (topLevelDependencySpecifier) {
                this._addDependencyRecursive(projectShrinkwrapMap, peerDependencyName, this.shrinkwrapFile.getTopLevelDependencyKey(peerDependencyName), shrinkwrapEntry);
            }
        }
    }
    /**
     * Save the current state of the object to project/.rush/temp/shrinkwrap-deps.json
     */
    async saveAsync(projectShrinkwrapMap) {
        const file = {};
        const keys = Array.from(projectShrinkwrapMap.keys()).sort();
        for (const key of keys) {
            file[key] = projectShrinkwrapMap.get(key);
        }
        await node_core_library_1.JsonFile.saveAsync(file, this.projectShrinkwrapFilePath, { ensureFolderExists: true });
    }
    /**
     * @override
     */
    get shrinkwrapFile() {
        return super.shrinkwrapFile;
    }
}
exports.PnpmProjectShrinkwrapFile = PnpmProjectShrinkwrapFile;
//# sourceMappingURL=PnpmProjectShrinkwrapFile.js.map