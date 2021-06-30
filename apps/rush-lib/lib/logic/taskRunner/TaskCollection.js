"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskCollection = void 0;
const node_core_library_1 = require("@rushstack/node-core-library");
const Task_1 = require("./Task");
const TaskStatus_1 = require("./TaskStatus");
/**
 * This class represents a set of tasks with interdependencies.  Any class of task definition
 * may be registered, and dependencies between tasks are easily specified. There is a check for
 * cyclic dependencies and tasks are ordered based on critical path.
 */
class TaskCollection {
    constructor() {
        this._tasks = new Map();
    }
    /**
     * Registers a task definition to the map of defined tasks
     */
    addTask(builder) {
        if (this._tasks.has(builder.name)) {
            throw new Error('A task with that name has already been registered.');
        }
        const task = new Task_1.Task(builder, TaskStatus_1.TaskStatus.Ready);
        task.criticalPathLength = undefined;
        this._tasks.set(task.name, task);
    }
    /**
     * Returns true if a task with that name has been registered
     */
    hasTask(taskName) {
        return this._tasks.has(taskName);
    }
    /**
     * Defines the list of dependencies for an individual task.
     * @param taskName - the string name of the task for which we are defining dependencies. A task with this
     * name must already have been registered.
     */
    addDependencies(taskName, taskDependencies) {
        const task = this._tasks.get(taskName);
        if (!task) {
            throw new Error(`The task '${taskName}' has not been registered`);
        }
        if (!taskDependencies) {
            throw new Error('The list of dependencies must be defined');
        }
        for (const dependencyName of taskDependencies) {
            if (!this._tasks.has(dependencyName)) {
                throw new Error(`The project '${dependencyName}' has not been registered.`);
            }
            const dependency = this._tasks.get(dependencyName);
            task.dependencies.add(dependency);
            dependency.dependents.add(task);
        }
    }
    /**
     * Returns the tasks registered with the collection ordered by the critical path.
     * It also makes sure there are no cyclic dependencies in the tasks.
     */
    getOrderedTasks() {
        this._checkForCyclicDependencies(this._tasks.values(), [], new Set());
        // Precalculate the number of dependent packages
        this._tasks.forEach((task) => {
            this._calculateCriticalPaths(task);
        });
        const buildQueue = [];
        // Add everything to the buildQueue
        this._tasks.forEach((task) => {
            buildQueue.push(task);
        });
        // Sort the queue in descending order, nothing will mess with the order
        node_core_library_1.Sort.sortBy(buildQueue, (task) => -task.criticalPathLength);
        return buildQueue;
    }
    /**
     * Checks for projects that indirectly depend on themselves.
     */
    _checkForCyclicDependencies(tasks, dependencyChain, alreadyCheckedProjects) {
        for (const task of tasks) {
            if (dependencyChain.indexOf(task.name) >= 0) {
                throw new Error('A cyclic dependency was encountered:\n' +
                    '  ' +
                    [...dependencyChain, task.name].reverse().join('\n  -> ') +
                    '\nConsider using the cyclicDependencyProjects option for rush.json.');
            }
            if (!alreadyCheckedProjects.has(task.name)) {
                alreadyCheckedProjects.add(task.name);
                dependencyChain.push(task.name);
                this._checkForCyclicDependencies(task.dependents, dependencyChain, alreadyCheckedProjects);
                dependencyChain.pop();
            }
        }
    }
    /**
     * Calculate the number of packages which must be built before we reach
     * the furthest away "root" node
     */
    _calculateCriticalPaths(task) {
        // Return the memoized value
        if (task.criticalPathLength !== undefined) {
            return task.criticalPathLength;
        }
        // If no dependents, we are in a "root"
        if (task.dependents.size === 0) {
            task.criticalPathLength = 0;
            return task.criticalPathLength;
        }
        else {
            // Otherwise we are as long as the longest package + 1
            const depsLengths = [];
            task.dependents.forEach((dep) => depsLengths.push(this._calculateCriticalPaths(dep)));
            task.criticalPathLength = Math.max(...depsLengths) + 1;
            return task.criticalPathLength;
        }
    }
}
exports.TaskCollection = TaskCollection;
//# sourceMappingURL=TaskCollection.js.map