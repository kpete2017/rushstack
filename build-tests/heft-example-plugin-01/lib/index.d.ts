import { SyncHook } from 'tapable';
import { IHeftPlugin, HeftSession, HeftConfiguration } from '@rushstack/heft';
export declare const enum PluginNames {
    ExamplePlugin01 = "example-plugin-01"
}
export interface IExamplePlugin01Accessor {
    exampleHook: SyncHook;
}
export declare class ExamplePlugin01 implements IHeftPlugin {
    private _accessor;
    pluginName: string;
    get accessor(): IExamplePlugin01Accessor;
    apply(heftSession: HeftSession, heftConfiguration: HeftConfiguration): void;
}
declare const _default: ExamplePlugin01;
export default _default;
//# sourceMappingURL=index.d.ts.map