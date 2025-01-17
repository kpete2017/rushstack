"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.YarnPackageManager = void 0;
const RushConstants_1 = require("../../logic/RushConstants");
const PackageManager_1 = require("./PackageManager");
/**
 * Support for interacting with the Yarn package manager.
 */
class YarnPackageManager extends PackageManager_1.PackageManager {
    /** @internal */
    constructor(version) {
        super(version, 'yarn');
        this._shrinkwrapFilename = RushConstants_1.RushConstants.yarnShrinkwrapFilename;
    }
}
exports.YarnPackageManager = YarnPackageManager;
//# sourceMappingURL=YarnPackageManager.js.map