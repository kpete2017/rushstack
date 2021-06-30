/**
 * Docs for DocEnum
 * @public
 * {@docCategory SystemEvent}
 */
export declare enum DocEnum {
    /**
     * These are some docs for Zero
     */
    Zero = 0,
    /**
     * These are some docs for One
     */
    One = 1,
    /**
     * These are some docs for Two
     */
    Two = 2
}
/**
 * Enum that merges with namespace
 *
 * @remarks
 * {@link (DocEnumNamespaceMerge:enum)|Link to enum}
 *
 * {@link (DocEnumNamespaceMerge:namespace)|Link to namespace}
 *
 * {@link (DocEnumNamespaceMerge:namespace).exampleFunction|Link to function inside namespace}
 *
 * @public
 */
export declare enum DocEnumNamespaceMerge {
    /**
     * These are some docs for Left
     */
    Left = 0,
    /**
     * These are some docs for Right
     */
    Right = 1
}
/**
 * Namespace that merges with enum
 * @public
 */
export declare namespace DocEnumNamespaceMerge {
    /**
     * This is a function inside of a namespace that merges with an enum.
     */
    function exampleFunction(): void;
}
//# sourceMappingURL=DocEnums.d.ts.map