/// <reference types="jest" />
/**
 * api-extractor-test-01
 *
 * @remarks
 * This library is consumed by api-extractor-test-02 and api-extractor-test-03.
 * It tests the basic types of definitions, and all the weird cases for following
 * chains of type aliases.
 *
 * @packageDocumentation
 */
/**
 * A simple, normal definition
 * @public
 */
export interface ISimpleInterface {
}
/**
 * Test different kinds of ambient definitions
 * @public
 */
export declare class AmbientConsumer {
    /**
     * Found via tsconfig.json's "lib" setting, which specifies the built-in "es2015.collection"
     */
    builtinDefinition1(): Map<string, string>;
    /**
     * Found via tsconfig.json's "lib" setting, which specifies the built-in "es2015.promise"
     */
    builtinDefinition2(): Promise<void>;
    /**
     * Configured via tsconfig.json's "lib" setting, which specifies `@types/jest`.
     * The emitted index.d.ts gets a reference like this:  <reference types="jest" />
     */
    definitelyTyped(): jest.MockContext<number, any>;
    /**
     * Found via tsconfig.json's "include" setting point to a *.d.ts file.
     * This is an old-style Definitely Typed definition, which is the worst possible kind,
     * because consumers are expected to provide this, with no idea where it came from.
     */
    localTypings(): IAmbientInterfaceExample;
}
/**
 * Example decorator
 * @public
 */
export declare function virtual(target: Object, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<any>): void;
/**
 * Tests a decorator
 * @public
 */
export declare class DecoratorTest {
    /**
     * Function with a decorator
     */
    test(): void;
}
export { default as AbstractClass } from './AbstractClass';
export { default as AbstractClass2, AbstractClass3 } from './AbstractClass2';
export { ClassWithAccessModifiers } from './AccessModifiers';
export { ClassWithTypeLiterals } from './ClassWithTypeLiterals';
export * from './DeclarationMerging';
export * from './Enums';
export { DefaultExportEdgeCase, default as ClassExportedAsDefault } from './DefaultExportEdgeCase';
/**
 * Test that we can correctly carry default imports into the rollup .d.ts file
 */
import Long, { MAX_UNSIGNED_VALUE } from 'long';
export { MAX_UNSIGNED_VALUE };
/** @public */
export declare class UseLong {
    use_long(): Long;
}
export { ClassWithSymbols, fullyExportedCustomSymbol } from './EcmaScriptSymbols';
export { ForgottenExportConsumer1 } from './ForgottenExportConsumer1';
export { ForgottenExportConsumer2 } from './ForgottenExportConsumer2';
export { ForgottenExportConsumer3 } from './ForgottenExportConsumer3';
export { default as IInterfaceAsDefaultExport } from './IInterfaceAsDefaultExport';
/**
 * Test the alias-following logic:  This class gets aliased twice before being
 * exported from the package.
 */
export { ReexportedClass3 as ReexportedClass } from './ReexportedClass3/ReexportedClass3';
export { TypeReferencesInAedoc } from './TypeReferencesInAedoc';
export { ReferenceLibDirective } from './ReferenceLibDirective';
export { VARIABLE, NamespaceContainingVariable } from './variableDeclarations';
//# sourceMappingURL=index.d.ts.map