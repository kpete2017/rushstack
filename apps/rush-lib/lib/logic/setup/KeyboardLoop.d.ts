/// <reference types="node" />
import * as readline from 'readline';
export declare class KeyboardLoop {
    protected stdin: NodeJS.ReadStream;
    protected stderr: NodeJS.WriteStream;
    private _readlineInterface;
    private _resolvePromise;
    private _rejectPromise;
    private _cursorHidden;
    constructor();
    get capturedInput(): boolean;
    private _captureInput;
    private _uncaptureInput;
    protected hideCursor(): void;
    protected unhideCursor(): void;
    startAsync(): Promise<void>;
    protected resolveAsync(): void;
    protected rejectAsync(error: Error): void;
    /** @virtual */
    protected onStart(): void;
    /** @virtual */
    protected onKeypress(character: string, key: readline.Key): void;
    private _onKeypress;
}
//# sourceMappingURL=KeyboardLoop.d.ts.map