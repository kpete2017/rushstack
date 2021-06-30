import { Terminal } from '@rushstack/node-core-library';
/**
 * @public
 */
export interface ITypingsGeneratorOptions<TTypingsResult = string | undefined> {
    srcFolder: string;
    generatedTsFolder: string;
    fileExtensions: string[];
    parseAndGenerateTypings: (fileContents: string, filePath: string) => TTypingsResult | Promise<TTypingsResult>;
    terminal?: Terminal;
    filesToIgnore?: string[];
}
/**
 * This is a simple tool that generates .d.ts files for non-TS files.
 *
 * @public
 */
export declare class TypingsGenerator {
    private _targetMap;
    private _dependencyMap;
    protected _options: ITypingsGeneratorOptions;
    private _filesToIgnoreVal;
    constructor(options: ITypingsGeneratorOptions);
    generateTypingsAsync(): Promise<void>;
    runWatcherAsync(): Promise<void>;
    /**
     * Register file dependencies that may effect the typings of a target file.
     * Note: This feature is only useful in watch mode.
     * The registerDependency method must be called in the body of parseAndGenerateTypings every
     * time because the registry for a file is cleared at the beginning of processing.
     */
    registerDependency(target: string, dependency: string): void;
    private _parseFileAndGenerateTypingsAsync;
    private get _filesToIgnore();
    private _clearDependencies;
    private _getDependencyTargets;
    private _getTypingsFilePath;
    private _normalizeFileExtensions;
}
//# sourceMappingURL=TypingsGenerator.d.ts.map