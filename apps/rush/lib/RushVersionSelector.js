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
exports.RushVersionSelector = void 0;
const path = __importStar(require("path"));
const semver = __importStar(require("semver"));
const node_core_library_1 = require("@rushstack/node-core-library");
const Utilities_1 = require("@microsoft/rush-lib/lib/utilities/Utilities");
const rush_lib_1 = require("@microsoft/rush-lib");
const RushCommandSelector_1 = require("./RushCommandSelector");
const MAX_INSTALL_ATTEMPTS = 3;
class RushVersionSelector {
    constructor(currentPackageVersion) {
        this._rushGlobalFolder = new rush_lib_1._RushGlobalFolder();
        this._currentPackageVersion = currentPackageVersion;
    }
    async ensureRushVersionInstalledAsync(version, configuration, executeOptions) {
        const isLegacyRushVersion = semver.lt(version, '4.0.0');
        const expectedRushPath = path.join(this._rushGlobalFolder.nodeSpecificPath, `rush-${version}`);
        const installMarker = new rush_lib_1._LastInstallFlag(expectedRushPath, {
            node: process.versions.node
        });
        if (!installMarker.isValid()) {
            // Need to install Rush
            console.log(`Rush version ${version} is not currently installed. Installing...`);
            const resourceName = `rush-${version}`;
            console.log(`Trying to acquire lock for ${resourceName}`);
            const lock = await node_core_library_1.LockFile.acquire(expectedRushPath, resourceName);
            if (installMarker.isValid()) {
                console.log('Another process performed the installation.');
            }
            else {
                Utilities_1.Utilities.installPackageInDirectory({
                    directory: expectedRushPath,
                    packageName: isLegacyRushVersion ? '@microsoft/rush' : '@microsoft/rush-lib',
                    version: version,
                    tempPackageTitle: 'rush-local-install',
                    maxInstallAttempts: MAX_INSTALL_ATTEMPTS,
                    // This is using a local configuration to install a package in a shared global location.
                    // Generally that's a bad practice, but in this case if we can successfully install
                    // the package at all, we can reasonably assume it's good for all the repositories.
                    // In particular, we'll assume that two different NPM registries cannot have two
                    // different implementations of the same version of the same package.
                    // This was needed for: https://github.com/microsoft/rushstack/issues/691
                    commonRushConfigFolder: configuration ? configuration.commonRushConfigFolder : undefined,
                    suppressOutput: true
                });
                console.log(`Successfully installed Rush version ${version} in ${expectedRushPath}.`);
                // If we've made it here without exception, write the flag file
                installMarker.create();
                lock.release();
            }
        }
        if (semver.lt(version, '3.0.20')) {
            // In old versions, requiring the entry point invoked the command-line parser immediately,
            // so fail if "rushx" was used
            RushCommandSelector_1.RushCommandSelector.failIfNotInvokedAsRush(version);
            require(path.join(expectedRushPath, 'node_modules', '@microsoft', 'rush', 'lib', 'rush'));
        }
        else if (semver.lt(version, '4.0.0')) {
            // In old versions, requiring the entry point invoked the command-line parser immediately,
            // so fail if "rushx" was used
            RushCommandSelector_1.RushCommandSelector.failIfNotInvokedAsRush(version);
            require(path.join(expectedRushPath, 'node_modules', '@microsoft', 'rush', 'lib', 'start'));
        }
        else {
            // For newer rush-lib, RushCommandSelector can test whether "rushx" is supported or not
            const rushCliEntrypoint = require(path.join(expectedRushPath, 'node_modules', '@microsoft', 'rush-lib', 'lib', 'index'));
            RushCommandSelector_1.RushCommandSelector.execute(this._currentPackageVersion, rushCliEntrypoint, executeOptions);
        }
    }
}
exports.RushVersionSelector = RushVersionSelector;
//# sourceMappingURL=RushVersionSelector.js.map