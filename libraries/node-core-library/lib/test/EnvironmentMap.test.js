"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const process_1 = __importDefault(require("process"));
const EnvironmentMap_1 = require("../EnvironmentMap");
describe('EnvironmentMap', () => {
    test('_sanityCheck() throws', () => {
        const map = new EnvironmentMap_1.EnvironmentMap();
        const environmentObject = { A: '123' };
        expect(() => {
            // eslint-disable-next-line
            const combined = Object.assign(Object.assign({}, environmentObject), map);
        }).toThrow();
    });
    test('Case-insensitive on windows', () => {
        const map = new EnvironmentMap_1.EnvironmentMap();
        map.set('A', '1');
        map.set('a', '2');
        if (process_1.default.platform === 'win32') {
            expect([...map.entries()]).toMatchInlineSnapshot(`
        Array [
          Object {
            "name": "a",
            "value": "2",
          },
        ]
      `);
        }
        else {
            expect([...map.entries()]).toMatchInlineSnapshot(`
        Array [
          Object {
            "name": "A",
            "value": "1",
          },
          Object {
            "name": "a",
            "value": "2",
          },
        ]
      `);
        }
    });
});
//# sourceMappingURL=EnvironmentMap.test.js.map