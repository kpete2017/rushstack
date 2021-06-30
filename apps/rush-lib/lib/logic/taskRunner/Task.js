"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.Task = void 0;
/**
 * The `Task` class is a node in the dependency graph of work that needs to be scheduled by the `TaskRunner`.
 * Each `Task` has a `BaseBuilder` member, whose subclass manages the actual operations for building a single
 * project.
 */
class Task {
    constructor(builder, initialStatus) {
        /**
         * A set of all dependencies which must be executed before this task is complete.
         * When dependencies finish execution, they are removed from this list.
         */
        this.dependencies = new Set();
        /**
         * The inverse of dependencies, lists all projects which are directly dependent on this one.
         */
        this.dependents = new Set();
        this.builder = builder;
        this.status = initialStatus;
    }
    get name() {
        return this.builder.name;
    }
}
exports.Task = Task;
//# sourceMappingURL=Task.js.map