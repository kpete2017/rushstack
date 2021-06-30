/**
 * This class illustrates some cases involving type literals.
 * @public
 */
export declare class ClassWithTypeLiterals {
    /** type literal in  */
    method1(vector: {
        x: number;
        y: number;
    }): void;
    /** type literal output  */
    method2(): {
        classValue: ClassWithTypeLiterals;
        callback: () => number;
    } | undefined;
}
//# sourceMappingURL=ClassWithTypeLiterals.d.ts.map