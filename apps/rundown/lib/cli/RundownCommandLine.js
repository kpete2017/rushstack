"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.RundownCommandLine = void 0;
const ts_command_line_1 = require("@rushstack/ts-command-line");
const SnapshotAction_1 = require("./SnapshotAction");
const InspectAction_1 = require("./InspectAction");
class RundownCommandLine extends ts_command_line_1.CommandLineParser {
    constructor() {
        super({
            toolFilename: 'rundown',
            toolDescription: 'Detect load time regressions by running an app, tracing require() calls,' +
                ' and generating a deterministic report'
        });
        this.addAction(new SnapshotAction_1.SnapshotAction());
        this.addAction(new InspectAction_1.InspectAction());
    }
    onDefineParameters() { }
}
exports.RundownCommandLine = RundownCommandLine;
//# sourceMappingURL=RundownCommandLine.js.map