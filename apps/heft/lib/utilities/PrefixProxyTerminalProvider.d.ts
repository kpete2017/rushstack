import { Terminal, ITerminalProvider, TerminalProviderSeverity } from '@rushstack/node-core-library';
export declare class PrefixProxyTerminalProvider implements ITerminalProvider {
    private _parent;
    private _prefix;
    constructor(parent: ITerminalProvider, prefix: string);
    static getTerminal(parent: ITerminalProvider, prefix: string): Terminal;
    get supportsColor(): boolean;
    get eolCharacter(): string;
    write(data: string, severity: TerminalProviderSeverity): void;
}
//# sourceMappingURL=PrefixProxyTerminalProvider.d.ts.map