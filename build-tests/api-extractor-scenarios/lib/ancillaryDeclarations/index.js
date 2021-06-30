"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyClass = void 0;
/** @public */
class MyClass {
    /** @internal */
    get _thing() {
        return { title: 'thing' };
    }
    // The setter should also be considered @internal because the getter was marked as internal.
    set _thing(value) { }
}
exports.MyClass = MyClass;
//# sourceMappingURL=index.js.map