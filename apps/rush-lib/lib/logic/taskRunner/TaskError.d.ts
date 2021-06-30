/**
 * Encapsulates information about an error
 */
export declare class TaskError extends Error {
    protected _type: string;
    constructor(type: string, message: string);
    get message(): string;
    toString(): string;
}
/**
 * TestTaskError extends TaskError
 */
export declare class BuildTaskError extends TaskError {
    protected _file: string;
    protected _line: number;
    protected _offset: number;
    constructor(type: string, message: string, file: string, line: number, offset: number);
    get message(): string;
    toString(): string;
}
//# sourceMappingURL=TaskError.d.ts.map