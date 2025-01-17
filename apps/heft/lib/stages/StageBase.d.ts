import { Terminal } from '@rushstack/node-core-library';
import { AsyncSeriesBailHook, SyncHook, AsyncSeriesHook } from 'tapable';
import { HeftConfiguration } from '../configuration/HeftConfiguration';
import { LoggingManager } from '../pluginFramework/logging/LoggingManager';
/**
 * @public
 */
export interface IStageContext<TStageHooks extends StageHooksBase<TStageProperties>, TStageProperties extends object> {
    hooks: TStageHooks;
    properties: TStageProperties;
}
/**
 * @public
 */
export declare abstract class StageHooksBase<TStageProperties extends object> {
    /**
     * This hook allows the stage's execution to be completely overridden. Only the last-registered plugin
     * with an override hook provided applies.
     *
     * @beta
     */
    readonly overrideStage: AsyncSeriesBailHook<TStageProperties>;
    readonly loadStageConfiguration: AsyncSeriesHook;
    readonly afterLoadStageConfiguration: AsyncSeriesHook;
}
export declare abstract class StageBase<TStageHooks extends StageHooksBase<TStageProperties>, TStageProperties extends object, TStageOptions> {
    readonly stageInitializationHook: SyncHook<IStageContext<TStageHooks, TStageProperties>>;
    protected readonly heftConfiguration: HeftConfiguration;
    protected readonly loggingManager: LoggingManager;
    protected readonly globalTerminal: Terminal;
    protected stageOptions: TStageOptions;
    protected stageProperties: TStageProperties;
    protected stageHooks: TStageHooks;
    private readonly _innerHooksType;
    constructor(heftConfiguration: HeftConfiguration, loggingManager: LoggingManager, innerHooksType: new () => TStageHooks);
    initializeAsync(stageOptions: TStageOptions): Promise<void>;
    executeAsync(): Promise<void>;
    protected abstract getDefaultStagePropertiesAsync(options: TStageOptions): Promise<TStageProperties>;
    protected abstract executeInnerAsync(): Promise<void>;
}
//# sourceMappingURL=StageBase.d.ts.map