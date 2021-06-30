import { InitialOptionsWithRootDir } from '@jest/types/build/Config';
/**
 * This Jest transform handles imports of data files (e.g. .png, .jpg) that would normally be
 * processed by a Webpack's file-loader. Instead of actually loading the resource, we return the file's name.
 * Webpack's file-loader normally returns the resource's URL, and the filename is an equivalent for a Node
 * environment.
 */
export declare function process(src: string, filename: string, jestOptions: InitialOptionsWithRootDir): string;
//# sourceMappingURL=jest-string-mock-transform.d.ts.map