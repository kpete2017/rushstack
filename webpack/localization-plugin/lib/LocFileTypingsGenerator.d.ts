import { StringValuesTypingsGenerator } from '@rushstack/typings-generator';
import { Terminal, NewlineKind } from '@rushstack/node-core-library';
/**
 * @public
 */
export interface ITypingsGeneratorOptions {
    srcFolder: string;
    generatedTsFolder: string;
    terminal?: Terminal;
    exportAsDefault?: boolean;
    filesToIgnore?: string[];
    resxNewlineNormalization?: NewlineKind | undefined;
}
/**
 * This is a simple tool that generates .d.ts files for .loc.json and .resx files.
 *
 * @public
 */
export declare class LocFileTypingsGenerator extends StringValuesTypingsGenerator {
    constructor(options: ITypingsGeneratorOptions);
}
//# sourceMappingURL=LocFileTypingsGenerator.d.ts.map