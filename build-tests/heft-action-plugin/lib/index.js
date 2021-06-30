"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const node_core_library_1 = require("@rushstack/node-core-library");
class HeftActionPlugin {
    constructor() {
        this.pluginName = 'heft-action-plugin';
    }
    apply(heftSession, heftConfiguration) {
        heftSession.registerAction({
            actionName: 'my-custom-action',
            documentation: 'An example custom action',
            parameters: {
                production: {
                    kind: 'flag',
                    parameterLongName: '--production',
                    description: 'Run in production mode'
                }
            },
            callback: async ({ production }) => {
                const logger = heftSession.requestScopedLogger('custom-action');
                const customActionOutput = `production: ${production}`;
                logger.terminal.writeLine(`!!!!!!!!!!!!!! Custom action executing (${customActionOutput}) !!!!!!!!!!!!!!`);
                await node_core_library_1.FileSystem.writeFileAsync(path.join(heftConfiguration.buildFolder, 'dist', 'custom-action-output'), customActionOutput, { ensureFolderExists: true });
            }
        });
    }
}
exports.default = new HeftActionPlugin();
//# sourceMappingURL=index.js.map