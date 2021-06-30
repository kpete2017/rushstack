import { CommandLineParser } from '@rushstack/ts-command-line';
import { Terminal } from '@rushstack/node-core-library';
export declare class HeftToolsCommandLineParser extends CommandLineParser {
    private _terminalProvider;
    private _terminal;
    private _loggingManager;
    private _metricsCollector;
    private _pluginManager;
    private _heftConfiguration;
    private _internalHeftSession;
    private _heftLifecycleHook;
    private _preInitializationArgumentValues;
    private _unmanagedFlag;
    private _debugFlag;
    private _pluginsParameter;
    get isDebug(): boolean;
    get terminal(): Terminal;
    constructor();
    protected onDefineParameters(): void;
    execute(args?: string[]): Promise<boolean>;
    private _checkForUpgradeAsync;
    protected onExecute(): Promise<void>;
    private _normalizeCwd;
    private _getPreInitializationArgumentValues;
    private _initializePluginsAsync;
    private _reportErrorAndSetExitCode;
}
//# sourceMappingURL=HeftToolsCommandLineParser.d.ts.map