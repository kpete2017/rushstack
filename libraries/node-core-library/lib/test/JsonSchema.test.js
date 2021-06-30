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
const JsonFile_1 = require("../JsonFile");
const JsonSchema_1 = require("../JsonSchema");
function normalize(text) {
    return text.replace(/[\r\n ]+/g, ' ').trim();
}
describe('JsonSchema', () => {
    const schemaPath = path.resolve(path.join(__dirname, './test-data/test-schema.json'));
    const schema = JsonSchema_1.JsonSchema.fromFile(schemaPath);
    test('loadAndValidate successfully validates a JSON file', () => {
        const jsonPath = path.resolve(path.join(__dirname, './test-data/test.json'));
        const jsonObject = JsonFile_1.JsonFile.loadAndValidate(jsonPath, schema);
        expect(jsonObject).toMatchObject({
            exampleString: 'This is a string',
            exampleArray: ['apple', 'banana', 'coconut']
        });
    });
    test('validateObjectWithCallback successfully reports a compound validation error', () => {
        const jsonPath2 = path.resolve(path.join(__dirname, './test-data/test2.json'));
        const jsonObject2 = JsonFile_1.JsonFile.load(jsonPath2);
        const expectedError = `
Error: #/exampleOneOf (Description for exampleOneOf - this i...)
    Data does not match any schemas from 'oneOf'
Error: #/exampleOneOf (Description for type1)
      Additional properties not allowed: field2
Error: #/exampleOneOf (Description for type2)
      Missing required property: field3`;
        let errorCount = 0;
        schema.validateObjectWithCallback(jsonObject2, (errorInfo) => {
            ++errorCount;
            expect(normalize(errorInfo.details)).toEqual(normalize(expectedError));
        });
        expect(errorCount).toEqual(1);
    });
});
//# sourceMappingURL=JsonSchema.test.js.map