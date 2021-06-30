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
const child_process_1 = require("child_process");
const getPackageDeps_1 = require("../getPackageDeps");
const node_core_library_1 = require("@rushstack/node-core-library");
const SOURCE_PATH = path.join(__dirname).replace(path.join('lib', 'test'), path.join('src', 'test'));
const TEST_PROJECT_PATH = path.join(SOURCE_PATH, 'testProject');
const NESTED_TEST_PROJECT_PATH = path.join(SOURCE_PATH, 'nestedTestProject');
describe('parseGitFilename', () => {
    it('can parse backslash-escaped filenames', (done) => {
        expect(getPackageDeps_1.parseGitFilename('some/path/to/a/file name')).toEqual('some/path/to/a/file name');
        expect(getPackageDeps_1.parseGitFilename('"some/path/to/a/file?name"')).toEqual('some/path/to/a/file?name');
        expect(getPackageDeps_1.parseGitFilename('"some/path/to/a/file\\\\name"')).toEqual('some/path/to/a/file\\name');
        expect(getPackageDeps_1.parseGitFilename('"some/path/to/a/file\\"name"')).toEqual('some/path/to/a/file"name');
        expect(getPackageDeps_1.parseGitFilename('"some/path/to/a/file\\"name"')).toEqual('some/path/to/a/file"name');
        expect(getPackageDeps_1.parseGitFilename('"some/path/to/a/file\\347\\275\\221\\347\\275\\221name"')).toEqual('some/path/to/a/file网网name');
        expect(getPackageDeps_1.parseGitFilename('"some/path/to/a/file\\\\347\\\\\\347\\275\\221name"')).toEqual('some/path/to/a/file\\347\\网name');
        expect(getPackageDeps_1.parseGitFilename('"some/path/to/a/file\\\\\\347\\275\\221\\347\\275\\221name"')).toEqual('some/path/to/a/file\\网网name');
        done();
    });
});
describe('parseGitLsTree', () => {
    it('can handle a blob', (done) => {
        const filename = 'src/typings/tsd.d.ts';
        const hash = '3451bccdc831cb43d7a70ed8e628dcf9c7f888c8';
        const output = `100644 blob ${hash}\t${filename}`;
        const changes = getPackageDeps_1.parseGitLsTree(output);
        expect(changes.size).toEqual(1); // Expect there to be exactly 1 change
        expect(changes.get(filename)).toEqual(hash); // Expect the hash to be ${hash}
        done();
    });
    it('can handle a submodule', (done) => {
        const filename = 'rushstack';
        const hash = 'c5880bf5b0c6c1f2e2c43c95beeb8f0a808e8bac';
        const output = `160000 commit ${hash}\t${filename}`;
        const changes = getPackageDeps_1.parseGitLsTree(output);
        expect(changes.size).toEqual(1); // Expect there to be exactly 1 change
        expect(changes.get(filename)).toEqual(hash); // Expect the hash to be ${hash}
        done();
    });
    it('can handle multiple lines', (done) => {
        const filename1 = 'src/typings/tsd.d.ts';
        const hash1 = '3451bccdc831cb43d7a70ed8e628dcf9c7f888c8';
        const filename2 = 'src/foo bar/tsd.d.ts';
        const hash2 = '0123456789abcdef1234567890abcdef01234567';
        const output = `100644 blob ${hash1}\t${filename1}\n100666 blob ${hash2}\t${filename2}`;
        const changes = getPackageDeps_1.parseGitLsTree(output);
        expect(changes.size).toEqual(2); // Expect there to be exactly 2 changes
        expect(changes.get(filename1)).toEqual(hash1); // Expect the hash to be ${hash1}
        expect(changes.get(filename2)).toEqual(hash2); // Expect the hash to be ${hash2}
        done();
    });
    it('throws with malformed input', (done) => {
        expect(getPackageDeps_1.parseGitLsTree.bind(undefined, 'some super malformed input')).toThrow();
        done();
    });
});
describe('getPackageDeps', () => {
    it('can parse committed file', (done) => {
        const results = getPackageDeps_1.getPackageDeps(TEST_PROJECT_PATH);
        try {
            const expectedFiles = {
                'file1.txt': 'c7b2f707ac99ca522f965210a7b6b0b109863f34',
                'file  2.txt': 'a385f754ec4fede884a4864d090064d9aeef8ccb',
                'file蝴蝶.txt': 'ae814af81e16cb2ae8c57503c77e2cab6b5462ba',
                ["package.json" /* PackageJson */]: '18a1e415e56220fa5122428a4ef8eb8874756576'
            };
            const filePaths = Array.from(results.keys()).sort();
            filePaths.forEach((filePath) => expect(results.get(filePath)).toEqual(expectedFiles[filePath]));
        }
        catch (e) {
            return done(e);
        }
        done();
    });
    it('can handle files in subfolders', (done) => {
        const results = getPackageDeps_1.getPackageDeps(NESTED_TEST_PROJECT_PATH);
        try {
            const expectedFiles = {
                'src/file 1.txt': 'c7b2f707ac99ca522f965210a7b6b0b109863f34',
                ["package.json" /* PackageJson */]: '18a1e415e56220fa5122428a4ef8eb8874756576'
            };
            const filePaths = Array.from(results.keys()).sort();
            filePaths.forEach((filePath) => expect(results.get(filePath)).toEqual(expectedFiles[filePath]));
        }
        catch (e) {
            return done(e);
        }
        done();
    });
    it('can handle adding one file', (done) => {
        const tempFilePath = path.join(TEST_PROJECT_PATH, 'a.txt');
        node_core_library_1.FileSystem.writeFile(tempFilePath, 'a');
        function _done(e) {
            node_core_library_1.FileSystem.deleteFile(tempFilePath);
            done(e);
        }
        const results = getPackageDeps_1.getPackageDeps(TEST_PROJECT_PATH);
        try {
            const expectedFiles = {
                'a.txt': '2e65efe2a145dda7ee51d1741299f848e5bf752e',
                'file1.txt': 'c7b2f707ac99ca522f965210a7b6b0b109863f34',
                'file  2.txt': 'a385f754ec4fede884a4864d090064d9aeef8ccb',
                'file蝴蝶.txt': 'ae814af81e16cb2ae8c57503c77e2cab6b5462ba',
                ["package.json" /* PackageJson */]: '18a1e415e56220fa5122428a4ef8eb8874756576'
            };
            const filePaths = Array.from(results.keys()).sort();
            filePaths.forEach((filePath) => expect(results.get(filePath)).toEqual(expectedFiles[filePath]));
        }
        catch (e) {
            return _done(e);
        }
        _done();
    });
    it('can handle adding two files', (done) => {
        const tempFilePath1 = path.join(TEST_PROJECT_PATH, 'a.txt');
        const tempFilePath2 = path.join(TEST_PROJECT_PATH, 'b.txt');
        node_core_library_1.FileSystem.writeFile(tempFilePath1, 'a');
        node_core_library_1.FileSystem.writeFile(tempFilePath2, 'a');
        function _done(e) {
            node_core_library_1.FileSystem.deleteFile(tempFilePath1);
            node_core_library_1.FileSystem.deleteFile(tempFilePath2);
            done(e);
        }
        const results = getPackageDeps_1.getPackageDeps(TEST_PROJECT_PATH);
        try {
            const expectedFiles = {
                'a.txt': '2e65efe2a145dda7ee51d1741299f848e5bf752e',
                'b.txt': '2e65efe2a145dda7ee51d1741299f848e5bf752e',
                'file1.txt': 'c7b2f707ac99ca522f965210a7b6b0b109863f34',
                'file  2.txt': 'a385f754ec4fede884a4864d090064d9aeef8ccb',
                'file蝴蝶.txt': 'ae814af81e16cb2ae8c57503c77e2cab6b5462ba',
                ["package.json" /* PackageJson */]: '18a1e415e56220fa5122428a4ef8eb8874756576'
            };
            const filePaths = Array.from(results.keys()).sort();
            filePaths.forEach((filePath) => expect(results.get(filePath)).toEqual(expectedFiles[filePath]));
        }
        catch (e) {
            return _done(e);
        }
        _done();
    });
    it('can handle removing one file', (done) => {
        const testFilePath = path.join(TEST_PROJECT_PATH, 'file1.txt');
        node_core_library_1.FileSystem.deleteFile(testFilePath);
        function _done(e) {
            child_process_1.execSync(`git checkout ${testFilePath}`, { stdio: 'ignore' });
            done(e);
        }
        const results = getPackageDeps_1.getPackageDeps(TEST_PROJECT_PATH);
        try {
            const expectedFiles = {
                'file  2.txt': 'a385f754ec4fede884a4864d090064d9aeef8ccb',
                'file蝴蝶.txt': 'ae814af81e16cb2ae8c57503c77e2cab6b5462ba',
                ["package.json" /* PackageJson */]: '18a1e415e56220fa5122428a4ef8eb8874756576'
            };
            const filePaths = Array.from(results.keys()).sort();
            filePaths.forEach((filePath) => expect(results.get(filePath)).toEqual(expectedFiles[filePath]));
        }
        catch (e) {
            return _done(e);
        }
        _done();
    });
    it('can handle changing one file', (done) => {
        const testFilePath = path.join(TEST_PROJECT_PATH, 'file1.txt');
        node_core_library_1.FileSystem.writeFile(testFilePath, 'abc');
        function _done(e) {
            child_process_1.execSync(`git checkout ${testFilePath}`, { stdio: 'ignore' });
            done(e);
        }
        const results = getPackageDeps_1.getPackageDeps(TEST_PROJECT_PATH);
        try {
            const expectedFiles = {
                'file1.txt': 'f2ba8f84ab5c1bce84a7b441cb1959cfc7093b7f',
                'file  2.txt': 'a385f754ec4fede884a4864d090064d9aeef8ccb',
                'file蝴蝶.txt': 'ae814af81e16cb2ae8c57503c77e2cab6b5462ba',
                ["package.json" /* PackageJson */]: '18a1e415e56220fa5122428a4ef8eb8874756576'
            };
            const filePaths = Array.from(results.keys()).sort();
            filePaths.forEach((filePath) => expect(results.get(filePath)).toEqual(expectedFiles[filePath]));
        }
        catch (e) {
            return _done(e);
        }
        _done();
    });
    it('can exclude a committed file', (done) => {
        const results = getPackageDeps_1.getPackageDeps(TEST_PROJECT_PATH, [
            'file1.txt',
            'file  2.txt',
            'file蝴蝶.txt'
        ]);
        try {
            const expectedFiles = {
                ["package.json" /* PackageJson */]: '18a1e415e56220fa5122428a4ef8eb8874756576'
            };
            const filePaths = Array.from(results.keys()).sort();
            filePaths.forEach((filePath) => expect(results.get(filePath)).toEqual(expectedFiles[filePath]));
        }
        catch (e) {
            return done(e);
        }
        done();
    });
    it('can exclude an added file', (done) => {
        const tempFilePath = path.join(TEST_PROJECT_PATH, 'a.txt');
        node_core_library_1.FileSystem.writeFile(tempFilePath, 'a');
        function _done(e) {
            node_core_library_1.FileSystem.deleteFile(tempFilePath);
            done(e);
        }
        const results = getPackageDeps_1.getPackageDeps(TEST_PROJECT_PATH, ['a.txt']);
        try {
            const expectedFiles = {
                'file1.txt': 'c7b2f707ac99ca522f965210a7b6b0b109863f34',
                'file  2.txt': 'a385f754ec4fede884a4864d090064d9aeef8ccb',
                'file蝴蝶.txt': 'ae814af81e16cb2ae8c57503c77e2cab6b5462ba',
                ["package.json" /* PackageJson */]: '18a1e415e56220fa5122428a4ef8eb8874756576'
            };
            const filePaths = Array.from(results.keys()).sort();
            expect(filePaths).toHaveLength(Object.keys(expectedFiles).length);
            filePaths.forEach((filePath) => expect(results.get(filePath)).toEqual(expectedFiles[filePath]));
        }
        catch (e) {
            return _done(e);
        }
        _done();
    });
    it('can handle a filename with spaces', (done) => {
        const tempFilePath = path.join(TEST_PROJECT_PATH, 'a file.txt');
        node_core_library_1.FileSystem.writeFile(tempFilePath, 'a');
        function _done(e) {
            node_core_library_1.FileSystem.deleteFile(tempFilePath);
            done(e);
        }
        const results = getPackageDeps_1.getPackageDeps(TEST_PROJECT_PATH);
        try {
            const expectedFiles = {
                'file1.txt': 'c7b2f707ac99ca522f965210a7b6b0b109863f34',
                'file  2.txt': 'a385f754ec4fede884a4864d090064d9aeef8ccb',
                'file蝴蝶.txt': 'ae814af81e16cb2ae8c57503c77e2cab6b5462ba',
                'a file.txt': '2e65efe2a145dda7ee51d1741299f848e5bf752e',
                ["package.json" /* PackageJson */]: '18a1e415e56220fa5122428a4ef8eb8874756576'
            };
            const filePaths = Array.from(results.keys()).sort();
            expect(filePaths).toHaveLength(Object.keys(expectedFiles).length);
            filePaths.forEach((filePath) => expect(results.get(filePath)).toEqual(expectedFiles[filePath]));
        }
        catch (e) {
            return _done(e);
        }
        _done();
    });
    it('can handle a filename with multiple spaces', (done) => {
        const tempFilePath = path.join(TEST_PROJECT_PATH, 'a  file name.txt');
        node_core_library_1.FileSystem.writeFile(tempFilePath, 'a');
        function _done(e) {
            node_core_library_1.FileSystem.deleteFile(tempFilePath);
            done(e);
        }
        const results = getPackageDeps_1.getPackageDeps(TEST_PROJECT_PATH);
        try {
            const expectedFiles = {
                'file1.txt': 'c7b2f707ac99ca522f965210a7b6b0b109863f34',
                'file  2.txt': 'a385f754ec4fede884a4864d090064d9aeef8ccb',
                'file蝴蝶.txt': 'ae814af81e16cb2ae8c57503c77e2cab6b5462ba',
                'a  file name.txt': '2e65efe2a145dda7ee51d1741299f848e5bf752e',
                ["package.json" /* PackageJson */]: '18a1e415e56220fa5122428a4ef8eb8874756576'
            };
            const filePaths = Array.from(results.keys()).sort();
            expect(filePaths).toHaveLength(Object.keys(expectedFiles).length);
            filePaths.forEach((filePath) => expect(results.get(filePath)).toEqual(expectedFiles[filePath]));
        }
        catch (e) {
            return _done(e);
        }
        _done();
    });
    it('can handle a filename with non-standard characters', (done) => {
        const tempFilePath = path.join(TEST_PROJECT_PATH, 'newFile批把.txt');
        node_core_library_1.FileSystem.writeFile(tempFilePath, 'a');
        function _done(e) {
            node_core_library_1.FileSystem.deleteFile(tempFilePath);
            done(e);
        }
        const results = getPackageDeps_1.getPackageDeps(TEST_PROJECT_PATH);
        try {
            const expectedFiles = {
                'file1.txt': 'c7b2f707ac99ca522f965210a7b6b0b109863f34',
                'file  2.txt': 'a385f754ec4fede884a4864d090064d9aeef8ccb',
                'file蝴蝶.txt': 'ae814af81e16cb2ae8c57503c77e2cab6b5462ba',
                'newFile批把.txt': '2e65efe2a145dda7ee51d1741299f848e5bf752e',
                ["package.json" /* PackageJson */]: '18a1e415e56220fa5122428a4ef8eb8874756576'
            };
            const filePaths = Array.from(results.keys()).sort();
            expect(filePaths).toHaveLength(Object.keys(expectedFiles).length);
            filePaths.forEach((filePath) => expect(results.get(filePath)).toEqual(expectedFiles[filePath]));
        }
        catch (e) {
            return _done(e);
        }
        _done();
    });
    it('can handle a filename with non-standard characters', (done) => {
        const tempFilePath = path.join(TEST_PROJECT_PATH, 'newFile批把.txt');
        node_core_library_1.FileSystem.writeFile(tempFilePath, 'a');
        function _done(e) {
            node_core_library_1.FileSystem.deleteFile(tempFilePath);
            done(e);
        }
        const results = getPackageDeps_1.getPackageDeps(TEST_PROJECT_PATH);
        try {
            const expectedFiles = {
                'file1.txt': 'c7b2f707ac99ca522f965210a7b6b0b109863f34',
                'file  2.txt': 'a385f754ec4fede884a4864d090064d9aeef8ccb',
                'file蝴蝶.txt': 'ae814af81e16cb2ae8c57503c77e2cab6b5462ba',
                'newFile批把.txt': '2e65efe2a145dda7ee51d1741299f848e5bf752e',
                ["package.json" /* PackageJson */]: '18a1e415e56220fa5122428a4ef8eb8874756576'
            };
            const filePaths = Array.from(results.keys()).sort();
            expect(filePaths).toHaveLength(Object.keys(expectedFiles).length);
            filePaths.forEach((filePath) => expect(results.get(filePath)).toEqual(expectedFiles[filePath]));
        }
        catch (e) {
            return _done(e);
        }
        _done();
    });
});
//# sourceMappingURL=getPackageDeps.test.js.map