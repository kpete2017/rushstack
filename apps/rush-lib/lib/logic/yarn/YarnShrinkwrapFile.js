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
exports.YarnShrinkwrapFile = void 0;
const os = __importStar(require("os"));
const BaseShrinkwrapFile_1 = require("../base/BaseShrinkwrapFile");
const node_core_library_1 = require("@rushstack/node-core-library");
const RushConstants_1 = require("../RushConstants");
const PackageNameParsers_1 = require("../../api/PackageNameParsers");
const lockfileModule = node_core_library_1.Import.lazy('@yarnpkg/lockfile', require);
/**
 * Support for consuming the "yarn.lock" file.
 *
 * Yarn refers to its shrinkwrap file as a "lock file", even though it has nothing to do
 * with file locking.  Apparently this was based on a convention of the Ruby bundler.
 * Since Rush has to work interchangeably with 3 different package managers, here we refer
 * generically to yarn.lock as a "shrinkwrap file".
 *
 * If Rush's Yarn support gains popularity, we will try to improve the wording of
 * logging messages to use terminology more consistent with Yarn's own documentation.
 */
class YarnShrinkwrapFile extends BaseShrinkwrapFile_1.BaseShrinkwrapFile {
    constructor(shrinkwrapJson) {
        super();
        this._shrinkwrapJson = shrinkwrapJson;
        this._tempProjectNames = [];
        const seenEntries = new Set();
        for (const key of Object.keys(this._shrinkwrapJson)) {
            // Example key:
            const packageNameAndSemVer = YarnShrinkwrapFile._decodePackageNameAndSemVer(key);
            // If it starts with @rush-temp, then include it:
            if (PackageNameParsers_1.PackageNameParsers.permissive.getScope(packageNameAndSemVer.packageName) ===
                RushConstants_1.RushConstants.rushTempNpmScope) {
                if (!/^file:/i.test(packageNameAndSemVer.semVerRange)) {
                    // Sanity check to make sure this is a real package.
                    // (Nobody should ever have an actual dependency on an "@rush-temp/" package.
                    throw new Error('Unexpected package/semver expression found in the Yarn shrinkwrap file (yarn.lock): ' +
                        JSON.stringify(key));
                }
                if (!seenEntries.add(packageNameAndSemVer.packageName)) {
                    // Sanity check -- this should never happen
                    throw new Error('Duplicate @rush-temp package found in the Yarn shrinkwrap file (yarn.lock): ' +
                        JSON.stringify(key));
                }
                this._tempProjectNames.push(packageNameAndSemVer.packageName);
                const entry = this._shrinkwrapJson[key];
                // Yarn fails installation if the integrity hash does not match a "file://" reference to a tarball.
                // This is incorrect:  Normally a mismatched integrity hash does indicate a corrupted download,
                // since an NPM registry normally guarantees that a specific version number cannot be republished
                // with different content.  But this is NOT true for a "file://" reference, and there are valid
                // reasons why someone would update the file.  (PNPM handles this correctly, by simply reinstalling
                // the tarball if its hash has changed.)
                //
                // As a workaround, we can simply remove the hashes from the shrinkwrap file.  We will convert this:
                //   "file:./projects/my-project.tgz#80cefe05fd715e65219d1ed481209dc4023408aa"
                // ..to this:
                //   "file:./projects/my-project.tgz"
                const indexOfHash = entry.resolved.indexOf('#');
                if (indexOfHash >= 0) {
                    entry.resolved = entry.resolved.substring(0, indexOfHash);
                }
            }
        }
        this._tempProjectNames.sort(); // make the result deterministic
        // We don't support Yarn workspaces yet
        this.isWorkspaceCompatible = false;
    }
    static loadFromFile(shrinkwrapFilename) {
        let shrinkwrapString;
        let shrinkwrapJson;
        try {
            if (!node_core_library_1.FileSystem.exists(shrinkwrapFilename)) {
                return undefined; // file does not exist
            }
            shrinkwrapString = node_core_library_1.FileSystem.readFile(shrinkwrapFilename);
            shrinkwrapJson = lockfileModule.parse(shrinkwrapString);
        }
        catch (error) {
            throw new Error(`Error reading "${shrinkwrapFilename}":` + os.EOL + `  ${error.message}`);
        }
        return new YarnShrinkwrapFile(shrinkwrapJson.object);
    }
    /**
     * The `@yarnpkg/lockfile` API only partially deserializes its data, and expects the caller
     * to parse the yarn.lock lookup keys (sometimes called a "pattern").
     *
     * Example input:  "js-tokens@^3.0.0 || ^4.0.0"
     * Example output: { packageName: "js-tokens", semVerRange: "^3.0.0 || ^4.0.0" }
     */
    static _decodePackageNameAndSemVer(packageNameAndSemVer) {
        const result = YarnShrinkwrapFile._packageNameAndSemVerRegExp.exec(packageNameAndSemVer);
        if (!result) {
            // Sanity check -- this should never happen
            throw new Error('Unable to parse package/semver expression in the Yarn shrinkwrap file (yarn.lock): ' +
                JSON.stringify(packageNameAndSemVer));
        }
        const packageName = result[1] || '';
        const parsedPackageName = PackageNameParsers_1.PackageNameParsers.permissive.tryParse(packageName);
        if (parsedPackageName.error) {
            // Sanity check -- this should never happen
            throw new Error('Invalid package name the Yarn shrinkwrap file (yarn.lock): ' +
                JSON.stringify(packageNameAndSemVer) +
                '\n' +
                parsedPackageName.error);
        }
        return {
            packageName,
            semVerRange: result[2] || ''
        };
    }
    /**
     * This is the inverse of _decodePackageNameAndSemVer():
     * Given an IPackageNameAndSemVer object, recreate the yarn.lock lookup key
     * (sometimes called a "pattern").
     */
    static _encodePackageNameAndSemVer(packageNameAndSemVer) {
        return packageNameAndSemVer.packageName + '@' + packageNameAndSemVer.semVerRange;
    }
    /** @override */
    getTempProjectNames() {
        return this._tempProjectNames;
    }
    /** @override */
    hasCompatibleTopLevelDependency(dependencySpecifier) {
        // It seems like we should normalize the key somehow, but Yarn apparently does not
        // do any normalization.
        const key = YarnShrinkwrapFile._encodePackageNameAndSemVer({
            packageName: dependencySpecifier.packageName,
            semVerRange: dependencySpecifier.versionSpecifier
        });
        // Check whether this exact key appears in the shrinkwrap file
        return Object.hasOwnProperty.call(this._shrinkwrapJson, key);
    }
    /** @override */
    tryEnsureCompatibleDependency(dependencySpecifier, tempProjectName) {
        return this.hasCompatibleTopLevelDependency(dependencySpecifier);
    }
    /** @override */
    serialize() {
        return lockfileModule.stringify(this._shrinkwrapJson);
    }
    /** @override */
    getTopLevelDependencyVersion(dependencyName) {
        throw new node_core_library_1.InternalError('Not implemented');
    }
    /** @override */
    tryEnsureDependencyVersion(dependencySpecifier, tempProjectName) {
        throw new node_core_library_1.InternalError('Not implemented');
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
exports.YarnShrinkwrapFile = YarnShrinkwrapFile;
// Example inputs:
// "js-tokens@^3.0.0 || ^4.0.0"
// "@rush-temp/api-extractor-test-03@file:./projects/api-extractor-test-03.tgz"
YarnShrinkwrapFile._packageNameAndSemVerRegExp = /^(@?[^@\s]+)(?:@(.*))?$/;
//# sourceMappingURL=YarnShrinkwrapFile.js.map