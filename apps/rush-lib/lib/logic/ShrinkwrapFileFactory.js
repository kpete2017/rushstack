"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShrinkwrapFileFactory = void 0;
const NpmShrinkwrapFile_1 = require("./npm/NpmShrinkwrapFile");
const PnpmShrinkwrapFile_1 = require("./pnpm/PnpmShrinkwrapFile");
const YarnShrinkwrapFile_1 = require("./yarn/YarnShrinkwrapFile");
class ShrinkwrapFileFactory {
    static getShrinkwrapFile(packageManager, packageManagerOptions, shrinkwrapFilename) {
        switch (packageManager) {
            case 'npm':
                return NpmShrinkwrapFile_1.NpmShrinkwrapFile.loadFromFile(shrinkwrapFilename);
            case 'pnpm':
                return PnpmShrinkwrapFile_1.PnpmShrinkwrapFile.loadFromFile(shrinkwrapFilename, packageManagerOptions);
            case 'yarn':
                return YarnShrinkwrapFile_1.YarnShrinkwrapFile.loadFromFile(shrinkwrapFilename);
            default:
                throw new Error(`Invalid package manager: ${packageManager}`);
        }
    }
}
exports.ShrinkwrapFileFactory = ShrinkwrapFileFactory;
//# sourceMappingURL=ShrinkwrapFileFactory.js.map