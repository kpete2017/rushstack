"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.PushAction = void 0;
const ts_command_line_1 = require("@rushstack/ts-command-line");
const BusinessLogic_1 = require("./BusinessLogic");
class PushAction extends ts_command_line_1.CommandLineAction {
    constructor() {
        super({
            actionName: 'push',
            summary: 'Pushes a widget to the service',
            documentation: 'Here we provide a longer description of how our action works.'
        });
    }
    onExecute() {
        // abstract
        return BusinessLogic_1.BusinessLogic.doTheWork(this._force.value, this._protocol.value || '(none)');
    }
    onDefineParameters() {
        // abstract
        this._force = this.defineFlagParameter({
            parameterLongName: '--force',
            parameterShortName: '-f',
            description: 'Push and overwrite any existing state'
        });
        this._protocol = this.defineChoiceParameter({
            parameterLongName: '--protocol',
            description: 'Specify the protocol to use',
            alternatives: ['ftp', 'webdav', 'scp'],
            environmentVariable: 'WIDGET_PROTOCOL',
            defaultValue: 'scp'
        });
    }
}
exports.PushAction = PushAction;
//# sourceMappingURL=PushAction.js.map