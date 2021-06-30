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
const ChangeFile_1 = require("../ChangeFile");
const RushConfiguration_1 = require("../RushConfiguration");
const ChangeManagement_1 = require("../ChangeManagement");
describe('ChangeFile', () => {
    it('can add a change', () => {
        const rushFilename = path.resolve(__dirname, 'repo', 'rush-npm.json');
        const rushConfiguration = RushConfiguration_1.RushConfiguration.loadFromConfigurationFile(rushFilename);
        const changeFile = new ChangeFile_1.ChangeFile({
            packageName: 'a',
            changes: [],
            email: 'fake@microsoft.com'
        }, rushConfiguration);
        changeFile.addChange({
            packageName: 'a',
            changeType: ChangeManagement_1.ChangeType.minor,
            comment: 'for minor'
        });
        changeFile.addChange({
            packageName: 'a',
            changeType: ChangeManagement_1.ChangeType.patch,
            comment: 'for patch'
        });
        expect(changeFile.getChanges('a')).toHaveLength(2);
        expect(changeFile.getChanges('a')[0].comment).toEqual('for minor');
        expect(changeFile.getChanges('a')[1].comment).toEqual('for patch');
    });
});
//# sourceMappingURL=ChangeFile.test.js.map