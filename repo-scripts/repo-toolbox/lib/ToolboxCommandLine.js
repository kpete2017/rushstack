"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See the @microsoft/rush package's LICENSE file for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToolboxCommandLine = void 0;
const ts_command_line_1 = require("@rushstack/ts-command-line");
const ReadmeAction_1 = require("./ReadmeAction");
class ToolboxCommandLine extends ts_command_line_1.CommandLineParser {
    constructor() {
        super({
            toolFilename: 'toolbox',
            toolDescription: 'Used to execute various operations specific to this repo'
        });
        this.addAction(new ReadmeAction_1.ReadmeAction());
    }
    onDefineParameters() {
        // abstract
    }
    onExecute() {
        // override
        return super.onExecute();
    }
}
exports.ToolboxCommandLine = ToolboxCommandLine;
//# sourceMappingURL=ToolboxCommandLine.js.map