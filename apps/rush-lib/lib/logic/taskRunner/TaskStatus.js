"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskStatus = void 0;
/**
 * Enumeration defining potential states of a task: not started, executing, or completed
 */
var TaskStatus;
(function (TaskStatus) {
    TaskStatus["Ready"] = "READY";
    TaskStatus["Executing"] = "EXECUTING";
    TaskStatus["Success"] = "SUCCESS";
    TaskStatus["SuccessWithWarning"] = "SUCCESS WITH WARNINGS";
    TaskStatus["Skipped"] = "SKIPPED";
    TaskStatus["FromCache"] = "FROM CACHE";
    TaskStatus["Failure"] = "FAILURE";
    TaskStatus["Blocked"] = "BLOCKED";
})(TaskStatus = exports.TaskStatus || (exports.TaskStatus = {}));
//# sourceMappingURL=TaskStatus.js.map