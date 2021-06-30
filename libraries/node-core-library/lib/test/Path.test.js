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
const os = __importStar(require("os"));
const path = __importStar(require("path"));
const Path_1 = require("../Path");
describe('Path', () => {
    describe('isUnder', () => {
        if (os.platform() === 'win32') {
            test('Windows paths', () => {
                expect(Path_1.Path.isUnder('C:\\a\\b.txt', 'C:\\a')).toEqual(true);
                expect(Path_1.Path.isUnder('C:\\a\\b.txt', 'C:\\a\\')).toEqual(true);
                expect(Path_1.Path.isUnder('C:\\a\\b\\c.txt', 'C:\\a')).toEqual(true);
                expect(Path_1.Path.isUnder('C:\\a\\b.txt', 'C:\\b')).toEqual(false);
                expect(Path_1.Path.isUnder('C:\\a\\b.txt', 'C:\\b\\')).toEqual(false);
                expect(Path_1.Path.isUnder('C:\\a\\b\\c.txt', 'C:\\b')).toEqual(false);
                expect(Path_1.Path.isUnder('C:\\a\\b.txt', 'D:\\a')).toEqual(false);
            });
        }
        test('POSIX-style paths', () => {
            expect(Path_1.Path.isUnder('/a/b.txt', '/a')).toEqual(true);
            expect(Path_1.Path.isUnder('/a/b.txt', '/a/')).toEqual(true);
            expect(Path_1.Path.isUnder('/a/b/c.txt', '/a')).toEqual(true);
            expect(Path_1.Path.isUnder('/a/b.txt', '/b')).toEqual(false);
            expect(Path_1.Path.isUnder('/a/b.txt', '/b/')).toEqual(false);
            expect(Path_1.Path.isUnder('/a/b/c.txt', '/b')).toEqual(false);
        });
        test('Edge cases', () => {
            expect(Path_1.Path.isUnder('/a', '/a')).toEqual(false);
            expect(Path_1.Path.isUnder('.', '.')).toEqual(false);
            expect(Path_1.Path.isUnder('', '')).toEqual(false);
        });
        test('Relative paths', () => {
            expect(Path_1.Path.isUnder('a/b/c', 'a/b')).toEqual(true);
            expect(Path_1.Path.isUnder('./a/b/c', './a/b')).toEqual(true);
            expect(Path_1.Path.isUnder('../a/b/c', '../a/b')).toEqual(true);
            expect(Path_1.Path.isUnder('a/b', 'a/b/c')).toEqual(false);
            expect(Path_1.Path.isUnder('./a/b', './a/b/c')).toEqual(false);
            expect(Path_1.Path.isUnder('../a/b', '../a/b/c')).toEqual(false);
        });
    });
    describe('isDownwardRelative', () => {
        test('Positive cases', () => {
            expect(Path_1.Path.isDownwardRelative('folder')).toEqual(true);
            expect(Path_1.Path.isDownwardRelative('folder/')).toEqual(true);
            expect(Path_1.Path.isDownwardRelative('./folder')).toEqual(true);
            expect(Path_1.Path.isDownwardRelative('./folder/file')).toEqual(true);
            expect(Path_1.Path.isDownwardRelative('./folder/file')).toEqual(true);
            if (os.platform() === 'win32') {
                expect(Path_1.Path.isDownwardRelative('folder\\')).toEqual(true);
                expect(Path_1.Path.isDownwardRelative('.\\folder')).toEqual(true);
                expect(Path_1.Path.isDownwardRelative('.\\folder\\file')).toEqual(true);
                expect(Path_1.Path.isDownwardRelative('.\\folder\\file')).toEqual(true);
            }
        });
        test('Degenerate positive cases', () => {
            expect(Path_1.Path.isDownwardRelative('folder/degenerate...')).toEqual(true);
            expect(Path_1.Path.isDownwardRelative('folder/...degenerate')).toEqual(true);
            expect(Path_1.Path.isDownwardRelative('folder/...degenerate...')).toEqual(true);
            expect(Path_1.Path.isDownwardRelative('folder/degenerate.../file')).toEqual(true);
            expect(Path_1.Path.isDownwardRelative('folder/...degenerate/file')).toEqual(true);
            expect(Path_1.Path.isDownwardRelative('folder/...degenerate.../file')).toEqual(true);
            expect(Path_1.Path.isDownwardRelative('...degenerate/file')).toEqual(true);
            expect(Path_1.Path.isDownwardRelative('.../file')).toEqual(true);
            expect(Path_1.Path.isDownwardRelative('...')).toEqual(true);
        });
        test('Negative cases', () => {
            expect(Path_1.Path.isDownwardRelative('../folder')).toEqual(false);
            expect(Path_1.Path.isDownwardRelative('../folder/folder')).toEqual(false);
            expect(Path_1.Path.isDownwardRelative('folder/../folder')).toEqual(false);
            expect(Path_1.Path.isDownwardRelative('/folder/file')).toEqual(false);
            if (os.platform() === 'win32') {
                expect(Path_1.Path.isDownwardRelative('C:/folder/file')).toEqual(false);
                expect(Path_1.Path.isDownwardRelative('..\\folder')).toEqual(false);
                expect(Path_1.Path.isDownwardRelative('..\\folder\\folder')).toEqual(false);
                expect(Path_1.Path.isDownwardRelative('folder\\..\\folder')).toEqual(false);
                expect(Path_1.Path.isDownwardRelative('\\folder\\file')).toEqual(false);
                expect(Path_1.Path.isDownwardRelative('C:\\folder\\file')).toEqual(false);
            }
        });
    });
    describe('formatConcisely', () => {
        test('tests', () => {
            expect(Path_1.Path.formatConcisely({ pathToConvert: '/folder1/folder2/folder3', baseFolder: '/folder1' })).toEqual('./folder2/folder3');
            expect(path.isAbsolute(Path_1.Path.formatConcisely({ pathToConvert: '/folder1/folder2/folder3', baseFolder: '/folder4' }))).toBe(true);
            expect(Path_1.Path.formatConcisely({
                pathToConvert: '/folder1/folder2/folder3/folder4/../file.txt',
                baseFolder: '/folder1/folder2/folder3'
            })).toEqual('./file.txt');
        });
    });
});
//# sourceMappingURL=Path.test.js.map