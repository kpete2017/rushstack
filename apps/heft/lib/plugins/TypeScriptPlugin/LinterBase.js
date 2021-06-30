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
exports.LinterBase = void 0;
const path = __importStar(require("path"));
const node_core_library_1 = require("@rushstack/node-core-library");
class LinterBase {
    constructor(linterName, options) {
        this._scopedLogger = options.scopedLogger;
        this._terminal = this._scopedLogger.terminal;
        this._ts = options.ts;
        this._buildFolderPath = options.buildFolderPath;
        this._buildCacheFolderPath = options.buildCacheFolderPath;
        this._linterConfigFilePath = options.linterConfigFilePath;
        this._linterName = linterName;
        this._measurePerformance = options.measurePerformance;
    }
    async performLintingAsync(options) {
        await this.initializeAsync(options.tsProgram);
        const tslintConfigVersion = this.cacheVersion;
        const cacheFilePath = path.join(this._buildCacheFolderPath, `${this._linterName}.json`);
        let tslintCacheData;
        try {
            tslintCacheData = await node_core_library_1.JsonFile.loadAsync(cacheFilePath);
        }
        catch (e) {
            if (node_core_library_1.FileSystem.isNotExistError(e)) {
                tslintCacheData = undefined;
            }
            else {
                throw e;
            }
        }
        const cachedNoFailureFileVersions = new Map((tslintCacheData === null || tslintCacheData === void 0 ? void 0 : tslintCacheData.cacheVersion) === tslintConfigVersion ? tslintCacheData.fileVersions : []);
        const newNoFailureFileVersions = new Map();
        //#region Code from TSLint
        // Some of this code comes from here:
        // https://github.com/palantir/tslint/blob/24d29e421828348f616bf761adb3892bcdf51662/src/linter.ts#L161-L179
        // Modified to only lint files that have changed and that we care about
        const lintFailures = [];
        for (const sourceFile of options.tsProgram.getSourceFiles()) {
            const filePath = sourceFile.fileName;
            if (!options.typeScriptFilenames.has(filePath) || (await this.isFileExcludedAsync(filePath))) {
                continue;
            }
            // Older compilers don't compute the ts.SourceFile.version.  If it is missing, then we can't skip processing
            const version = sourceFile.version || '';
            const cachedVersion = cachedNoFailureFileVersions.get(filePath) || '';
            if (cachedVersion === '' ||
                version === '' ||
                cachedVersion !== version ||
                options.changedFiles.has(sourceFile)) {
                this._measurePerformance(this._linterName, () => {
                    const failures = this.lintFile(sourceFile);
                    if (failures.length === 0) {
                        newNoFailureFileVersions.set(filePath, version);
                    }
                    else {
                        lintFailures.push(...failures);
                    }
                });
            }
            else {
                newNoFailureFileVersions.set(filePath, version);
            }
        }
        //#endregion
        this.lintingFinished(lintFailures);
        const updatedTslintCacheData = {
            cacheVersion: tslintConfigVersion,
            fileVersions: Array.from(newNoFailureFileVersions)
        };
        await node_core_library_1.JsonFile.saveAsync(updatedTslintCacheData, cacheFilePath, { ensureFolderExists: true });
        const lintTiming = this.getTiming(this._linterName);
        this._terminal.writeVerboseLine(`Lint: ${lintTiming.duration}ms (${lintTiming.hitCount} files)`);
    }
    getTiming(timingName) {
        return {
            duration: this._ts.performance.getDuration(timingName),
            hitCount: this._ts.performance.getCount(`before${timingName}`)
        };
    }
}
exports.LinterBase = LinterBase;
//# sourceMappingURL=LinterBase.js.map