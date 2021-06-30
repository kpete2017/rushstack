export declare const enum FileErrorFormat {
    Unix = 0,
    VisualStudio = 1
}
/**
 * An `Error` subclass that should be thrown to report an unexpected state that specifically references
 * a location in a file.
 *
 * @public
 */
export declare class FileError extends Error {
    /**
     * Use this instance property to reliably detect if an instance of a class is an instance of FileError
     */
    readonly filePath: string;
    readonly line: number | undefined;
    readonly column: number | undefined;
    /**
     * Constructs a new instance of the {@link FileError} class.
     *
     * @param message - A message describing the error.
     */
    constructor(message: string, filePath: string, line?: number, column?: number);
    /** @override */
    toString(format?: FileErrorFormat): string;
    static [Symbol.hasInstance](instance: object): boolean;
}
//# sourceMappingURL=FileError.d.ts.map