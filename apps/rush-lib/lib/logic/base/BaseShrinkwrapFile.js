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
exports.BaseShrinkwrapFile = void 0;
const safe_1 = __importDefault(require("colors/safe"));
const semver = __importStar(require("semver"));
const RushConstants_1 = require("../../logic/RushConstants");
const DependencySpecifier_1 = require("../DependencySpecifier");
const PackageNameParsers_1 = require("../../api/PackageNameParsers");
/**
 * This class is a parser for both npm's npm-shrinkwrap.json and pnpm's pnpm-lock.yaml file formats.
 */
class BaseShrinkwrapFile {
    constructor() {
        this._alreadyWarnedSpecs = new Set();
    }
    static tryGetValue(dictionary, key) {
        if (dictionary.hasOwnProperty(key)) {
            return dictionary[key];
        }
        return undefined;
    }
    /**
     * Validate the shrinkwrap using the provided policy options.
     *
     * @virtual
     */
    validate(packageManagerOptionsConfig, policyOptions, experimentsConfig) { }
    /**
     * Returns true if the shrinkwrap file includes a top-level package that would satisfy the specified
     * package name and SemVer version range
     *
     * @virtual
     */
    hasCompatibleTopLevelDependency(dependencySpecifier) {
        const shrinkwrapDependency = this.getTopLevelDependencyVersion(dependencySpecifier.packageName);
        if (!shrinkwrapDependency) {
            return false;
        }
        return this._checkDependencyVersion(dependencySpecifier, shrinkwrapDependency);
    }
    /**
     * Returns true if the shrinkwrap file includes a package that would satisfying the specified
     * package name and SemVer version range.  By default, the dependencies are resolved by looking
     * at the root of the node_modules folder described by the shrinkwrap file.  However, if
     * tempProjectName is specified, then the resolution will start in that subfolder.
     *
     * Consider this example:
     *
     * - node_modules\
     *   - temp-project\
     *     - lib-a@1.2.3
     *     - lib-b@1.0.0
     *   - lib-b@2.0.0
     *
     * In this example, hasCompatibleDependency("lib-b", ">= 1.1.0", "temp-project") would fail
     * because it finds lib-b@1.0.0 which does not satisfy the pattern ">= 1.1.0".
     *
     * @virtual
     */
    tryEnsureCompatibleDependency(dependencySpecifier, tempProjectName) {
        const shrinkwrapDependency = this.tryEnsureDependencyVersion(dependencySpecifier, tempProjectName);
        if (!shrinkwrapDependency) {
            return false;
        }
        return this._checkDependencyVersion(dependencySpecifier, shrinkwrapDependency);
    }
    /**
     * Check for projects that exist in the shrinkwrap file, but don't exist
     * in rush.json.  This might occur, e.g. if a project was recently deleted or renamed.
     *
     * @returns a list of orphaned projects.
     */
    findOrphanedProjects(rushConfiguration) {
        const orphanedProjectNames = [];
        // We can recognize temp projects because they are under the "@rush-temp" NPM scope.
        for (const tempProjectName of this.getTempProjectNames()) {
            if (!rushConfiguration.findProjectByTempName(tempProjectName)) {
                orphanedProjectNames.push(tempProjectName);
            }
        }
        return orphanedProjectNames;
    }
    _getTempProjectNames(dependencies) {
        const result = [];
        for (const key of Object.keys(dependencies)) {
            // If it starts with @rush-temp, then include it:
            if (PackageNameParsers_1.PackageNameParsers.permissive.getScope(key) === RushConstants_1.RushConstants.rushTempNpmScope) {
                result.push(key);
            }
        }
        result.sort(); // make the result deterministic
        return result;
    }
    _checkDependencyVersion(projectDependency, shrinkwrapDependency) {
        let normalizedProjectDependency = projectDependency;
        let normalizedShrinkwrapDependency = shrinkwrapDependency;
        // Special handling for NPM package aliases such as this:
        //
        // "dependencies": {
        //   "alias-name": "npm:target-name@^1.2.3"
        // }
        //
        // In this case, the shrinkwrap file will have a key equivalent to "npm:target-name@1.2.5",
        // and so we need to unwrap the target and compare "1.2.5" with "^1.2.3".
        if (projectDependency.specifierType === DependencySpecifier_1.DependencySpecifierType.Alias) {
            // Does the shrinkwrap install it as an alias?
            if (shrinkwrapDependency.specifierType === DependencySpecifier_1.DependencySpecifierType.Alias) {
                // Does the shrinkwrap have the right package name?
                if (projectDependency.packageName === shrinkwrapDependency.packageName) {
                    // Yes, the aliases match, so let's compare their targets in the logic below
                    normalizedProjectDependency = projectDependency.aliasTarget;
                    normalizedShrinkwrapDependency = shrinkwrapDependency.aliasTarget;
                }
                else {
                    // If the names are different, then it's a mismatch
                    return false;
                }
            }
            else {
                // A non-alias cannot satisfy an alias dependency; at least, let's avoid that idea
                return false;
            }
        }
        switch (normalizedProjectDependency.specifierType) {
            case DependencySpecifier_1.DependencySpecifierType.Version:
            case DependencySpecifier_1.DependencySpecifierType.Range:
                return semver.satisfies(normalizedShrinkwrapDependency.versionSpecifier, normalizedProjectDependency.versionSpecifier);
            default:
                // For other version specifier types like "file:./blah.tgz" or "git://github.com/npm/cli.git#v1.0.27"
                // we allow the installation to continue but issue a warning.  The "rush install" checks will not work
                // correctly.
                // Only warn once for each versionSpecifier
                if (!this._alreadyWarnedSpecs.has(projectDependency.versionSpecifier)) {
                    this._alreadyWarnedSpecs.add(projectDependency.versionSpecifier);
                    console.log(safe_1.default.yellow(`WARNING: Not validating ${projectDependency.specifierType}-based` +
                        ` specifier: "${projectDependency.versionSpecifier}"`));
                }
                return true;
        }
    }
}
exports.BaseShrinkwrapFile = BaseShrinkwrapFile;
//# sourceMappingURL=BaseShrinkwrapFile.js.map