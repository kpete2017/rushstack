import { Token } from './Tokenizer';
import { TextRange } from './TextRange';
export declare const enum AstKind {
    None = "None",
    Script = "Script",
    AndIf = "AndIf",
    Command = "Command",
    CompoundWord = "CompoundWord",
    VariableExpansion = "VariableExpansion",
    Text = "Text"
}
/**
 * Base class for all AST nodes.
 */
export declare abstract class AstBaseNode {
    readonly kind: AstKind;
    range: TextRange | undefined;
    /**
     * Returns a diagnostic dump of the tree, showing the prefix/suffix/separator for
     * each node.
     */
    getDump(indent?: string): string;
    getChildNodes(): AstNode[];
    getFullRange(): TextRange;
    protected abstract collectChildNodesInto(nodes: AstNode[]): void;
    protected getDumpText(): string | undefined;
}
/**
 * Represents a complete script that can be executed.
 */
export declare class AstScript extends AstBaseNode {
    readonly kind: AstKind.Script;
    body: AstNode | undefined;
    /** @override */
    protected collectChildNodesInto(nodes: AstNode[]): void;
}
/**
 * Represents the "&&" operator, which is used to join two individual commands.
 */
export declare class AstAndIf extends AstBaseNode {
    readonly kind: AstKind.AndIf;
    /**
     * The command that executes first, and always.
     */
    firstCommand: AstCommand | undefined;
    /**
     * The command that executes second, and only if the first one succeeds.
     */
    secondCommand: AstCommand | undefined;
    /** @override */
    protected collectChildNodesInto(nodes: AstNode[]): void;
}
/**
 * Represents a command.  For example, the name of an executable to be started.
 */
export declare class AstCommand extends AstBaseNode {
    readonly kind: AstKind.Command;
    commandPath: AstCompoundWord | undefined;
    arguments: AstCompoundWord[];
    /** @override */
    protected collectChildNodesInto(nodes: AstNode[]): void;
}
/**
 * Represents a compound word, e.g. "--the-thing" or "./the/thing".
 */
export declare class AstCompoundWord extends AstBaseNode {
    readonly kind: AstKind.CompoundWord;
    readonly parts: AstNode[];
    /** @override */
    protected collectChildNodesInto(nodes: AstNode[]): void;
}
/**
 * Represents an environment variable expansion expression, e.g. "${VARIABLE}"
 */
export declare class AstVariableExpansion extends AstBaseNode {
    readonly kind: AstKind.VariableExpansion;
    /** @override */
    protected collectChildNodesInto(nodes: AstNode[]): void;
}
/**
 * Represents some plain text.
 */
export declare class AstText extends AstBaseNode {
    readonly kind: AstKind.Text;
    token: Token | undefined;
    /** @override */
    protected collectChildNodesInto(nodes: AstNode[]): void;
    /** @override */
    protected getDumpText(): string | undefined;
}
export declare type AstNode = AstScript | AstAndIf | AstCommand | AstCompoundWord | AstVariableExpansion | AstText;
//# sourceMappingURL=AstNode.d.ts.map