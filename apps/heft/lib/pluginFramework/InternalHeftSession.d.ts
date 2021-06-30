import { SyncHook } from 'tapable';
import { IHeftPlugin } from './IHeftPlugin';
import { HeftSession, RegisterAction } from './HeftSession';
import { BuildStage } from '../stages/BuildStage';
import { CleanStage } from '../stages/CleanStage';
import { TestStage } from '../stages/TestStage';
import { MetricsCollector } from '../metrics/MetricsCollector';
import { LoggingManager } from './logging/LoggingManager';
import { IHeftLifecycle } from './HeftLifecycle';
/**
 * @internal
 */
export interface IInternalHeftSessionOptions {
    heftLifecycleHook: SyncHook<IHeftLifecycle>;
    buildStage: BuildStage;
    cleanStage: CleanStage;
    testStage: TestStage;
    metricsCollector: MetricsCollector;
    loggingManager: LoggingManager;
    getIsDebugMode(): boolean;
    registerAction: RegisterAction;
}
/**
 * @internal
 */
export declare class InternalHeftSession {
    private readonly _options;
    private _pluginHooks;
    constructor(options: IInternalHeftSessionOptions);
    getSessionForPlugin(thisPlugin: IHeftPlugin): HeftSession;
    applyPluginHooks(plugin: IHeftPlugin): void;
}
//# sourceMappingURL=InternalHeftSession.d.ts.map