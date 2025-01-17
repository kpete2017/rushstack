"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetupAction = void 0;
const SetupPackageRegistry_1 = require("../../logic/setup/SetupPackageRegistry");
const BaseRushAction_1 = require("./BaseRushAction");
class SetupAction extends BaseRushAction_1.BaseRushAction {
    constructor(parser) {
        super({
            actionName: 'setup',
            summary: '(EXPERIMENTAL) Invoke this command before working in a new repo to ensure that any required' +
                ' prerequisites are installed and permissions are configured.',
            documentation: '(EXPERIMENTAL) Invoke this command before working in a new repo to ensure that any required' +
                ' prerequisites are installed and permissions are configured.  The initial implementation' +
                ' configures the NPM registry credentials.  More features will be added later.',
            parser
        });
    }
    onDefineParameters() {
        // abstract
    }
    async runAsync() {
        const setupPackageRegistry = new SetupPackageRegistry_1.SetupPackageRegistry({
            rushConfiguration: this.rushConfiguration,
            isDebug: this.parser.isDebug,
            syncNpmrcAlreadyCalled: false
        });
        await setupPackageRegistry.checkAndSetup();
    }
}
exports.SetupAction = SetupAction;
//# sourceMappingURL=SetupAction.js.map