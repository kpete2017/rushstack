import { AsyncParallelHook, SyncHook } from 'tapable';
/**
 * @public
 */
export interface IMetricsData {
    /**
     * The command that was executed.
     */
    command: string;
    /**
     * The amount of time the command took to execute, in milliseconds.
     */
    taskTotalExecutionMs: number;
    /**
     * The name of the operating system provided by NodeJS.
     */
    machineOs: string;
    /**
     * The processor's architecture.
     */
    machineArch: string;
    /**
     * The number of processor cores.
     */
    machineCores: number;
    /**
     * The processor's model name.
     */
    machineProcessor: string;
    /**
     * The total amount of memory the machine has, in megabytes.
     */
    machineTotalMemoryMB: number;
}
/**
 * Tap these hooks to record build metrics, to a file, for example.
 *
 * @public
 */
export declare class MetricsCollectorHooks {
    /**
     * This hook is called when a metric is recorded.
     */
    recordMetric: SyncHook<string, IMetricsData>;
    /**
     * This hook is called when collected metrics should be flushed
     */
    flush: AsyncParallelHook;
    /**
     * This hook is called when collected metrics should be flushed and no more metrics will be collected.
     */
    flushAndTeardown: AsyncParallelHook;
}
/**
 * @internal
 */
export interface IPerformanceData {
    taskTotalExecutionMs: number;
}
/**
 * @internal
 * A simple performance metrics collector. A plugin is required to pipe data anywhere.
 */
export declare class MetricsCollector {
    readonly hooks: MetricsCollectorHooks;
    private _hasBeenTornDown;
    private _startTimeMs;
    /**
     * Start metrics log timer.
     */
    setStartTime(): void;
    /**
     * Record metrics to the installed plugin(s).
     *
     * @param command - Describe the user command, e.g. `start` or `build`
     * @param params - Optional parameters
     */
    record(command: string, performanceData?: Partial<IPerformanceData>): void;
    /**
     * Flushes all pending logged metrics.
     */
    flushAsync(): Promise<void>;
    /**
     * Flushes all pending logged metrics and closes the MetricsCollector instance.
     */
    flushAndTeardownAsync(): Promise<void>;
}
//# sourceMappingURL=MetricsCollector.d.ts.map