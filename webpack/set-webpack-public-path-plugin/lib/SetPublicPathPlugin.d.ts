import * as Webpack from 'webpack';
/**
 * The base options for setting the webpack public path at runtime.
 *
 * @public
 */
export interface ISetWebpackPublicPathOptions {
    /**
     * Use the System.baseURL property if it is defined.
     */
    systemJs?: boolean;
    /**
     * Use the specified string as a URL prefix after the SystemJS path or the publicPath option.
     * If neither systemJs nor publicPath is defined, this option will not apply and an exception will be thrown.
     */
    urlPrefix?: string;
    /**
     * Use the specified path as the base public path.
     */
    publicPath?: string;
    /**
     * Check for a variable with this name on the page and use its value as a regular expression against script paths to
     *  the bundle's script. If a value foo is passed into regexVariable, the produced bundle will look for a variable
     *  called foo during initialization, and if a foo variable is found, use its value as a regular expression to detect
     *  the bundle's script.
     *
     * See the README for more information.
     */
    regexVariable?: string;
    /**
     * A function that returns a snippet of code that manipulates the variable with the name that's specified in the
     *  parameter. If this parameter isn't provided, no post-processing code is included. The variable must be modified
     *  in-place - the processed value should not be returned.
     *
     * See the README for more information.
     */
    getPostProcessScript?: (varName: string) => string;
    /**
     * If true, find the last script matching the regexVariable (if it is set). If false, find the first matching script.
     * This can be useful if there are multiple scripts loaded in the DOM that match the regexVariable.
     */
    preferLastFoundScript?: boolean;
    /**
     * If true, always include the public path-setting code. Don't try to detect if any chunks or assets are present.
     */
    skipDetection?: boolean;
}
/**
 * Options for the set-webpack-public-path plugin.
 *
 * @public
 */
export interface ISetWebpackPublicPathPluginOptions extends ISetWebpackPublicPathOptions {
    /**
     * An object that describes how the public path should be discovered.
     */
    scriptName?: {
        /**
         * If set to true, use the webpack generated asset's name. This option is not compatible with
         * andy other scriptName options.
         */
        useAssetName?: boolean;
        /**
         * A regular expression expressed as a string to be applied to all script paths on the page.
         */
        name?: string;
        /**
         * If true, the name property is tokenized.
         *
         * See the README for more information.
         */
        isTokenized?: boolean;
    };
}
/**
 * This simple plugin sets the __webpack_public_path__ variable to a value specified in the arguments,
 *  optionally appended to the SystemJs baseURL property.
 *
 * @public
 */
export declare class SetPublicPathPlugin implements Webpack.Plugin {
    options: ISetWebpackPublicPathPluginOptions;
    constructor(options: ISetWebpackPublicPathPluginOptions);
    apply(compiler: Webpack.Compiler): void;
    private _detectAssetsOrChunks;
    private _getStartupCode;
}
//# sourceMappingURL=SetPublicPathPlugin.d.ts.map