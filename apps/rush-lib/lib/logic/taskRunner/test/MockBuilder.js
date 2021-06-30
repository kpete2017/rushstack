"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockBuilder = void 0;
const TaskStatus_1 = require("../TaskStatus");
const BaseBuilder_1 = require("../BaseBuilder");
class MockBuilder extends BaseBuilder_1.BaseBuilder {
    constructor(name, action) {
        super();
        this.hadEmptyScript = false;
        this.isIncrementalBuildAllowed = false;
        this.name = name;
        this._action = action;
    }
    async executeAsync(context) {
        let result;
        if (this._action) {
            result = await this._action(context.collatedWriter.terminal);
        }
        return result ? result : TaskStatus_1.TaskStatus.Success;
    }
}
exports.MockBuilder = MockBuilder;
//# sourceMappingURL=MockBuilder.js.map