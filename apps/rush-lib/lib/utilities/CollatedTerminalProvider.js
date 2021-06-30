"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollatedTerminalProvider = void 0;
const node_core_library_1 = require("@rushstack/node-core-library");
class CollatedTerminalProvider {
    constructor(collatedTerminal) {
        this._hasErrors = false;
        this._hasWarnings = false;
        this.supportsColor = true;
        this.eolCharacter = '\n';
        this._collatedTerminal = collatedTerminal;
    }
    get hasErrors() {
        return this._hasErrors;
    }
    get hasWarnings() {
        return this._hasWarnings;
    }
    write(data, severity) {
        switch (severity) {
            case node_core_library_1.TerminalProviderSeverity.log:
            case node_core_library_1.TerminalProviderSeverity.verbose: {
                this._collatedTerminal.writeStdoutLine(data);
                break;
            }
            case node_core_library_1.TerminalProviderSeverity.error: {
                this._collatedTerminal.writeStderrLine(data);
                this._hasErrors = true;
                break;
            }
            case node_core_library_1.TerminalProviderSeverity.warning: {
                this._collatedTerminal.writeStderrLine(data);
                this._hasWarnings = true;
                break;
            }
            default: {
                throw new Error(`Unexpected severity: ${severity}`);
            }
        }
    }
}
exports.CollatedTerminalProvider = CollatedTerminalProvider;
//# sourceMappingURL=CollatedTerminalProvider.js.map