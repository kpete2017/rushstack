"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.SnapshotAction = void 0;
const BaseReportAction_1 = require("./BaseReportAction");
const Rundown_1 = require("../Rundown");
class SnapshotAction extends BaseReportAction_1.BaseReportAction {
    constructor() {
        super({
            actionName: 'snapshot',
            summary: 'Invoke a Node.js script and generate a test snapshot',
            documentation: 'Invoke a Node.js script and generate a test snapshot.  This command creates a concise report that can be' +
                ' added to Git, so that its diff can be used to detect performance regressions'
        });
    }
    onDefineParameters() {
        super.onDefineParameters();
    }
    async onExecute() {
        const rundown = new Rundown_1.Rundown();
        await rundown.invokeAsync(this.scriptParameter.value, this.argsParameter.value, this.quietParameter.value, this.ignoreExitCodeParameter.value);
        rundown.writeSnapshotReport();
    }
}
exports.SnapshotAction = SnapshotAction;
//# sourceMappingURL=SnapshotAction.js.map