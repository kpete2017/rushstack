"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
const Sort_1 = require("../Sort");
test('Sort.compareByValue', () => {
    const array = [3, 6, 2];
    array.sort(Sort_1.Sort.compareByValue); // [2, 3, 6]
});
test('Sort.compareByValue cases', () => {
    const values = [undefined, null, -1, 1];
    const results = [];
    for (let i = 0; i < values.length; ++i) {
        for (let j = 0; j < values.length; ++j) {
            const x = values[i];
            const y = values[j];
            let relation = '?';
            switch (Sort_1.Sort.compareByValue(x, y)) {
                case -1:
                    relation = '<';
                    break;
                case 0:
                    relation = '=';
                    break;
                case 1:
                    relation = '>';
                    break;
            }
            results.push(`${x} ${relation} ${y}`);
        }
    }
    expect(results).toMatchSnapshot();
});
test('Sort.sortBy', () => {
    const array = ['aaa', 'bb', 'c'];
    Sort_1.Sort.sortBy(array, (x) => x.length); // [ 'c', 'bb', 'aaa' ]
});
test('Sort.isSortedBy', () => {
    const array = ['a', 'bb', 'ccc'];
    Sort_1.Sort.isSortedBy(array, (x) => x.length); // true
});
test('Sort.sortMapKeys', () => {
    const map = new Map();
    map.set('zebra', 1);
    map.set('goose', 2);
    map.set('aardvark', 3);
    Sort_1.Sort.sortMapKeys(map);
    expect(Array.from(map.keys())).toEqual(['aardvark', 'goose', 'zebra']);
});
test('Sort.sortSetBy', () => {
    const set = new Set();
    set.add('aaa');
    set.add('bb');
    set.add('c');
    Sort_1.Sort.sortSetBy(set, (x) => x.length);
    expect(Array.from(set)).toEqual(['c', 'bb', 'aaa']);
});
test('Sort.sortSet', () => {
    const set = new Set();
    set.add('zebra');
    set.add('goose');
    set.add('aardvark');
    Sort_1.Sort.sortSet(set);
    expect(Array.from(set)).toEqual(['aardvark', 'goose', 'zebra']);
});
//# sourceMappingURL=Sort.test.js.map