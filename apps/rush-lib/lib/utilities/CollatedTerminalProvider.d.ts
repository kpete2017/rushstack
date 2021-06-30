import { ITerminalProvider, TerminalProviderSeverity } from '@rushstack/node-core-library';
import { CollatedTerminal } from '@rushstack/stream-collator';
export declare class CollatedTerminalProvider implements ITerminalProvider {
    private readonly _collatedTerminal;
    private _hasErrors;
    private _hasWarnings;
    readonly supportsColor: boolean;
    readonly eolCharacter: string;
    get hasErrors(): boolean;
    get hasWarnings(): boolean;
    constructor(collatedTerminal: CollatedTerminal);
    write(data: string, severity: TerminalProviderSeverity): void;
}
//# sourceMappingURL=CollatedTerminalProvider.d.ts.map