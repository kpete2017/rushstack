"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.PackageManager = void 0;
/**
 * An abstraction for controlling the supported package managers: PNPM, NPM, and Yarn.
 * @beta
 */
class PackageManager {
    /** @internal */
    constructor(version, packageManager) {
        this.version = version;
        this.packageManager = packageManager;
    }
    /**
     * The filename of the shrinkwrap file that is used by the package manager.
     *
     * @remarks
     * Example: `npm-shrinkwrap.json` or `pnpm-lock.yaml`
     */
    get shrinkwrapFilename() {
        return this._shrinkwrapFilename;
    }
}
exports.PackageManager = PackageManager;
//# sourceMappingURL=PackageManager.js.map