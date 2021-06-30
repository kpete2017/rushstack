"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const moduleApi = require("module");
const process_1 = __importDefault(require("process"));
// The _ipcTraceRecordsBatch will get transmitted when this many items are accumulated
const IPC_BATCH_SIZE = 300;
class Launcher {
    constructor() {
        this.action = "inspect" /* Inspect */;
        this.targetScriptPathArg = '';
        this.reportPath = '';
        this._importedModules = new Set();
        this._importedModulePaths = new Set();
        this._ipcTraceRecordsBatch = [];
    }
    transformArgs(argv) {
        let nodeArg;
        let remainderArgs;
        // Example process.argv:
        // ["path/to/node.exe", "path/to/launcher.js", "path/to/target-script.js", "first-target-arg"]
        [nodeArg, , this.targetScriptPathArg, ...remainderArgs] = argv;
        // Example process.argv:
        // ["path/to/node.exe", "path/to/target-script.js", "first-target-arg"]
        return [nodeArg, this.targetScriptPathArg, ...remainderArgs];
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static _copyProperties(dst, src) {
        for (const prop of Object.keys(src)) {
            dst[prop] = src[prop];
        }
    }
    _sendIpcTraceBatch() {
        if (this._ipcTraceRecordsBatch.length > 0) {
            const batch = [...this._ipcTraceRecordsBatch];
            this._ipcTraceRecordsBatch.length = 0;
            process_1.default.send({
                id: 'trace',
                records: batch
            });
        }
    }
    /**
     * Synchronously delay for the specified time interval.
     */
    static _delayMs(milliseconds) {
        Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, milliseconds);
    }
    installHook() {
        const realRequire = moduleApi.Module.prototype.require;
        const importedModules = this._importedModules; // for closure
        const importedModulePaths = this._importedModulePaths; // for closure
        const ipcTraceRecordsBatch = this._ipcTraceRecordsBatch; // for closure
        const sendIpcTraceBatch = this._sendIpcTraceBatch.bind(this); // for closure
        function hookedRequire(moduleName) {
            // NOTE: The "this" pointer is the calling NodeModule, so we rely on closure
            // variable here.
            const callingModuleInfo = this;
            // Paranoidly use "arguments" in case some implementor passes additional undocumented arguments
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const importedModule = realRequire.apply(callingModuleInfo, arguments);
            if (!importedModules.has(importedModule)) {
                importedModules.add(importedModule);
                // Find the info for the imported module
                let importedModuleInfo = undefined;
                const children = callingModuleInfo.children || [];
                for (const child of children) {
                    if (child.exports === importedModule) {
                        importedModuleInfo = child;
                        break;
                    }
                }
                if (importedModuleInfo === undefined) {
                    // It's a built-in module like "os"
                }
                else {
                    if (!importedModuleInfo.filename) {
                        throw new Error('Missing filename for ' + moduleName);
                    }
                    if (!importedModulePaths.has(importedModuleInfo.filename)) {
                        importedModulePaths.add(importedModuleInfo.filename);
                        ipcTraceRecordsBatch.push({
                            importedModule: importedModuleInfo.filename,
                            callingModule: callingModuleInfo.filename
                        });
                        if (ipcTraceRecordsBatch.length >= IPC_BATCH_SIZE) {
                            sendIpcTraceBatch();
                        }
                    }
                }
            }
            return importedModule;
        }
        moduleApi.Module.prototype.require = hookedRequire;
        Launcher._copyProperties(hookedRequire, realRequire);
        process_1.default.on('exit', () => {
            this._sendIpcTraceBatch();
            process_1.default.send({
                id: 'done'
            });
            // The Node.js "exit" event is synchronous, and the process will terminate as soon as this function returns.
            // To avoid a race condition, allow some time for IPC messages to be transmitted to the parent process.
            // TODO: There should be a way to eliminate this delay by intercepting earlier in the shutdown sequence,
            // but it needs to consider every way that Node.js can exit.
            Launcher._delayMs(500);
        });
    }
}
if (!process_1.default.send) {
    throw new Error('launcher.js must be invoked via IPC');
}
const launcher = new Launcher();
const originalArgv = [...process_1.default.argv];
process_1.default.argv.length = 0;
process_1.default.argv.push(...launcher.transformArgs(originalArgv));
launcher.installHook();
// Start the app
require(launcher.targetScriptPathArg);
//# sourceMappingURL=launcher.js.map