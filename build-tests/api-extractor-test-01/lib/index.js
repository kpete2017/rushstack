"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAX_UNSIGNED_VALUE = exports.DecoratorTest = exports.virtual = exports.AmbientConsumer = void 0;
/**
 * Test different kinds of ambient definitions
 * @public
 */
class AmbientConsumer {
    /**
     * Found via tsconfig.json's "lib" setting, which specifies the built-in "es2015.collection"
     */
    builtinDefinition1() {
        return new Map();
    }
    /**
     * Found via tsconfig.json's "lib" setting, which specifies the built-in "es2015.promise"
     */
    builtinDefinition2() {
        return new Promise(() => {
            /* */
        });
    }
    /**
     * Configured via tsconfig.json's "lib" setting, which specifies `@types/jest`.
     * The emitted index.d.ts gets a reference like this:  <reference types="jest" />
     */
    definitelyTyped() {
        return {};
    }
    /**
     * Found via tsconfig.json's "include" setting point to a *.d.ts file.
     * This is an old-style Definitely Typed definition, which is the worst possible kind,
     * because consumers are expected to provide this, with no idea where it came from.
     */
    localTypings() {
        return {};
    }
}
exports.AmbientConsumer = AmbientConsumer;
/**
 * Example decorator
 * @public
 */
function virtual(target, propertyKey, descriptor) {
    // Eventually we may implement runtime validation (e.g. in DEBUG builds)
    // but currently this decorator is only used by the build tools.
}
exports.virtual = virtual;
/**
 * Tests a decorator
 * @public
 */
class DecoratorTest {
    /**
     * Function with a decorator
     */
    test() {
        console.log('');
    }
}
__decorate([
    virtual
], DecoratorTest.prototype, "test", null);
exports.DecoratorTest = DecoratorTest;
var AbstractClass_1 = require("./AbstractClass");
Object.defineProperty(exports, "AbstractClass", { enumerable: true, get: function () { return AbstractClass_1.default; } });
var AbstractClass2_1 = require("./AbstractClass2");
Object.defineProperty(exports, "AbstractClass2", { enumerable: true, get: function () { return AbstractClass2_1.default; } });
Object.defineProperty(exports, "AbstractClass3", { enumerable: true, get: function () { return AbstractClass2_1.AbstractClass3; } });
var AccessModifiers_1 = require("./AccessModifiers");
Object.defineProperty(exports, "ClassWithAccessModifiers", { enumerable: true, get: function () { return AccessModifiers_1.ClassWithAccessModifiers; } });
var ClassWithTypeLiterals_1 = require("./ClassWithTypeLiterals");
Object.defineProperty(exports, "ClassWithTypeLiterals", { enumerable: true, get: function () { return ClassWithTypeLiterals_1.ClassWithTypeLiterals; } });
__exportStar(require("./DeclarationMerging"), exports);
__exportStar(require("./Enums"), exports);
var DefaultExportEdgeCase_1 = require("./DefaultExportEdgeCase");
Object.defineProperty(exports, "DefaultExportEdgeCase", { enumerable: true, get: function () { return DefaultExportEdgeCase_1.DefaultExportEdgeCase; } });
Object.defineProperty(exports, "ClassExportedAsDefault", { enumerable: true, get: function () { return DefaultExportEdgeCase_1.default; } });
/**
 * Test that we can correctly carry default imports into the rollup .d.ts file
 */
const long_1 = require("long");
Object.defineProperty(exports, "MAX_UNSIGNED_VALUE", { enumerable: true, get: function () { return long_1.MAX_UNSIGNED_VALUE; } });
var EcmaScriptSymbols_1 = require("./EcmaScriptSymbols");
Object.defineProperty(exports, "ClassWithSymbols", { enumerable: true, get: function () { return EcmaScriptSymbols_1.ClassWithSymbols; } });
Object.defineProperty(exports, "fullyExportedCustomSymbol", { enumerable: true, get: function () { return EcmaScriptSymbols_1.fullyExportedCustomSymbol; } });
var ForgottenExportConsumer1_1 = require("./ForgottenExportConsumer1");
Object.defineProperty(exports, "ForgottenExportConsumer1", { enumerable: true, get: function () { return ForgottenExportConsumer1_1.ForgottenExportConsumer1; } });
var ForgottenExportConsumer2_1 = require("./ForgottenExportConsumer2");
Object.defineProperty(exports, "ForgottenExportConsumer2", { enumerable: true, get: function () { return ForgottenExportConsumer2_1.ForgottenExportConsumer2; } });
var ForgottenExportConsumer3_1 = require("./ForgottenExportConsumer3");
Object.defineProperty(exports, "ForgottenExportConsumer3", { enumerable: true, get: function () { return ForgottenExportConsumer3_1.ForgottenExportConsumer3; } });
/**
 * Test the alias-following logic:  This class gets aliased twice before being
 * exported from the package.
 */
var ReexportedClass3_1 = require("./ReexportedClass3/ReexportedClass3");
Object.defineProperty(exports, "ReexportedClass", { enumerable: true, get: function () { return ReexportedClass3_1.ReexportedClass3; } });
var TypeReferencesInAedoc_1 = require("./TypeReferencesInAedoc");
Object.defineProperty(exports, "TypeReferencesInAedoc", { enumerable: true, get: function () { return TypeReferencesInAedoc_1.TypeReferencesInAedoc; } });
var ReferenceLibDirective_1 = require("./ReferenceLibDirective");
Object.defineProperty(exports, "ReferenceLibDirective", { enumerable: true, get: function () { return ReferenceLibDirective_1.ReferenceLibDirective; } });
var variableDeclarations_1 = require("./variableDeclarations");
Object.defineProperty(exports, "VARIABLE", { enumerable: true, get: function () { return variableDeclarations_1.VARIABLE; } });
Object.defineProperty(exports, "NamespaceContainingVariable", { enumerable: true, get: function () { return variableDeclarations_1.NamespaceContainingVariable; } });
//# sourceMappingURL=index.js.map