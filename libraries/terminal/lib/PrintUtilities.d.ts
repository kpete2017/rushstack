import { Terminal } from '@rushstack/node-core-library';
/**
 * A sensible fallback column width for consoles.
 *
 * @public
 */
export declare const DEFAULT_CONSOLE_WIDTH: number;
/**
 * A collection of utilities for printing messages to the console.
 *
 * @public
 */
export declare class PrintUtilities {
    /**
     * Returns the width of the console, measured in columns
     */
    static getConsoleWidth(): number | undefined;
    /**
     * Applies word wrapping.  If maxLineLength is unspecified, then it defaults to the
     * console width.
     */
    static wrapWords(text: string, maxLineLength?: number, indent?: number): string;
    /**
     * Displays a message in the console wrapped in a box UI.
     *
     * @param boxWidth - The width of the box, defaults to half of the console width.
     */
    static printMessageInBox(message: string, terminal: Terminal, boxWidth?: number): void;
}
//# sourceMappingURL=PrintUtilities.d.ts.map