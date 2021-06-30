"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
class TestAction extends __1.CommandLineAction {
    constructor() {
        super({
            actionName: 'do:the-job',
            summary: 'does the job',
            documentation: 'a longer description'
        });
        this.done = false;
    }
    async onExecute() {
        expect(this._flag.value).toEqual(true);
        this.done = true;
    }
    onDefineParameters() {
        this._flag = this.defineFlagParameter({
            parameterLongName: '--flag',
            description: 'The flag'
        });
    }
}
class TestCommandLine extends __1.CommandLineParser {
    constructor() {
        super({
            toolFilename: 'example',
            toolDescription: 'An example project'
        });
        this.addAction(new TestAction());
    }
    onDefineParameters() {
        // no parameters
    }
}
describe('CommandLineParser', () => {
    it('executes an action', async () => {
        const commandLineParser = new TestCommandLine();
        await commandLineParser.execute(['do:the-job', '--flag']);
        expect(commandLineParser.selectedAction).toBeDefined();
        expect(commandLineParser.selectedAction.actionName).toEqual('do:the-job');
        const action = commandLineParser.selectedAction;
        expect(action.done).toBe(true);
    });
});
//# sourceMappingURL=CommandLineParser.test.js.map