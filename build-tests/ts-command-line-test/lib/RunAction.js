"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RunAction = void 0;
const ts_command_line_1 = require("@rushstack/ts-command-line");
class RunAction extends ts_command_line_1.CommandLineAction {
    constructor() {
        super({
            actionName: 'run',
            summary: 'This action (hypothetically) passes its command line arguments to the shell to be executed.',
            documentation: 'This demonstrates how to use the defineCommandLineRemainder() API.'
        });
    }
    onExecute() {
        return __awaiter(this, void 0, void 0, function* () {
            // abstract
            console.log(`Console Title: ${this._title.value || '(none)'}`);
            console.log('Arguments to be executed: ' + JSON.stringify(this.remainder.values));
        });
    }
    onDefineParameters() {
        // abstract
        this._title = this.defineStringParameter({
            parameterLongName: '--title',
            argumentName: 'TITLE',
            environmentVariable: 'WIDGET_TITLE',
            description: 'An optional title to show in the console window'
        });
        this.defineCommandLineRemainder({
            description: 'The remaining arguments are passed along to the command shell.'
        });
    }
}
exports.RunAction = RunAction;
//# sourceMappingURL=RunAction.js.map