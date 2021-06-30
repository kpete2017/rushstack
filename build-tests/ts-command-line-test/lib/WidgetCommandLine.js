"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.WidgetCommandLine = void 0;
const ts_command_line_1 = require("@rushstack/ts-command-line");
const PushAction_1 = require("./PushAction");
const RunAction_1 = require("./RunAction");
const BusinessLogic_1 = require("./BusinessLogic");
class WidgetCommandLine extends ts_command_line_1.CommandLineParser {
    constructor() {
        super({
            toolFilename: 'widget',
            toolDescription: 'The "widget" tool is a code sample for using the @rushstack/ts-command-line library.'
        });
        this.addAction(new PushAction_1.PushAction());
        this.addAction(new RunAction_1.RunAction());
    }
    onDefineParameters() {
        // abstract
        this._verbose = this.defineFlagParameter({
            parameterLongName: '--verbose',
            parameterShortName: '-v',
            description: 'Show extra logging detail'
        });
    }
    onExecute() {
        // override
        BusinessLogic_1.BusinessLogic.configureLogger(this._verbose.value);
        return super.onExecute();
    }
}
exports.WidgetCommandLine = WidgetCommandLine;
//# sourceMappingURL=WidgetCommandLine.js.map