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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalizationPlugin = void 0;
const node_core_library_1 = require("@rushstack/node-core-library");
const Webpack = __importStar(require("webpack"));
const path = __importStar(require("path"));
const Constants_1 = require("./utilities/Constants");
const WebpackConfigurationUpdater_1 = require("./WebpackConfigurationUpdater");
const LocFileTypingsGenerator_1 = require("./LocFileTypingsGenerator");
const Pseudolocalization_1 = require("./Pseudolocalization");
const EntityMarker_1 = require("./utilities/EntityMarker");
const AssetProcessor_1 = require("./AssetProcessor");
const LocFileParser_1 = require("./utilities/LocFileParser");
const PLUGIN_NAME = 'localization';
/**
 * This plugin facilitates localization in webpack.
 *
 * @public
 */
class LocalizationPlugin {
    constructor(options) {
        /**
         * @internal
         */
        this.stringKeys = new Map();
        this._filesToIgnore = new Set();
        this._stringPlaceholderCounter = 0;
        this._stringPlaceholderMap = new Map();
        this._locales = new Set();
        this._pseudolocalizers = new Map();
        /**
         * The outermost map's keys are the locale names.
         * The middle map's keys are the resolved, file names.
         * The innermost map's keys are the string identifiers and its values are the string values.
         */
        this._resolvedLocalizedStrings = new Map();
        this._options = options;
    }
    apply(compiler) {
        const isWebpack4 = !!compiler.hooks;
        if (!isWebpack4) {
            throw new Error(`The ${LocalizationPlugin.name} plugin requires Webpack 4`);
        }
        if (this._options.typingsOptions && compiler.context) {
            if (this._options.typingsOptions.generatedTsFolder &&
                !path.isAbsolute(this._options.typingsOptions.generatedTsFolder)) {
                this._options.typingsOptions.generatedTsFolder = path.resolve(compiler.context, this._options.typingsOptions.generatedTsFolder);
            }
            if (this._options.typingsOptions.sourceRoot &&
                !path.isAbsolute(this._options.typingsOptions.sourceRoot)) {
                this._options.typingsOptions.sourceRoot = path.resolve(compiler.context, this._options.typingsOptions.sourceRoot);
            }
        }
        // https://github.com/webpack/webpack-dev-server/pull/1929/files#diff-15fb51940da53816af13330d8ce69b4eR66
        const isWebpackDevServer = process.env.WEBPACK_DEV_SERVER === 'true';
        const { errors, warnings } = this._initializeAndValidateOptions(compiler.options, isWebpackDevServer);
        let typingsPreprocessor;
        if (this._options.typingsOptions) {
            typingsPreprocessor = new LocFileTypingsGenerator_1.LocFileTypingsGenerator({
                srcFolder: this._options.typingsOptions.sourceRoot || compiler.context,
                generatedTsFolder: this._options.typingsOptions.generatedTsFolder,
                exportAsDefault: this._options.typingsOptions.exportAsDefault,
                filesToIgnore: this._options.filesToIgnore
            });
        }
        else {
            typingsPreprocessor = undefined;
        }
        const webpackConfigurationUpdaterOptions = {
            pluginInstance: this,
            configuration: compiler.options,
            filesToIgnore: this._filesToIgnore,
            localeNameOrPlaceholder: Constants_1.Constants.LOCALE_NAME_PLACEHOLDER,
            resxNewlineNormalization: this._resxNewlineNormalization
        };
        if (errors.length > 0 || warnings.length > 0) {
            compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation) => {
                compilation.errors.push(...errors);
                compilation.warnings.push(...warnings);
            });
            if (errors.length > 0) {
                // If there are any errors, just pass through the resources in source and don't do any
                // additional configuration
                WebpackConfigurationUpdater_1.WebpackConfigurationUpdater.amendWebpackConfigurationForInPlaceLocFiles(webpackConfigurationUpdaterOptions);
                return;
            }
        }
        if (isWebpackDevServer) {
            if (typingsPreprocessor) {
                compiler.hooks.afterEnvironment.tap(PLUGIN_NAME, () => typingsPreprocessor.runWatcherAsync());
                if (!compiler.options.plugins) {
                    compiler.options.plugins = [];
                }
                compiler.options.plugins.push(new Webpack.WatchIgnorePlugin([this._options.typingsOptions.generatedTsFolder]));
            }
            WebpackConfigurationUpdater_1.WebpackConfigurationUpdater.amendWebpackConfigurationForInPlaceLocFiles(webpackConfigurationUpdaterOptions);
        }
        else {
            if (typingsPreprocessor) {
                compiler.hooks.beforeRun.tapPromise(PLUGIN_NAME, async () => await typingsPreprocessor.generateTypingsAsync());
            }
            WebpackConfigurationUpdater_1.WebpackConfigurationUpdater.amendWebpackConfigurationForMultiLocale(webpackConfigurationUpdaterOptions);
            if (errors.length === 0) {
                compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (untypedCompilation) => {
                    const compilation = untypedCompilation;
                    compilation.mainTemplate.hooks.assetPath.tap(PLUGIN_NAME, (assetPath, options) => {
                        if (options.contentHashType === 'javascript' &&
                            assetPath.match(Constants_1.Constants.LOCALE_FILENAME_TOKEN_REGEX)) {
                            // Does this look like an async chunk URL generator?
                            if (typeof options.chunk.id === 'string' && options.chunk.id.match(/^\" \+/)) {
                                return assetPath.replace(Constants_1.Constants.LOCALE_FILENAME_TOKEN_REGEX, `" + ${Constants_1.Constants.JSONP_PLACEHOLDER} + "`);
                            }
                            else {
                                return assetPath.replace(Constants_1.Constants.LOCALE_FILENAME_TOKEN_REGEX, Constants_1.Constants.LOCALE_NAME_PLACEHOLDER);
                            }
                        }
                        else if (assetPath.match(Constants_1.Constants.NO_LOCALE_SOURCE_MAP_FILENAME_TOKEN_REGEX)) {
                            // Replace the placeholder with the [locale] token for sourcemaps
                            const deLocalizedFilename = options.filename.replace(AssetProcessor_1.PLACEHOLDER_REGEX, Constants_1.Constants.LOCALE_FILENAME_TOKEN);
                            return assetPath.replace(Constants_1.Constants.NO_LOCALE_SOURCE_MAP_FILENAME_TOKEN_REGEX, deLocalizedFilename);
                        }
                        else {
                            return assetPath;
                        }
                    });
                    compilation.hooks.optimizeChunks.tap(PLUGIN_NAME, (untypedChunks, untypedChunkGroups) => {
                        const chunks = untypedChunks;
                        const chunkGroups = untypedChunkGroups;
                        let chunksHaveAnyChildren = false;
                        for (const chunkGroup of chunkGroups) {
                            const children = chunkGroup.getChildren();
                            if (children.length > 0) {
                                chunksHaveAnyChildren = true;
                                break;
                            }
                        }
                        if (chunksHaveAnyChildren &&
                            (!compilation.options.output ||
                                !compilation.options.output.chunkFilename ||
                                compilation.options.output.chunkFilename.indexOf(Constants_1.Constants.LOCALE_FILENAME_TOKEN) === -1)) {
                            compilation.errors.push(new Error('The configuration.output.chunkFilename property must be provided and must include ' +
                                `the ${Constants_1.Constants.LOCALE_FILENAME_TOKEN} placeholder`));
                            return;
                        }
                        for (const chunk of chunks) {
                            // See if the chunk contains any localized modules or loads any localized chunks
                            const localizedChunk = this._chunkHasLocalizedModules(chunk);
                            // Change the chunk's name to include either the locale name or the locale name for chunks without strings
                            const replacementValue = localizedChunk
                                ? Constants_1.Constants.LOCALE_NAME_PLACEHOLDER
                                : this._noStringsLocaleName;
                            if (chunk.hasRuntime()) {
                                chunk.filenameTemplate = compilation.options.output.filename.replace(Constants_1.Constants.LOCALE_FILENAME_TOKEN_REGEX, replacementValue);
                            }
                            else {
                                chunk.filenameTemplate = compilation.options.output.chunkFilename.replace(Constants_1.Constants.LOCALE_FILENAME_TOKEN_REGEX, replacementValue);
                            }
                        }
                    });
                });
                compiler.hooks.emit.tap(PLUGIN_NAME, (compilation) => {
                    const localizationStats = {
                        entrypoints: {},
                        namedChunkGroups: {}
                    };
                    const alreadyProcessedAssets = new Set();
                    const hotUpdateRegex = /\.hot-update\.js$/;
                    for (const untypedChunk of compilation.chunks) {
                        const chunk = untypedChunk;
                        const chunkFilesSet = new Set(chunk.files);
                        function processChunkJsFile(callback) {
                            let alreadyProcessedAFileInThisChunk = false;
                            for (const chunkFilename of chunk.files) {
                                if (chunkFilename.endsWith('.js') && // Ensure this is a JS file
                                    !hotUpdateRegex.test(chunkFilename) && // Ensure this is not a webpack hot update
                                    !alreadyProcessedAssets.has(chunkFilename) // Ensure this isn't a vendor chunk we've already processed
                                ) {
                                    if (alreadyProcessedAFileInThisChunk) {
                                        throw new Error(`Found more than one JS file in chunk "${chunk.name}". This is not expected.`);
                                    }
                                    alreadyProcessedAFileInThisChunk = true;
                                    alreadyProcessedAssets.add(chunkFilename);
                                    callback(chunkFilename);
                                }
                            }
                        }
                        if (this._chunkHasLocalizedModules(chunk)) {
                            processChunkJsFile((chunkFilename) => {
                                if (chunkFilename.indexOf(Constants_1.Constants.LOCALE_NAME_PLACEHOLDER) === -1) {
                                    throw new Error(`Asset ${chunkFilename} is expected to be localized, but is missing a locale placeholder`);
                                }
                                const asset = compilation.assets[chunkFilename];
                                const resultingAssets = AssetProcessor_1.AssetProcessor.processLocalizedAsset({
                                    plugin: this,
                                    compilation,
                                    assetName: chunkFilename,
                                    asset,
                                    chunk,
                                    chunkHasLocalizedModules: this._chunkHasLocalizedModules.bind(this),
                                    locales: this._locales,
                                    noStringsLocaleName: this._noStringsLocaleName,
                                    fillMissingTranslationStrings: this._fillMissingTranslationStrings,
                                    defaultLocale: this._defaultLocale
                                });
                                // Delete the existing asset because it's been renamed
                                delete compilation.assets[chunkFilename];
                                chunkFilesSet.delete(chunkFilename);
                                const localizedChunkAssets = {};
                                for (const [locale, newAsset] of resultingAssets) {
                                    compilation.assets[newAsset.filename] = newAsset.asset;
                                    localizedChunkAssets[locale] = newAsset.filename;
                                    chunkFilesSet.add(newAsset.filename);
                                }
                                if (chunk.hasRuntime()) {
                                    // This is an entrypoint
                                    localizationStats.entrypoints[chunk.name] = {
                                        localizedAssets: localizedChunkAssets
                                    };
                                }
                                else {
                                    // This is a secondary chunk
                                    if (chunk.name) {
                                        localizationStats.namedChunkGroups[chunk.name] = {
                                            localizedAssets: localizedChunkAssets
                                        };
                                    }
                                }
                                chunk.localizedFiles = localizedChunkAssets;
                            });
                        }
                        else {
                            processChunkJsFile((chunkFilename) => {
                                const asset = compilation.assets[chunkFilename];
                                const resultingAsset = AssetProcessor_1.AssetProcessor.processNonLocalizedAsset({
                                    plugin: this,
                                    compilation,
                                    assetName: chunkFilename,
                                    asset,
                                    chunk,
                                    noStringsLocaleName: this._noStringsLocaleName,
                                    chunkHasLocalizedModules: this._chunkHasLocalizedModules.bind(this)
                                });
                                // Delete the existing asset because it's been renamed
                                delete compilation.assets[chunkFilename];
                                chunkFilesSet.delete(chunkFilename);
                                compilation.assets[resultingAsset.filename] = resultingAsset.asset;
                                chunkFilesSet.add(resultingAsset.filename);
                            });
                        }
                        chunk.files = Array.from(chunkFilesSet);
                    }
                    if (this._options.localizationStats) {
                        if (this._options.localizationStats.dropPath) {
                            const resolvedLocalizationStatsDropPath = path.resolve(compiler.outputPath, this._options.localizationStats.dropPath);
                            node_core_library_1.JsonFile.save(localizationStats, resolvedLocalizationStatsDropPath, {
                                ensureFolderExists: true
                            });
                        }
                        if (this._options.localizationStats.callback) {
                            try {
                                this._options.localizationStats.callback(localizationStats);
                            }
                            catch (e) {
                                /* swallow errors from the callback */
                            }
                        }
                    }
                });
            }
        }
    }
    /**
     * @internal
     *
     * @returns
     */
    addDefaultLocFile(terminal, localizedResourcePath, localizedResourceData) {
        const additionalLoadedFilePaths = [];
        const errors = [];
        const locFileData = this._convertLocalizationFileToLocData(localizedResourceData);
        this._addLocFile(this._defaultLocale, localizedResourcePath, locFileData);
        const normalizeLocalizedData = (localizedData) => {
            if (typeof localizedData === 'string') {
                additionalLoadedFilePaths.push(localizedData);
                const localizationFile = LocFileParser_1.LocFileParser.parseLocFile({
                    filePath: localizedData,
                    content: node_core_library_1.FileSystem.readFile(localizedData),
                    terminal: terminal,
                    resxNewlineNormalization: this._resxNewlineNormalization
                });
                return this._convertLocalizationFileToLocData(localizationFile);
            }
            else {
                return localizedData;
            }
        };
        const missingLocales = [];
        for (const [translatedLocaleName, translatedStrings] of Object.entries(this._resolvedTranslatedStringsFromOptions)) {
            const translatedLocFileFromOptions = translatedStrings[localizedResourcePath];
            if (!translatedLocFileFromOptions) {
                missingLocales.push(translatedLocaleName);
            }
            else {
                const translatedLocFileData = normalizeLocalizedData(translatedLocFileFromOptions);
                this._addLocFile(translatedLocaleName, localizedResourcePath, translatedLocFileData);
            }
        }
        if (missingLocales.length > 0 && this._options.localizedData.resolveMissingTranslatedStrings) {
            let resolvedTranslatedData = undefined;
            try {
                resolvedTranslatedData = this._options.localizedData.resolveMissingTranslatedStrings(missingLocales, localizedResourcePath);
            }
            catch (e) {
                errors.push(e);
            }
            if (resolvedTranslatedData) {
                for (const [resolvedLocaleName, resolvedLocaleData] of Object.entries(resolvedTranslatedData)) {
                    if (resolvedLocaleData) {
                        const translatedLocFileData = normalizeLocalizedData(resolvedLocaleData);
                        this._addLocFile(resolvedLocaleName, localizedResourcePath, translatedLocFileData);
                    }
                }
            }
        }
        this._pseudolocalizers.forEach((pseudolocalizer, pseudolocaleName) => {
            const pseudolocFileData = {};
            for (const [stringName, stringValue] of Object.entries(locFileData)) {
                pseudolocFileData[stringName] = pseudolocalizer(stringValue);
            }
            this._addLocFile(pseudolocaleName, localizedResourcePath, pseudolocFileData);
        });
        return { additionalLoadedFilePaths, errors };
    }
    /**
     * @internal
     */
    getDataForSerialNumber(serialNumber) {
        return this._stringPlaceholderMap.get(serialNumber);
    }
    _addLocFile(localeName, localizedFilePath, localizedFileData) {
        const filesMap = this._resolvedLocalizedStrings.get(localeName);
        const stringsMap = new Map();
        filesMap.set(localizedFilePath, stringsMap);
        for (const [stringName, stringValue] of Object.entries(localizedFileData)) {
            const stringKey = `${localizedFilePath}?${stringName}`;
            if (!this.stringKeys.has(stringKey)) {
                const placeholder = this._getPlaceholderString();
                this.stringKeys.set(stringKey, placeholder);
            }
            const placeholder = this.stringKeys.get(stringKey);
            if (!this._stringPlaceholderMap.has(placeholder.suffix)) {
                this._stringPlaceholderMap.set(placeholder.suffix, {
                    values: {
                        [this._passthroughLocaleName]: stringName
                    },
                    locFilePath: localizedFilePath,
                    stringName: stringName
                });
            }
            this._stringPlaceholderMap.get(placeholder.suffix).values[localeName] = stringValue;
            stringsMap.set(stringName, stringValue);
        }
    }
    _initializeAndValidateOptions(configuration, isWebpackDevServer) {
        const errors = [];
        const warnings = [];
        function ensureValidLocaleName(localeName) {
            const LOCALE_NAME_REGEX = /[a-z-]/i;
            if (!localeName.match(LOCALE_NAME_REGEX)) {
                errors.push(new Error(`Invalid locale name: ${localeName}. Locale names may only contain letters and hyphens.`));
                return false;
            }
            else {
                return true;
            }
        }
        // START configuration
        if (!configuration.output ||
            !configuration.output.filename ||
            typeof configuration.output.filename !== 'string' ||
            configuration.output.filename.indexOf(Constants_1.Constants.LOCALE_FILENAME_TOKEN) === -1) {
            errors.push(new Error('The configuration.output.filename property must be provided, must be a string, and must include ' +
                `the ${Constants_1.Constants.LOCALE_FILENAME_TOKEN} placeholder`));
        }
        // END configuration
        // START options.filesToIgnore
        // eslint-disable-next-line no-lone-blocks
        {
            for (const filePath of this._options.filesToIgnore || []) {
                const normalizedFilePath = path.resolve(configuration.context, filePath);
                this._filesToIgnore.add(normalizedFilePath);
            }
        }
        // END options.filesToIgnore
        // START options.localizedData
        if (this._options.localizedData) {
            // START options.localizedData.passthroughLocale
            if (this._options.localizedData.passthroughLocale) {
                const { usePassthroughLocale, passthroughLocaleName = 'passthrough' } = this._options.localizedData.passthroughLocale;
                if (usePassthroughLocale) {
                    this._passthroughLocaleName = passthroughLocaleName;
                    this._locales.add(passthroughLocaleName);
                }
            }
            // END options.localizedData.passthroughLocale
            // START options.localizedData.translatedStrings
            const { translatedStrings } = this._options.localizedData;
            this._resolvedTranslatedStringsFromOptions = {};
            if (translatedStrings) {
                for (const [localeName, locale] of Object.entries(translatedStrings)) {
                    if (this._locales.has(localeName)) {
                        errors.push(Error(`The locale "${localeName}" appears multiple times. ` +
                            'There may be multiple instances with different casing.'));
                        return { errors, warnings };
                    }
                    if (!ensureValidLocaleName(localeName)) {
                        return { errors, warnings };
                    }
                    this._locales.add(localeName);
                    this._resolvedLocalizedStrings.set(localeName, new Map());
                    this._resolvedTranslatedStringsFromOptions[localeName] = {};
                    const locFilePathsInLocale = new Set();
                    for (const [locFilePath, locFileDataFromOptions] of Object.entries(locale)) {
                        if (locale.hasOwnProperty(locFilePath)) {
                            const normalizedLocFilePath = path.resolve(configuration.context, locFilePath);
                            if (locFilePathsInLocale.has(normalizedLocFilePath)) {
                                errors.push(new Error(`The localization file path "${locFilePath}" appears multiple times in locale ${localeName}. ` +
                                    'There may be multiple instances with different casing.'));
                                return { errors, warnings };
                            }
                            locFilePathsInLocale.add(normalizedLocFilePath);
                            const normalizedLocFileDataFromOptions = typeof locFileDataFromOptions === 'string'
                                ? path.resolve(configuration.context, locFileDataFromOptions)
                                : locFileDataFromOptions;
                            this._resolvedTranslatedStringsFromOptions[localeName][normalizedLocFilePath] =
                                normalizedLocFileDataFromOptions;
                        }
                    }
                }
            }
            // END options.localizedData.translatedStrings
            // START options.localizedData.defaultLocale
            if (this._options.localizedData.defaultLocale) {
                const { localeName, fillMissingTranslationStrings } = this._options.localizedData.defaultLocale;
                if (this._options.localizedData.defaultLocale.localeName) {
                    if (this._locales.has(localeName)) {
                        errors.push(new Error('The default locale is also specified in the translated strings.'));
                        return { errors, warnings };
                    }
                    else if (!ensureValidLocaleName(localeName)) {
                        return { errors, warnings };
                    }
                    this._locales.add(localeName);
                    this._resolvedLocalizedStrings.set(localeName, new Map());
                    this._defaultLocale = localeName;
                    this._fillMissingTranslationStrings = !!fillMissingTranslationStrings;
                }
                else {
                    errors.push(new Error('Missing default locale name'));
                    return { errors, warnings };
                }
            }
            else {
                errors.push(new Error('Missing default locale options.'));
                return { errors, warnings };
            }
            // END options.localizedData.defaultLocale
            // START options.localizedData.pseudoLocales
            if (this._options.localizedData.pseudolocales) {
                for (const [pseudolocaleName, pseudoLocaleOpts] of Object.entries(this._options.localizedData.pseudolocales)) {
                    if (this._defaultLocale === pseudolocaleName) {
                        errors.push(new Error(`A pseudolocale (${pseudolocaleName}) name is also the default locale name.`));
                        return { errors, warnings };
                    }
                    if (this._locales.has(pseudolocaleName)) {
                        errors.push(new Error(`A pseudolocale (${pseudolocaleName}) name is also specified in the translated strings.`));
                        return { errors, warnings };
                    }
                    this._pseudolocalizers.set(pseudolocaleName, Pseudolocalization_1.Pseudolocalization.getPseudolocalizer(pseudoLocaleOpts));
                    this._locales.add(pseudolocaleName);
                    this._resolvedLocalizedStrings.set(pseudolocaleName, new Map());
                }
            }
            // END options.localizedData.pseudoLocales
            // START options.localizedData.normalizeResxNewlines
            if (this._options.localizedData.normalizeResxNewlines) {
                switch (this._options.localizedData.normalizeResxNewlines) {
                    case 'crlf': {
                        this._resxNewlineNormalization = "\r\n" /* CrLf */;
                        break;
                    }
                    case 'lf': {
                        this._resxNewlineNormalization = "\n" /* Lf */;
                        break;
                    }
                    default: {
                        errors.push(new Error(`Unexpected value "${this._options.localizedData.normalizeResxNewlines}" for option ` +
                            '"localizedData.normalizeResxNewlines"'));
                        break;
                    }
                }
            }
            // END options.localizedData.normalizeResxNewlines
        }
        else if (!isWebpackDevServer) {
            throw new Error('Localized data must be provided unless webpack dev server is running.');
        }
        // END options.localizedData
        // START options.noStringsLocaleName
        if (this._options.noStringsLocaleName === undefined ||
            this._options.noStringsLocaleName === null ||
            !ensureValidLocaleName(this._options.noStringsLocaleName)) {
            this._noStringsLocaleName = 'none';
        }
        else {
            this._noStringsLocaleName = this._options.noStringsLocaleName;
        }
        // END options.noStringsLocaleName
        return { errors, warnings };
    }
    _getPlaceholderString() {
        const suffix = (this._stringPlaceholderCounter++).toString();
        return {
            value: `${Constants_1.Constants.STRING_PLACEHOLDER_PREFIX}_\\_${Constants_1.Constants.STRING_PLACEHOLDER_LABEL}_${suffix}`,
            suffix: suffix
        };
    }
    _chunkHasLocalizedModules(chunk) {
        let chunkHasAnyLocModules = EntityMarker_1.EntityMarker.getMark(chunk);
        if (chunkHasAnyLocModules === undefined) {
            chunkHasAnyLocModules = false;
            for (const module of chunk.getModules()) {
                if (EntityMarker_1.EntityMarker.getMark(module)) {
                    chunkHasAnyLocModules = true;
                    break;
                }
            }
            // If this chunk doesn't directly contain any localized resources, it still
            // needs to be localized if it's an entrypoint chunk (i.e. - it has a runtime)
            // and it loads localized async chunks.
            // In that case, the generated chunk URL generation code needs to contain
            // the locale name.
            if (!chunkHasAnyLocModules && chunk.hasRuntime()) {
                for (const asyncChunk of chunk.getAllAsyncChunks()) {
                    if (this._chunkHasLocalizedModules(asyncChunk)) {
                        chunkHasAnyLocModules = true;
                        break;
                    }
                }
            }
            EntityMarker_1.EntityMarker.markEntity(chunk, chunkHasAnyLocModules);
        }
        return chunkHasAnyLocModules;
    }
    _convertLocalizationFileToLocData(locFile) {
        const locFileData = {};
        for (const [stringName, locFileEntry] of Object.entries(locFile)) {
            locFileData[stringName] = locFileEntry.value;
        }
        return locFileData;
    }
}
exports.LocalizationPlugin = LocalizationPlugin;
//# sourceMappingURL=LocalizationPlugin.js.map