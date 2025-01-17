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
exports.getRushConfigFolder = exports.getRushCommonTempFolder = exports.findRushJsonFolder = void 0;
/**
 * This is taken from rush-lib. If we use RushConfiguration from rush-lib
 * to get the rush common/temp folder, we cause a whole bunch of unnecessary
 * filesystem accesses.
 */
const path = __importStar(require("path"));
const node_core_library_1 = require("@rushstack/node-core-library");
function _findRushJsonFolder() {
    let currentFolder = process.cwd();
    for (let i = 0; i < 10; ++i) {
        const rushJsonFilename = path.join(currentFolder, 'rush.json');
        if (node_core_library_1.FileSystem.exists(rushJsonFilename)) {
            return currentFolder;
        }
        const parentFolder = path.dirname(currentFolder);
        if (parentFolder === currentFolder) {
            break;
        }
        currentFolder = parentFolder;
    }
    throw new Error('Unable to find rush.json configuration file');
}
let _cachedRushJsonFolder;
function findRushJsonFolder() {
    return _cachedRushJsonFolder || (_cachedRushJsonFolder = _findRushJsonFolder());
}
exports.findRushJsonFolder = findRushJsonFolder;
function getRushCommonTempFolder() {
    const rushJsonFolder = findRushJsonFolder();
    return path.join(rushJsonFolder, 'common', 'temp');
}
exports.getRushCommonTempFolder = getRushCommonTempFolder;
function getRushConfigFolder() {
    const rushJsonFolder = findRushJsonFolder();
    return path.join(rushJsonFolder, 'common', 'config');
}
exports.getRushConfigFolder = getRushConfigFolder;
//# sourceMappingURL=RushUtilities.js.map