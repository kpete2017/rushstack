/** @beta */
export interface IBeta {
    x: number;
}
/**
 * It's okay for an "alpha" function to reference a "beta" symbol,
 * because "beta" is more public than "alpha".
 * @alpha
 */
export declare function alphaFunctionReturnsBeta(): IBeta;
/**
 * It's not okay for a "public" function to reference a "beta" symbol,
 * because "beta" is less public than "public".
 * @public
 */
export declare function publicFunctionReturnsBeta(): IBeta;
//# sourceMappingURL=index.d.ts.map