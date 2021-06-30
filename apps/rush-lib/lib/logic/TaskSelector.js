"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskSelector = void 0;
const ProjectBuilder_1 = require("../logic/taskRunner/ProjectBuilder");
const PackageChangeAnalyzer_1 = require("./PackageChangeAnalyzer");
const TaskCollection_1 = require("./taskRunner/TaskCollection");
/**
 * This class is responsible for:
 *  - based on to/from flags, solving the dependency graph and figuring out which projects need to be run
 *  - creating a ProjectBuilder for each project that needs to be built
 *  - registering the necessary ProjectBuilders with the TaskRunner, which actually orchestrates execution
 */
class TaskSelector {
    constructor(options) {
        this._options = options;
        const { packageChangeAnalyzer = new PackageChangeAnalyzer_1.PackageChangeAnalyzer(options.rushConfiguration) } = options;
        this._packageChangeAnalyzer = packageChangeAnalyzer;
    }
    static getScriptToRun(rushProject, commandToRun, customParameterValues) {
        const script = TaskSelector._getScriptCommand(rushProject, commandToRun);
        if (script === undefined) {
            return undefined;
        }
        if (!script) {
            return '';
        }
        else {
            const taskCommand = `${script} ${customParameterValues.join(' ')}`;
            return process.platform === 'win32' ? ProjectBuilder_1.convertSlashesForWindows(taskCommand) : taskCommand;
        }
    }
    registerTasks() {
        const projects = this._options.selection;
        const taskCollection = new TaskCollection_1.TaskCollection();
        // Register all tasks
        for (const rushProject of projects) {
            this._registerTask(rushProject, taskCollection);
        }
        if (!this._options.ignoreDependencyOrder) {
            const dependencyMap = new Map();
            // Generate the filtered dependency graph for selected projects
            function getDependencyTaskNames(project) {
                const cached = dependencyMap.get(project);
                if (cached) {
                    return cached;
                }
                const dependencyTaskNames = new Set();
                dependencyMap.set(project, dependencyTaskNames);
                for (const dep of project.dependencyProjects) {
                    if (projects.has(dep)) {
                        // Add direct relationships for projects in the set
                        dependencyTaskNames.add(ProjectBuilder_1.ProjectBuilder.getTaskName(dep));
                    }
                    else {
                        // Add indirect relationships for projects not in the set
                        for (const indirectDep of getDependencyTaskNames(dep)) {
                            dependencyTaskNames.add(indirectDep);
                        }
                    }
                }
                return dependencyTaskNames;
            }
            // Add ordering relationships for each dependency
            for (const project of projects) {
                taskCollection.addDependencies(ProjectBuilder_1.ProjectBuilder.getTaskName(project), getDependencyTaskNames(project));
            }
        }
        return taskCollection;
    }
    _registerTask(project, taskCollection) {
        if (!project || taskCollection.hasTask(ProjectBuilder_1.ProjectBuilder.getTaskName(project))) {
            return;
        }
        const commandToRun = TaskSelector.getScriptToRun(project, this._options.commandToRun, this._options.customParameterValues);
        if (commandToRun === undefined && !this._options.ignoreMissingScript) {
            throw new Error(`The project [${project.packageName}] does not define a '${this._options.commandToRun}' command in the 'scripts' section of its package.json`);
        }
        taskCollection.addTask(new ProjectBuilder_1.ProjectBuilder({
            rushProject: project,
            rushConfiguration: this._options.rushConfiguration,
            buildCacheConfiguration: this._options.buildCacheConfiguration,
            commandToRun: commandToRun || '',
            commandName: this._options.commandName,
            isIncrementalBuildAllowed: this._options.isIncrementalBuildAllowed,
            packageChangeAnalyzer: this._packageChangeAnalyzer,
            packageDepsFilename: this._options.packageDepsFilename
        }));
    }
    static _getScriptCommand(rushProject, script) {
        if (!rushProject.packageJson.scripts) {
            return undefined;
        }
        const rawCommand = rushProject.packageJson.scripts[script];
        if (rawCommand === undefined || rawCommand === null) {
            return undefined;
        }
        return rawCommand;
    }
}
exports.TaskSelector = TaskSelector;
//# sourceMappingURL=TaskSelector.js.map