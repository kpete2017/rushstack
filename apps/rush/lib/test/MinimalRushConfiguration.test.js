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
const MinimalRushConfiguration_1 = require("../MinimalRushConfiguration");
describe('MinimalRushConfiguration', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });
    describe('legacy rush config', () => {
        beforeEach(() => {
            jest.spyOn(process, 'cwd').mockReturnValue(path.join(__dirname, 'sandbox', 'legacy-repo', 'project'));
        });
        it('correctly loads the rush.json file', () => {
            const config = MinimalRushConfiguration_1.MinimalRushConfiguration.loadFromDefaultLocation();
            expect(config.rushVersion).toEqual('2.5.0');
        });
    });
    describe('non-legacy rush config', () => {
        beforeEach(() => {
            jest.spyOn(process, 'cwd').mockReturnValue(path.join(__dirname, 'sandbox', 'repo', 'project'));
        });
        it('correctly loads the rush.json file', () => {
            const config = MinimalRushConfiguration_1.MinimalRushConfiguration.loadFromDefaultLocation();
            expect(config.rushVersion).toEqual('4.0.0');
        });
    });
});
//# sourceMappingURL=MinimalRushConfiguration.test.js.map