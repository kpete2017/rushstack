export interface IRunResult {
    stdout: string[];
    stderr: string[];
    code: number;
}
export declare function runSudoAsync(command: string, params: string[]): Promise<IRunResult>;
export declare function runAsync(command: string, params: string[]): Promise<IRunResult>;
//# sourceMappingURL=exec.d.ts.map