"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
describe('DynamicCommandLineParser', () => {
    it('parses an action', async () => {
        const commandLineParser = new __1.DynamicCommandLineParser({
            toolFilename: 'example',
            toolDescription: 'An example project'
        });
        const action = new __1.DynamicCommandLineAction({
            actionName: 'do:the-job',
            summary: 'does the job',
            documentation: 'a longer description'
        });
        commandLineParser.addAction(action);
        action.defineFlagParameter({
            parameterLongName: '--flag',
            description: 'The flag'
        });
        await commandLineParser.execute(['do:the-job', '--flag']);
        expect(commandLineParser.selectedAction).toEqual(action);
        const retrievedParameter = action.getFlagParameter('--flag');
        expect(retrievedParameter.value).toBe(true);
    });
});
//# sourceMappingURL=DynamicCommandLineParser.test.js.map