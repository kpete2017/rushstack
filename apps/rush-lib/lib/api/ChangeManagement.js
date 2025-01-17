"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangeType = void 0;
/**
 * Represents all of the types of change requests.
 */
var ChangeType;
(function (ChangeType) {
    ChangeType[ChangeType["none"] = 0] = "none";
    ChangeType[ChangeType["dependency"] = 1] = "dependency";
    ChangeType[ChangeType["hotfix"] = 2] = "hotfix";
    ChangeType[ChangeType["patch"] = 3] = "patch";
    ChangeType[ChangeType["minor"] = 4] = "minor";
    ChangeType[ChangeType["major"] = 5] = "major";
})(ChangeType = exports.ChangeType || (exports.ChangeType = {}));
//# sourceMappingURL=ChangeManagement.js.map