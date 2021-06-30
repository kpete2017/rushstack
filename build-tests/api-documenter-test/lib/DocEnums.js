"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocEnumNamespaceMerge = exports.DocEnum = void 0;
/**
 * Docs for DocEnum
 * @public
 * {@docCategory SystemEvent}
 */
var DocEnum;
(function (DocEnum) {
    /**
     * These are some docs for Zero
     */
    DocEnum[DocEnum["Zero"] = 0] = "Zero";
    /**
     * These are some docs for One
     */
    DocEnum[DocEnum["One"] = 1] = "One";
    /**
     * These are some docs for Two
     */
    DocEnum[DocEnum["Two"] = 2] = "Two";
})(DocEnum = exports.DocEnum || (exports.DocEnum = {}));
/**
 * Enum that merges with namespace
 *
 * @remarks
 * {@link (DocEnumNamespaceMerge:enum)|Link to enum}
 *
 * {@link (DocEnumNamespaceMerge:namespace)|Link to namespace}
 *
 * {@link (DocEnumNamespaceMerge:namespace).exampleFunction|Link to function inside namespace}
 *
 * @public
 */
var DocEnumNamespaceMerge;
(function (DocEnumNamespaceMerge) {
    /**
     * These are some docs for Left
     */
    DocEnumNamespaceMerge[DocEnumNamespaceMerge["Left"] = 0] = "Left";
    /**
     * These are some docs for Right
     */
    DocEnumNamespaceMerge[DocEnumNamespaceMerge["Right"] = 1] = "Right";
})(DocEnumNamespaceMerge = exports.DocEnumNamespaceMerge || (exports.DocEnumNamespaceMerge = {}));
/**
 * Namespace that merges with enum
 * @public
 */
(function (DocEnumNamespaceMerge) {
    /**
     * This is a function inside of a namespace that merges with an enum.
     */
    function exampleFunction() { }
    DocEnumNamespaceMerge.exampleFunction = exampleFunction;
})(DocEnumNamespaceMerge = exports.DocEnumNamespaceMerge || (exports.DocEnumNamespaceMerge = {}));
//# sourceMappingURL=DocEnums.js.map