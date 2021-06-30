"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.InspectAction = void 0;
const BaseReportAction_1 = require("./BaseReportAction");
const Rundown_1 = require("../Rundown");
class InspectAction extends BaseReportAction_1.BaseReportAction {
    constructor() {
        super({
            actionName: 'inspect',
            summary: 'Invoke a Node.js script and generate detailed diagnostic output',
            documentation: 'Invoke a Node.js script and generate detailed diagnostic output.  This command is used' +
                ' to inspect performance regressions.'
        });
    }
    onDefineParameters() {
        super.onDefineParameters();
        this._traceParameter = this.defineFlagParameter({
            parameterLongName: '--trace-imports',
            parameterShortName: '-t',
            description: 'Reports the call chain for each module path, showing how it was imported'
        });
    }
    async onExecute() {
        const rundown = new Rundown_1.Rundown();
        await rundown.invokeAsync(this.scriptParameter.value, this.argsParameter.value, this.quietParameter.value, this.ignoreExitCodeParameter.value);
        rundown.writeInspectReport(this._traceParameter.value);
    }
}
exports.InspectAction = InspectAction;
//# sourceMappingURL=InspectAction.js.map