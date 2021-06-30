"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassWithAccessModifiers = void 0;
/**
 * This class gets aliased twice before being exported from the package.
 * @public
 */
class ClassWithAccessModifiers {
    /** Doc comment */
    constructor() {
        /** Doc comment */
        this._privateField = 123;
    }
    /** Doc comment */
    privateMethod() { }
    /** Doc comment */
    get privateGetter() {
        return '';
    }
    /** Doc comment */
    privateSetter(x) { }
    /** Doc comment */
    static privateStaticMethod() { }
    /** Doc comment */
    get protectedGetter() {
        return '';
    }
    /** Doc comment */
    protectedSetter(x) { }
    /** Doc comment */
    defaultPublicMethod() { }
}
exports.ClassWithAccessModifiers = ClassWithAccessModifiers;
/** Doc comment */
ClassWithAccessModifiers.publicStaticField = 123;
//# sourceMappingURL=AccessModifiers.js.map