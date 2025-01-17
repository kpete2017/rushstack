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
exports.PackageJsonEditor = exports.PackageJsonDependency = void 0;
const semver = __importStar(require("semver"));
const node_core_library_1 = require("@rushstack/node-core-library");
const lodash = node_core_library_1.Import.lazy('lodash', require);
/**
 * @beta
 */
class PackageJsonDependency {
    constructor(name, version, type, onChange) {
        this._name = name;
        this._version = version;
        this._type = type;
        this._onChange = onChange;
    }
    get name() {
        return this._name;
    }
    get version() {
        return this._version;
    }
    setVersion(newVersion) {
        if (!semver.valid(newVersion) && !semver.validRange(newVersion)) {
            throw new Error(`Cannot set version to invalid value: "${newVersion}"`);
        }
        this._version = newVersion;
        this._onChange();
    }
    get dependencyType() {
        return this._type;
    }
}
exports.PackageJsonDependency = PackageJsonDependency;
/**
 * @beta
 */
class PackageJsonEditor {
    constructor(filepath, data) {
        this._filePath = filepath;
        this._sourceData = data;
        this._modified = false;
        this._dependencies = new Map();
        this._devDependencies = new Map();
        this._resolutions = new Map();
        const dependencies = data.dependencies || {};
        const optionalDependencies = data.optionalDependencies || {};
        const peerDependencies = data.peerDependencies || {};
        const devDependencies = data.devDependencies || {};
        const resolutions = data.resolutions || {};
        const _onChange = this._onChange.bind(this);
        try {
            Object.keys(dependencies || {}).forEach((packageName) => {
                if (Object.prototype.hasOwnProperty.call(optionalDependencies, packageName)) {
                    throw new Error(`The package "${packageName}" cannot be listed in both ` +
                        `"dependencies" and "optionalDependencies"`);
                }
                if (Object.prototype.hasOwnProperty.call(peerDependencies, packageName)) {
                    throw new Error(`The package "${packageName}" cannot be listed in both "dependencies" and "peerDependencies"`);
                }
                this._dependencies.set(packageName, new PackageJsonDependency(packageName, dependencies[packageName], "dependencies" /* Regular */, _onChange));
            });
            Object.keys(optionalDependencies || {}).forEach((packageName) => {
                if (Object.prototype.hasOwnProperty.call(peerDependencies, packageName)) {
                    throw new Error(`The package "${packageName}" cannot be listed in both ` +
                        `"optionalDependencies" and "peerDependencies"`);
                }
                this._dependencies.set(packageName, new PackageJsonDependency(packageName, optionalDependencies[packageName], "optionalDependencies" /* Optional */, _onChange));
            });
            Object.keys(peerDependencies || {}).forEach((packageName) => {
                this._dependencies.set(packageName, new PackageJsonDependency(packageName, peerDependencies[packageName], "peerDependencies" /* Peer */, _onChange));
            });
            Object.keys(devDependencies || {}).forEach((packageName) => {
                this._devDependencies.set(packageName, new PackageJsonDependency(packageName, devDependencies[packageName], "devDependencies" /* Dev */, _onChange));
            });
            Object.keys(resolutions || {}).forEach((packageName) => {
                this._resolutions.set(packageName, new PackageJsonDependency(packageName, resolutions[packageName], "resolutions" /* YarnResolutions */, _onChange));
            });
            // (Do not sort this._resolutions because order may be significant; the RFC is unclear about that.)
            node_core_library_1.Sort.sortMapKeys(this._dependencies);
            node_core_library_1.Sort.sortMapKeys(this._devDependencies);
        }
        catch (e) {
            throw new Error(`Error loading "${filepath}": ${e.message}`);
        }
    }
    static load(filePath) {
        return new PackageJsonEditor(filePath, node_core_library_1.JsonFile.load(filePath));
    }
    static fromObject(object, filename) {
        return new PackageJsonEditor(filename, object);
    }
    get name() {
        return this._sourceData.name;
    }
    get version() {
        return this._sourceData.version;
    }
    get filePath() {
        return this._filePath;
    }
    /**
     * The list of dependencies of type DependencyType.Regular, DependencyType.Optional, or DependencyType.Peer.
     */
    get dependencyList() {
        return [...this._dependencies.values()];
    }
    /**
     * The list of dependencies of type DependencyType.Dev.
     */
    get devDependencyList() {
        return [...this._devDependencies.values()];
    }
    /**
     * This field is a Yarn-specific feature that allows overriding of package resolution.
     *
     * @remarks
     * See the {@link https://github.com/yarnpkg/rfcs/blob/master/implemented/0000-selective-versions-resolutions.md
     * | 0000-selective-versions-resolutions.md RFC} for details.
     */
    get resolutionsList() {
        return [...this._resolutions.values()];
    }
    tryGetDependency(packageName) {
        return this._dependencies.get(packageName);
    }
    tryGetDevDependency(packageName) {
        return this._devDependencies.get(packageName);
    }
    addOrUpdateDependency(packageName, newVersion, dependencyType) {
        const dependency = new PackageJsonDependency(packageName, newVersion, dependencyType, this._onChange.bind(this));
        // Rush collapses everything that isn't a devDependency into the dependencies
        // field, so we need to set the value depending on dependency type
        switch (dependencyType) {
            case "dependencies" /* Regular */:
            case "optionalDependencies" /* Optional */:
            case "peerDependencies" /* Peer */:
                this._dependencies.set(packageName, dependency);
                break;
            case "devDependencies" /* Dev */:
                this._devDependencies.set(packageName, dependency);
                break;
            case "resolutions" /* YarnResolutions */:
                this._resolutions.set(packageName, dependency);
                break;
            default:
                throw new node_core_library_1.InternalError('Unsupported DependencyType');
        }
        this._modified = true;
    }
    saveIfModified() {
        if (this._modified) {
            this._modified = false;
            this._sourceData = this._normalize(this._sourceData);
            node_core_library_1.JsonFile.save(this._sourceData, this._filePath, { updateExistingFile: true });
            return true;
        }
        return false;
    }
    /**
     * Get the normalized package.json that represents the current state of the
     * PackageJsonEditor. This method does not save any changes that were made to the
     * package.json, but instead returns the object representation of what would be saved
     * if saveIfModified() is called.
     */
    saveToObject() {
        // Only normalize if we need to
        const sourceData = this._modified ? this._normalize(this._sourceData) : this._sourceData;
        // Provide a clone to avoid reference back to the original data object
        return lodash.cloneDeep(sourceData);
    }
    _onChange() {
        this._modified = true;
    }
    /**
     * Create a normalized shallow copy of the provided package.json without modifying the
     * original. If the result of this method is being returned via a public facing method,
     * it will still need to be deep-cloned to avoid propogating changes back to the
     * original dataset.
     */
    _normalize(source) {
        const normalizedData = Object.assign({}, source);
        delete normalizedData.dependencies;
        delete normalizedData.optionalDependencies;
        delete normalizedData.peerDependencies;
        delete normalizedData.devDependencies;
        delete normalizedData.resolutions;
        const keys = [...this._dependencies.keys()].sort();
        for (const packageName of keys) {
            const dependency = this._dependencies.get(packageName);
            switch (dependency.dependencyType) {
                case "dependencies" /* Regular */:
                    if (!normalizedData.dependencies) {
                        normalizedData.dependencies = {};
                    }
                    normalizedData.dependencies[dependency.name] = dependency.version;
                    break;
                case "optionalDependencies" /* Optional */:
                    if (!normalizedData.optionalDependencies) {
                        normalizedData.optionalDependencies = {};
                    }
                    normalizedData.optionalDependencies[dependency.name] = dependency.version;
                    break;
                case "peerDependencies" /* Peer */:
                    if (!normalizedData.peerDependencies) {
                        normalizedData.peerDependencies = {};
                    }
                    normalizedData.peerDependencies[dependency.name] = dependency.version;
                    break;
                case "devDependencies" /* Dev */: // uses this._devDependencies instead
                case "resolutions" /* YarnResolutions */: // uses this._resolutions instead
                default:
                    throw new node_core_library_1.InternalError('Unsupported DependencyType');
            }
        }
        const devDependenciesKeys = [...this._devDependencies.keys()].sort();
        for (const packageName of devDependenciesKeys) {
            const dependency = this._devDependencies.get(packageName);
            if (!normalizedData.devDependencies) {
                normalizedData.devDependencies = {};
            }
            normalizedData.devDependencies[dependency.name] = dependency.version;
        }
        // (Do not sort this._resolutions because order may be significant; the RFC is unclear about that.)
        for (const packageName of this._resolutions.keys()) {
            const dependency = this._resolutions.get(packageName);
            if (!normalizedData.resolutions) {
                normalizedData.resolutions = {};
            }
            normalizedData.resolutions[dependency.name] = dependency.version;
        }
        return normalizedData;
    }
}
exports.PackageJsonEditor = PackageJsonEditor;
//# sourceMappingURL=PackageJsonEditor.js.map