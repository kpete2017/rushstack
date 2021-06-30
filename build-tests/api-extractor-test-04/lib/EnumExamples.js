"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegularEnum = void 0;
/**
 * This is a regular enum marked as \@beta
 * @beta
 */
var RegularEnum;
(function (RegularEnum) {
    /**
     * This member inherits its \@beta status from the parent
     */
    RegularEnum[RegularEnum["BetaMember"] = 100] = "BetaMember";
    /**
     * This member is marked as \@alpha
     * @alpha
     */
    RegularEnum[RegularEnum["AlphaMember"] = 101] = "AlphaMember";
    /**
     * This member is marked as \@internal
     * @internal
     */
    RegularEnum[RegularEnum["_InternalMember"] = 102] = "_InternalMember";
})(RegularEnum = exports.RegularEnum || (exports.RegularEnum = {}));
//# sourceMappingURL=EnumExamples.js.map