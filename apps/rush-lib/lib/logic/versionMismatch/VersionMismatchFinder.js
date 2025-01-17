"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VersionMismatchFinder = void 0;
const safe_1 = __importDefault(require("colors/safe"));
const node_core_library_1 = require("@rushstack/node-core-library");
const VersionMismatchFinderProject_1 = require("./VersionMismatchFinderProject");
const VersionMismatchFinderCommonVersions_1 = require("./VersionMismatchFinderCommonVersions");
class VersionMismatchFinder {
    constructor(projects, allowedAlternativeVersions) {
        this._projects = projects;
        this._mismatches = new Map();
        this._allowedAlternativeVersion = allowedAlternativeVersions || new Map();
        this._analyze();
    }
    static rushCheck(rushConfiguration, options = {}) {
        VersionMismatchFinder._checkForInconsistentVersions(rushConfiguration, Object.assign(Object.assign({}, options), { isRushCheckCommand: true }));
    }
    static ensureConsistentVersions(rushConfiguration, options = {}) {
        VersionMismatchFinder._checkForInconsistentVersions(rushConfiguration, Object.assign(Object.assign({}, options), { isRushCheckCommand: false }));
    }
    /**
     * Populates a version mismatch finder object given a Rush Configuration.
     * Intentionally considers preferred versions.
     */
    static getMismatches(rushConfiguration, options = {}) {
        const commonVersions = rushConfiguration.getCommonVersions(options.variant);
        const projects = rushConfiguration.projects.map((project) => {
            return new VersionMismatchFinderProject_1.VersionMismatchFinderProject(project);
        });
        // Create an object for the purposes of reporting conflicts with preferredVersions
        // or xstitchPreferredVersions from common-versions.json
        projects.push(new VersionMismatchFinderCommonVersions_1.VersionMismatchFinderCommonVersions(commonVersions));
        return new VersionMismatchFinder(projects, commonVersions.allowedAlternativeVersions);
    }
    static _checkForInconsistentVersions(rushConfiguration, options) {
        if (rushConfiguration.ensureConsistentVersions || options.isRushCheckCommand) {
            const mismatchFinder = VersionMismatchFinder.getMismatches(rushConfiguration, options);
            if (options.printAsJson) {
                mismatchFinder.printAsJson();
            }
            else {
                mismatchFinder.print();
                if (mismatchFinder.numberOfMismatches > 0) {
                    console.log(safe_1.default.red(`Found ${mismatchFinder.numberOfMismatches} mis-matching dependencies!`));
                    throw new node_core_library_1.AlreadyReportedError();
                }
                else {
                    if (options.isRushCheckCommand) {
                        console.log(safe_1.default.green(`Found no mis-matching dependencies!`));
                    }
                }
            }
        }
    }
    get numberOfMismatches() {
        return this._mismatches.size;
    }
    getMismatches() {
        return this._getKeys(this._mismatches);
    }
    getVersionsOfMismatch(mismatch) {
        return this._mismatches.has(mismatch) ? this._getKeys(this._mismatches.get(mismatch)) : undefined;
    }
    getConsumersOfMismatch(mismatch, version) {
        const mismatchedPackage = this._mismatches.get(mismatch);
        if (!mismatchedPackage) {
            return undefined;
        }
        const mismatchedVersion = mismatchedPackage.get(version);
        return mismatchedVersion;
    }
    printAsJson() {
        const mismatchDependencies = [];
        this.getMismatches().forEach((dependency) => {
            const mismatchDependencyVersionArray = [];
            this.getVersionsOfMismatch(dependency).forEach((version) => {
                const projects = [];
                this.getConsumersOfMismatch(dependency, version).forEach((project) => {
                    projects.push(project.friendlyName);
                });
                const mismatchDependencyVersion = {
                    version: version,
                    projects: projects
                };
                mismatchDependencyVersionArray.push(mismatchDependencyVersion);
            });
            const mismatchDependency = {
                dependencyName: dependency,
                versions: mismatchDependencyVersionArray
            };
            mismatchDependencies.push(mismatchDependency);
        });
        const output = {
            mismatchedVersions: mismatchDependencies
        };
        console.log(JSON.stringify(output, undefined, 2));
    }
    print() {
        // Iterate over the list. For any dependency with mismatching versions, print the projects
        this.getMismatches().forEach((dependency) => {
            console.log(safe_1.default.yellow(dependency));
            this.getVersionsOfMismatch(dependency).forEach((version) => {
                console.log(`  ${version}`);
                this.getConsumersOfMismatch(dependency, version).forEach((project) => {
                    console.log(`   - ${project.friendlyName}`);
                });
            });
            console.log();
        });
    }
    _analyze() {
        this._projects.forEach((project) => {
            if (!project.skipRushCheck) {
                // NOTE: We do not consider peer dependencies here.  The purpose of "rush check" is
                // mainly to avoid side-by-side duplicates in the node_modules folder, whereas
                // peer dependencies are just a compatibility statement that will be satisfied by a
                // regular dependency.  (It might be useful for Rush to help people keep their peer dependency
                // patterns consistent, but on the other hand different projects may have different
                // levels of compatibility -- we should wait for someone to actually request this feature
                // before we get into that.)
                project.allDependencies.forEach((dependency) => {
                    if (dependency.dependencyType !== "peerDependencies" /* Peer */) {
                        const version = dependency.version;
                        const isCyclic = project.cyclicDependencyProjects.has(dependency.name);
                        if (this._isVersionAllowedAlternative(dependency.name, version)) {
                            return;
                        }
                        const name = dependency.name + (isCyclic ? ' (cyclic)' : '');
                        if (!this._mismatches.has(name)) {
                            this._mismatches.set(name, new Map());
                        }
                        const dependencyVersions = this._mismatches.get(name);
                        if (!dependencyVersions.has(version)) {
                            dependencyVersions.set(version, []);
                        }
                        dependencyVersions.get(version).push(project);
                    }
                });
            }
        });
        this._mismatches.forEach((mismatches, project) => {
            if (mismatches.size <= 1) {
                this._mismatches.delete(project);
            }
        });
    }
    _isVersionAllowedAlternative(dependency, version) {
        const allowedAlternatives = this._allowedAlternativeVersion.get(dependency);
        return Boolean(allowedAlternatives && allowedAlternatives.indexOf(version) > -1);
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _getKeys(iterable) {
        const keys = [];
        if (iterable) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            iterable.forEach((value, key) => {
                keys.push(key);
            });
        }
        return keys;
    }
}
exports.VersionMismatchFinder = VersionMismatchFinder;
//# sourceMappingURL=VersionMismatchFinder.js.map