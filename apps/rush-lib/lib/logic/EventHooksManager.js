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
exports.EventHooksManager = void 0;
const os = __importStar(require("os"));
const safe_1 = __importDefault(require("colors/safe"));
const Utilities_1 = require("../utilities/Utilities");
const EventHooks_1 = require("../api/EventHooks");
const Stopwatch_1 = require("../utilities/Stopwatch");
class EventHooksManager {
    constructor(rushConfiguration) {
        this._rushConfiguration = rushConfiguration;
        this._eventHooks = rushConfiguration.eventHooks;
        this._commonTempFolder = rushConfiguration.commonTempFolder;
    }
    handle(event, isDebug, ignoreHooks) {
        if (!this._eventHooks) {
            return;
        }
        const scripts = this._eventHooks.get(event);
        if (scripts.length > 0) {
            if (ignoreHooks) {
                console.log(`Skipping event hooks for ${EventHooks_1.Event[event]} since --ignore-hooks was specified`);
                return;
            }
            const stopwatch = Stopwatch_1.Stopwatch.start();
            console.log(os.EOL + safe_1.default.green(`Executing event hooks for ${EventHooks_1.Event[event]}`));
            scripts.forEach((script) => {
                try {
                    Utilities_1.Utilities.executeLifecycleCommand(script, {
                        rushConfiguration: this._rushConfiguration,
                        workingDirectory: this._rushConfiguration.rushJsonFolder,
                        initCwd: this._commonTempFolder,
                        handleOutput: true,
                        environmentPathOptions: {
                            includeRepoBin: true
                        }
                    });
                }
                catch (error) {
                    console.error(os.EOL +
                        safe_1.default.yellow(`Event hook "${script}" failed. Run "rush" with --debug` +
                            ` to see detailed error information.`));
                    if (isDebug) {
                        console.error(os.EOL + error.message);
                    }
                }
            });
            stopwatch.stop();
            console.log(os.EOL + safe_1.default.green(`Event hooks finished. (${stopwatch.toString()})`));
        }
    }
}
exports.EventHooksManager = EventHooksManager;
//# sourceMappingURL=EventHooksManager.js.map