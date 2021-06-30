"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiMethodSignature = void 0;
const DeclarationReference_1 = require("@microsoft/tsdoc/lib-commonjs/beta/DeclarationReference");
const ApiDeclaredItem_1 = require("../items/ApiDeclaredItem");
const ApiParameterListMixin_1 = require("../mixins/ApiParameterListMixin");
const ApiReleaseTagMixin_1 = require("../mixins/ApiReleaseTagMixin");
const ApiReturnTypeMixin_1 = require("../mixins/ApiReturnTypeMixin");
const ApiNameMixin_1 = require("../mixins/ApiNameMixin");
const ApiTypeParameterListMixin_1 = require("../mixins/ApiTypeParameterListMixin");
const ApiOptionalMixin_1 = require("../mixins/ApiOptionalMixin");
/**
 * Represents a TypeScript member function declaration that belongs to an `ApiInterface`.
 *
 * @remarks
 *
 * This is part of the {@link ApiModel} hierarchy of classes, which are serializable representations of
 * API declarations.
 *
 * `ApiMethodSignature` represents a TypeScript declaration such as the `render` member function in this example:
 *
 * ```ts
 * export interface IWidget {
 *   render(): void;
 * }
 * ```
 *
 * Compare with {@link ApiMethod}, which represents a method belonging to a class.
 * For example, a class method can be `static` but an interface method cannot.
 *
 * @public
 */
class ApiMethodSignature extends ApiNameMixin_1.ApiNameMixin(ApiTypeParameterListMixin_1.ApiTypeParameterListMixin(ApiParameterListMixin_1.ApiParameterListMixin(ApiReleaseTagMixin_1.ApiReleaseTagMixin(ApiReturnTypeMixin_1.ApiReturnTypeMixin(ApiOptionalMixin_1.ApiOptionalMixin(ApiDeclaredItem_1.ApiDeclaredItem)))))) {
    constructor(options) {
        super(options);
    }
    static getContainerKey(name, overloadIndex) {
        return `${name}|${"MethodSignature" /* MethodSignature */}|${overloadIndex}`;
    }
    /** @override */
    get kind() {
        return "MethodSignature" /* MethodSignature */;
    }
    /** @override */
    get containerKey() {
        return ApiMethodSignature.getContainerKey(this.name, this.overloadIndex);
    }
    /** @beta @override */
    buildCanonicalReference() {
        const nameComponent = DeclarationReference_1.DeclarationReference.parseComponent(this.name);
        return (this.parent ? this.parent.canonicalReference : DeclarationReference_1.DeclarationReference.empty())
            .addNavigationStep("#" /* Members */, nameComponent)
            .withMeaning("member" /* Member */)
            .withOverloadIndex(this.overloadIndex);
    }
}
exports.ApiMethodSignature = ApiMethodSignature;
//# sourceMappingURL=ApiMethodSignature.js.map