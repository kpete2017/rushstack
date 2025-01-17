import { ITerminalProvider } from '@rushstack/node-core-library';
import { ExtendedTypeScript } from './internalTypings/TypeScriptInternals';
import { SubprocessRunnerBase } from '../../utilities/subprocess/SubprocessRunnerBase';
import { PerformanceMeasurer, PerformanceMeasurerAsync } from '../../utilities/Performance';
import { Tslint } from './Tslint';
import { Eslint } from './Eslint';
import { HeftSession } from '../../pluginFramework/HeftSession';
import { ISharedTypeScriptConfiguration } from './TypeScriptPlugin';
export interface ITypeScriptBuilderConfiguration extends ISharedTypeScriptConfiguration {
    buildFolder: string;
    typeScriptToolPath: string;
    tslintToolPath: string | undefined;
    eslintToolPath: string | undefined;
    lintingEnabled: boolean;
    watchMode: boolean;
    /**
     * The path to the tsconfig file being built.
     */
    tsconfigPath: string;
    /**
     * The path of project's build cache folder
     */
    buildCacheFolder: string;
    /**
     * Set this to change the maximum number of file handles that will be opened concurrently for writing.
     * The default is 50.
     */
    maxWriteParallelism: number;
}
export declare class TypeScriptBuilder extends SubprocessRunnerBase<ITypeScriptBuilderConfiguration> {
    private _typescriptVersion;
    private _typescriptParsedVersion;
    private _capabilities;
    private _useIncrementalProgram;
    private _eslintEnabled;
    private _tslintEnabled;
    private _moduleKindsToEmit;
    private _eslintConfigFilePath;
    private _tslintConfigFilePath;
    private _typescriptLogger;
    private _typescriptTerminal;
    private _emitCompletedCallbackManager;
    private __tsCacheFilePath;
    private _tsReadJsonCache;
    private _cachedFileSystem;
    get filename(): string;
    private get _tsCacheFilePath();
    constructor(parentGlobalTerminalProvider: ITerminalProvider, configuration: ITypeScriptBuilderConfiguration, heftSession: HeftSession, emitCallback: () => void);
    invokeAsync(): Promise<void>;
    _runWatch(ts: ExtendedTypeScript, measureTsPerformance: PerformanceMeasurer): Promise<void>;
    _runBuild(ts: ExtendedTypeScript, eslint: Eslint | undefined, tslint: Tslint | undefined, measureTsPerformance: PerformanceMeasurer, measureTsPerformanceAsync: PerformanceMeasurerAsync): Promise<void>;
    private _printDiagnosticMessage;
    private _getAdjustedDiagnosticCategory;
    private _emit;
    private _validateTsconfig;
    private _addModuleKindToEmit;
    private _loadTsconfig;
    private _buildIncrementalCompilerHost;
    private _buildWatchCompilerHost;
    private _overrideTypeScriptReadJson;
    private _parseModuleKind;
}
//# sourceMappingURL=TypeScriptBuilder.d.ts.map