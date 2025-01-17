import * as childProcess from 'child_process';
import { ISubprocessMessageBase } from './SubprocessCommunication';
export declare type SendMessageFunctionType = (message: ISubprocessMessageBase) => void;
export interface ISubprocessCommunicationManagerInitializationOptions {
    sendMessageToParentProcess: SendMessageFunctionType;
    sendMessageToSubprocess: SendMessageFunctionType;
}
export declare abstract class SubprocessCommunicationManagerBase {
    private _sendMessageToParentProcess;
    private _sendMessageToSubprocess;
    protected get sendMessageToParentProcess(): SendMessageFunctionType;
    protected get sendMessageToSubprocess(): SendMessageFunctionType;
    initialize(options: ISubprocessCommunicationManagerInitializationOptions): void;
    registerSubprocess(subprocess: childProcess.ChildProcess): void;
    abstract canHandleMessageFromSubprocess(message: ISubprocessMessageBase): boolean;
    abstract receiveMessageFromSubprocess(message: ISubprocessMessageBase): void;
    abstract canHandleMessageFromParentProcess(message: ISubprocessMessageBase): boolean;
    abstract receiveMessageFromParentProcess(message: ISubprocessMessageBase): void;
}
//# sourceMappingURL=SubprocessCommunicationManagerBase.d.ts.map