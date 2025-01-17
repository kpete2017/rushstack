"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiMethod = void 0;
const DeclarationReference_1 = require("@microsoft/tsdoc/lib-commonjs/beta/DeclarationReference");
const ApiStaticMixin_1 = require("../mixins/ApiStaticMixin");
const ApiDeclaredItem_1 = require("../items/ApiDeclaredItem");
const ApiParameterListMixin_1 = require("../mixins/ApiParameterListMixin");
const ApiReleaseTagMixin_1 = require("../mixins/ApiReleaseTagMixin");
const ApiReturnTypeMixin_1 = require("../mixins/ApiReturnTypeMixin");
const ApiNameMixin_1 = require("../mixins/ApiNameMixin");
const ApiTypeParameterListMixin_1 = require("../mixins/ApiTypeParameterListMixin");
const ApiOptionalMixin_1 = require("../mixins/ApiOptionalMixin");
/**
 * Represents a TypeScript member function declaration that belongs to an `ApiClass`.
 *
 * @remarks
 *
 * This is part of the {@link ApiModel} hierarchy of classes, which are serializable representations of
 * API declarations.
 *
 * `ApiMethod` represents a TypeScript declaration such as the `render` member function in this example:
 *
 * ```ts
 * export class Widget {
 *   public render(): void { }
 * }
 * ```
 *
 * Compare with {@link ApiMethodSignature}, which represents a method belonging to an interface.
 * For example, a class method can be `static` but an interface method cannot.
 *
 * @public
 */
class ApiMethod extends ApiNameMixin_1.ApiNameMixin(ApiTypeParameterListMixin_1.ApiTypeParameterListMixin(ApiParameterListMixin_1.ApiParameterListMixin(ApiReleaseTagMixin_1.ApiReleaseTagMixin(ApiReturnTypeMixin_1.ApiReturnTypeMixin(ApiStaticMixin_1.ApiStaticMixin(ApiOptionalMixin_1.ApiOptionalMixin(ApiDeclaredItem_1.ApiDeclaredItem))))))) {
    constructor(options) {
        super(options);
    }
    static getContainerKey(name, isStatic, overloadIndex) {
        if (isStatic) {
            return `${name}|${"Method" /* Method */}|static|${overloadIndex}`;
        }
        else {
            return `${name}|${"Method" /* Method */}|instance|${overloadIndex}`;
        }
    }
    /** @override */
    get kind() {
        return "Method" /* Method */;
    }
    /** @override */
    get containerKey() {
        return ApiMethod.getContainerKey(this.name, this.isStatic, this.overloadIndex);
    }
    /** @beta @override */
    buildCanonicalReference() {
        const nameComponent = DeclarationReference_1.DeclarationReference.parseComponent(this.name);
        return (this.parent ? this.parent.canonicalReference : DeclarationReference_1.DeclarationReference.empty())
            .addNavigationStep(this.isStatic ? "." /* Exports */ : "#" /* Members */, nameComponent)
            .withMeaning("member" /* Member */)
            .withOverloadIndex(this.overloadIndex);
    }
}
exports.ApiMethod = ApiMethod;
//# sourceMappingURL=ApiMethod.js.map