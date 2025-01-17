import { TerminalWritable, ITerminalChunk } from '@rushstack/terminal';
import { CollatedWriter } from './CollatedWriter';
import { CollatedTerminal } from './CollatedTerminal';
/**
 * Constructor options for {@link StreamCollator}.
 *
 * @beta
 */
export interface IStreamCollatorOptions {
    /**
     * The target {@link @rushstack/terminal#TerminalWritable} object that the
     * {@link StreamCollator} will write its output to.
     */
    destination: TerminalWritable;
    /**
     * An event handler that is called when a {@link CollatedWriter} becomes output,
     * before any of its chunks have been written to the destination.
     *
     * @remarks
     *
     * Each `CollatedWriter` object will become active exactly once
     * before the `StreamCollator` completes.
     */
    onWriterActive?: (writer: CollatedWriter) => void;
}
/**
 * A static class which manages the output of multiple threads.
 *
 * @beta
 */
export declare class StreamCollator {
    private _taskNames;
    private _writers;
    private _activeWriter;
    private _openInactiveWriters;
    private _closedInactiveWriters;
    private _onWriterActive;
    private _preventReentrantCall;
    readonly destination: TerminalWritable;
    readonly terminal: CollatedTerminal;
    constructor(options: IStreamCollatorOptions);
    /**
     * Returns the currently active `CollatedWriter`, or `undefined` if no writer
     * is active yet.
     */
    get activeWriter(): CollatedWriter | undefined;
    /**
     * For diagnostic purposes, returns the {@link CollatedWriter.taskName} for the
     * currently active writer, or an empty string if no writer is active.
     */
    get activeTaskName(): string;
    /**
     * The list of writers that have been registered by calling {@link StreamCollator.registerTask},
     * in the order that they were registered.
     */
    get writers(): ReadonlySet<CollatedWriter>;
    /**
     * Registers a new task to be collated, and constructs a {@link CollatedWriter} object
     * to receive its input.
     */
    registerTask(taskName: string): CollatedWriter;
    /** @internal */
    _writerWriteChunk(writer: CollatedWriter, chunk: ITerminalChunk, bufferedChunks: ITerminalChunk[]): void;
    /** @internal */
    _writerClose(writer: CollatedWriter, bufferedChunks: ITerminalChunk[]): void;
    private _assignActiveWriter;
    private _checkForReentrantCall;
}
//# sourceMappingURL=StreamCollator.d.ts.map