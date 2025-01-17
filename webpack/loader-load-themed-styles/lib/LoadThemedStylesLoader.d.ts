/**
 * This simple loader wraps the loading of CSS in script equivalent to
 *  require("load-themed-styles").loadStyles('... css text ...').
 * @packageDocumentation
 */
import { loader } from 'webpack';
/**
 * Options for the loader.
 *
 * @public
 */
export interface ILoadThemedStylesLoaderOptions {
    /**
     * If this parameter is specified, override the name of the value exported from this loader. This is useful in
     *  exporting as the default in es6 module import scenarios. See the README for more information.
     */
    namedExport?: string;
    /**
     * If this parameter is set to "true," the "loadAsync" parameter is set to true in the call to loadStyles.
     * Defaults to false.
     */
    async?: boolean;
}
/**
 * This simple loader wraps the loading of CSS in script equivalent to
 *  require("load-themed-styles").loadStyles('... css text ...').
 *
 * @public
 */
export declare class LoadThemedStylesLoader {
    private static _loadedThemedStylesPath;
    constructor();
    static set loadedThemedStylesPath(value: string);
    /**
     * Use this property to override the path to the `@microsoft/load-themed-styles` package.
     */
    static get loadedThemedStylesPath(): string;
    /**
     * Reset the path to the `@microsoft/load-themed-styles package` to the default.
     */
    static resetLoadedThemedStylesPath(): void;
    static pitch(this: loader.LoaderContext, remainingRequest: string): string;
}
//# sourceMappingURL=LoadThemedStylesLoader.d.ts.map