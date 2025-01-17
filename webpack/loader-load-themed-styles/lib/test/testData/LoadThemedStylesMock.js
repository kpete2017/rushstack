"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
class LoadThemedStylesMock {
    static loadStyles(data, async) {
        this.loadedData.push(data);
        this.calledWithAsync.push(async);
    }
}
LoadThemedStylesMock.loadedData = [];
LoadThemedStylesMock.calledWithAsync = [];
module.exports = LoadThemedStylesMock;
//# sourceMappingURL=LoadThemedStylesMock.js.map