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
exports.process = void 0;
const path = __importStar(require("path"));
const node_core_library_1 = require("@rushstack/node-core-library");
const HeftJestDataFile_1 = require("./HeftJestDataFile");
// This caches heft-jest-data.json file contents.
// Map from jestOptions.rootDir --> IHeftJestDataFileJson
const dataFileJsonCache = new Map();
// Synchronous delay that doesn't burn CPU cycles
function delayMs(milliseconds) {
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, milliseconds);
}
const DEBUG_TRANSFORM = false;
// Tolerate this much inaccuracy in the filesystem time stamps
const TIMESTAMP_TOLERANCE_MS = 15;
// Wait this long after a .js file's timestamp changes before starting to read it; this gives time
// for the contents to get flushed to disk.
const FLUSH_TIME_MS = 500;
// Wait this long for the .js file to be written before giving up.
const MAX_WAIT_MS = 7000;
// Shamefully sleep this long to avoid consuming CPU cycles
const POLLING_INTERVAL_MS = 50;
/**
 * This Jest transformer maps TS files under a 'src' folder to their compiled equivalent under 'lib'
 */
function process(srcCode, srcFilePath, jestOptions) {
    let heftJestDataFile = dataFileJsonCache.get(jestOptions.rootDir);
    if (heftJestDataFile === undefined) {
        // Read heft-jest-data.json, which is created by the JestPlugin.  It tells us
        // which emitted output folder to use for Jest.
        heftJestDataFile = HeftJestDataFile_1.HeftJestDataFile.loadForProject(jestOptions.rootDir);
        dataFileJsonCache.set(jestOptions.rootDir, heftJestDataFile);
    }
    // Is the input file under the "src" folder?
    const srcFolder = path.join(jestOptions.rootDir, 'src');
    if (node_core_library_1.Path.isUnder(srcFilePath, srcFolder)) {
        // Example: /path/to/project/src/folder1/folder2/Example.ts
        const parsedFilename = path.parse(srcFilePath);
        // Example: folder1/folder2
        const srcRelativeFolderPath = path.relative(srcFolder, parsedFilename.dir);
        // Example: /path/to/project/lib/folder1/folder2/Example.js
        const libFilePath = path.join(jestOptions.rootDir, heftJestDataFile.emitFolderNameForTests, srcRelativeFolderPath, `${parsedFilename.name}${heftJestDataFile.extensionForTests}`);
        const startOfLoopMs = new Date().getTime();
        let stalled = false;
        if (!heftJestDataFile.skipTimestampCheck) {
            for (;;) {
                let srcFileStatistics;
                try {
                    srcFileStatistics = node_core_library_1.FileSystem.getStatistics(srcFilePath);
                }
                catch (_a) {
                    // If the source file was deleted, then fall through and allow readFile() to fail
                    break;
                }
                let libFileStatistics = undefined;
                try {
                    libFileStatistics = node_core_library_1.FileSystem.getStatistics(libFilePath);
                }
                catch (_b) {
                    // ignore errors
                }
                const nowMs = new Date().getTime();
                if (libFileStatistics) {
                    // The lib/*.js timestamp must not be older than the src/*.ts timestamp, otherwise the transpiler
                    // is not done writing its outputs.
                    if (libFileStatistics.ctimeMs + TIMESTAMP_TOLERANCE_MS > srcFileStatistics.ctimeMs) {
                        // Also, the lib/*.js timestamp must not be too recent, otherwise the transpiler may not have
                        // finished flushing its output to disk.
                        if (nowMs > libFileStatistics.ctimeMs + FLUSH_TIME_MS) {
                            // The .js file is newer than the .ts file, and is old enough to have been flushed
                            break;
                        }
                    }
                }
                if (nowMs - startOfLoopMs > MAX_WAIT_MS) {
                    // Something is wrong -- why hasn't the compiler updated the .js file?
                    if (libFileStatistics) {
                        throw new Error('jest-build-transform: Gave up waiting for the transpiler to update its output file:\n' +
                            libFilePath);
                    }
                    else {
                        throw new Error('jest-build-transform: Gave up waiting for the transpiler to write its output file:\n' +
                            libFilePath);
                    }
                }
                // Jest's transforms are synchronous, so our only option here is to sleep synchronously. Bad Jest. :-(
                // TODO: The better solution is to change how Jest's watch loop is notified.
                stalled = true;
                delayMs(POLLING_INTERVAL_MS);
            }
        }
        if (stalled && DEBUG_TRANSFORM) {
            const nowMs = new Date().getTime();
            console.log(`Waited ${nowMs - startOfLoopMs} ms for .js file`);
            delayMs(2000);
        }
        let libCode;
        try {
            libCode = node_core_library_1.FileSystem.readFile(libFilePath);
        }
        catch (error) {
            if (node_core_library_1.FileSystem.isNotExistError(error)) {
                throw new Error('jest-build-transform: The expected transpiler output file does not exist:\n' + libFilePath);
            }
            else {
                throw error;
            }
        }
        const sourceMapFilePath = libFilePath + '.map';
        let originalSourceMap;
        try {
            originalSourceMap = node_core_library_1.FileSystem.readFile(sourceMapFilePath);
        }
        catch (error) {
            if (node_core_library_1.FileSystem.isNotExistError(error)) {
                throw new Error('jest-build-transform: The source map file is missing -- check your tsconfig.json settings:\n' +
                    sourceMapFilePath);
            }
            else {
                throw error;
            }
        }
        // Fix up the source map, since Jest will present the .ts file path to VS Code as the executing script
        const parsedSourceMap = JSON.parse(originalSourceMap);
        if (parsedSourceMap.version !== 3) {
            throw new Error('jest-build-transform: Unsupported source map file version: ' + sourceMapFilePath);
        }
        parsedSourceMap.file = srcFilePath;
        parsedSourceMap.sources = [srcFilePath];
        parsedSourceMap.sourcesContent = [srcCode];
        delete parsedSourceMap.sourceRoot;
        const correctedSourceMap = JSON.stringify(parsedSourceMap);
        // Embed the source map, since if we return the { code, map } object, then the debugger does not believe
        // it is the same file, and will show a separate view with the same file path.
        //
        // Note that if the Jest testEnvironment does not support vm.compileFunction (introduced with Node.js 10),
        // then the Jest module wrapper will inject text below the "//# sourceMappingURL=" line which breaks source maps.
        // See this PR for details: https://github.com/facebook/jest/pull/9252
        const encodedSourceMap = 'data:application/json;charset=utf-8;base64,' +
            Buffer.from(correctedSourceMap, 'utf8').toString('base64');
        const sourceMappingUrlToken = 'sourceMappingURL=';
        const sourceMappingCommentIndex = libCode.lastIndexOf(sourceMappingUrlToken);
        let libCodeWithSourceMap;
        if (sourceMappingCommentIndex !== -1) {
            libCodeWithSourceMap =
                libCode.slice(0, sourceMappingCommentIndex + sourceMappingUrlToken.length) + encodedSourceMap;
        }
        else {
            // If there isn't a sourceMappingURL comment, inject one
            const sourceMapComment = (libCode.endsWith('\n') ? '' : '\n') + `//# ${sourceMappingUrlToken}${encodedSourceMap}`;
            libCodeWithSourceMap = libCode + sourceMapComment;
        }
        return libCodeWithSourceMap;
    }
    else {
        throw new Error('jest-build-transform: The input path is not under the "src" folder:\n' + srcFilePath);
    }
}
exports.process = process;
//# sourceMappingURL=jest-build-transform.js.map