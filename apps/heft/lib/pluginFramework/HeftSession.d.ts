import { SyncHook } from 'tapable';
import { MetricsCollector, MetricsCollectorHooks } from '../metrics/MetricsCollector';
import { ICleanStageContext } from '../stages/CleanStage';
import { IBuildStageContext } from '../stages/BuildStage';
import { ITestStageContext } from '../stages/TestStage';
import { IHeftPlugin } from './IHeftPlugin';
import { IInternalHeftSessionOptions } from './InternalHeftSession';
import { ScopedLogger } from './logging/ScopedLogger';
import { ICustomActionOptions } from '../cli/actions/CustomAction';
import { IHeftLifecycle } from './HeftLifecycle';
/** @beta */
export declare type RegisterAction = <TParameters>(action: ICustomActionOptions<TParameters>) => void;
/**
 * @public
 */
export interface IHeftSessionHooks {
    metricsCollector: MetricsCollectorHooks;
    /** @internal */
    heftLifecycle: SyncHook<IHeftLifecycle>;
    build: SyncHook<IBuildStageContext>;
    clean: SyncHook<ICleanStageContext>;
    test: SyncHook<ITestStageContext>;
}
export interface IHeftSessionOptions {
    plugin: IHeftPlugin;
    /**
     * @beta
     */
    requestAccessToPluginByName: RequestAccessToPluginByNameCallback;
}
/**
 * @beta
 */
export declare type RequestAccessToPluginByNameCallback = (pluginToAccessName: string, pluginApply: (pluginAccessor: object) => void) => void;
/**
 * @public
 */
export declare class HeftSession {
    private readonly _loggingManager;
    private readonly _options;
    private readonly _getIsDebugMode;
    readonly hooks: IHeftSessionHooks;
    /**
     * @internal
     */
    readonly metricsCollector: MetricsCollector;
    /**
     * If set to true, the build is running with the --debug flag
     */
    get debugMode(): boolean;
    /** @beta */
    readonly registerAction: RegisterAction;
    /**
     * Call this function to receive a callback with the plugin if and after the specified plugin
     * has been applied. This is used to tap hooks on another plugin.
     *
     * @beta
     */
    readonly requestAccessToPluginByName: RequestAccessToPluginByNameCallback;
    /**
     * @internal
     */
    constructor(options: IHeftSessionOptions, internalSessionOptions: IInternalHeftSessionOptions);
    /**
     * Call this function to request a logger with the specified name.
     */
    requestScopedLogger(loggerName: string): ScopedLogger;
}
//# sourceMappingURL=HeftSession.d.ts.map