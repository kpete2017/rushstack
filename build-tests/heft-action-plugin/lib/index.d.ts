import { IHeftPlugin, HeftSession, HeftConfiguration } from '@rushstack/heft';
declare class HeftActionPlugin implements IHeftPlugin {
    readonly pluginName: string;
    apply(heftSession: HeftSession, heftConfiguration: HeftConfiguration): void;
}
declare const _default: HeftActionPlugin;
export default _default;
//# sourceMappingURL=index.d.ts.map