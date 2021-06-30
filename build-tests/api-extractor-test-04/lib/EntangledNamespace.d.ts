/**
 * This is a "beta" namespace.
 * @beta
 */
export declare namespace EntangledNamespace {
    /**
     * This is a nested namespace.
     * The "beta" release tag is inherited from the parent.
     */
    namespace N2 {
        /**
         * This class is in a nested namespace.
         * @alpha
         */
        class ClassX {
            /**
             * The "alpha" release tag is inherited from the parent.
             */
            static a: string;
        }
    }
    /**
     * This is a nested namespace.
     * The "beta" release tag is inherited from the parent.
     */
    namespace N3 {
        /**
         * This class is in a nested namespace.
         * @internal
         */
        class _ClassY {
            /**
             * This definition refers to a "alpha" namespaced class.
             */
            b: EntangledNamespace.N2.ClassX;
            /**
             * This definition refers to the type of a "alpha" namespaced member.
             */
            c(): typeof N2.ClassX.a;
        }
    }
}
//# sourceMappingURL=EntangledNamespace.d.ts.map