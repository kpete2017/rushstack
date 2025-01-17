import { ITerminalProvider, Terminal } from '@rushstack/node-core-library';
import { ISubprocessApiCallArg } from './SubprocessCommunication';
import { HeftSession } from '../../pluginFramework/HeftSession';
import { SubprocessCommunicationManagerBase } from './SubprocessCommunicationManagerBase';
import { IScopedLogger } from '../../pluginFramework/logging/ScopedLogger';
export interface ISubprocessInnerConfiguration {
    globalTerminalProviderId: number;
    terminalSupportsColor: boolean;
    terminalEolCharacter: string;
}
export declare const SUBPROCESS_RUNNER_CLASS_LABEL: unique symbol;
export declare const SUBPROCESS_RUNNER_INNER_INVOKE: unique symbol;
/**
 * This base class allows an computationally expensive task to be run in a separate NodeJS
 * process.
 *
 * The subprocess can be provided with a configuration, which must be JSON-serializable,
 * and the subprocess can log data via a Terminal object.
 */
export declare abstract class SubprocessRunnerBase<TSubprocessConfiguration> {
    static [SUBPROCESS_RUNNER_CLASS_LABEL]: boolean;
    private static _subprocessInspectorPort;
    private _terminalProviderManager;
    private _scopedLoggerManager;
    private _subprocessCommunicationManagerInitializationOptions;
    private _innerConfiguration;
    _runningAsSubprocess: boolean;
    protected readonly _configuration: TSubprocessConfiguration;
    protected _globalTerminal: Terminal;
    private readonly _subprocessCommunicationManagers;
    /**
     * The subprocess filename. This should be set to __filename in the child class.
     */
    abstract get filename(): string;
    get runningAsSubprocess(): boolean;
    /**
     * Constructs an instances of a subprocess runner
     */
    constructor(parentGlobalTerminalProvider: ITerminalProvider, configuration: TSubprocessConfiguration, heftSession: HeftSession);
    static initializeSubprocess<TSubprocessConfiguration>(thisType: new (parentGlobalTerminalProvider: ITerminalProvider, configuration: TSubprocessConfiguration, heftSession: HeftSession) => SubprocessRunnerBase<TSubprocessConfiguration>, innerConfiguration: ISubprocessInnerConfiguration, configuration: TSubprocessConfiguration): SubprocessRunnerBase<TSubprocessConfiguration>;
    invokeAsSubprocessAsync(): Promise<void>;
    abstract invokeAsync(): Promise<void>;
    [SUBPROCESS_RUNNER_INNER_INVOKE](): Promise<void>;
    protected registerSubprocessCommunicationManager(communicationManager: SubprocessCommunicationManagerBase): void;
    protected requestScopedLoggerAsync(loggerName: string): Promise<IScopedLogger>;
    private _registerDefaultCommunicationManagers;
    private _processNodeArgsForSubprocess;
    private _receiveMessageFromParentProcess;
    private _receiveMessageFromSubprocess;
    static serializeForIpcMessage(arg: unknown): ISubprocessApiCallArg;
    static deserializeFromIpcMessage(arg: ISubprocessApiCallArg): unknown | undefined;
}
//# sourceMappingURL=SubprocessRunnerBase.d.ts.map