import type { IBuildStageProperties, ScopedLogger } from '@rushstack/heft';
import { IWebpackConfiguration } from './shared';
export declare class WebpackConfigurationLoader {
    static tryLoadWebpackConfigAsync(logger: ScopedLogger, buildFolder: string, buildProperties: IBuildStageProperties): Promise<IWebpackConfiguration | undefined>;
    private static _tryLoadWebpackConfiguration;
}
//# sourceMappingURL=WebpackConfigurationLoader.d.ts.map