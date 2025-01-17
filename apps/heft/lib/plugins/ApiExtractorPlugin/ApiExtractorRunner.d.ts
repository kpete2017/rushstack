import { SubprocessRunnerBase } from '../../utilities/subprocess/SubprocessRunnerBase';
export interface IApiExtractorRunnerConfiguration {
    /**
     * The path to the Extractor's config file ("api-extractor.json")
     *
     * For example, /home/username/code/repo/project/config/api-extractor.json
     */
    apiExtractorJsonFilePath: string;
    /**
     * The path to the @microsoft/api-extractor package
     *
     * For example, /home/username/code/repo/project/node_modules/@microsoft/api-extractor
     */
    apiExtractorPackagePath: string;
    /**
     * The path to the typescript package
     *
     * For example, /home/username/code/repo/project/node_modules/typescript
     */
    typescriptPackagePath: string | undefined;
    /**
     * The folder of the project being built
     *
     * For example, /home/username/code/repo/project
     */
    buildFolder: string;
    /**
     * If set to true, run API Extractor in production mode
     */
    production: boolean;
}
export declare class ApiExtractorRunner extends SubprocessRunnerBase<IApiExtractorRunnerConfiguration> {
    private _scopedLogger;
    private _terminal;
    get filename(): string;
    invokeAsync(): Promise<void>;
}
//# sourceMappingURL=ApiExtractorRunner.d.ts.map