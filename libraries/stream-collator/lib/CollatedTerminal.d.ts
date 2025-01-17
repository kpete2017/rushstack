import { ITerminalChunk, TerminalWritable } from '@rushstack/terminal';
/**
 * This API was introduced as a temporary measure.
 * @deprecated Very soon we plan to replace this with the `Terminal` API from `@rushstack/node-core-library`.
 * @beta
 */
export declare class CollatedTerminal {
    private readonly _destination;
    constructor(destination: TerminalWritable);
    writeChunk(chunk: ITerminalChunk): void;
    writeStdoutLine(message: string): void;
    writeStderrLine(message: string): void;
}
//# sourceMappingURL=CollatedTerminal.d.ts.map