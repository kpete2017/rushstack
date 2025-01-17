"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubprocessLoggerManager = void 0;
const node_core_library_1 = require("@rushstack/node-core-library");
const SubprocessCommunicationManagerBase_1 = require("./SubprocessCommunicationManagerBase");
const SubprocessRunnerBase_1 = require("./SubprocessRunnerBase");
const SUBPROCESS_LOGGER_MANAGER_REQUEST_LOGGER_MESSAGE_TYPE = 'subprocessLoggerManagerRequestLogger';
const SUBPROCESS_LOGGER_MANAGER_PROVIDE_LOGGER_MESSAGE_TYPE = 'subprocessLoggerManagerProvideLogger';
const SUBPROCESS_LOGGER_EMIT_ERROR_WARNING_MESSAGE_TYPE = 'subprocessLoggerEmitErrorWarning';
class SubprocessLoggerManager extends SubprocessCommunicationManagerBase_1.SubprocessCommunicationManagerBase {
    constructor(options) {
        super();
        this._loggerNamesAwaitingResponse = new Map();
        this._requestedLoggers = new Map();
        this._heftSession = options.heftSession;
        this._terminalProviderManager = options.terminalProviderManager;
    }
    async requestScopedLoggerAsync(loggerName) {
        if (this._loggerNamesAwaitingResponse.has(loggerName)) {
            throw new Error(`A logger with name "${loggerName}" has already been requested.`);
        }
        try {
            return await new Promise((resolve, reject) => {
                this._loggerNamesAwaitingResponse.set(loggerName, { resolve, reject });
                const message = {
                    type: SUBPROCESS_LOGGER_MANAGER_REQUEST_LOGGER_MESSAGE_TYPE,
                    loggerName: loggerName
                };
                this.sendMessageToParentProcess(message);
            });
        }
        finally {
            this._loggerNamesAwaitingResponse.delete(loggerName);
        }
    }
    canHandleMessageFromSubprocess(message) {
        return (message.type === SUBPROCESS_LOGGER_MANAGER_REQUEST_LOGGER_MESSAGE_TYPE ||
            message.type === SUBPROCESS_LOGGER_EMIT_ERROR_WARNING_MESSAGE_TYPE);
    }
    receiveMessageFromSubprocess(message) {
        switch (message.type) {
            case SUBPROCESS_LOGGER_MANAGER_REQUEST_LOGGER_MESSAGE_TYPE: {
                // Requesting a new logger
                if (!this._heftSession) {
                    throw new Error(`A heft session must be provided to the ${SubprocessLoggerManager.name} instance in the ` +
                        'parent process.');
                }
                if (!this._terminalProviderManager) {
                    throw new Error(`A terminal provider manager must be provided to the ${SubprocessLoggerManager.name} instance in the ` +
                        'parent process.');
                }
                const typedMessage = message;
                let responseMessage;
                try {
                    const logger = this._heftSession.requestScopedLogger(typedMessage.loggerName);
                    const terminalProviderId = this._terminalProviderManager.registerTerminalProvider(logger.terminalProvider);
                    this._requestedLoggers.set(terminalProviderId, logger);
                    responseMessage = {
                        type: SUBPROCESS_LOGGER_MANAGER_PROVIDE_LOGGER_MESSAGE_TYPE,
                        loggerName: typedMessage.loggerName,
                        terminalProviderId: terminalProviderId
                    };
                }
                catch (error) {
                    responseMessage = {
                        type: SUBPROCESS_LOGGER_MANAGER_REQUEST_LOGGER_MESSAGE_TYPE,
                        loggerName: typedMessage.loggerName,
                        error: SubprocessRunnerBase_1.SubprocessRunnerBase.serializeForIpcMessage(error)
                    };
                }
                this.sendMessageToSubprocess(responseMessage);
                break;
            }
            case SUBPROCESS_LOGGER_EMIT_ERROR_WARNING_MESSAGE_TYPE: {
                const typedMessage = message;
                const logger = this._requestedLoggers.get(typedMessage.loggerId);
                if (!logger) {
                    throw new Error(`No logger was was registered with ID ${typedMessage.loggerId}`);
                }
                const errorOrWarning = SubprocessRunnerBase_1.SubprocessRunnerBase.deserializeFromIpcMessage(typedMessage.errorOrWarning);
                if (typedMessage.isError) {
                    logger.emitError(errorOrWarning);
                }
                else {
                    logger.emitWarning(errorOrWarning);
                }
                break;
            }
        }
    }
    canHandleMessageFromParentProcess(message) {
        return message.type === SUBPROCESS_LOGGER_MANAGER_PROVIDE_LOGGER_MESSAGE_TYPE;
    }
    receiveMessageFromParentProcess(message) {
        if (message.type === SUBPROCESS_LOGGER_MANAGER_PROVIDE_LOGGER_MESSAGE_TYPE) {
            const typedMessage = message;
            const response = this._loggerNamesAwaitingResponse.get(typedMessage.loggerName);
            if (!response) {
                throw new Error(`Missing a registered responder for logger name "${typedMessage.loggerName}"`);
            }
            if (typedMessage.error) {
                const error = SubprocessRunnerBase_1.SubprocessRunnerBase.deserializeFromIpcMessage(typedMessage.error);
                response.reject(error);
            }
            else if (typedMessage.terminalProviderId !== undefined) {
                const terminalProvider = this._terminalProviderManager.registerSubprocessTerminalProvider(typedMessage.terminalProviderId);
                const sendErrorOrWarning = (errorOrWarning, isError) => {
                    const message = {
                        type: SUBPROCESS_LOGGER_EMIT_ERROR_WARNING_MESSAGE_TYPE,
                        loggerId: typedMessage.terminalProviderId,
                        errorOrWarning: SubprocessRunnerBase_1.SubprocessRunnerBase.serializeForIpcMessage(errorOrWarning),
                        isError
                    };
                    this.sendMessageToParentProcess(message);
                };
                const scopedLogger = {
                    terminal: new node_core_library_1.Terminal(terminalProvider),
                    emitError: (error) => {
                        sendErrorOrWarning(error, true);
                    },
                    emitWarning: (warning) => {
                        sendErrorOrWarning(warning, false);
                    }
                };
                response.resolve(scopedLogger);
            }
            else {
                response.reject(new Error('Received an invalid response.'));
            }
        }
    }
}
exports.SubprocessLoggerManager = SubprocessLoggerManager;
//# sourceMappingURL=SubprocessLoggerManager.js.map