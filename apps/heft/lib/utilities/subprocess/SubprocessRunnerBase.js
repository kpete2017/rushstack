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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubprocessRunnerBase = exports.SUBPROCESS_RUNNER_INNER_INVOKE = exports.SUBPROCESS_RUNNER_CLASS_LABEL = void 0;
const childProcess = __importStar(require("child_process"));
const path = __importStar(require("path"));
const node_core_library_1 = require("@rushstack/node-core-library");
const SubprocessCommunication_1 = require("./SubprocessCommunication");
const TerminalProviderManager_1 = require("./TerminalProviderManager");
const SubprocessLoggerManager_1 = require("./SubprocessLoggerManager");
const FileError_1 = require("../../pluginFramework/logging/FileError");
const SubprocessTerminator_1 = require("./SubprocessTerminator");
exports.SUBPROCESS_RUNNER_CLASS_LABEL = Symbol('IsSubprocessModule');
exports.SUBPROCESS_RUNNER_INNER_INVOKE = Symbol('SubprocessInnerInvoke');
/**
 * This base class allows an computationally expensive task to be run in a separate NodeJS
 * process.
 *
 * The subprocess can be provided with a configuration, which must be JSON-serializable,
 * and the subprocess can log data via a Terminal object.
 */
class SubprocessRunnerBase {
    /**
     * Constructs an instances of a subprocess runner
     */
    constructor(parentGlobalTerminalProvider, configuration, heftSession) {
        this._runningAsSubprocess = false;
        this._subprocessCommunicationManagers = [];
        this._configuration = configuration;
        if (parentGlobalTerminalProvider) {
            // This is the parent process
            this._innerConfiguration = {
                globalTerminalProviderId: undefined,
                terminalEolCharacter: parentGlobalTerminalProvider.eolCharacter,
                terminalSupportsColor: parentGlobalTerminalProvider.supportsColor
            };
            this._registerDefaultCommunicationManagers({
                sendMessageToParentProcess: this._receiveMessageFromSubprocess.bind(this),
                sendMessageToSubprocess: this._receiveMessageFromParentProcess.bind(this)
            }, heftSession);
            const globalTerminalProviderId = this._terminalProviderManager.registerTerminalProvider(parentGlobalTerminalProvider);
            this._innerConfiguration.globalTerminalProviderId = globalTerminalProviderId;
            this._globalTerminal = new node_core_library_1.Terminal(this._terminalProviderManager.registerSubprocessTerminalProvider(globalTerminalProviderId));
        }
    }
    get runningAsSubprocess() {
        return this._runningAsSubprocess;
    }
    static initializeSubprocess(thisType, innerConfiguration, configuration) {
        const subprocessRunner = new thisType(undefined, configuration, undefined);
        subprocessRunner._runningAsSubprocess = true;
        subprocessRunner._innerConfiguration = innerConfiguration;
        subprocessRunner._registerDefaultCommunicationManagers({
            sendMessageToParentProcess: process.send.bind(process),
            sendMessageToSubprocess: () => {
                throw new Error('A subprocess cannot send a message to itself.');
            }
        }, undefined);
        subprocessRunner._globalTerminal = new node_core_library_1.Terminal(subprocessRunner._terminalProviderManager.registerSubprocessTerminalProvider(innerConfiguration.globalTerminalProviderId));
        return subprocessRunner;
    }
    invokeAsSubprocessAsync() {
        return new Promise((resolve, reject) => {
            const subprocess = childProcess.fork(path.resolve(__dirname, 'startSubprocess'), [this.filename, JSON.stringify(this._innerConfiguration), JSON.stringify(this._configuration)], Object.assign({ execArgv: this._processNodeArgsForSubprocess(this._globalTerminal, process.execArgv) }, SubprocessTerminator_1.SubprocessTerminator.RECOMMENDED_OPTIONS));
            SubprocessTerminator_1.SubprocessTerminator.killProcessTreeOnExit(subprocess, SubprocessTerminator_1.SubprocessTerminator.RECOMMENDED_OPTIONS);
            this._terminalProviderManager.registerSubprocess(subprocess);
            this._scopedLoggerManager.registerSubprocess(subprocess);
            let hasExited = false;
            let exitError;
            subprocess.on('message', (message) => {
                switch (message.type) {
                    case 'exit': {
                        if (hasExited) {
                            throw new Error(`Subprocess communication error. Received a duplicate "${message.type}" message.`);
                        }
                        const exitMessage = message;
                        hasExited = true;
                        exitError = SubprocessRunnerBase.deserializeFromIpcMessage(exitMessage.error);
                        break;
                    }
                    default: {
                        if (hasExited) {
                            throw new Error('Subprocess communication error. Received a message after the subprocess ' +
                                'has indicated that it has exited');
                        }
                        this._receiveMessageFromSubprocess(message);
                    }
                }
            });
            subprocess.on('close', () => {
                if (exitError) {
                    reject(exitError);
                }
                else if (!hasExited) {
                    reject(new Error('Subprocess exited before sending "exit" message.'));
                }
                else {
                    resolve();
                }
            });
        });
    }
    async [(_a = exports.SUBPROCESS_RUNNER_CLASS_LABEL, exports.SUBPROCESS_RUNNER_INNER_INVOKE)]() {
        process.on('message', (message) => {
            this._receiveMessageFromParentProcess(message);
        });
        let error = undefined;
        try {
            await this.invokeAsync();
        }
        catch (e) {
            error = e;
        }
        finally {
            process.removeAllListeners();
            const exitMessage = {
                type: 'exit',
                error: SubprocessRunnerBase.serializeForIpcMessage(error)
            };
            process.send(exitMessage);
        }
    }
    registerSubprocessCommunicationManager(communicationManager) {
        if (this._subprocessCommunicationManagerInitializationOptions) {
            communicationManager.initialize(this._subprocessCommunicationManagerInitializationOptions);
        }
        this._subprocessCommunicationManagers.push(communicationManager);
    }
    async requestScopedLoggerAsync(loggerName) {
        return await this._scopedLoggerManager.requestScopedLoggerAsync(loggerName);
    }
    _registerDefaultCommunicationManagers(subprocessCommunicationManagerInitializationOptions, heftSession) {
        if (this._subprocessCommunicationManagerInitializationOptions) {
            throw new Error('Default subprocess communication managers have already been registered.');
        }
        this._subprocessCommunicationManagerInitializationOptions =
            subprocessCommunicationManagerInitializationOptions;
        for (const communicationManager of this._subprocessCommunicationManagers) {
            communicationManager.initialize(this._subprocessCommunicationManagerInitializationOptions);
        }
        this._terminalProviderManager = new TerminalProviderManager_1.TerminalProviderManager({
            configuration: this._innerConfiguration
        });
        this._scopedLoggerManager = new SubprocessLoggerManager_1.SubprocessLoggerManager({
            terminalProviderManager: this._terminalProviderManager,
            heftSession: heftSession
        });
        this.registerSubprocessCommunicationManager(this._terminalProviderManager);
        this.registerSubprocessCommunicationManager(this._scopedLoggerManager);
    }
    _processNodeArgsForSubprocess(terminal, nodeArgs) {
        nodeArgs = [...nodeArgs]; // Clone the args array
        const inspectPort = SubprocessRunnerBase._subprocessInspectorPort++;
        let willUseInspector = false;
        for (let i = 0; i < nodeArgs.length; i++) {
            // The '--inspect' and '--inspect-brk' arguments can have an explicit port specified with syntax that
            // looks like '--inspect=<port>', so we'll split by the '=' character in case the port is explicitly specified
            const [firstNodeArgPart] = nodeArgs[i].split('=');
            if (firstNodeArgPart === '--inspect' || firstNodeArgPart === '--inspect-brk') {
                nodeArgs[i] = `${firstNodeArgPart}=${inspectPort}`;
                willUseInspector = true;
            }
        }
        if (willUseInspector) {
            terminal.writeLine(`Subprocess with inspector bound to port ${inspectPort}`);
        }
        return nodeArgs;
    }
    _receiveMessageFromParentProcess(message) {
        for (const subprocessCommunicationManager of this._subprocessCommunicationManagers) {
            if (subprocessCommunicationManager.canHandleMessageFromParentProcess(message)) {
                subprocessCommunicationManager.receiveMessageFromParentProcess(message);
                return;
            }
        }
        throw new Error('Subprocess communication manager. No communication manager can handle message type ' +
            `"${message.type}" from parent process.`);
    }
    _receiveMessageFromSubprocess(message) {
        for (const subprocessCommunicationManager of this._subprocessCommunicationManagers) {
            if (subprocessCommunicationManager.canHandleMessageFromSubprocess(message)) {
                subprocessCommunicationManager.receiveMessageFromSubprocess(message);
                return;
            }
        }
        throw new Error('Subprocess communication manager. No communication manager can handle message type ' +
            `"${message.type}" from subprocess.`);
    }
    static serializeForIpcMessage(arg) {
        if (arg === undefined) {
            return { type: SubprocessCommunication_1.SupportedSerializableArgType.Undefined };
        }
        else if (arg === null) {
            return { type: SubprocessCommunication_1.SupportedSerializableArgType.Null };
        }
        switch (typeof arg) {
            case 'object': {
                if (arg instanceof FileError_1.FileError) {
                    const result = {
                        type: SubprocessCommunication_1.SupportedSerializableArgType.FileError,
                        value: {
                            errorMessage: arg.message,
                            errorStack: arg.stack,
                            filePath: arg.filePath,
                            line: arg.line,
                            column: arg.column
                        }
                    };
                    return result;
                }
                else if (arg instanceof Error) {
                    const result = {
                        type: SubprocessCommunication_1.SupportedSerializableArgType.Error,
                        value: {
                            errorMessage: arg.message,
                            errorStack: arg.stack
                        }
                    };
                    return result;
                }
                break;
            }
            case 'string':
            case 'number':
            case 'boolean': {
                const result = {
                    type: SubprocessCommunication_1.SupportedSerializableArgType.Primitive,
                    value: arg
                };
                return result;
            }
        }
        throw new Error(`Argument (${arg}) is not supported in subprocess communication.`);
    }
    static deserializeFromIpcMessage(arg) {
        switch (arg.type) {
            case SubprocessCommunication_1.SupportedSerializableArgType.Undefined: {
                return undefined;
            }
            case SubprocessCommunication_1.SupportedSerializableArgType.Null: {
                return null;
            }
            case SubprocessCommunication_1.SupportedSerializableArgType.Error: {
                const typedArg = arg;
                const result = new Error(typedArg.value.errorMessage);
                result.stack = typedArg.value.errorStack;
                return result;
            }
            case SubprocessCommunication_1.SupportedSerializableArgType.FileError: {
                const typedArg = arg;
                const result = new FileError_1.FileError(typedArg.value.errorMessage, typedArg.value.filePath, typedArg.value.line, typedArg.value.column);
                result.stack = typedArg.value.errorStack;
                return result;
            }
            case SubprocessCommunication_1.SupportedSerializableArgType.Primitive: {
                const typedArg = arg;
                return typedArg.value;
            }
            default:
                throw new Error(`Unexpected arg type "${arg.type}".`);
        }
    }
}
exports.SubprocessRunnerBase = SubprocessRunnerBase;
SubprocessRunnerBase[_a] = true;
SubprocessRunnerBase._subprocessInspectorPort = 9229 + 1; // 9229 is the default port
//# sourceMappingURL=SubprocessRunnerBase.js.map