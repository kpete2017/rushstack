"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
const Utilities_1 = require("../Utilities");
describe('Utilities', () => {
    describe('usingAsync', () => {
        let disposed;
        beforeEach(() => {
            disposed = false;
        });
        class Disposable {
            dispose() {
                disposed = true;
            }
        }
        it('Disposes correctly in a simple case', async () => {
            await Utilities_1.Utilities.usingAsync(() => new Disposable(), () => {
                /* no-op */
            });
            expect(disposed).toEqual(true);
        });
        it('Disposes correctly after the operation throws an exception', async () => {
            await expect(async () => await Utilities_1.Utilities.usingAsync(() => new Disposable(), () => {
                throw new Error('operation threw');
            })).rejects.toMatchSnapshot();
            expect(disposed).toEqual(true);
        });
        it('Does not dispose if the construction throws an exception', async () => {
            await expect(async () => await Utilities_1.Utilities.usingAsync(async () => {
                throw new Error('constructor threw');
            }, () => {
                /* no-op */
            })).rejects.toMatchSnapshot();
            expect(disposed).toEqual(false);
        });
    });
});
//# sourceMappingURL=Utilities.test.js.map