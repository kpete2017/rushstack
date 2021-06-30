"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
const FileSystem_1 = require("../FileSystem");
// The PosixModeBits are intended to be used with bitwise operations.
/* eslint-disable no-bitwise */
test('PosixModeBits tests', () => {
    let modeBits = 292 /* AllRead */ | 146 /* AllWrite */;
    expect(FileSystem_1.FileSystem.formatPosixModeBits(modeBits)).toEqual('-rw-rw-rw-');
    modeBits |= 8 /* GroupExecute */;
    expect(FileSystem_1.FileSystem.formatPosixModeBits(modeBits)).toEqual('-rw-rwxrw-');
    // Add the group execute bit
    modeBits |= 1 /* OthersExecute */;
    expect(FileSystem_1.FileSystem.formatPosixModeBits(modeBits)).toEqual('-rw-rwxrwx');
    // Add the group execute bit
    modeBits &= ~146 /* AllWrite */;
    expect(FileSystem_1.FileSystem.formatPosixModeBits(modeBits)).toEqual('-r--r-xr-x');
});
//# sourceMappingURL=FileSystem.test.js.map