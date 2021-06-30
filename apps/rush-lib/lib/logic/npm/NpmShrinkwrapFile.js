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
exports.NpmShrinkwrapFile = void 0;
const os = __importStar(require("os"));
const node_core_library_1 = require("@rushstack/node-core-library");
const BaseShrinkwrapFile_1 = require("../base/BaseShrinkwrapFile");
const DependencySpecifier_1 = require("../DependencySpecifier");
class NpmShrinkwrapFile extends BaseShrinkwrapFile_1.BaseShrinkwrapFile {
    constructor(shrinkwrapJson) {
        super();
        this._shrinkwrapJson = shrinkwrapJson;
        // Normalize the data
        if (!this._shrinkwrapJson.version) {
            this._shrinkwrapJson.version = '';
        }
        if (!this._shrinkwrapJson.name) {
            this._shrinkwrapJson.name = '';
        }
        if (!this._shrinkwrapJson.dependencies) {
            this._shrinkwrapJson.dependencies = {};
        }
        // Workspaces not supported in NPM
        this.isWorkspaceCompatible = false;
    }
    static loadFromFile(shrinkwrapJsonFilename) {
        let data = undefined;
        try {
            if (!node_core_library_1.FileSystem.exists(shrinkwrapJsonFilename)) {
                return undefined; // file does not exist
            }
            // We don't use JsonFile/jju here because shrinkwrap.json is a special NPM file format
            // and typically very large, so we want to load it the same way that NPM does.
            data = node_core_library_1.FileSystem.readFile(shrinkwrapJsonFilename);
            if (data.charCodeAt(0) === 0xfeff) {
                // strip BOM
                data = data.slice(1);
            }
            return new NpmShrinkwrapFile(JSON.parse(data));
        }
        catch (error) {
            throw new Error(`Error reading "${shrinkwrapJsonFilename}":` + os.EOL + `  ${error.message}`);
        }
    }
    /** @override */
    getTempProjectNames() {
        return this._getTempProjectNames(this._shrinkwrapJson.dependencies);
    }
    /** @override */
    serialize() {
        return node_core_library_1.JsonFile.stringify(this._shrinkwrapJson);
    }
    /** @override */
    getTopLevelDependencyVersion(dependencyName) {
        // First, check under tempProjectName, as this is the first place we look during linking.
        const dependencyJson = NpmShrinkwrapFile.tryGetValue(this._shrinkwrapJson.dependencies, dependencyName);
        if (!dependencyJson) {
            return undefined;
        }
        return new DependencySpecifier_1.DependencySpecifier(dependencyName, dependencyJson.version);
    }
    /**
     * @param dependencyName the name of the dependency to get a version for
     * @param tempProjectName the name of the temp project to check for this dependency
     * @param versionRange Not used, just exists to satisfy abstract API contract
     * @override
     */
    tryEnsureDependencyVersion(dependencySpecifier, tempProjectName) {
        // First, check under tempProjectName, as this is the first place we look during linking.
        let dependencyJson = undefined;
        const tempDependency = NpmShrinkwrapFile.tryGetValue(this._shrinkwrapJson.dependencies, tempProjectName);
        if (tempDependency && tempDependency.dependencies) {
            dependencyJson = NpmShrinkwrapFile.tryGetValue(tempDependency.dependencies, dependencySpecifier.packageName);
        }
        // Otherwise look at the root of the shrinkwrap file
        if (!dependencyJson) {
            return this.getTopLevelDependencyVersion(dependencySpecifier.packageName);
        }
        return new DependencySpecifier_1.DependencySpecifier(dependencySpecifier.packageName, dependencyJson.version);
    }
    /** @override */
    getProjectShrinkwrap(project) {
        return undefined;
    }
    /** @override */
    isWorkspaceProjectModified(project, variant) {
        throw new node_core_library_1.InternalError('Not implemented');
    }
}
exports.NpmShrinkwrapFile = NpmShrinkwrapFile;
//# sourceMappingURL=NpmShrinkwrapFile.js.map