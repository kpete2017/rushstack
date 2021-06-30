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
const Path_1 = require("../Path");
function toPosixPath(value) {
    return value.replace(/[\\\/]/g, '/');
}
function toNativePath(value) {
    return value.replace(/[\\\/]/g, path.sep);
}
function relativeCaseInsensitive(from, to) {
    return toPosixPath(Path_1.Path['_relativeCaseInsensitive'](toNativePath(from), toNativePath(to)));
}
describe('Path', () => {
    test('_detectCaseSensitive()', () => {
        // NOTE: To ensure these tests are deterministic, only use absolute paths
        expect(relativeCaseInsensitive('/', '/')).toEqual('');
        expect(relativeCaseInsensitive('/', '/a')).toEqual('a');
        expect(relativeCaseInsensitive('/', '/a/')).toEqual('a');
        expect(relativeCaseInsensitive('/', '/a//')).toEqual('a');
        expect(relativeCaseInsensitive('/', '/a/b')).toEqual('a/b');
        expect(relativeCaseInsensitive('/', '/a/b/c')).toEqual('a/b/c');
        expect(relativeCaseInsensitive('/A', '/a/b/c')).toEqual('b/c');
        expect(relativeCaseInsensitive('/A/', '/a/b/c')).toEqual('b/c');
        expect(relativeCaseInsensitive('/A/B', '/a/b/c')).toEqual('c');
        expect(relativeCaseInsensitive('/A/b/C', '/a/b/c')).toEqual('');
        expect(relativeCaseInsensitive('/a/B/c', '/a/b/c')).toEqual('');
        expect(relativeCaseInsensitive('/a/B/c/D', '/a/b/c')).toEqual('..');
        expect(relativeCaseInsensitive('/a/B/c/D', '/a/b/c/e')).toEqual('../e');
    });
});
//# sourceMappingURL=Path.test.js.map