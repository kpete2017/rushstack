import { IHeftPlugin } from '../IHeftPlugin';
import { ScopedLogger } from './ScopedLogger';
import { ITerminalProvider } from '@rushstack/node-core-library';
import { FileErrorFormat } from './FileError';
export interface ILoggingManagerOptions {
    terminalProvider: ITerminalProvider;
}
export declare class LoggingManager {
    private _options;
    private _scopedLoggers;
    private _shouldPrintStacks;
    private _hasAnyErrors;
    get errorsHaveBeenEmitted(): boolean;
    constructor(options: ILoggingManagerOptions);
    enablePrintStacks(): void;
    requestScopedLogger(plugin: IHeftPlugin, loggerName: string): ScopedLogger;
    getErrorStrings(fileErrorFormat?: FileErrorFormat): string[];
    getWarningStrings(fileErrorFormat?: FileErrorFormat): string[];
    static getErrorMessage(error: Error, fileErrorFormat?: FileErrorFormat): string;
}
//# sourceMappingURL=LoggingManager.d.ts.map