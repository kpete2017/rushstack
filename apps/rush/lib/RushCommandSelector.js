"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RushCommandSelector = void 0;
const safe_1 = __importDefault(require("colors/safe"));
const path = __importStar(require("path"));
/**
 * Both "rush" and "rushx" share the same src/start.ts entry point.  This makes it
 * a little easier for them to share all the same startup checks and version selector
 * logic.  RushCommandSelector looks at argv to determine whether we're doing "rush"
 * or "rushx" behavior, and then invokes the appropriate entry point in the selected
 * @microsoft/rush-lib.
 */
class RushCommandSelector {
    static failIfNotInvokedAsRush(version) {
        if (RushCommandSelector._getCommandName() === 'rushx') {
            RushCommandSelector._failWithError(`This repository is using Rush version ${version} which does not support the "rushx" command`);
        }
    }
    static execute(launcherVersion, 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    selectedRushLib, options) {
        const Rush = selectedRushLib.Rush;
        if (!Rush) {
            // This should be impossible unless we somehow loaded an unexpected version
            RushCommandSelector._failWithError(`Unable to find the "Rush" entry point in @microsoft/rush-lib`);
        }
        if (RushCommandSelector._getCommandName() === 'rushx') {
            if (!Rush.launchRushX) {
                RushCommandSelector._failWithError(`This repository is using Rush version ${Rush.version}` +
                    ` which does not support the "rushx" command`);
            }
            Rush.launchRushX(launcherVersion, {
                isManaged: options.isManaged,
                alreadyReportedNodeTooNewError: options.alreadyReportedNodeTooNewError
            });
        }
        else {
            Rush.launch(launcherVersion, {
                isManaged: options.isManaged,
                alreadyReportedNodeTooNewError: options.alreadyReportedNodeTooNewError
            });
        }
    }
    static _failWithError(message) {
        console.log(safe_1.default.red(message));
        return process.exit(1);
    }
    static _getCommandName() {
        if (process.argv.length >= 2) {
            // Example:
            // argv[0]: "C:\\Program Files\\nodejs\\node.exe"
            // argv[1]: "C:\\Program Files\\nodejs\\node_modules\\@microsoft\\rush\\bin\\rushx"
            const basename = path.basename(process.argv[1]).toUpperCase();
            if (basename === 'RUSHX') {
                return 'rushx';
            }
            if (basename === 'RUSH') {
                return 'rush';
            }
        }
        return undefined;
    }
}
exports.RushCommandSelector = RushCommandSelector;
//# sourceMappingURL=RushCommandSelector.js.map