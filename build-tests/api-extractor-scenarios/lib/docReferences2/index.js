"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.FailWithSelfReference = exports.CyclicB = exports.CyclicA = void 0;
/** @public */
class CyclicA {
    /** {@inheritDoc CyclicB.methodB2} */
    methodA1() { }
    /** {@inheritDoc CyclicB.methodB4} */
    methodA3() { }
}
exports.CyclicA = CyclicA;
/** @public */
class CyclicB {
    /** {@inheritDoc CyclicA.methodA3} */
    methodB2() { }
    /** THE COMMENT */
    methodB4() { }
}
exports.CyclicB = CyclicB;
/** @public */
class FailWithSelfReference {
    /** {@inheritDoc FailWithSelfReference.method2} */
    method1() { }
    /** {@inheritDoc FailWithSelfReference.method1} */
    method2() { }
}
exports.FailWithSelfReference = FailWithSelfReference;
//# sourceMappingURL=index.js.map