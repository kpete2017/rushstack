"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.runAsync = exports.runSudoAsync = void 0;
const node_core_library_1 = require("@rushstack/node-core-library");
// eslint-disable-next-line
const sudo = require('sudo');
async function runSudoAsync(command, params) {
    const result = sudo([command, ...params], {
        cachePassword: false,
        prompt: 'Enter your password: '
    });
    return await _handleChildProcess(result);
}
exports.runSudoAsync = runSudoAsync;
async function runAsync(command, params) {
    const result = node_core_library_1.Executable.spawn(command, params);
    return await _handleChildProcess(result);
}
exports.runAsync = runAsync;
async function _handleChildProcess(childProcess) {
    return await new Promise((resolve) => {
        const stderr = [];
        childProcess.stderr.on('data', (data) => {
            stderr.push(data.toString());
        });
        const stdout = [];
        childProcess.stdout.on('data', (data) => {
            stdout.push(data.toString());
        });
        childProcess.on('close', (code) => {
            resolve({ code, stdout, stderr });
        });
    });
}
//# sourceMappingURL=exec.js.map