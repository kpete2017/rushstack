"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseReportAction = void 0;
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
const ts_command_line_1 = require("@rushstack/ts-command-line");
class BaseReportAction extends ts_command_line_1.CommandLineAction {
    constructor(options) {
        super(options);
    }
    // abstract
    onDefineParameters() {
        this.scriptParameter = this.defineStringParameter({
            parameterLongName: '--script',
            parameterShortName: '-s',
            argumentName: 'PATH',
            description: 'The path to a .js file that will be the entry point for the target Node.js process',
            required: true
        });
        this.argsParameter = this.defineStringParameter({
            parameterLongName: '--args',
            parameterShortName: '-a',
            argumentName: 'STRING',
            description: 'Specifies command-line arguments to be passed to the target Node.js process.  The value' +
                ' should be a single text string delimited by spaces.' +
                ' Example: rundown inspect --scripts ./example.js --args="--flag --option=123"'
        });
        this.quietParameter = this.defineFlagParameter({
            parameterLongName: '--quiet',
            parameterShortName: '-q',
            description: 'Suppress STDOUT/STDERR for the target Node.js process'
        });
        this.ignoreExitCodeParameter = this.defineFlagParameter({
            parameterLongName: '--ignore-exit-code',
            parameterShortName: '-i',
            description: 'Do not report an error if the target Node.js process returns a nonzero exit code'
        });
    }
}
exports.BaseReportAction = BaseReportAction;
//# sourceMappingURL=BaseReportAction.js.map