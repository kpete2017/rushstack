"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeServicePlugin = void 0;
const child_process = __importStar(require("child_process"));
const process = __importStar(require("process"));
const perf_hooks_1 = require("perf_hooks");
const node_core_library_1 = require("@rushstack/node-core-library");
const CoreConfigFiles_1 = require("../utilities/CoreConfigFiles");
const SubprocessTerminator_1 = require("../utilities/subprocess/SubprocessTerminator");
const PLUGIN_NAME = 'NodeServicePlugin';
var State;
(function (State) {
    /**
     * The service process is not running, and _activeChildProcess is undefined.
     *
     * In this state, there may or may not be a timeout scheduled that will later restart the service.
     */
    State[State["Stopped"] = 0] = "Stopped";
    /**
     * The service process is running normally.
     */
    State[State["Running"] = 1] = "Running";
    /**
     * The SIGTERM signal has been sent to the service process, and we are waiting for it
     * to shut down gracefully.
     *
     * NOTE: On Windows OS, SIGTERM is skipped and we proceed directly to SIGKILL.
     */
    State[State["Stopping"] = 2] = "Stopping";
    /**
     * The SIGKILL signal has been sent to forcibly terminate the service process, and we are waiting
     * to confirm that the operation has completed.
     */
    State[State["Killing"] = 3] = "Killing";
})(State || (State = {}));
class NodeServicePlugin {
    constructor() {
        this.pluginName = PLUGIN_NAME;
        this._state = State.Stopped;
        /**
         * The state machine schedules at most one setInterval() timeout at any given time.  It is for:
         *
         * - waitBeforeRestartMs in State.Stopped
         * - waitForTerminateMs in State.Stopping
         * - waitForKillMs in State.Killing
         */
        this._timeout = undefined;
        /**
         * Used by _scheduleRestart().  The process will be automatically restarted when performance.now()
         * exceeds this time.
         */
        this._restartTime = undefined;
        /**
         * The data read from the node-service.json config file, or "undefined" if the file is missing.
         */
        this._rawConfiguration = undefined;
        /**
         * This is set to true when the child process terminates unexpectedly (for example, something like
         * "the service listening port is already in use" or "unable to authenticate to the database").
         * Rather than attempting to restart in a potentially endless loop, instead we will wait until "watch mode"
         * recompiles the project.
         */
        this._childProcessFailed = false;
        this._pluginEnabled = false;
        this._compileHooks_afterEachCompile = () => {
            this._trapUnhandledException(() => {
                // We've recompiled, so try launching again
                this._childProcessFailed = false;
                if (this._state === State.Stopped) {
                    // If we are already stopped, then extend the timeout
                    this._scheduleRestart(this._configuration.waitBeforeRestartMs);
                }
                else {
                    this._stopChild();
                }
            });
        };
    }
    apply(heftSession, heftConfiguration) {
        this._logger = heftSession.requestScopedLogger('node-service');
        heftSession.hooks.build.tap(PLUGIN_NAME, (build) => {
            if (!build.properties.serveMode) {
                // This plugin is only used with "heft start"
                return;
            }
            build.hooks.loadStageConfiguration.tapPromise(PLUGIN_NAME, async () => {
                await this._loadStageConfiguration(heftConfiguration);
                if (this._pluginEnabled) {
                    build.hooks.postBuild.tap(PLUGIN_NAME, (bundle) => {
                        bundle.hooks.run.tapPromise(PLUGIN_NAME, async () => {
                            await this._runCommandAsync(heftSession, heftConfiguration);
                        });
                    });
                    build.hooks.compile.tap(PLUGIN_NAME, (compile) => {
                        compile.hooks.afterCompile.tap(PLUGIN_NAME, this._compileHooks_afterEachCompile);
                        compile.hooks.afterRecompile.tap(PLUGIN_NAME, this._compileHooks_afterEachCompile);
                    });
                }
            });
        });
    }
    async _loadStageConfiguration(heftConfiguration) {
        this._rawConfiguration =
            await CoreConfigFiles_1.CoreConfigFiles.nodeServiceConfigurationLoader.tryLoadConfigurationFileForProjectAsync(this._logger.terminal, heftConfiguration.buildFolder, heftConfiguration.rigConfig);
        // defaults
        this._configuration = {
            commandName: 'serve',
            ignoreMissingScript: false,
            waitBeforeRestartMs: 2000,
            waitForTerminateMs: 2000,
            waitForKillMs: 2000
        };
        // TODO: @rushstack/heft-config-file should be able to read a *.defaults.json file
        if (this._rawConfiguration) {
            this._pluginEnabled = true;
            if (this._rawConfiguration.commandName !== undefined) {
                this._configuration.commandName = this._rawConfiguration.commandName;
            }
            if (this._rawConfiguration.ignoreMissingScript !== undefined) {
                this._configuration.ignoreMissingScript = this._rawConfiguration.ignoreMissingScript;
            }
            if (this._rawConfiguration.waitBeforeRestartMs !== undefined) {
                this._configuration.waitBeforeRestartMs = this._rawConfiguration.waitBeforeRestartMs;
            }
            if (this._rawConfiguration.waitForTerminateMs !== undefined) {
                this._configuration.waitForTerminateMs = this._rawConfiguration.waitForTerminateMs;
            }
            if (this._rawConfiguration.waitForKillMs !== undefined) {
                this._configuration.waitForKillMs = this._rawConfiguration.waitForKillMs;
            }
            this._shellCommand = (heftConfiguration.projectPackageJson.scripts || {})[this._configuration.commandName];
            if (this._shellCommand === undefined) {
                if (this._configuration.ignoreMissingScript) {
                    this._logger.terminal.writeLine(`The plugin is disabled because the project's package.json` +
                        ` does not have a "${this._configuration.commandName}" script`);
                }
                else {
                    throw new Error(`The node-service task cannot start because the project's package.json ` +
                        `does not have a "${this._configuration.commandName}" script`);
                }
                this._pluginEnabled = false;
            }
        }
        else {
            this._logger.terminal.writeVerboseLine('The plugin is disabled because its config file was not found: ' +
                CoreConfigFiles_1.CoreConfigFiles.nodeServiceConfigurationLoader.projectRelativeFilePath);
        }
    }
    async _runCommandAsync(heftSession, heftConfiguration) {
        this._logger.terminal.writeLine(`Starting Node service...`);
        this._restartChild();
    }
    _restartChild() {
        if (this._state !== State.Stopped) {
            throw new node_core_library_1.InternalError('Invalid state');
        }
        this._state = State.Running;
        this._clearTimeout();
        this._logger.terminal.writeLine('Invoking command: ' + JSON.stringify(this._shellCommand));
        this._activeChildProcess = child_process.spawn(this._shellCommand, Object.assign({ shell: true, stdio: ['inherit', 'inherit', 'inherit'] }, SubprocessTerminator_1.SubprocessTerminator.RECOMMENDED_OPTIONS));
        SubprocessTerminator_1.SubprocessTerminator.killProcessTreeOnExit(this._activeChildProcess, SubprocessTerminator_1.SubprocessTerminator.RECOMMENDED_OPTIONS);
        const childPid = this._activeChildProcess.pid;
        this._logger.terminal.writeVerboseLine(`Started service process #${childPid}`);
        this._activeChildProcess.on('close', (code, signal) => {
            this._trapUnhandledException(() => {
                // The 'close' event is emitted after a process has ended and the stdio streams of a child process
                // have been closed. This is distinct from the 'exit' event, since multiple processes might share the
                // same stdio streams. The 'close' event will always emit after 'exit' was already emitted,
                // or 'error' if the child failed to spawn.
                if (this._state === State.Running) {
                    this._logger.terminal.writeWarningLine(`The service process #${childPid} terminated unexpectedly` +
                        this._formatCodeOrSignal(code, signal));
                    this._childProcessFailed = true;
                    this._transitionToStopped();
                    return;
                }
                if (this._state === State.Stopping || this._state === State.Killing) {
                    this._logger.terminal.writeVerboseLine(`The service process #${childPid} terminated successfully` +
                        this._formatCodeOrSignal(code, signal));
                    this._transitionToStopped();
                    return;
                }
            });
        });
        // This is event only fires for Node.js >= 15.x
        this._activeChildProcess.on('spawn', () => {
            this._trapUnhandledException(() => {
                // Print a newline to separate the service's STDOUT from Heft's output
                console.log();
            });
        });
        this._activeChildProcess.on('exit', (code, signal) => {
            this._trapUnhandledException(() => {
                this._logger.terminal.writeVerboseLine(`The service process fired its "exit" event` + this._formatCodeOrSignal(code, signal));
            });
        });
        this._activeChildProcess.on('error', (err) => {
            this._trapUnhandledException(() => {
                // "The 'error' event is emitted whenever:
                // 1. The process could not be spawned, or
                // 2. The process could not be killed, or
                // 3. Sending a message to the child process failed.
                //
                // The 'exit' event may or may not fire after an error has occurred. When listening to both the 'exit'
                // and 'error' events, guard against accidentally invoking handler functions multiple times."
                if (this._state === State.Running) {
                    this._logger.terminal.writeErrorLine(`Failed to start: ` + err.toString());
                    this._childProcessFailed = true;
                    this._transitionToStopped();
                    return;
                }
                if (this._state === State.Stopping) {
                    this._logger.terminal.writeWarningLine(`The service process #${childPid} rejected the shutdown signal: ` + err.toString());
                    this._transitionToKilling();
                    return;
                }
                if (this._state === State.Killing) {
                    this._logger.terminal.writeErrorLine(`The service process #${childPid} could not be killed: ` + err.toString());
                    this._transitionToStopped();
                    return;
                }
            });
        });
    }
    _formatCodeOrSignal(code, signal) {
        if (signal) {
            return ` (signal=${code})`;
        }
        if (typeof code === 'number') {
            return ` (exit code ${code})`;
        }
        return '';
    }
    _stopChild() {
        if (this._state !== State.Running) {
            return;
        }
        if (NodeServicePlugin._isWindows) {
            // On Windows, SIGTERM can kill Cmd.exe and leave its children running in the background
            this._transitionToKilling();
        }
        else {
            if (!this._activeChildProcess) {
                // All the code paths that set _activeChildProcess=undefined should also leave the Running state
                throw new node_core_library_1.InternalError('_activeChildProcess should not be undefined');
            }
            this._state = State.Stopping;
            this._clearTimeout();
            this._logger.terminal.writeVerboseLine('Sending SIGTERM to gracefully shut down the service process');
            // Passing a negative PID terminates the entire group instead of just the one process.
            // This works because we set detached=true for child_process.spawn()
            process.kill(-this._activeChildProcess.pid, 'SIGTERM');
            this._clearTimeout();
            this._timeout = setTimeout(() => {
                this._timeout = undefined;
                this._logger.terminal.writeWarningLine('The service process is taking too long to terminate');
                this._transitionToKilling();
            }, this._configuration.waitForTerminateMs);
        }
    }
    _transitionToKilling() {
        this._state = State.Killing;
        this._clearTimeout();
        if (!this._activeChildProcess) {
            // All the code paths that set _activeChildProcess=undefined should also leave the Running state
            throw new node_core_library_1.InternalError('_activeChildProcess should not be undefined');
        }
        this._logger.terminal.writeVerboseLine('Attempting to killing the service process');
        SubprocessTerminator_1.SubprocessTerminator.killProcessTree(this._activeChildProcess, SubprocessTerminator_1.SubprocessTerminator.RECOMMENDED_OPTIONS);
        this._clearTimeout();
        this._timeout = setTimeout(() => {
            this._timeout = undefined;
            this._logger.terminal.writeErrorLine('Abandoning the service process because it could not be killed');
            this._transitionToStopped();
        }, this._configuration.waitForKillMs);
    }
    _transitionToStopped() {
        // Failed to start
        this._state = State.Stopped;
        this._clearTimeout();
        this._activeChildProcess = undefined;
        // Once we have stopped, schedule a restart
        if (!this._childProcessFailed) {
            this._scheduleRestart(this._configuration.waitBeforeRestartMs);
        }
        else {
            this._logger.terminal.writeLine('The service process has failed.  Waiting for watch mode to recompile before restarting...');
        }
    }
    _scheduleRestart(msFromNow) {
        const newTime = perf_hooks_1.performance.now() + msFromNow;
        if (this._restartTime !== undefined && newTime < this._restartTime) {
            return;
        }
        this._restartTime = newTime;
        this._logger.terminal.writeVerboseLine(`Sleeping for ${msFromNow} milliseconds`);
        this._clearTimeout();
        this._timeout = setTimeout(() => {
            this._timeout = undefined;
            this._restartTime = undefined;
            this._logger.terminal.writeVerboseLine('Time to restart');
            this._restartChild();
        }, Math.max(0, this._restartTime - perf_hooks_1.performance.now()));
    }
    _clearTimeout() {
        if (this._timeout) {
            clearTimeout(this._timeout);
            this._timeout = undefined;
        }
    }
    _trapUnhandledException(action) {
        try {
            action();
        }
        catch (error) {
            this._logger.emitError(error);
            this._logger.terminal.writeErrorLine('An unexpected error occurred');
            // TODO: Provide a Heft facility for this
            process.exit(1);
        }
    }
}
exports.NodeServicePlugin = NodeServicePlugin;
NodeServicePlugin._isWindows = process.platform === 'win32';
//# sourceMappingURL=NodeServicePlugin.js.map