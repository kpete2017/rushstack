"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
const Rushell_1 = require("../Rushell");
test('Rushell', () => {
    const rushell = new Rushell_1.Rushell();
    expect(rushell.execute('npm version').value).toContain('@microsoft/rushell');
});
//# sourceMappingURL=Rushell.test.js.map