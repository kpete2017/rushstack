// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
import { ChunkClass } from '../chunks/ChunkClass';
describe('Example Test', function () {
    it('Correctly tests stuff', function () {
        expect(true).toBeTruthy();
    });
    it('Correctly handles images', function () {
        var chunkClass = new ChunkClass();
        expect(function () { return chunkClass.getImageUrl(); }).not.toThrow();
        expect(typeof chunkClass.getImageUrl()).toBe('string');
    });
});
//# sourceMappingURL=ExampleTest.test.js.map