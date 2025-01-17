import { CommandLineParser } from '@rushstack/ts-command-line';
import { RushConfiguration } from '../api/RushConfiguration';
import { Telemetry } from '../logic/Telemetry';
import { RushGlobalFolder } from '../api/RushGlobalFolder';
/**
 * Options for `RushCommandLineParser`.
 */
export interface IRushCommandLineParserOptions {
    cwd: string;
    alreadyReportedNodeTooNewError: boolean;
}
export declare class RushCommandLineParser extends CommandLineParser {
    telemetry: Telemetry | undefined;
    rushGlobalFolder: RushGlobalFolder;
    readonly rushConfiguration: RushConfiguration;
    private _debugParameter;
    private _rushOptions;
    constructor(options?: Partial<IRushCommandLineParserOptions>);
    get isDebug(): boolean;
    flushTelemetry(): void;
    protected onDefineParameters(): void;
    protected onExecute(): Promise<void>;
    private _normalizeOptions;
    private _wrapOnExecuteAsync;
    private _populateActions;
    private _populateScriptActions;
    private _addDefaultBuildActions;
    private _addCommandLineConfigActions;
    private _addCommandLineConfigAction;
    private _validateCommandLineConfigParameterAssociations;
    private _validateCommandLineConfigCommand;
    private _reportErrorAndSetExitCode;
}
//# sourceMappingURL=RushCommandLineParser.d.ts.map