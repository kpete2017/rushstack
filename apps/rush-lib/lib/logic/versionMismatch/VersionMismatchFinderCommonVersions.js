"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.VersionMismatchFinderCommonVersions = void 0;
const RushConstants_1 = require("../RushConstants");
const PackageJsonEditor_1 = require("../../api/PackageJsonEditor");
const VersionMismatchFinderEntity_1 = require("./VersionMismatchFinderEntity");
class VersionMismatchFinderCommonVersions extends VersionMismatchFinderEntity_1.VersionMismatchFinderEntity {
    constructor(commonVersionsConfiguration) {
        super({
            friendlyName: `preferred versions from ${RushConstants_1.RushConstants.commonVersionsFilename}`,
            cyclicDependencyProjects: new Set()
        });
        this._fileManager = commonVersionsConfiguration;
    }
    get filePath() {
        return this._fileManager.filePath;
    }
    get allDependencies() {
        const dependencies = [];
        this._fileManager.getAllPreferredVersions().forEach((version, dependencyName) => {
            dependencies.push(this._getPackageJsonDependency(dependencyName, version));
        });
        return dependencies;
    }
    tryGetDependency(packageName) {
        const version = this._fileManager.getAllPreferredVersions().get(packageName);
        if (!version) {
            return undefined;
        }
        else {
            return this._getPackageJsonDependency(packageName, version);
        }
    }
    tryGetDevDependency(packageName) {
        return undefined; // common-versions.json doesn't have a distinction between dev and non-dev dependencies
    }
    addOrUpdateDependency(packageName, newVersion, dependencyType) {
        if (dependencyType !== "dependencies" /* Regular */) {
            throw new Error(`${RushConstants_1.RushConstants.commonVersionsFilename} only accepts "${"dependencies" /* Regular */}" dependencies`);
        }
        if (this._fileManager.xstitchPreferredVersions.has(packageName)) {
            this._fileManager.xstitchPreferredVersions.set(packageName, newVersion);
        }
        else {
            this._fileManager.preferredVersions.set(packageName, newVersion);
        }
    }
    saveIfModified() {
        return this._fileManager.save();
    }
    _getPackageJsonDependency(dependencyName, version) {
        return new PackageJsonEditor_1.PackageJsonDependency(dependencyName, version, "dependencies" /* Regular */, () => this.addOrUpdateDependency(dependencyName, version, "dependencies" /* Regular */));
    }
}
exports.VersionMismatchFinderCommonVersions = VersionMismatchFinderCommonVersions;
//# sourceMappingURL=VersionMismatchFinderCommonVersions.js.map