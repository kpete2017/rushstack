import { Terminal, NewlineKind } from '@rushstack/node-core-library';
import { ILocalizationFile } from '../interfaces';
export interface IResxReaderOptions {
    resxFilePath: string;
    terminal: Terminal;
    newlineNormalization: NewlineKind | undefined;
}
export declare class ResxReader {
    static readResxFileAsLocFile(options: IResxReaderOptions): ILocalizationFile;
    static readResxAsLocFile(resxContents: string, options: IResxReaderOptions): ILocalizationFile;
    private static _readResxAsLocFileInternal;
    private static _readDataElement;
    private static _readTextElement;
    private static _logErrorWithLocation;
    private static _logWarningWithLocation;
    private static _logWithLocation;
}
//# sourceMappingURL=ResxReader.d.ts.map