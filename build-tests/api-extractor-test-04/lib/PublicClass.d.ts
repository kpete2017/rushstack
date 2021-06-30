/**
 * These are internal constructor parameters for PublicClass's internal constructor.
 * @internal
 */
export interface IPublicClassInternalParameters {
}
/**
 * This is a public class
 * @public
 */
export declare class PublicClass {
    /** @internal */
    constructor(parameters: IPublicClassInternalParameters);
    /**
     * This is a beta field
     * @beta
     */
    betaField: string;
    /**
     * This is a comment
     */
    undecoratedMember(): void;
    /**
     * This is a beta comment
     * @beta
     */
    betaMember(): void;
    /**
     * This is an alpha comment
     * @alpha
     */
    alphaMember(): void;
    /**
     * This is an internal member
     * @internal
     */
    _internalMember(): void;
}
//# sourceMappingURL=PublicClass.d.ts.map