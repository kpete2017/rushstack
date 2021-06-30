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
// Follow the NPM dependency chain to find the module path for BaseWorkerPool.js
// heft --> @jest/core --> @jest/reporters --> jest-worker
const PATCHED_FORCE_EXIT_DELAY = 7000; // 7 seconds
const patchName = path.basename(__filename);
function applyPatch() {
    try {
        let contextFolder = __dirname;
        // Resolve the "@jest/core" package relative to Heft
        contextFolder = node_core_library_1.Import.resolvePackage({ packageName: '@jest/core', baseFolderPath: contextFolder });
        // Resolve the "@jest/reporters" package relative to "@jest/core"
        contextFolder = node_core_library_1.Import.resolvePackage({ packageName: '@jest/reporters', baseFolderPath: contextFolder });
        // Resolve the "jest-worker" package relative to "@jest/reporters"
        const jestWorkerFolder = node_core_library_1.Import.resolvePackage({
            packageName: 'jest-worker',
            baseFolderPath: contextFolder
        });
        const baseWorkerPoolPath = path.join(jestWorkerFolder, 'build/base/BaseWorkerPool.js');
        const baseWorkerPoolFilename = path.basename(baseWorkerPoolPath); // BaseWorkerPool.js
        if (!node_core_library_1.FileSystem.exists(baseWorkerPoolPath)) {
            throw new Error('The BaseWorkerPool.js file was not found in the expected location:\n' + baseWorkerPoolPath);
        }
        // Load the module
        const baseWorkerPoolModule = require(baseWorkerPoolPath);
        // Obtain the metadata for the module
        let baseWorkerPoolModuleMetadata = undefined;
        for (const childModule of module.children) {
            if (path.basename(childModule.filename || '').toUpperCase() === baseWorkerPoolFilename.toUpperCase()) {
                if (baseWorkerPoolModuleMetadata) {
                    throw new Error('More than one child module matched while detecting Node.js module metadata');
                }
                baseWorkerPoolModuleMetadata = childModule;
            }
        }
        if (!baseWorkerPoolModuleMetadata) {
            throw new Error('Failed to detect the Node.js module metadata for BaseWorkerPool.js');
        }
        // Load the original file contents
        const originalFileContent = node_core_library_1.FileSystem.readFile(baseWorkerPoolPath);
        // Add boilerplate so that eval() will return the exports
        let patchedCode = '// PATCHED BY HEFT USING eval()\n\nexports = {}\n' +
            originalFileContent +
            '\n// return value:\nexports';
        // Apply the patch.  We will replace this:
        //
        //    const FORCE_EXIT_DELAY = 500;
        //
        // with this:
        //
        //    const FORCE_EXIT_DELAY = 7000;
        let matched = false;
        patchedCode = patchedCode.replace(/(const\s+FORCE_EXIT_DELAY\s*=\s*)(\d+)(\s*\;)/, (matchedString, leftPart, middlePart, rightPart) => {
            matched = true;
            return leftPart + PATCHED_FORCE_EXIT_DELAY.toString() + rightPart;
        });
        if (!matched) {
            throw new Error('The expected pattern was not found in the file:\n' + baseWorkerPoolPath);
        }
        function evalInContext() {
            // Remap the require() function for the eval() context
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            function require(modulePath) {
                return baseWorkerPoolModuleMetadata.require(modulePath);
            }
            // eslint-disable-next-line no-eval
            return eval(patchedCode);
        }
        const patchedModule = evalInContext();
        baseWorkerPoolModule.default = patchedModule.default;
    }
    catch (e) {
        console.error();
        console.error(`ERROR: ${patchName} failed to patch the "jest-worker" package:`);
        console.error(e.toString());
        console.error();
        throw e;
    }
}
if (typeof jest !== 'undefined' || process.env.JEST_WORKER_ID) {
    // This patch is incompatible with Jest's proprietary require() implementation
    console.log(`\nJEST ENVIRONMENT DETECTED - Skipping Heft's ${patchName}\n`);
}
else {
    applyPatch();
}
//# sourceMappingURL=jestWorkerPatch.js.map