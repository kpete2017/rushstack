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
exports.PurgeAction = void 0;
const safe_1 = __importDefault(require("colors/safe"));
const os = __importStar(require("os"));
const BaseRushAction_1 = require("./BaseRushAction");
const Stopwatch_1 = require("../../utilities/Stopwatch");
const PurgeManager_1 = require("../../logic/PurgeManager");
const UnlinkManager_1 = require("../../logic/UnlinkManager");
class PurgeAction extends BaseRushAction_1.BaseRushAction {
    constructor(parser) {
        super({
            actionName: 'purge',
            summary: 'For diagnostic purposes, use this command to delete caches and other temporary files used by Rush',
            documentation: 'The "rush purge" command is used to delete temporary files created by Rush.  This is' +
                ' useful if you are having problems and suspect that cache files may be corrupt.',
            parser
        });
    }
    onDefineParameters() {
        this._unsafeParameter = this.defineFlagParameter({
            parameterLongName: '--unsafe',
            description: '(UNSAFE!) Also delete shared files such as the package manager instances stored in' +
                ' the ".rush" folder in the user\'s home directory.  This is a more aggressive fix that is' +
                ' NOT SAFE to run in a live environment because it will cause other concurrent Rush processes to fail.'
        });
    }
    async runAsync() {
        const stopwatch = Stopwatch_1.Stopwatch.start();
        const unlinkManager = new UnlinkManager_1.UnlinkManager(this.rushConfiguration);
        const purgeManager = new PurgeManager_1.PurgeManager(this.rushConfiguration, this.rushGlobalFolder);
        unlinkManager.unlink(/*force:*/ true);
        if (this._unsafeParameter.value) {
            purgeManager.purgeUnsafe();
        }
        else {
            purgeManager.purgeNormal();
        }
        purgeManager.deleteAll();
        console.log(os.EOL +
            safe_1.default.green(`Rush purge started successfully and will complete asynchronously. (${stopwatch.toString()})`));
    }
}
exports.PurgeAction = PurgeAction;
//# sourceMappingURL=PurgeAction.js.map