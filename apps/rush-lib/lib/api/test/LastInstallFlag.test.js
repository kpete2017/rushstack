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
const path = __importStar(require("path"));
const LastInstallFlag_1 = require("../LastInstallFlag");
const node_core_library_1 = require("@rushstack/node-core-library");
const TEMP_DIR = path.join(__dirname, 'temp');
describe('LastInstallFlag', () => {
    beforeEach(() => {
        node_core_library_1.FileSystem.ensureEmptyFolder(TEMP_DIR);
    });
    afterEach(() => {
        node_core_library_1.FileSystem.ensureEmptyFolder(TEMP_DIR);
    });
    it('can create and remove a flag in an empty directory', () => {
        // preparation
        const flag = new LastInstallFlag_1.LastInstallFlag(TEMP_DIR);
        node_core_library_1.FileSystem.deleteFile(flag.path);
        // test state, should be invalid since the file doesn't exist
        expect(flag.isValid()).toEqual(false);
        // test creation
        flag.create();
        expect(node_core_library_1.FileSystem.exists(flag.path)).toEqual(true);
        expect(flag.isValid()).toEqual(true);
        // test deletion
        flag.clear();
        expect(node_core_library_1.FileSystem.exists(flag.path)).toEqual(false);
        expect(flag.isValid()).toEqual(false);
    });
    it('can detect if the last flag was in a different state', () => {
        // preparation
        const flag1 = new LastInstallFlag_1.LastInstallFlag(TEMP_DIR, { node: '5.0.0' });
        const flag2 = new LastInstallFlag_1.LastInstallFlag(TEMP_DIR, { node: '8.9.4' });
        node_core_library_1.FileSystem.deleteFile(flag1.path);
        // test state, should be invalid since the file doesn't exist
        expect(flag1.isValid()).toEqual(false);
        expect(flag2.isValid()).toEqual(false);
        // test creation
        flag1.create();
        expect(node_core_library_1.FileSystem.exists(flag1.path)).toEqual(true);
        expect(flag1.isValid()).toEqual(true);
        // the second flag has different state and should be invalid
        expect(flag2.isValid()).toEqual(false);
        // test deletion
        flag1.clear();
        expect(node_core_library_1.FileSystem.exists(flag1.path)).toEqual(false);
        expect(flag1.isValid()).toEqual(false);
        expect(flag2.isValid()).toEqual(false);
    });
    it('can detect if the last flag was in a corrupted state', () => {
        // preparation, write non-json into flag file
        const flag = new LastInstallFlag_1.LastInstallFlag(TEMP_DIR);
        node_core_library_1.FileSystem.writeFile(flag.path, 'sdfjkaklfjksldajgfkld');
        // test state, should be invalid since the file is not JSON
        expect(flag.isValid()).toEqual(false);
        node_core_library_1.FileSystem.deleteFile(flag.path);
    });
    it("throws an error if new storePath doesn't match the old one", () => {
        const flag1 = new LastInstallFlag_1.LastInstallFlag(TEMP_DIR, {
            packageManager: 'pnpm',
            storePath: path.join(TEMP_DIR, 'pnpm-store')
        });
        const flag2 = new LastInstallFlag_1.LastInstallFlag(TEMP_DIR, {
            packageManager: 'pnpm',
            storePath: path.join(TEMP_DIR, 'temp-store')
        });
        flag1.create();
        expect(() => {
            flag2.checkValidAndReportStoreIssues();
        }).toThrowError(/PNPM store path/);
    });
    it("doesn't throw an error if conditions for error aren't met", () => {
        const flag1 = new LastInstallFlag_1.LastInstallFlag(TEMP_DIR, {
            packageManager: 'pnpm',
            storePath: path.join(TEMP_DIR, 'pnpm-store')
        });
        const flag2 = new LastInstallFlag_1.LastInstallFlag(TEMP_DIR, {
            packageManager: 'npm'
        });
        flag1.create();
        expect(() => {
            flag2.checkValidAndReportStoreIssues();
        }).not.toThrow();
        expect(flag2.checkValidAndReportStoreIssues()).toEqual(false);
    });
});
//# sourceMappingURL=LastInstallFlag.test.js.map