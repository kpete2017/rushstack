"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SassTypingsGenerator = void 0;
const path = __importStar(require("path"));
const node_sass_1 = require("node-sass");
const postcss_1 = __importDefault(require("postcss"));
const postcss_modules_1 = __importDefault(require("postcss-modules"));
const node_core_library_1 = require("@rushstack/node-core-library");
const typings_generator_1 = require("@rushstack/typings-generator");
/**
 * Generates type files (.d.ts) for Sass/SCSS/CSS files.
 *
 * @public
 */
class SassTypingsGenerator extends typings_generator_1.StringValuesTypingsGenerator {
    /**
     * @param buildFolder - The project folder to search for Sass files and
     *     generate typings.
     */
    constructor(options) {
        const { buildFolder, sassConfiguration } = options;
        const srcFolder = sassConfiguration.srcFolder || path.join(buildFolder, 'src');
        const generatedTsFolder = sassConfiguration.generatedTsFolder || path.join(buildFolder, 'temp', 'sass-ts');
        const exportAsDefault = sassConfiguration.exportAsDefault === undefined ? true : sassConfiguration.exportAsDefault;
        const exportAsDefaultInterfaceName = 'IExportStyles';
        const fileExtensions = sassConfiguration.fileExtensions || ['.sass', '.scss', '.css'];
        super({
            srcFolder,
            generatedTsFolder,
            exportAsDefault,
            exportAsDefaultInterfaceName,
            fileExtensions,
            filesToIgnore: sassConfiguration.excludeFiles,
            // Generate typings function
            parseAndGenerateTypings: async (fileContents, filePath) => {
                if (this._isSassPartial(filePath)) {
                    // Do not generate typings for Sass partials.
                    return;
                }
                const css = await this._transpileSassAsync(fileContents, filePath, buildFolder, sassConfiguration.importIncludePaths);
                const classNames = await this._getClassNamesFromCSSAsync(css, filePath);
                const sortedClassNames = classNames.sort((a, b) => a.localeCompare(b));
                const sassTypings = { typings: [] };
                for (const exportName of sortedClassNames) {
                    sassTypings.typings.push({ exportName });
                }
                return sassTypings;
            }
        });
    }
    /**
     * Sass partial files are snippets of CSS meant to be included in other Sass files.
     * Partial filenames always begin with a leading underscore and do not produce a CSS output file.
     */
    _isSassPartial(filePath) {
        return path.basename(filePath)[0] === '_';
    }
    async _transpileSassAsync(fileContents, filePath, buildFolder, importIncludePaths) {
        const result = await node_core_library_1.LegacyAdapters.convertCallbackToPromise(node_sass_1.render, {
            data: fileContents,
            file: filePath,
            importer: (url) => ({ file: this._patchSassUrl(url) }),
            includePaths: importIncludePaths
                ? importIncludePaths
                : [path.join(buildFolder, 'node_modules'), path.join(buildFolder, 'src')],
            indentedSyntax: path.extname(filePath).toLowerCase() === '.sass'
        });
        // Register any @import files as dependencies.
        const target = result.stats.entry;
        for (const dependency of result.stats.includedFiles) {
            this.registerDependency(target, dependency);
        }
        return result.css.toString();
    }
    _patchSassUrl(url) {
        if (url[0] === '~') {
            return 'node_modules/' + url.substr(1);
        }
        return url;
    }
    async _getClassNamesFromCSSAsync(css, filePath) {
        let classMap = {};
        const cssModulesClassMapPlugin = postcss_modules_1.default({
            getJSON: (cssFileName, json) => {
                classMap = json;
            },
            // Avoid unnecessary name hashing.
            generateScopedName: (name) => name
        });
        await postcss_1.default([cssModulesClassMapPlugin]).process(css, { from: filePath });
        const classNames = Object.keys(classMap);
        return classNames;
    }
}
exports.SassTypingsGenerator = SassTypingsGenerator;
//# sourceMappingURL=SassTypingsGenerator.js.map