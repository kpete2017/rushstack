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
const CommonVersionsConfiguration_1 = require("../CommonVersionsConfiguration");
describe('CommonVersionsConfiguration', () => {
    it('can load the file', () => {
        const filename = path.resolve(__dirname, 'jsonFiles', 'common-versions.json');
        const configuration = CommonVersionsConfiguration_1.CommonVersionsConfiguration.loadFromFile(filename);
        expect(configuration.preferredVersions.get('@scope/library-1')).toEqual('~3.2.1');
        expect(configuration.xstitchPreferredVersions.get('library-2')).toEqual('1.2.3');
        expect(configuration.allowedAlternativeVersions.get('library-3')).toEqual(['^1.2.3']);
    });
});
//# sourceMappingURL=CommonVersionsConfiguration.test.js.map