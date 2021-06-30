"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports._PreapprovedNamespace = exports._PreapprovedClass = exports._PreapprovedEnum = void 0;
/** @internal @preapproved */
var _PreapprovedEnum;
(function (_PreapprovedEnum) {
    _PreapprovedEnum[_PreapprovedEnum["ONE"] = 1] = "ONE";
    _PreapprovedEnum[_PreapprovedEnum["TWO"] = 2] = "TWO";
})(_PreapprovedEnum = exports._PreapprovedEnum || (exports._PreapprovedEnum = {}));
/** @internal @preapproved */
class _PreapprovedClass {
    member() { }
}
exports._PreapprovedClass = _PreapprovedClass;
/** @internal @preapproved */
var _PreapprovedNamespace;
(function (_PreapprovedNamespace) {
    class X {
    }
    _PreapprovedNamespace.X = X;
    function f() { }
    _PreapprovedNamespace.f = f;
})(_PreapprovedNamespace = exports._PreapprovedNamespace || (exports._PreapprovedNamespace = {}));
//# sourceMappingURL=index.js.map