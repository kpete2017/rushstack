import { StageBase, StageHooksBase, IStageContext } from './StageBase';
import { HeftConfiguration } from '../configuration/HeftConfiguration';
import { AsyncSeriesHook, AsyncParallelHook } from 'tapable';
import { LoggingManager } from '../pluginFramework/logging/LoggingManager';
/**
 * @public
 */
export declare class TestStageHooks extends StageHooksBase<ITestStageProperties> {
    readonly run: AsyncParallelHook;
    readonly configureTest: AsyncSeriesHook;
}
/**
 * @public
 */
export interface ITestStageProperties {
    watchMode: boolean;
    updateSnapshots: boolean;
    findRelatedTests: ReadonlyArray<string> | undefined;
    passWithNoTests: boolean | undefined;
    silent: boolean | undefined;
    testNamePattern: string | undefined;
    testPathPattern: ReadonlyArray<string> | undefined;
    testTimeout: number | undefined;
    detectOpenHandles: boolean | undefined;
    debugHeftReporter: boolean | undefined;
    maxWorkers: string | undefined;
}
/**
 * @public
 */
export interface ITestStageContext extends IStageContext<TestStageHooks, ITestStageProperties> {
}
export interface ITestStageOptions {
    watchMode: boolean;
    updateSnapshots: boolean;
    findRelatedTests: ReadonlyArray<string> | undefined;
    passWithNoTests: boolean | undefined;
    silent: boolean | undefined;
    testNamePattern: string | undefined;
    testPathPattern: ReadonlyArray<string> | undefined;
    testTimeout: number | undefined;
    detectOpenHandles: boolean | undefined;
    debugHeftReporter: boolean | undefined;
    maxWorkers: string | undefined;
}
export declare class TestStage extends StageBase<TestStageHooks, ITestStageProperties, ITestStageOptions> {
    constructor(heftConfiguration: HeftConfiguration, loggingManager: LoggingManager);
    protected getDefaultStagePropertiesAsync(options: ITestStageOptions): Promise<ITestStageProperties>;
    protected executeInnerAsync(): Promise<void>;
}
//# sourceMappingURL=TestStage.d.ts.map