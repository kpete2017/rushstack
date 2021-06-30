import { IPublicClassInternalParameters } from './PublicClass';
/**
 * This is a public class
 * @public
 */
export interface IPublicComplexInterface {
    /**
     * Example of trimming an indexer.
     * @internal
     */
    [key: string]: IPublicClassInternalParameters;
    /**
     * Example of trimming a construct signature.
     * @internal
     */
    new (): any;
}
//# sourceMappingURL=IPublicComplexInterface.d.ts.map