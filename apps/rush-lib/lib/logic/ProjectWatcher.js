"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectWatcher = void 0;
const node_core_library_1 = require("@rushstack/node-core-library");
const PackageChangeAnalyzer_1 = require("./PackageChangeAnalyzer");
// Use lazy import because we don't need this immediately
const chokidar = node_core_library_1.Import.lazy('chokidar', require);
/**
 * This class is for incrementally watching a set of projects in the repository for changes.
 *
 * Calling `waitForChange()` will return a promise that resolves when the package-deps of one or
 * more projects differ from the value the previous time it was invoked. The first time will always resolve with the full selection.
 */
class ProjectWatcher {
    constructor(options) {
        const { debounceMilliseconds = 1000, rushConfiguration, projectsToWatch, terminal } = options;
        this._debounceMilliseconds = debounceMilliseconds;
        this._rushConfiguration = rushConfiguration;
        this._projectsToWatch = projectsToWatch;
        this._terminal = terminal;
    }
    /**
     * Waits for a change to the package-deps of one or more of the selected projects, since the previous invocation.
     * Will return immediately the first time it is invoked, since no state has been recorded.
     * If no change is currently present, watches the source tree of all selected projects for file changes.
     */
    async waitForChange() {
        const initialChangeResult = await this._computeChanged();
        // Ensure that the new state is recorded so that we don't loop infinitely
        this._commitChanges(initialChangeResult.state);
        if (initialChangeResult.changedProjects.size) {
            return initialChangeResult;
        }
        const watcher = new chokidar.FSWatcher({
            persistent: true,
            cwd: node_core_library_1.Path.convertToSlashes(this._rushConfiguration.rushJsonFolder),
            followSymlinks: false,
            ignoreInitial: true,
            ignored: /(?:^|[\\\/])node_modules/g,
            disableGlobbing: true,
            interval: 1000
        });
        // Only watch for changes in the requested project folders
        for (const project of this._projectsToWatch) {
            watcher.add(node_core_library_1.Path.convertToSlashes(project.projectFolder));
        }
        const watchedResult = await new Promise((resolve, reject) => {
            let timeout;
            let terminated = false;
            const resolveIfChanged = async () => {
                timeout = undefined;
                if (terminated) {
                    return;
                }
                try {
                    const result = await this._computeChanged();
                    // Need an async tick to allow for more file system events to be handled
                    process.nextTick(() => {
                        if (timeout) {
                            // If another file has changed, wait for another pass.
                            return;
                        }
                        this._commitChanges(result.state);
                        if (result.changedProjects.size) {
                            terminated = true;
                            resolve(result);
                        }
                    });
                }
                catch (err) {
                    // eslint-disable-next-line require-atomic-updates
                    terminated = true;
                    reject(err);
                }
            };
            watcher.on('all', () => {
                try {
                    if (terminated) {
                        return;
                    }
                    // Use a timeout to debounce changes, e.g. bulk copying files into the directory while the watcher is running.
                    if (timeout) {
                        clearTimeout(timeout);
                    }
                    timeout = setTimeout(resolveIfChanged, this._debounceMilliseconds);
                }
                catch (err) {
                    terminated = true;
                    reject(err);
                }
            });
        });
        await watcher.close();
        return watchedResult;
    }
    /**
     * Determines which, if any, projects (within the selection) have new hashes for files that are not in .gitignore
     */
    async _computeChanged() {
        const state = new PackageChangeAnalyzer_1.PackageChangeAnalyzer(this._rushConfiguration);
        const previousState = this._previousState;
        if (!previousState) {
            return {
                changedProjects: this._projectsToWatch,
                state
            };
        }
        const changedProjects = new Set();
        for (const project of this._projectsToWatch) {
            const { packageName } = project;
            if (ProjectWatcher._haveProjectDepsChanged((await previousState.getPackageDeps(packageName, this._terminal)), (await state.getPackageDeps(packageName, this._terminal)))) {
                // May need to detect if the nature of the change will break the process, e.g. changes to package.json
                changedProjects.add(project);
            }
        }
        return {
            changedProjects,
            state
        };
    }
    _commitChanges(state) {
        this._previousState = state;
        if (!this._initialState) {
            this._initialState = state;
        }
    }
    /**
     * Tests for inequality of the passed Maps. Order invariant.
     *
     * @returns `true` if the maps are different, `false` otherwise
     */
    static _haveProjectDepsChanged(prev, next) {
        if (prev.size !== next.size) {
            return true;
        }
        for (const [key, value] of prev) {
            if (next.get(key) !== value) {
                return true;
            }
        }
        return false;
    }
}
exports.ProjectWatcher = ProjectWatcher;
//# sourceMappingURL=ProjectWatcher.js.map