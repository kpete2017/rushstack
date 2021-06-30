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
const colors = __importStar(require("colors"));
const AnsiEscape_1 = require("../AnsiEscape");
describe('AnsiEscape', () => {
    let initialColorsEnabled;
    beforeAll(() => {
        initialColorsEnabled = colors.enabled;
        colors.enable();
    });
    afterAll(() => {
        if (!initialColorsEnabled) {
            colors.disable();
        }
    });
    test('calls removeCodes() successfully', () => {
        const coloredInput = colors.rainbow('Hello, world!');
        const decoloredInput = AnsiEscape_1.AnsiEscape.removeCodes(coloredInput);
        expect(coloredInput).not.toBe(decoloredInput);
        expect(decoloredInput).toBe('Hello, world!');
    });
});
//# sourceMappingURL=AnsiEscape.test.js.map