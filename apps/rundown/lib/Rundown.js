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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Rundown = void 0;
const node_core_library_1 = require("@rushstack/node-core-library");
const child_process = __importStar(require("child_process"));
const path = __importStar(require("path"));
const string_argv_1 = __importDefault(require("string-argv"));
class Rundown {
    constructor() {
        // Map from required path --> caller path
        this._importedModuleMap = new Map();
    }
    async invokeAsync(scriptPath, args, quiet, ignoreExitCode) {
        if (!node_core_library_1.FileSystem.exists(scriptPath)) {
            throw new Error('The specified script path does not exist: ' + scriptPath);
        }
        const absoluteScriptPath = path.resolve(scriptPath);
        const expandedArgs = args === undefined ? [] : string_argv_1.default(args);
        console.log('Starting process: ' + [absoluteScriptPath, ...expandedArgs].join(' '));
        console.log();
        // Example process.argv:
        // ["path/to/launcher.js", "path/to/target-script.js", "first-target-arg"]
        const nodeArgs = [path.join(__dirname, 'launcher.js'), absoluteScriptPath, ...expandedArgs];
        await this._spawnLauncherAsync(nodeArgs, quiet, ignoreExitCode);
        if (!quiet) {
            console.log();
        }
    }
    writeSnapshotReport() {
        const reportPath = 'rundown-snapshot.log';
        console.log('Writing report file: ' + reportPath);
        const packageJsonLookup = new node_core_library_1.PackageJsonLookup();
        const importedPaths = [...this._importedModuleMap.keys()];
        const importedPackageFolders = new Set();
        for (const importedPath of importedPaths) {
            const importedPackageFolder = packageJsonLookup.tryGetPackageFolderFor(importedPath);
            if (importedPackageFolder) {
                if (/[\\/]node_modules[\\/]/i.test(importedPackageFolder)) {
                    importedPackageFolders.add(path.basename(importedPackageFolder));
                }
                else {
                    const relativePath = path.relative(process.cwd(), importedPackageFolder);
                    importedPackageFolders.add(node_core_library_1.Text.replaceAll(relativePath, '\\', '/'));
                }
            }
            else {
                // If the importedPath does not belong to an NPM package, then rundown-snapshot.log can ignore it.
                // In other words, treat it the same way as the local project's source files.
            }
        }
        node_core_library_1.Sort.sortSet(importedPackageFolders);
        const data = [...importedPackageFolders].join('\n') + '\n';
        node_core_library_1.FileSystem.writeFile(reportPath, data);
    }
    writeInspectReport(traceImports) {
        const reportPath = 'rundown-inspect.log';
        console.log('Writing report file: ' + reportPath);
        const importedPaths = [...this._importedModuleMap.keys()];
        importedPaths.sort();
        let data = '';
        if (traceImports) {
            for (const importedPath of importedPaths) {
                data += importedPath + '\n';
                let current = importedPath;
                const visited = new Set();
                for (;;) {
                    const callerPath = this._importedModuleMap.get(current);
                    if (!callerPath) {
                        break;
                    }
                    if (visited.has(callerPath)) {
                        break;
                    }
                    visited.add(callerPath);
                    data += '  imported by ' + callerPath + '\n';
                    current = callerPath;
                }
                data += '\n';
            }
        }
        else {
            data = importedPaths.join('\n') + '\n';
        }
        node_core_library_1.FileSystem.writeFile(reportPath, data);
    }
    async _spawnLauncherAsync(nodeArgs, quiet, ignoreExitCode) {
        const childProcess = child_process.spawn(process.execPath, nodeArgs, {
            stdio: quiet ? ['inherit', 'ignore', 'ignore', 'ipc'] : ['inherit', 'inherit', 'inherit', 'ipc']
        });
        let completedNormally = false;
        childProcess.on('message', (message) => {
            switch (message.id) {
                case 'trace':
                    for (const record of message.records) {
                        this._importedModuleMap.set(record.importedModule, record.callingModule);
                    }
                    break;
                case 'done':
                    completedNormally = true;
                    break;
                default:
                    throw new Error('Unknown IPC message: ' + JSON.stringify(message));
            }
        });
        await new Promise((resolve, reject) => {
            childProcess.on('exit', (code, signal) => {
                if (code !== 0 && !ignoreExitCode) {
                    reject(new Error('Child process terminated with exit code ' + code));
                }
                else if (!completedNormally) {
                    reject(new Error('Child process terminated without completing IPC handshake'));
                }
                else {
                    resolve();
                }
            });
        });
    }
}
exports.Rundown = Rundown;
//# sourceMappingURL=Rundown.js.map