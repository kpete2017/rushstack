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
Object.defineProperty(exports, "__esModule", { value: true });
const path = __importStar(require("path"));
const RushConfiguration_1 = require("../RushConfiguration");
const EventHooks_1 = require("../EventHooks");
describe('EventHooks', () => {
    it('loads a post build hook from rush.json', () => {
        const rushFilename = path.resolve(__dirname, 'repo', 'rush-npm.json');
        const rushConfiguration = RushConfiguration_1.RushConfiguration.loadFromConfigurationFile(rushFilename);
        expect(rushConfiguration.eventHooks.get(EventHooks_1.Event.postRushBuild)).toEqual(['do something']);
    });
    it('loads empty rush hooks', () => {
        const eventHooks = new EventHooks_1.EventHooks({});
        expect(eventHooks.get(EventHooks_1.Event.postRushBuild)).toHaveLength(0);
    });
    it('loads two rush hooks', () => {
        const expectedHooks = ['do one', 'do two'];
        const eventHooks = new EventHooks_1.EventHooks({
            postRushBuild: expectedHooks
        });
        const resultHooks = eventHooks.get(EventHooks_1.Event.postRushBuild);
        expect(resultHooks).toEqual(expectedHooks);
    });
});
//# sourceMappingURL=EventHooks.test.js.map