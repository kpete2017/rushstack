"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApprovedPackagesChecker = void 0;
const DependencySpecifier_1 = require("./DependencySpecifier");
class ApprovedPackagesChecker {
    constructor(rushConfiguration) {
        this._rushConfiguration = rushConfiguration;
        this._approvedPackagesPolicy = this._rushConfiguration.approvedPackagesPolicy;
        this._filesAreOutOfDate = false;
        if (this._approvedPackagesPolicy.enabled) {
            this._updateApprovedPackagesPolicy();
        }
    }
    /**
     * If true, the files on disk are out of date.
     */
    get approvedPackagesFilesAreOutOfDate() {
        return this._filesAreOutOfDate;
    }
    /**
     * Examines the current dependencies for the projects specified in RushConfiguration,
     * and then adds them to the 'browser-approved-packages.json' and
     * 'nonbrowser-approved-packages.json' config files.  If these files don't exist,
     * they will be created.
     *
     * If the "approvedPackagesPolicy" feature is not enabled, then no action is taken.
     */
    rewriteConfigFiles() {
        const approvedPackagesPolicy = this._rushConfiguration.approvedPackagesPolicy;
        if (approvedPackagesPolicy.enabled) {
            approvedPackagesPolicy.browserApprovedPackages.saveToFile();
            approvedPackagesPolicy.nonbrowserApprovedPackages.saveToFile();
        }
    }
    _updateApprovedPackagesPolicy() {
        for (const rushProject of this._rushConfiguration.projects) {
            const packageJson = rushProject.packageJson;
            this._collectDependencies(packageJson.dependencies, this._approvedPackagesPolicy, rushProject);
            this._collectDependencies(packageJson.devDependencies, this._approvedPackagesPolicy, rushProject);
            this._collectDependencies(packageJson.peerDependencies, this._approvedPackagesPolicy, rushProject);
            this._collectDependencies(packageJson.optionalDependencies, this._approvedPackagesPolicy, rushProject);
        }
    }
    _collectDependencies(dependencies, approvedPackagesPolicy, rushProject) {
        if (dependencies) {
            for (const packageName of Object.keys(dependencies)) {
                let referencedPackageName = packageName;
                // Special handling for NPM package aliases such as this:
                //
                // "dependencies": {
                //   "alias-name": "npm:target-name@^1.2.3"
                // }
                const dependencySpecifier = new DependencySpecifier_1.DependencySpecifier(packageName, dependencies[packageName]);
                if (dependencySpecifier.aliasTarget) {
                    // Use "target-name" instead of "alias-name"
                    referencedPackageName = dependencySpecifier.aliasTarget.packageName;
                }
                const scope = this._rushConfiguration.packageNameParser.getScope(referencedPackageName);
                // Make sure the scope isn't something like "@types" which should be ignored
                if (!approvedPackagesPolicy.ignoredNpmScopes.has(scope) && rushProject.reviewCategory) {
                    // Yes, add it to the list if it's not already there
                    let updated = false;
                    // By default we put everything in the browser file.  But if it already appears in the
                    // non-browser file, then use that instead.
                    if (approvedPackagesPolicy.nonbrowserApprovedPackages.getItemByName(referencedPackageName)) {
                        updated = approvedPackagesPolicy.nonbrowserApprovedPackages.addOrUpdatePackage(referencedPackageName, rushProject.reviewCategory);
                    }
                    else {
                        updated = approvedPackagesPolicy.browserApprovedPackages.addOrUpdatePackage(referencedPackageName, rushProject.reviewCategory);
                    }
                    this._filesAreOutOfDate = this._filesAreOutOfDate || updated;
                }
            }
        }
    }
}
exports.ApprovedPackagesChecker = ApprovedPackagesChecker;
//# sourceMappingURL=ApprovedPackagesChecker.js.map