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
exports.EmitFilesPatch = void 0;
const path = __importStar(require("path"));
const node_core_library_1 = require("@rushstack/node-core-library");
class EmitFilesPatch {
    static install(ts, tsconfig, moduleKindsToEmit, useBuildCache, changedFiles) {
        if (EmitFilesPatch._patchedTs === ts) {
            // We already patched this instance of TS
            return;
        }
        if (EmitFilesPatch._patchedTs !== undefined) {
            throw new node_core_library_1.InternalError('EmitFilesPatch.install() cannot be called without first uninstalling the existing patch');
        }
        EmitFilesPatch._patchedTs = ts;
        EmitFilesPatch._baseEmitFiles = ts.emitFiles;
        let foundPrimary = false;
        let defaultModuleKind;
        for (const moduleKindToEmit of moduleKindsToEmit) {
            if (moduleKindToEmit.isPrimary) {
                if (foundPrimary) {
                    throw new Error('Multiple primary module emit kinds encountered.');
                }
                else {
                    foundPrimary = true;
                }
                defaultModuleKind = moduleKindToEmit.moduleKind;
            }
        }
        // Override the underlying file emitter to run itself once for each flavor
        // This is a rather inelegant way to convince the TypeScript compiler not to duplicate parse/link/check
        ts.emitFiles = (resolver, host, targetSourceFile, emitTransformers, emitOnlyDtsFiles, onlyBuildInfo, forceDtsEmit) => {
            if (onlyBuildInfo || emitOnlyDtsFiles) {
                // There should only be one tsBuildInfo and one set of declaration files
                return EmitFilesPatch._baseEmitFiles(resolver, host, targetSourceFile, emitTransformers, emitOnlyDtsFiles, onlyBuildInfo, forceDtsEmit);
            }
            else {
                if (targetSourceFile && changedFiles) {
                    changedFiles.add(targetSourceFile);
                }
                let defaultModuleKindResult;
                let emitSkipped = false;
                for (const moduleKindToEmit of moduleKindsToEmit) {
                    const compilerOptions = moduleKindToEmit.isPrimary
                        ? Object.assign({}, tsconfig.options) : Object.assign(Object.assign({}, tsconfig.options), { module: moduleKindToEmit.moduleKind, 
                        // Don't emit declarations for secondary module kinds
                        declaration: false, declarationMap: false });
                    if (!compilerOptions.outDir) {
                        throw new node_core_library_1.InternalError('Expected compilerOptions.outDir to be assigned');
                    }
                    // Redirect from "path/to/lib" --> "path/to/.heft/build-cache/lib"
                    EmitFilesPatch._originalOutDir =
                        compilerOptions.outDir.replace(/([\\\/]+)$/, '') + '/'; /* Ensure trailing slash */
                    EmitFilesPatch._redirectedOutDir = useBuildCache
                        ? moduleKindToEmit.cacheOutFolderPath
                        : moduleKindToEmit.outFolderPath;
                    const flavorResult = EmitFilesPatch._baseEmitFiles(resolver, Object.assign(Object.assign({}, host), { writeFile: EmitFilesPatch.wrapWriteFile(host.writeFile, moduleKindToEmit.jsExtensionOverride), getCompilerOptions: () => compilerOptions }), targetSourceFile, ts.getTransformers(compilerOptions, undefined, emitOnlyDtsFiles), emitOnlyDtsFiles, onlyBuildInfo, forceDtsEmit);
                    emitSkipped = emitSkipped || flavorResult.emitSkipped;
                    if (moduleKindToEmit.moduleKind === defaultModuleKind) {
                        defaultModuleKindResult = flavorResult;
                    }
                    EmitFilesPatch._originalOutDir = undefined;
                    EmitFilesPatch._redirectedOutDir = undefined;
                    // Should results be aggregated, in case for whatever reason the diagnostics are not the same?
                }
                return Object.assign(Object.assign({}, defaultModuleKindResult), { emitSkipped });
            }
        };
    }
    static get isInstalled() {
        return this._patchedTs !== undefined;
    }
    /**
     * Wraps the writeFile callback on the IEmitHost to override the .js extension, if applicable
     */
    static wrapWriteFile(baseWriteFile, jsExtensionOverride) {
        if (!jsExtensionOverride) {
            return baseWriteFile;
        }
        const replacementExtension = `${jsExtensionOverride}$1`;
        return (fileName, data, writeBOM, onError, sourceFiles) => {
            return baseWriteFile(fileName.replace(/\.js(\.map)?$/g, replacementExtension), data, writeBOM, onError, sourceFiles);
        };
    }
    static getRedirectedFilePath(filePath) {
        if (!EmitFilesPatch.isInstalled) {
            throw new node_core_library_1.InternalError('EmitFilesPatch.getRedirectedFilePath() cannot be used unless the patch is installed');
        }
        // Redirect from "path/to/lib" --> "path/to/.heft/build-cache/lib"
        let redirectedFilePath = filePath;
        if (EmitFilesPatch._redirectedOutDir !== undefined) {
            if (
            /* This is significantly faster than Path.isUnderOrEqual */
            filePath.startsWith(EmitFilesPatch._originalOutDir)) {
                redirectedFilePath = path.resolve(EmitFilesPatch._redirectedOutDir, path.relative(EmitFilesPatch._originalOutDir, filePath));
            }
            else {
                // The compiler is writing some other output, for example:
                // ./.heft/build-cache/ts_a7cd263b9f06b2440c0f2b2264746621c192f2e2.json
            }
        }
        return redirectedFilePath;
    }
    static uninstall(ts) {
        if (EmitFilesPatch._patchedTs === undefined) {
            throw new node_core_library_1.InternalError('EmitFilesPatch.uninstall() cannot be called if no patch was installed');
        }
        if (ts !== EmitFilesPatch._patchedTs) {
            throw new node_core_library_1.InternalError('EmitFilesPatch.uninstall() called for the wrong object');
        }
        ts.emitFiles = EmitFilesPatch._baseEmitFiles;
        EmitFilesPatch._patchedTs = undefined;
        EmitFilesPatch._baseEmitFiles = undefined;
    }
}
exports.EmitFilesPatch = EmitFilesPatch;
EmitFilesPatch._patchedTs = undefined;
EmitFilesPatch._baseEmitFiles = undefined; // eslint-disable-line
EmitFilesPatch._originalOutDir = undefined;
EmitFilesPatch._redirectedOutDir = undefined;
//# sourceMappingURL=EmitFilesPatch.js.map