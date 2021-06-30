"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MinifiedIdentifier_1 = require("../MinifiedIdentifier");
describe('MinifiedIdentifier', () => {
    describe('getIdentifierInternal', () => {
        it('Round trips identifiers', () => {
            for (let i = 0; i < 100000; i++) {
                const actual = MinifiedIdentifier_1.getOrdinalFromIdentifierInternal(MinifiedIdentifier_1.getIdentifierInternal(i));
                if (actual !== i) {
                    throw new Error(`Expected ${i} but received ${actual}`);
                }
            }
        });
    });
    describe('getIdentifier', () => {
        it('Skips keywords', () => {
            let maxOrdinal = 0;
            const shortKeywords = new Set(['do', 'if', 'in']);
            for (const keyword of shortKeywords) {
                const ordinal = MinifiedIdentifier_1.getOrdinalFromIdentifierInternal(keyword);
                if (ordinal > maxOrdinal) {
                    maxOrdinal = ordinal;
                }
                const actual = MinifiedIdentifier_1.getIdentifier(ordinal);
                if (actual === keyword) {
                    throw new Error(`Expected keyword ${keyword} to fail to round trip`);
                }
            }
            for (let i = 0; i <= maxOrdinal; i++) {
                const identifier = MinifiedIdentifier_1.getIdentifier(i);
                if (shortKeywords.has(identifier)) {
                    throw new Error(`Expected keyword ${identifier} to be skipped`);
                }
            }
        });
    });
});
//# sourceMappingURL=MinifiedIdentifier.test.js.map