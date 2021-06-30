import { Terminal, NewlineKind } from '@rushstack/node-core-library';
import { ILocalizationFile } from '../interfaces';
/**
 * @internal
 */
export interface IParseLocFileOptions {
    terminal: Terminal;
    filePath: string;
    content: string;
    resxNewlineNormalization: NewlineKind | undefined;
}
/**
 * @internal
 */
export declare class LocFileParser {
    static parseLocFile(options: IParseLocFileOptions): ILocalizationFile;
}
//# sourceMappingURL=LocFileParser.d.ts.map