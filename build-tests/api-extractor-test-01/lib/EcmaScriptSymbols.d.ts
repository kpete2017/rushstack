/// <reference lib="es2015.symbol.wellknown" />
declare const unexportedCustomSymbol: unique symbol;
export declare const locallyExportedCustomSymbol: unique symbol;
/** @public */
export declare const fullyExportedCustomSymbol: unique symbol;
/** @public */
export declare namespace ANamespace {
    const locallyExportedCustomSymbol: unique symbol;
    /** @public */
    const fullyExportedCustomSymbol: unique symbol;
}
/**
 * @public
 */
export declare class ClassWithSymbols {
    readonly [unexportedCustomSymbol]: number;
    get [locallyExportedCustomSymbol](): string;
    [fullyExportedCustomSymbol](): void;
    get [ANamespace.locallyExportedCustomSymbol](): string;
    [ANamespace.fullyExportedCustomSymbol](): void;
    get [Symbol.toStringTag](): string;
}
export {};
//# sourceMappingURL=EcmaScriptSymbols.d.ts.map