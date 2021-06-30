import { Terminal } from '@rushstack/node-core-library';
export interface IFinishedWords {
    success: string;
    failure: string;
}
export declare class Logging {
    static runFunctionWithLoggingBoundsAsync(terminal: Terminal, name: string, fn: () => Promise<void>, finishedWords?: IFinishedWords): Promise<void>;
}
//# sourceMappingURL=Logging.d.ts.map