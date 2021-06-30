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
const node_core_library_1 = require("@rushstack/node-core-library");
const ChangeFiles_1 = require("../ChangeFiles");
describe('ChangeFiles', () => {
    let rushConfiguration;
    beforeEach(() => {
        rushConfiguration = {};
    });
    describe('getFiles', () => {
        it('returns correctly when there is one change file', () => {
            const changesPath = path.join(__dirname, 'leafChange');
            const changeFiles = new ChangeFiles_1.ChangeFiles(changesPath);
            const expectedPath = node_core_library_1.Path.convertToSlashes(path.join(changesPath, 'change1.json'));
            expect(changeFiles.getFiles()).toEqual([expectedPath]);
        });
        it('returns empty array when no change files', () => {
            const changesPath = path.join(__dirname, 'noChange');
            const changeFiles = new ChangeFiles_1.ChangeFiles(changesPath);
            expect(changeFiles.getFiles()).toHaveLength(0);
        });
        it('returns correctly when change files are categorized', () => {
            const changesPath = path.join(__dirname, 'categorizedChanges');
            const changeFiles = new ChangeFiles_1.ChangeFiles(changesPath);
            const files = changeFiles.getFiles();
            expect(files).toHaveLength(3);
            const expectedPathA = node_core_library_1.Path.convertToSlashes(path.join(changesPath, '@ms', 'a', 'changeA.json'));
            const expectedPathB = node_core_library_1.Path.convertToSlashes(path.join(changesPath, '@ms', 'b', 'changeB.json'));
            const expectedPathC = node_core_library_1.Path.convertToSlashes(path.join(changesPath, 'changeC.json'));
            expect(files).toContain(expectedPathA);
            expect(files).toContain(expectedPathB);
            expect(files).toContain(expectedPathC);
        });
    });
    describe('validate', () => {
        it('throws when there is a patch in a hotfix branch.', () => {
            const changeFile = path.join(__dirname, 'leafChange', 'change1.json');
            const changedPackages = ['d'];
            expect(() => {
                ChangeFiles_1.ChangeFiles.validate([changeFile], changedPackages, {
                    hotfixChangeEnabled: true
                });
            }).toThrow(Error);
        });
        it('allows a hotfix in a hotfix branch.', () => {
            const changeFile = path.join(__dirname, 'multipleHotfixChanges', 'change1.json');
            const changedPackages = ['a'];
            ChangeFiles_1.ChangeFiles.validate([changeFile], changedPackages, { hotfixChangeEnabled: true });
        });
        it('throws when there is any missing package.', () => {
            const changeFile = path.join(__dirname, 'verifyChanges', 'changes.json');
            const changedPackages = ['a', 'b', 'c'];
            expect(() => {
                ChangeFiles_1.ChangeFiles.validate([changeFile], changedPackages, rushConfiguration);
            }).toThrow(Error);
        });
        it('does not throw when there is no missing packages', () => {
            const changeFile = path.join(__dirname, 'verifyChanges', 'changes.json');
            const changedPackages = ['a'];
            expect(() => {
                ChangeFiles_1.ChangeFiles.validate([changeFile], changedPackages, rushConfiguration);
            }).not.toThrow();
        });
        it('throws when missing packages from categorized changes', () => {
            const changeFileA = path.join(__dirname, 'categorizedChanges', '@ms', 'a', 'changeA.json');
            const changeFileB = path.join(__dirname, 'categorizedChanges', '@ms', 'b', 'changeB.json');
            const changedPackages = ['@ms/a', '@ms/b', 'c'];
            expect(() => {
                ChangeFiles_1.ChangeFiles.validate([changeFileA, changeFileB], changedPackages, rushConfiguration);
            }).toThrow(Error);
        });
        it('does not throw when no missing packages from categorized changes', () => {
            const changeFileA = path.join(__dirname, 'categorizedChanges', '@ms', 'a', 'changeA.json');
            const changeFileB = path.join(__dirname, 'categorizedChanges', '@ms', 'b', 'changeB.json');
            const changeFileC = path.join(__dirname, 'categorizedChanges', 'changeC.json');
            const changedPackages = ['@ms/a', '@ms/b', 'c'];
            expect(() => {
                ChangeFiles_1.ChangeFiles.validate([changeFileA, changeFileB, changeFileC], changedPackages, rushConfiguration);
            }).not.toThrow(Error);
        });
    });
    describe('deleteAll', () => {
        it('delete all files when there are no prerelease packages', () => {
            const changesPath = path.join(__dirname, 'multipleChangeFiles');
            const changeFiles = new ChangeFiles_1.ChangeFiles(changesPath);
            expect(changeFiles.deleteAll(false)).toEqual(3);
        });
        it('does not delete change files for package whose change logs do not get updated. ', () => {
            const changesPath = path.join(__dirname, 'multipleChangeFiles');
            const changeFiles = new ChangeFiles_1.ChangeFiles(changesPath);
            const updatedChangelogs = [
                {
                    name: 'a',
                    entries: []
                },
                {
                    name: 'b',
                    entries: []
                }
            ];
            expect(changeFiles.deleteAll(false, updatedChangelogs)).toEqual(2);
        });
        it('delete all files when there are hotfixes', () => {
            const changesPath = path.join(__dirname, 'multipleHotfixChanges');
            const changeFiles = new ChangeFiles_1.ChangeFiles(changesPath);
            expect(changeFiles.deleteAll(false)).toEqual(3);
        });
    });
});
//# sourceMappingURL=ChangeFiles.test.js.map