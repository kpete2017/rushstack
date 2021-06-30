import { StringValuesTypingsGenerator } from '@rushstack/typings-generator';
/**
 * @public
 */
export interface ISassConfiguration {
    /**
     * Source code root directory.
     * Defaults to "src/".
     */
    srcFolder?: string;
    /**
     * Output directory for generated Sass typings.
     * Defaults to "temp/sass-ts/".
     */
    generatedTsFolder?: string;
    /**
     * Determines if export values are wrapped in a default property, or not.
     * Defaults to true.
     */
    exportAsDefault?: boolean;
    /**
     * Files with these extensions will pass through the Sass transpiler for typings generation.
     * Defaults to [".sass", ".scss", ".css"]
     */
    fileExtensions?: string[];
    /**
     * A list of paths used when resolving Sass imports.
     * The paths should be relative to the project root.
     * Defaults to ["node_modules", "src"]
     */
    importIncludePaths?: string[];
    /**
     * A list of file paths relative to the "src" folder that should be excluded from typings generation.
     */
    excludeFiles?: string[];
}
/**
 * @public
 */
export interface ISassTypingsGeneratorOptions {
    buildFolder: string;
    sassConfiguration: ISassConfiguration;
}
/**
 * Generates type files (.d.ts) for Sass/SCSS/CSS files.
 *
 * @public
 */
export declare class SassTypingsGenerator extends StringValuesTypingsGenerator {
    /**
     * @param buildFolder - The project folder to search for Sass files and
     *     generate typings.
     */
    constructor(options: ISassTypingsGeneratorOptions);
    /**
     * Sass partial files are snippets of CSS meant to be included in other Sass files.
     * Partial filenames always begin with a leading underscore and do not produce a CSS output file.
     */
    private _isSassPartial;
    private _transpileSassAsync;
    private _patchSassUrl;
    private _getClassNamesFromCSSAsync;
}
//# sourceMappingURL=SassTypingsGenerator.d.ts.map