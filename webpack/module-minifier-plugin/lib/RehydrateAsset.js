"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.rehydrateAsset = void 0;
const webpack_sources_1 = require("webpack-sources");
const Constants_1 = require("./Constants");
/**
 * Rehydrates an asset with minified modules.
 * @param asset - The asset
 * @param moduleMap - The minified modules
 * @param banner - A banner to inject for license information
 * @public
 */
function rehydrateAsset(asset, moduleMap, banner) {
    const { source: assetSource, modules, externalNames } = asset;
    const assetCode = assetSource.source();
    const tokenIndex = assetCode.indexOf(Constants_1.CHUNK_MODULES_TOKEN);
    const suffixStart = tokenIndex + Constants_1.CHUNK_MODULES_TOKEN.length;
    const suffix = assetCode.slice(suffixStart);
    const prefix = new webpack_sources_1.ReplaceSource(assetSource);
    // Preserve source map via fiddly logic
    prefix.replace(tokenIndex, assetCode.length, '');
    if (!modules.length) {
        // Empty chunk, degenerate case
        return new webpack_sources_1.ConcatSource(banner, prefix, '[]', suffix);
    }
    const emptyFunction = 'function(){}'; // eslint-disable-line @typescript-eslint/typedef
    // This must not have the global flag set
    const validIdRegex = /^[A-Za-z_$][A-Za-z0-9_$]*$/;
    const source = new webpack_sources_1.ConcatSource(banner, prefix);
    const firstModuleId = modules[0];
    const lastModuleId = modules[modules.length - 1];
    // Extended logic from webpack.Template.getModulesArrayBounds
    const minId = typeof firstModuleId === 'number' ? firstModuleId : 0;
    const maxId = typeof lastModuleId === 'number' ? lastModuleId : Infinity;
    const simpleArrayOverhead = 2 + maxId;
    let concatArrayOverhead = simpleArrayOverhead + 9;
    let useObject = typeof firstModuleId !== 'number' || typeof lastModuleId !== 'number';
    let objectOverhead = 1;
    let lastId = 0;
    if (!useObject) {
        for (const id of modules) {
            if (typeof id !== 'number') {
                // This must be an object
                useObject = true;
                break;
            }
            // This is the extension from webpack.Template.getModulesArrayBounds
            // We can make smaller emit by injecting additional filler arrays
            const delta = id - lastId - 1;
            // Compare the length of `],Array(${delta}),[` to ','.repeat(delta + 1)
            const threshold = (lastId === 0 ? 7 : 11) + ('' + delta).length;
            const fillerArraySavings = delta + 1 - threshold;
            if (fillerArraySavings > 0) {
                concatArrayOverhead -= fillerArraySavings;
            }
            objectOverhead += 2 + ('' + id).length;
            lastId = id;
        }
    }
    const useConcat = concatArrayOverhead < simpleArrayOverhead;
    const arrayOverhead = useConcat ? concatArrayOverhead : simpleArrayOverhead;
    useObject = useObject || objectOverhead < arrayOverhead;
    if (useObject) {
        // Write an object literal
        let separator = '{';
        for (const id of modules) {
            // If the id is legal to use as a key in a JavaScript object literal, use as-is
            const javascriptId = typeof id !== 'string' || validIdRegex.test(id) ? id : JSON.stringify(id);
            source.add(`${separator}${javascriptId}:`);
            separator = ',';
            const item = moduleMap.get(id);
            const moduleCode = item ? item.source : emptyFunction;
            source.add(moduleCode);
        }
        source.add('}');
    }
    else {
        // Write one or more array literals, joined by Array(gap) expressions
        // There will never be more than 16 + ("" + minId).length consecutive commas, so 40 is more than will ever be used
        // This is because the above criteria triggers an Array(len) expression instead
        const enoughCommas = ',,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,';
        const useConcatAtStart = useConcat && minId > 8;
        lastId = useConcatAtStart ? minId : 0;
        // TODO: Just because we want to use concat elsewhere doesn't mean its optimal to use at the start
        let separator = useConcatAtStart ? `Array(${minId}).concat([` : '[';
        let concatInserted = useConcatAtStart;
        for (const id of modules) {
            const delta = id - lastId - 1;
            const deltaStr = '' + delta;
            const fillerArrayThreshold = 11 + deltaStr.length;
            const item = moduleMap.get(id);
            const moduleCode = item ? item.source : emptyFunction;
            if (useConcat && delta + 1 > fillerArrayThreshold) {
                if (concatInserted) {
                    source.add(`],Array(${deltaStr}),[`);
                }
                else {
                    source.add(`].concat(Array(${deltaStr}),[`);
                    concatInserted = true;
                }
            }
            else {
                source.add(separator + enoughCommas.slice(0, delta + 1));
            }
            lastId = id;
            source.add(moduleCode);
            separator = '';
        }
        source.add(useConcat ? '])' : ']');
    }
    source.add(suffix);
    const cached = new webpack_sources_1.CachedSource(source);
    if (externalNames.size) {
        const replaceSource = new webpack_sources_1.ReplaceSource(cached);
        const code = cached.source();
        const externalIdRegex = /__WEBPACK_EXTERNAL_MODULE_[A-Za-z0-9_$]+/g;
        // RegExp.exec uses null or an array as the return type, explicitly
        let match = null;
        while ((match = externalIdRegex.exec(code))) {
            const id = match[0];
            const mapped = externalNames.get(id);
            if (mapped === undefined) {
                console.error(`Missing minified external for ${id} in ${asset.fileName}!`);
            }
            else {
                replaceSource.replace(match.index, externalIdRegex.lastIndex - 1, mapped);
            }
        }
        return new webpack_sources_1.CachedSource(replaceSource);
    }
    return cached;
}
exports.rehydrateAsset = rehydrateAsset;
//# sourceMappingURL=RehydrateAsset.js.map