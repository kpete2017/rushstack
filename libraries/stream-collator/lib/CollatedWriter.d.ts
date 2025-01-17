import { ITerminalChunk, TerminalWritable } from '@rushstack/terminal';
import { StreamCollator } from './StreamCollator';
import { CollatedTerminal } from './CollatedTerminal';
/**
 * An writable interface for managing output of simultaneous processes.
 *
 * @beta
 */
export declare class CollatedWriter extends TerminalWritable {
    private readonly _collator;
    private readonly _bufferedChunks;
    readonly taskName: string;
    readonly terminal: CollatedTerminal;
    constructor(taskName: string, collator: StreamCollator);
    /**
     * Returns true if this is the active writer for its associated {@link StreamCollator}.
     */
    get isActive(): boolean;
    /**
     * For diagnostic purposes, if the writer is buffering chunks because it has
     * not become active yet, they can be inspected via this property.
     */
    get bufferedChunks(): ReadonlyArray<ITerminalChunk>;
    /** {@inheritDoc @rushstack/terminal#TerminalWritable.onWriteChunk} */
    onWriteChunk(chunk: ITerminalChunk): void;
    /** {@inheritDoc @rushstack/terminal#TerminalWritable.onClose} */
    onClose(): void;
    /** @internal */
    _flushBufferedChunks(): void;
}
//# sourceMappingURL=CollatedWriter.d.ts.map