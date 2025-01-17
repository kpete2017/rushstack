"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkManagerFactory = void 0;
const NpmLinkManager_1 = require("./npm/NpmLinkManager");
const PnpmLinkManager_1 = require("./pnpm/PnpmLinkManager");
class LinkManagerFactory {
    static getLinkManager(rushConfiguration) {
        switch (rushConfiguration.packageManager) {
            case 'npm':
                return new NpmLinkManager_1.NpmLinkManager(rushConfiguration);
            case 'pnpm':
                return new PnpmLinkManager_1.PnpmLinkManager(rushConfiguration);
            case 'yarn':
                // Yarn uses the same node_modules structure as NPM
                return new NpmLinkManager_1.NpmLinkManager(rushConfiguration);
            default:
                throw new Error(`Unsupported package manager: ${rushConfiguration.packageManager}`);
        }
    }
}
exports.LinkManagerFactory = LinkManagerFactory;
//# sourceMappingURL=LinkManagerFactory.js.map