"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
const ProtectableMap_1 = require("../ProtectableMap");
class ExampleApi {
    constructor() {
        this.clearedCount = 0;
        this.deletedCount = 0;
        this.setCount = 0;
        this._studentAgesByName = new ProtectableMap_1.ProtectableMap({
            onClear: (source) => {
                ++this.clearedCount;
            },
            onDelete: (source, key) => {
                ++this.deletedCount;
            },
            onSet: (source, key, value) => {
                ++this.setCount;
                if (key.toUpperCase() !== key) {
                    throw new Error('The key must be all upper case: ' + key);
                }
                // If the provided value is negative, clamp it to zero:
                return Math.max(value, 0);
            }
        });
    }
    get studentAgesByName() {
        return this._studentAgesByName.protectedView;
    }
    doUnprotectedOperations() {
        // These are unprotected because they interact with this._studentAgesByName
        // instead of this._studentAgesByName.protectedView.
        this._studentAgesByName.clear();
        this._studentAgesByName.set('Dave', -123);
    }
}
describe('ProtectableMap', () => {
    test('Protected operations', () => {
        const exampleApi = new ExampleApi();
        exampleApi.studentAgesByName.clear();
        exampleApi.studentAgesByName.set('ALICE', 23);
        exampleApi.studentAgesByName.set('BOB', 21);
        exampleApi.studentAgesByName.set('BOB', -1);
        exampleApi.studentAgesByName.set('CHARLIE', 22);
        exampleApi.studentAgesByName.delete('CHARLIE');
        expect(exampleApi.clearedCount).toEqual(1);
        expect(exampleApi.setCount).toEqual(4);
        expect(exampleApi.deletedCount).toEqual(1);
        expect(exampleApi.studentAgesByName.get('ALICE')).toEqual(23);
        expect(exampleApi.studentAgesByName.get('BOB')).toEqual(0); // clamped by onSet()
        expect(exampleApi.studentAgesByName.has('CHARLIE')).toEqual(false);
    });
    test('Unprotected operations', () => {
        const exampleApi = new ExampleApi();
        exampleApi.doUnprotectedOperations();
        // Interacting directly with the ProtectableMap bypasses the hooks
        expect(exampleApi.clearedCount).toEqual(0);
        expect(exampleApi.studentAgesByName.get('Dave')).toEqual(-123);
    });
    test('Error case', () => {
        const exampleApi = new ExampleApi();
        expect(() => {
            exampleApi.studentAgesByName.set('Jane', 23);
        }).toThrowError('The key must be all upper case: Jane');
    });
});
//# sourceMappingURL=ProtectableMap.test.js.map