import type { HeftConfiguration, HeftSession, IHeftPlugin } from '@rushstack/heft';
/**
 * @internal
 */
export declare class WebpackPlugin implements IHeftPlugin {
    readonly pluginName: string;
    apply(heftSession: HeftSession, heftConfiguration: HeftConfiguration): void;
    private _runWebpackAsync;
    private _emitErrors;
}
//# sourceMappingURL=WebpackPlugin.d.ts.map