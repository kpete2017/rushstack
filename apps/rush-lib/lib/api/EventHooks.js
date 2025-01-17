"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventHooks = exports.Event = void 0;
const node_core_library_1 = require("@rushstack/node-core-library");
/**
 * Events happen during Rush runs.
 * @beta
 */
var Event;
(function (Event) {
    /**
     * Pre Rush install event
     */
    Event[Event["preRushInstall"] = 1] = "preRushInstall";
    /**
     * Post Rush install event
     */
    Event[Event["postRushInstall"] = 2] = "postRushInstall";
    /**
     * Pre Rush build event
     */
    Event[Event["preRushBuild"] = 3] = "preRushBuild";
    /**
     * Post Rush build event
     */
    Event[Event["postRushBuild"] = 4] = "postRushBuild";
})(Event = exports.Event || (exports.Event = {}));
/**
 * This class represents Rush event hooks configured for this repo.
 * Hooks are customized script actions that Rush executes when specific events occur.
 * The actions are expressed as a command-line that is executed using the operating system shell.
 * @beta
 */
class EventHooks {
    /**
     * @internal
     */
    constructor(eventHooksJson) {
        this._hooks = new Map();
        for (const [name, eventHooks] of Object.entries(eventHooksJson)) {
            const eventName = node_core_library_1.Enum.tryGetValueByKey(Event, name);
            if (eventName) {
                this._hooks.set(eventName, [...eventHooks] || []);
            }
        }
    }
    /**
     * Return all the scripts associated with the specified event.
     * @param event - Rush event
     */
    get(event) {
        return this._hooks.get(event) || [];
    }
}
exports.EventHooks = EventHooks;
//# sourceMappingURL=EventHooks.js.map