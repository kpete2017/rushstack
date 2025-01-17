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
exports.PnpmPackageManager = void 0;
const semver = __importStar(require("semver"));
const path = __importStar(require("path"));
const RushConstants_1 = require("../../logic/RushConstants");
const PackageManager_1 = require("./PackageManager");
/**
 * Support for interacting with the PNPM package manager.
 */
class PnpmPackageManager extends PackageManager_1.PackageManager {
    /** @internal */
    constructor(version) {
        super(version, 'pnpm');
        const parsedVersion = new semver.SemVer(version);
        if (parsedVersion.major >= 6) {
            // Introduced in version 6.0.0
            this._pnpmfileFilename = RushConstants_1.RushConstants.pnpmfileV6Filename;
        }
        else {
            this._pnpmfileFilename = RushConstants_1.RushConstants.pnpmfileV1Filename;
        }
        this._shrinkwrapFilename = RushConstants_1.RushConstants.pnpmV3ShrinkwrapFilename;
        // node_modules/.pnpm/lock.yaml
        // See https://github.com/pnpm/pnpm/releases/tag/v4.0.0 for more details.
        this.internalShrinkwrapRelativePath = path.join('node_modules', '.pnpm', 'lock.yaml');
    }
    /**
     * The filename of the shrinkwrap file that is used by the package manager.
     *
     * @remarks
     * Example: `pnpmfile.js` or `.pnpmfile.cjs`
     */
    get pnpmfileFilename() {
        return this._pnpmfileFilename;
    }
}
exports.PnpmPackageManager = PnpmPackageManager;
//# sourceMappingURL=PnpmPackageManager.js.map