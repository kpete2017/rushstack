"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
const StdioLineTransform_1 = require("../StdioLineTransform");
const MockWritable_1 = require("../MockWritable");
describe('StderrLineTransform', () => {
    it('should report stdout if there is no stderr', () => {
        const mockWritable = new MockWritable_1.MockWritable();
        const transform = new StdioLineTransform_1.StderrLineTransform({ destination: mockWritable });
        transform.writeChunk({ text: 'stdout 1\nstdout 2\n', kind: "O" /* Stdout */ });
        transform.close();
        expect(mockWritable.chunks).toMatchSnapshot();
    });
});
//# sourceMappingURL=StdioLineTransform.test.js.map