"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
const StdioSummarizer_1 = require("../StdioSummarizer");
const StdioLineTransform_1 = require("../StdioLineTransform");
const TextRewriterTransform_1 = require("../TextRewriterTransform");
describe('StdioSummarizer', () => {
    let summarizer;
    let stderrLineTransform;
    let transform;
    beforeEach(() => {
        summarizer = new StdioSummarizer_1.StdioSummarizer();
        stderrLineTransform = new StdioLineTransform_1.StderrLineTransform({ destination: summarizer });
        transform = new TextRewriterTransform_1.TextRewriterTransform({
            destination: stderrLineTransform,
            normalizeNewlines: "\n" /* Lf */
        });
    });
    it('should report stdout if there is no stderr', () => {
        transform.writeChunk({ text: 'stdout 1\nstdout 2\n', kind: "O" /* Stdout */ });
        transform.close();
        expect(summarizer.isOpen).toBe(false);
        expect(summarizer.getReport()).toMatchSnapshot();
    });
    it('should abridge extra lines', () => {
        transform.writeChunk({ text: 'discarded stdout\n', kind: "O" /* Stdout */ });
        for (let i = 0; i < 10; ++i) {
            transform.writeChunk({ text: `leading ${i}\n`, kind: "E" /* Stderr */ });
            transform.writeChunk({ text: 'discarded stdout\n', kind: "O" /* Stdout */ });
        }
        transform.writeChunk({ text: `discarded middle 1\n`, kind: "E" /* Stderr */ });
        transform.writeChunk({ text: `discarded middle 2\n`, kind: "E" /* Stderr */ });
        for (let i = 0; i < 10; ++i) {
            transform.writeChunk({ text: `trailing ${i}\n`, kind: "E" /* Stderr */ });
            transform.writeChunk({ text: 'discarded stdout\n', kind: "O" /* Stdout */ });
        }
        transform.close();
        expect(summarizer.getReport()).toMatchSnapshot();
    });
    it('should concatenate partial lines', () => {
        transform.writeChunk({ text: 'abc', kind: "E" /* Stderr */ });
        transform.writeChunk({ text: '', kind: "E" /* Stderr */ });
        transform.writeChunk({ text: 'de\nf\n\ng', kind: "E" /* Stderr */ });
        transform.writeChunk({ text: '\n', kind: "E" /* Stderr */ });
        transform.writeChunk({ text: 'h', kind: "E" /* Stderr */ });
        transform.close();
        expect(summarizer.getReport()).toMatchSnapshot();
    });
});
//# sourceMappingURL=StdioSummarizer.test.js.map