"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestStage = exports.TestStageHooks = void 0;
const StageBase_1 = require("./StageBase");
const tapable_1 = require("tapable");
/**
 * @public
 */
class TestStageHooks extends StageBase_1.StageHooksBase {
    constructor() {
        super(...arguments);
        this.run = new tapable_1.AsyncParallelHook();
        this.configureTest = new tapable_1.AsyncSeriesHook();
    }
}
exports.TestStageHooks = TestStageHooks;
class TestStage extends StageBase_1.StageBase {
    constructor(heftConfiguration, loggingManager) {
        super(heftConfiguration, loggingManager, TestStageHooks);
    }
    async getDefaultStagePropertiesAsync(options) {
        return {
            watchMode: options.watchMode,
            updateSnapshots: options.updateSnapshots,
            findRelatedTests: options.findRelatedTests,
            passWithNoTests: options.passWithNoTests,
            silent: options.silent,
            testNamePattern: options.testNamePattern,
            testPathPattern: options.testPathPattern,
            testTimeout: options.testTimeout,
            detectOpenHandles: options.detectOpenHandles,
            debugHeftReporter: options.debugHeftReporter,
            maxWorkers: options.maxWorkers
        };
    }
    async executeInnerAsync() {
        await this.stageHooks.configureTest.promise();
        await this.stageHooks.run.promise();
    }
}
exports.TestStage = TestStage;
//# sourceMappingURL=TestStage.js.map