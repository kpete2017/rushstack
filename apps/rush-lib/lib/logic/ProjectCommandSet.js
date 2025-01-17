"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectCommandSet = void 0;
/**
 * Parses the "scripts" section from package.json and provides support for executing scripts.
 */
class ProjectCommandSet {
    constructor(packageJson) {
        this.malformedScriptNames = [];
        this.commandNames = [];
        this._scriptsByName = new Map();
        const scripts = packageJson.scripts || {};
        for (const scriptName of Object.keys(scripts)) {
            if (scriptName[0] === '-' || scriptName.length === 0) {
                this.malformedScriptNames.push(scriptName);
            }
            else {
                this.commandNames.push(scriptName);
                this._scriptsByName.set(scriptName, scripts[scriptName]);
            }
        }
        this.commandNames.sort();
    }
    tryGetScriptBody(commandName) {
        return this._scriptsByName.get(commandName);
    }
    getScriptBody(commandName) {
        const result = this.tryGetScriptBody(commandName);
        if (result === undefined) {
            throw new Error(`The command "${commandName}" was not found`);
        }
        return result;
    }
}
exports.ProjectCommandSet = ProjectCommandSet;
//# sourceMappingURL=ProjectCommandSet.js.map