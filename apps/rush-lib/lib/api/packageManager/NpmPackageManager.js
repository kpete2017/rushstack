"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.NpmPackageManager = void 0;
const RushConstants_1 = require("../../logic/RushConstants");
const PackageManager_1 = require("./PackageManager");
/**
 * Support for interacting with the NPM package manager.
 */
class NpmPackageManager extends PackageManager_1.PackageManager {
    /** @internal */
    constructor(version) {
        super(version, 'npm');
        this._shrinkwrapFilename = RushConstants_1.RushConstants.npmShrinkwrapFilename;
    }
}
exports.NpmPackageManager = NpmPackageManager;
//# sourceMappingURL=NpmPackageManager.js.map