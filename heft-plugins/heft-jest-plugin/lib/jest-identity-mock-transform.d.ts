import { InitialOptionsWithRootDir } from '@jest/types/build/Config';
/**
 * This Jest transform handles imports of files like CSS that would normally be
 * processed by a Webpack loader.  Instead of actually loading the resource, we return a mock object.
 * The mock simply returns the imported name as a text string.  For example, `mock.xyz` would evaluate to `"xyz"`.
 * This technique is based on "identity-obj-proxy":
 *
 *   https://www.npmjs.com/package/identity-obj-proxy
 *
 * @privateRemarks
 * (We don't import the actual "identity-obj-proxy" package because transform output gets resolved with respect
 * to the target project folder, not Heft's folder.)
 */
export declare function process(src: string, filename: string, jestOptions: InitialOptionsWithRootDir): string;
//# sourceMappingURL=jest-identity-mock-transform.d.ts.map