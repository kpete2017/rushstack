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
exports.AssetProcessor = exports.PLACEHOLDER_REGEX = void 0;
const lodash = __importStar(require("lodash"));
const Constants_1 = require("./utilities/Constants");
exports.PLACEHOLDER_REGEX = new RegExp(`${Constants_1.Constants.STRING_PLACEHOLDER_PREFIX}_(\\\\*)_([A-C])(\\+[^+]+\\+)?_(\\d+)`, 'g');
class AssetProcessor {
    static processLocalizedAsset(options) {
        const assetSource = options.asset.source();
        const parsedAsset = AssetProcessor._parseStringToReconstructionSequence(options.plugin, assetSource, this._getJsonpFunction(options.chunk, options.chunkHasLocalizedModules, options.noStringsLocaleName));
        const reconstructedAsset = AssetProcessor._reconstructLocalized(parsedAsset.reconstructionSeries, options.locales, options.fillMissingTranslationStrings, options.defaultLocale, options.asset.size());
        const parsedAssetName = AssetProcessor._parseStringToReconstructionSequence(options.plugin, options.assetName, () => {
            throw new Error('unsupported');
        });
        const reconstructedAssetName = AssetProcessor._reconstructLocalized(parsedAssetName.reconstructionSeries, options.locales, options.fillMissingTranslationStrings, options.defaultLocale, options.assetName.length);
        const result = new Map();
        for (const [locale, { source, size }] of reconstructedAsset.result) {
            const newAsset = lodash.clone(options.asset);
            newAsset.source = () => source;
            newAsset.size = () => size;
            result.set(locale, {
                filename: reconstructedAssetName.result.get(locale).source,
                asset: newAsset
            });
        }
        const issues = [
            ...parsedAsset.issues,
            ...reconstructedAsset.issues,
            ...parsedAssetName.issues,
            ...reconstructedAssetName.issues
        ];
        if (issues.length > 0) {
            options.compilation.errors.push(Error(`localization:\n${issues.map((issue) => `  ${issue}`).join('\n')}`));
        }
        return result;
    }
    static processNonLocalizedAsset(options) {
        const assetSource = options.asset.source();
        const parsedAsset = AssetProcessor._parseStringToReconstructionSequence(options.plugin, assetSource, this._getJsonpFunction(options.chunk, options.chunkHasLocalizedModules, options.noStringsLocaleName));
        const reconstructedAsset = AssetProcessor._reconstructNonLocalized(parsedAsset.reconstructionSeries, options.asset.size(), options.noStringsLocaleName);
        const parsedAssetName = AssetProcessor._parseStringToReconstructionSequence(options.plugin, options.assetName, () => {
            throw new Error('unsupported');
        });
        const reconstructedAssetName = AssetProcessor._reconstructNonLocalized(parsedAssetName.reconstructionSeries, options.assetName.length, options.noStringsLocaleName);
        const issues = [
            ...parsedAsset.issues,
            ...reconstructedAsset.issues,
            ...parsedAssetName.issues,
            ...reconstructedAssetName.issues
        ];
        if (issues.length > 0) {
            options.compilation.errors.push(Error(`localization:\n${issues.map((issue) => `  ${issue}`).join('\n')}`));
        }
        const newAsset = lodash.clone(options.asset);
        newAsset.source = () => reconstructedAsset.result.source;
        newAsset.size = () => reconstructedAsset.result.size;
        return {
            filename: reconstructedAssetName.result.source,
            asset: newAsset
        };
    }
    static _reconstructLocalized(reconstructionSeries, locales, fillMissingTranslationStrings, defaultLocale, initialSize) {
        const localizedResults = new Map();
        const issues = [];
        for (const locale of locales) {
            const reconstruction = [];
            let sizeDiff = 0;
            for (const element of reconstructionSeries) {
                switch (element.kind) {
                    case 'static': {
                        reconstruction.push(element.staticString);
                        break;
                    }
                    case 'localized': {
                        const localizedElement = element;
                        let newValue = localizedElement.values[locale];
                        if (!newValue) {
                            if (fillMissingTranslationStrings) {
                                newValue = localizedElement.values[defaultLocale];
                            }
                            else {
                                issues.push(`The string "${localizedElement.stringName}" in "${localizedElement.locFilePath}" is missing in ` +
                                    `the locale ${locale}`);
                                newValue = '-- MISSING STRING --';
                            }
                        }
                        const escapedBackslash = localizedElement.escapedBackslash || '\\';
                        // Replace backslashes with the properly escaped backslash
                        newValue = newValue.replace(/\\/g, escapedBackslash);
                        // @todo: look into using JSON.parse(...) to get the escaping characters
                        const escapingCharacterSequence = escapedBackslash.substr(escapedBackslash.length / 2);
                        // Ensure the the quotemark, apostrophe, tab, and newline characters are properly escaped
                        newValue = newValue.replace(/\r/g, `${escapingCharacterSequence}r`);
                        newValue = newValue.replace(/\n/g, `${escapingCharacterSequence}n`);
                        newValue = newValue.replace(/\t/g, `${escapingCharacterSequence}t`);
                        newValue = newValue.replace(/\"/g, `${escapingCharacterSequence}u0022`);
                        newValue = newValue.replace(/\'/g, `${escapingCharacterSequence}u0027`);
                        reconstruction.push(newValue);
                        sizeDiff += newValue.length - localizedElement.size;
                        break;
                    }
                    case 'dynamic': {
                        const dynamicElement = element;
                        const newValue = dynamicElement.valueFn(locale, dynamicElement.token);
                        reconstruction.push(newValue);
                        sizeDiff += newValue.length - dynamicElement.size;
                        break;
                    }
                }
            }
            const newAssetSource = reconstruction.join('');
            localizedResults.set(locale, {
                source: newAssetSource,
                size: initialSize + sizeDiff
            });
        }
        return {
            issues,
            result: localizedResults
        };
    }
    static _reconstructNonLocalized(reconstructionSeries, initialSize, noStringsLocaleName) {
        const issues = [];
        const reconstruction = [];
        let sizeDiff = 0;
        for (const element of reconstructionSeries) {
            switch (element.kind) {
                case 'static': {
                    reconstruction.push(element.staticString);
                    break;
                }
                case 'localized': {
                    const localizedElement = element;
                    issues.push(`The string "${localizedElement.stringName}" in "${localizedElement.locFilePath}" appeared in an asset ` +
                        'that is not expected to contain localized resources.');
                    const newValue = '-- NOT EXPECTED TO BE LOCALIZED --';
                    reconstruction.push(newValue);
                    sizeDiff += newValue.length - localizedElement.size;
                    break;
                }
                case 'dynamic': {
                    const dynamicElement = element;
                    const newValue = dynamicElement.valueFn(noStringsLocaleName, dynamicElement.token);
                    reconstruction.push(newValue);
                    sizeDiff += newValue.length - dynamicElement.size;
                    break;
                }
            }
        }
        const newAssetSource = reconstruction.join('');
        return {
            issues,
            result: {
                source: newAssetSource,
                size: initialSize + sizeDiff
            }
        };
    }
    static _parseStringToReconstructionSequence(plugin, source, jsonpFunction) {
        const issues = [];
        const reconstructionSeries = [];
        let lastIndex = 0;
        let regexResult;
        while ((regexResult = exports.PLACEHOLDER_REGEX.exec(source))) {
            // eslint-disable-line no-cond-assign
            const staticElement = {
                kind: 'static',
                staticString: source.substring(lastIndex, regexResult.index)
            };
            reconstructionSeries.push(staticElement);
            const [placeholder, escapedBackslash, elementLabel, token, placeholderSerialNumber] = regexResult;
            let localizedReconstructionElement;
            switch (elementLabel) {
                case Constants_1.Constants.STRING_PLACEHOLDER_LABEL: {
                    const stringData = plugin.getDataForSerialNumber(placeholderSerialNumber);
                    if (!stringData) {
                        issues.push(`Missing placeholder ${placeholder}`);
                        const brokenLocalizedElement = {
                            kind: 'static',
                            staticString: placeholder
                        };
                        localizedReconstructionElement = brokenLocalizedElement;
                    }
                    else {
                        const localizedElement = {
                            kind: 'localized',
                            values: stringData.values,
                            size: placeholder.length,
                            locFilePath: stringData.locFilePath,
                            escapedBackslash: escapedBackslash,
                            stringName: stringData.stringName
                        };
                        localizedReconstructionElement = localizedElement;
                    }
                    break;
                }
                case Constants_1.Constants.LOCALE_NAME_PLACEHOLDER_LABEL: {
                    const dynamicElement = {
                        kind: 'dynamic',
                        valueFn: (locale) => locale,
                        size: placeholder.length,
                        escapedBackslash: escapedBackslash
                    };
                    localizedReconstructionElement = dynamicElement;
                    break;
                }
                case Constants_1.Constants.JSONP_PLACEHOLDER_LABEL: {
                    const dynamicElement = {
                        kind: 'dynamic',
                        valueFn: jsonpFunction,
                        size: placeholder.length,
                        escapedBackslash: escapedBackslash,
                        token: token.substring(1, token.length - 1)
                    };
                    localizedReconstructionElement = dynamicElement;
                    break;
                }
                default: {
                    throw new Error(`Unexpected label ${elementLabel}`);
                }
            }
            reconstructionSeries.push(localizedReconstructionElement);
            lastIndex = regexResult.index + placeholder.length;
        }
        const lastElement = {
            kind: 'static',
            staticString: source.substr(lastIndex)
        };
        reconstructionSeries.push(lastElement);
        return {
            issues,
            reconstructionSeries
        };
    }
    static _getJsonpFunction(chunk, chunkHasLocalizedModules, noStringsLocaleName) {
        const idsWithStrings = new Set();
        const idsWithoutStrings = new Set();
        const asyncChunks = chunk.getAllAsyncChunks();
        for (const asyncChunk of asyncChunks) {
            const chunkId = asyncChunk.id;
            if (chunkId === null || chunkId === undefined) {
                throw new Error(`Chunk "${asyncChunk.name}"'s ID is null or undefined.`);
            }
            if (chunkHasLocalizedModules(asyncChunk)) {
                idsWithStrings.add(chunkId);
            }
            else {
                idsWithoutStrings.add(chunkId);
            }
        }
        if (idsWithStrings.size === 0) {
            return () => JSON.stringify(noStringsLocaleName);
        }
        else if (idsWithoutStrings.size === 0) {
            return (locale) => JSON.stringify(locale);
        }
        else {
            // Generate an array [<locale>, <nostrings locale>] and an object that is used as an indexer into that
            // object that maps chunk IDs to 0s for chunks with localized strings and 1s for chunks without localized
            // strings
            //
            // This can be improved in the future. We can maybe sort the chunks such that the chunks below a certain ID
            // number are localized and the those above are not.
            const chunkMapping = {};
            for (const idWithStrings of idsWithStrings) {
                chunkMapping[idWithStrings] = 0;
            }
            for (const idWithoutStrings of idsWithoutStrings) {
                chunkMapping[idWithoutStrings] = 1;
            }
            return (locale, chunkIdToken) => {
                if (!locale) {
                    throw new Error('Missing locale name.');
                }
                return `(${JSON.stringify([locale, noStringsLocaleName])})[${JSON.stringify(chunkMapping)}[${chunkIdToken}]]`;
            };
        }
    }
}
exports.AssetProcessor = AssetProcessor;
//# sourceMappingURL=AssetProcessor.js.map