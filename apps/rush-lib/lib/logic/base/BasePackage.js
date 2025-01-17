"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasePackage = exports.PackageDependencyKind = void 0;
const node_core_library_1 = require("@rushstack/node-core-library");
/**
 * The type of dependency; used by IPackageDependency.
 */
var PackageDependencyKind;
(function (PackageDependencyKind) {
    PackageDependencyKind[PackageDependencyKind["Normal"] = 0] = "Normal";
    /**
     * The dependency was listed in the optionalDependencies section of package.json.
     */
    PackageDependencyKind[PackageDependencyKind["Optional"] = 1] = "Optional";
    /**
     * The dependency should be a symlink to a project that is locally built by Rush..
     */
    PackageDependencyKind[PackageDependencyKind["LocalLink"] = 2] = "LocalLink";
})(PackageDependencyKind = exports.PackageDependencyKind || (exports.PackageDependencyKind = {}));
/**
 * Represents an NPM package being processed by the linking algorithm.
 */
class BasePackage {
    constructor(name, version, folderPath, packageJson) {
        /**
         * If this is a local path that we are planning to symlink to a target folder,
         * then symlinkTargetFolderPath keeps track of the intended target.
         */
        this.symlinkTargetFolderPath = undefined;
        this.name = name;
        this.packageJson = packageJson;
        this.version = version;
        this.folderPath = folderPath;
        // Extract `@alias-scope/alias-name` from  `C:\node_modules\@alias-scope\alias-name`
        const pathParts = folderPath.split(/[\\\/]/);
        this.installedName = pathParts[pathParts.length - 1];
        if (pathParts.length >= 2) {
            // Is there an NPM scope?
            const parentFolder = pathParts[pathParts.length - 2];
            if (parentFolder[0] === '@') {
                this.installedName = parentFolder + '/' + this.installedName;
            }
        }
        this.children = [];
        this._childrenByName = new Map();
    }
    /**
     * Used by link managers, creates a virtual Package object that represents symbolic links
     * which will be created later
     */
    static createLinkedPackage(name, version, folderPath, packageJson) {
        return new BasePackage(name, version, folderPath, packageJson);
    }
    /**
     * Used by "npm link" to simulate a temp project that is missing from the common/node_modules
     * folder (e.g. because it was added after the shrinkwrap file was regenerated).
     * @param packageJsonFilename - Filename of the source package.json
     *        Example: `C:\MyRepo\common\temp\projects\project1\package.json`
     * @param targetFolderName - Filename where it should have been installed
     *        Example: `C:\MyRepo\common\temp\node_modules\@rush-temp\project1`
     */
    static createVirtualTempPackage(packageJsonFilename, installFolderName) {
        const packageJson = node_core_library_1.JsonFile.load(packageJsonFilename);
        return BasePackage.createLinkedPackage(packageJson.name, packageJson.version, installFolderName, packageJson);
    }
    get nameAndVersion() {
        let result = '';
        if (this.name) {
            result += this.name;
        }
        else {
            result += '(missing name)';
        }
        result += '@';
        if (this.version) {
            result += this.version;
        }
        else {
            result += '(missing version)';
        }
        return result;
    }
    addChild(child) {
        if (child.parent) {
            throw new Error('Child already has a parent');
        }
        if (this._childrenByName.has(child.name)) {
            throw new Error('Child already exists');
        }
        child.parent = this;
        this.children.push(child);
        this._childrenByName.set(child.name, child);
    }
    getChildByName(childPackageName) {
        return this._childrenByName.get(childPackageName);
    }
    printTree(indent) {
        if (!indent) {
            indent = '';
        }
        console.log(indent + this.nameAndVersion);
        for (const child of this.children) {
            child.printTree(indent + '  ');
        }
    }
}
exports.BasePackage = BasePackage;
//# sourceMappingURL=BasePackage.js.map