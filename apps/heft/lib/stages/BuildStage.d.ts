import { SyncHook, AsyncParallelHook, AsyncSeriesHook, AsyncSeriesWaterfallHook } from 'tapable';
import { StageBase, StageHooksBase, IStageContext } from './StageBase';
import { HeftConfiguration } from '../configuration/HeftConfiguration';
import { CommandLineAction, CommandLineFlagParameter, CommandLineStringParameter, CommandLineIntegerParameter } from '@rushstack/ts-command-line';
import { LoggingManager } from '../pluginFramework/logging/LoggingManager';
/**
 * @public
 */
export declare class BuildSubstageHooksBase {
    readonly run: AsyncParallelHook;
}
/**
 * @public
 */
export interface IBuildSubstage<TBuildSubstageHooks extends BuildSubstageHooksBase, TBuildSubstageProperties extends object> {
    hooks: TBuildSubstageHooks;
    properties: TBuildSubstageProperties;
}
/**
 * @public
 */
export declare type CopyFromCacheMode = 'hardlink' | 'copy';
/**
 * @public
 */
export declare class CompileSubstageHooks extends BuildSubstageHooksBase {
    /**
     * The `afterCompile` event is fired exactly once, after the "compile" stage completes its first operation.
     * The "bundle" stage will not begin until all event handlers have resolved their promises.  The behavior
     * of this event is the same in watch mode and non-watch mode.
     */
    readonly afterCompile: AsyncParallelHook;
    /**
     * The `afterRecompile` event is only used in watch mode.  It fires whenever the compiler's outputs have
     * been rebuilt.  The initial compilation fires the `afterCompile` event only, and then all subsequent iterations
     * fire the `afterRecompile` event only. Heft does not wait for the `afterRecompile` promises to resolve.
     */
    readonly afterRecompile: AsyncParallelHook;
}
/**
 * @public
 */
export declare class BundleSubstageHooks extends BuildSubstageHooksBase {
    readonly configureWebpack: AsyncSeriesWaterfallHook<unknown>;
    readonly afterConfigureWebpack: AsyncSeriesHook;
}
/**
 * @public
 */
export interface ICompileSubstageProperties {
    typescriptMaxWriteParallelism: number | undefined;
}
/**
 * @public
 */
export interface IBundleSubstageProperties {
    /**
     * If webpack is used, this will be set to the version of the webpack package
     */
    webpackVersion?: string | undefined;
    /**
     * If webpack is used, this will be set to the version of the webpack-dev-server package
     */
    webpackDevServerVersion?: string | undefined;
    /**
     * The configuration used by the Webpack plugin. This must be populated
     * for Webpack to run. If webpackConfigFilePath is specified,
     * this will be populated automatically with the exports of the
     * config file referenced in that property.
     */
    webpackConfiguration?: unknown;
}
/**
 * @public
 */
export interface IPreCompileSubstage extends IBuildSubstage<BuildSubstageHooksBase, {}> {
}
/**
 * @public
 */
export interface ICompileSubstage extends IBuildSubstage<CompileSubstageHooks, ICompileSubstageProperties> {
}
/**
 * @public
 */
export interface IBundleSubstage extends IBuildSubstage<BundleSubstageHooks, IBundleSubstageProperties> {
}
/**
 * @public
 */
export interface IPostBuildSubstage extends IBuildSubstage<BuildSubstageHooksBase, {}> {
}
/**
 * @public
 */
export declare class BuildStageHooks extends StageHooksBase<IBuildStageProperties> {
    readonly preCompile: SyncHook<IPreCompileSubstage>;
    readonly compile: SyncHook<ICompileSubstage>;
    readonly bundle: SyncHook<IBundleSubstage>;
    readonly postBuild: SyncHook<IPostBuildSubstage>;
}
/**
 * @public
 */
export interface IBuildStageProperties {
    production: boolean;
    lite: boolean;
    locale?: string;
    maxOldSpaceSize?: string;
    watchMode: boolean;
    serveMode: boolean;
    webpackStats?: unknown;
    /**
     * @beta
     */
    isTypeScriptProject?: boolean;
    /**
     * @beta
     */
    emitFolderNameForTests?: string;
    /**
     * @beta
     */
    emitExtensionForTests?: '.js' | '.cjs' | '.mjs';
}
/**
 * @public
 */
export interface IBuildStageContext extends IStageContext<BuildStageHooks, IBuildStageProperties> {
}
export interface IBuildStageOptions {
    production: boolean;
    lite: boolean;
    locale?: string;
    maxOldSpaceSize?: string;
    watchMode: boolean;
    serveMode: boolean;
    typescriptMaxWriteParallelism?: number;
}
export interface IBuildStageStandardParameters {
    productionFlag: CommandLineFlagParameter;
    localeParameter: CommandLineStringParameter;
    liteFlag: CommandLineFlagParameter;
    typescriptMaxWriteParallelismParameter: CommandLineIntegerParameter;
    maxOldSpaceSizeParameter: CommandLineStringParameter;
}
export declare class BuildStage extends StageBase<BuildStageHooks, IBuildStageProperties, IBuildStageOptions> {
    constructor(heftConfiguration: HeftConfiguration, loggingManager: LoggingManager);
    static defineStageStandardParameters(action: CommandLineAction): IBuildStageStandardParameters;
    static getOptionsFromStandardParameters(standardParameters: IBuildStageStandardParameters): Omit<IBuildStageOptions, 'watchMode' | 'serveMode'>;
    protected getDefaultStagePropertiesAsync(options: IBuildStageOptions): Promise<IBuildStageProperties>;
    protected executeInnerAsync(): Promise<void>;
    private _runSubstageWithLoggingAsync;
}
//# sourceMappingURL=BuildStage.d.ts.map