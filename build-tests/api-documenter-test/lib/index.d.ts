/**
 * api-extractor-test-05
 *
 * This project tests various documentation generation scenarios and
 * doc comment syntaxes.
 *
 * @packageDocumentation
 */
export * from './DocClass1';
export * from './DocEnums';
import { IDocInterface1, IDocInterface3, SystemEvent } from './DocClass1';
export { DecoratorExample } from './DecoratorExample';
/**
 * A type alias
 * @public
 */
export declare type ExampleTypeAlias = Promise<boolean>;
/**
 * A type alias that references multiple other types.
 * @public
 */
export declare type ExampleUnionTypeAlias = IDocInterface1 | IDocInterface3;
/**
 * A type alias that has duplicate references.
 * @public
 */
export declare type ExampleDuplicateTypeAlias = SystemEvent | typeof SystemEvent;
/**
 * An exported variable declaration.
 * @public
 */
export declare const constVariable: number;
/**
 * An exported function with hyperlinked parameters and return value.
 *
 * @param x - an API item that should get hyperlinked
 * @param y - a system type that should NOT get hyperlinked
 * @returns an interface that should get hyperlinked
 * @public
 */
export declare function exampleFunction(x: ExampleTypeAlias, y: number): IDocInterface1;
/**
 * A top-level namespace
 * @public
 */
export declare namespace OuterNamespace {
    /**
     * A nested namespace
     */
    namespace InnerNamespace {
        /**
         * A function inside a namespace
         */
        function nestedFunction(x: number): number;
    }
    /**
     * A variable exported from within a namespace.
     */
    let nestedVariable: boolean;
}
/**
 * @public
 */
export declare function yamlReferenceUniquenessTest(): IDocInterface1;
/**
 * @public
 */
export declare type TypeAlias = number;
/**
 * @public
 */
export declare type GenericTypeAlias<T> = T[];
//# sourceMappingURL=index.d.ts.map