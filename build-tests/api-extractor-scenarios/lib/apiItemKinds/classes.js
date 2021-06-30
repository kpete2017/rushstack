"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimpleClass = exports.AbstractClass = void 0;
/** @public */
class AbstractClass {
}
exports.AbstractClass = AbstractClass;
/** @public */
class SimpleClass {
    member() { }
    get readonlyProperty() {
        return 'hello';
    }
    get writeableProperty() {
        return 'hello';
    }
    set writeableProperty(value) { }
}
exports.SimpleClass = SimpleClass;
//# sourceMappingURL=classes.js.map