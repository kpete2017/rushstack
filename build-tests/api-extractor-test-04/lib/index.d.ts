/**
 * api-extractor-test-04
 *
 * Test scenarios for trimming alpha/beta/internal definitions from the generated *.d.ts files.
 *
 * @packageDocumentation
 */
export { AlphaClass } from './AlphaClass';
export { BetaClass } from './BetaClass';
export { PublicClass, IPublicClassInternalParameters } from './PublicClass';
export { InternalClass } from './InternalClass';
export { EntangledNamespace } from './EntangledNamespace';
export * from './EnumExamples';
export { BetaInterface } from './BetaInterface';
/**
 * This is a module-scoped variable.
 * @beta
 */
export declare const variableDeclaration: string;
import { AlphaClass } from './AlphaClass';
/**
 * This is an exported type alias.
 * @alpha
 */
export declare type ExportedAlias = AlphaClass;
export { IPublicComplexInterface } from './IPublicComplexInterface';
export { Lib1Interface } from 'api-extractor-lib1-test';
//# sourceMappingURL=index.d.ts.map