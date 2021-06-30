"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
const TypeUuid_1 = require("../TypeUuid");
const UuidA = '122f9816-15c2-480f-8c12-ed94d586b653';
const UuidC = 'db7dae9b-38d2-4a0a-a62f-ac6b71c2c575';
describe('TypeUuid', () => {
    test('correctly identifies types with inheritance', () => {
        class A {
        }
        class B extends A {
        }
        class C extends B {
            constructor(x) {
                super();
            }
        }
        TypeUuid_1.TypeUuid.registerClass(A, UuidA);
        TypeUuid_1.TypeUuid.registerClass(C, UuidC);
        const a = new A();
        const b = new B();
        const c = new C(123);
        expect(TypeUuid_1.TypeUuid.isInstanceOf(a, UuidA)).toEqual(true);
        expect(TypeUuid_1.TypeUuid.isInstanceOf(b, 'b205484a-fe48-4f40-bbd4-d7d46525637f')).toEqual(false);
        expect(TypeUuid_1.TypeUuid.isInstanceOf(c, UuidC)).toEqual(true);
    });
    test('forbids multiple type assignments', () => {
        class A {
        }
        TypeUuid_1.TypeUuid.registerClass(A, UuidA);
        expect(() => TypeUuid_1.TypeUuid.registerClass(A, UuidC)).toThrow(/already registered/);
    });
    test('handles undefined and null', () => {
        expect(TypeUuid_1.TypeUuid.isInstanceOf(undefined, UuidA)).toEqual(false);
        expect(TypeUuid_1.TypeUuid.isInstanceOf(null, UuidA)).toEqual(false);
    });
    test('works with Symbol.hasInstance', () => {
        const uuidQ = 'c9d85505-40de-4553-8da2-6604dccdc65f';
        class Q {
            static [Symbol.hasInstance](instance) {
                return TypeUuid_1.TypeUuid.isInstanceOf(instance, uuidQ);
            }
        }
        class Q2 {
            static [Symbol.hasInstance](instance) {
                return TypeUuid_1.TypeUuid.isInstanceOf(instance, uuidQ);
            }
        }
        TypeUuid_1.TypeUuid.registerClass(Q, uuidQ);
        TypeUuid_1.TypeUuid.registerClass(Q2, uuidQ);
        const q = new Q2();
        expect(q instanceof Q).toEqual(true);
    });
});
//# sourceMappingURL=TypeUuid.test.js.map