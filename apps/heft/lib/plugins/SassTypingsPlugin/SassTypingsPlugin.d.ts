import { IHeftPlugin } from '../../pluginFramework/IHeftPlugin';
import { HeftSession } from '../../pluginFramework/HeftSession';
import { HeftConfiguration } from '../../configuration/HeftConfiguration';
import { ISassConfiguration } from './SassTypingsGenerator';
export interface ISassConfigurationJson extends ISassConfiguration {
}
export declare class SassTypingsPlugin implements IHeftPlugin {
    readonly pluginName: string;
    /**
     * Generate typings for Sass files before TypeScript compilation.
     */
    apply(heftSession: HeftSession, heftConfiguration: HeftConfiguration): void;
    private _runSassTypingsGeneratorAsync;
    private _loadSassConfigurationAsync;
}
//# sourceMappingURL=SassTypingsPlugin.d.ts.map