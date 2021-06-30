import { Task } from './Task';
import { BaseBuilder } from './BaseBuilder';
/**
 * This class represents a set of tasks with interdependencies.  Any class of task definition
 * may be registered, and dependencies between tasks are easily specified. There is a check for
 * cyclic dependencies and tasks are ordered based on critical path.
 */
export declare class TaskCollection {
    private _tasks;
    constructor();
    /**
     * Registers a task definition to the map of defined tasks
     */
    addTask(builder: BaseBuilder): void;
    /**
     * Returns true if a task with that name has been registered
     */
    hasTask(taskName: string): boolean;
    /**
     * Defines the list of dependencies for an individual task.
     * @param taskName - the string name of the task for which we are defining dependencies. A task with this
     * name must already have been registered.
     */
    addDependencies(taskName: string, taskDependencies: Iterable<string>): void;
    /**
     * Returns the tasks registered with the collection ordered by the critical path.
     * It also makes sure there are no cyclic dependencies in the tasks.
     */
    getOrderedTasks(): Task[];
    /**
     * Checks for projects that indirectly depend on themselves.
     */
    private _checkForCyclicDependencies;
    /**
     * Calculate the number of packages which must be built before we reach
     * the furthest away "root" node
     */
    private _calculateCriticalPaths;
}
//# sourceMappingURL=TaskCollection.d.ts.map