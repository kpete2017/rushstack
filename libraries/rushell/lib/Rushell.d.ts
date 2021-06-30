/**
 * The returned value for {@link Rushell.execute}.
 * @beta
 */
export interface IRushellExecuteResult {
    /**
     * A text value that was the result of evaluating the script expression.
     */
    value: string;
}
/**
 * The shell command interpreter.
 * @beta
 */
export declare class Rushell {
    execute(script: string): IRushellExecuteResult;
    private _evaluateNode;
    private _evaluateCommand;
}
//# sourceMappingURL=Rushell.d.ts.map