import { InitialOptionsWithRootDir } from '@jest/types/build/Config';
import { TransformedSource } from '@jest/transform';
/**
 * This Jest transformer maps TS files under a 'src' folder to their compiled equivalent under 'lib'
 */
export declare function process(srcCode: string, srcFilePath: string, jestOptions: InitialOptionsWithRootDir): TransformedSource;
//# sourceMappingURL=jest-build-transform.d.ts.map