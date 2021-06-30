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
exports.ModuleMinifierPlugin = void 0;
const webpack_sources_1 = require("webpack-sources");
const webpack = __importStar(require("webpack"));
const tapable_1 = require("tapable");
const Constants_1 = require("./Constants");
const MinifiedIdentifier_1 = require("./MinifiedIdentifier");
const GenerateLicenseFileForAsset_1 = require("./GenerateLicenseFileForAsset");
const RehydrateAsset_1 = require("./RehydrateAsset");
const PortableMinifierIdsPlugin_1 = require("./PortableMinifierIdsPlugin");
const crypto_1 = require("crypto");
// The name of the plugin, for use in taps
const PLUGIN_NAME = 'ModuleMinifierPlugin';
const TAP_BEFORE = {
    name: PLUGIN_NAME,
    stage: Constants_1.STAGE_BEFORE
};
const TAP_AFTER = {
    name: PLUGIN_NAME,
    stage: Constants_1.STAGE_AFTER
};
/**
 * https://github.com/webpack/webpack/blob/30e747a55d9e796ae22f67445ae42c7a95a6aa48/lib/Template.js#L36-47
 * @param a first id to be sorted
 * @param b second id to be sorted against
 * @returns the sort value
 */
function stringifyIdSortPredicate(a, b) {
    const aId = a + '';
    const bId = b + '';
    if (aId < bId)
        return -1;
    if (aId > bId)
        return 1;
    return 0;
}
function hashCodeFragment(code) {
    return crypto_1.createHash('sha256').update(code).digest('hex');
}
/**
 * Base implementation of asset rehydration
 *
 * @param dehydratedAssets The dehydrated assets
 * @param compilation The webpack compilation
 */
function defaultRehydrateAssets(dehydratedAssets, compilation) {
    const { assets, modules } = dehydratedAssets;
    // Now assets/modules contain fully minified code. Rehydrate.
    for (const [assetName, info] of assets) {
        const banner = /\.m?js(\?.+)?$/.test(assetName)
            ? GenerateLicenseFileForAsset_1.generateLicenseFileForAsset(compilation, info, modules)
            : '';
        const outputSource = RehydrateAsset_1.rehydrateAsset(info, modules, banner);
        compilation.assets[assetName] = outputSource;
    }
    return dehydratedAssets;
}
function isMinificationResultError(result) {
    return !!result.error;
}
/**
 * Webpack plugin that minifies code on a per-module basis rather than per-asset. The actual minification is handled by the input `minifier` object.
 * @public
 */
class ModuleMinifierPlugin {
    constructor(options) {
        this.hooks = {
            rehydrateAssets: new tapable_1.AsyncSeriesWaterfallHook(['dehydratedContent', 'compilation']),
            finalModuleId: new tapable_1.SyncWaterfallHook(['id']),
            postProcessCodeFragment: new tapable_1.SyncWaterfallHook(['code', 'context'])
        };
        const { minifier, sourceMap, usePortableModules = false } = options;
        if (usePortableModules) {
            this._portableIdsPlugin = new PortableMinifierIdsPlugin_1.PortableMinifierModuleIdsPlugin(this.hooks);
        }
        this.hooks.rehydrateAssets.tap(PLUGIN_NAME, defaultRehydrateAssets);
        this.minifier = minifier;
        this._sourceMap = sourceMap;
    }
    apply(compiler) {
        const { _portableIdsPlugin: stableIdsPlugin } = this;
        const { options: { devtool, mode } } = compiler;
        // The explicit setting is preferred due to accuracy, but try to guess based on devtool
        const useSourceMaps = typeof this._sourceMap === 'boolean'
            ? this._sourceMap
            : typeof devtool === 'string'
                ? devtool.endsWith('source-map')
                : mode === 'production' && devtool !== false;
        if (stableIdsPlugin) {
            stableIdsPlugin.apply(compiler);
        }
        compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
            /**
             * Set of local module ids that have been processed.
             */
            const submittedModules = new Set();
            /**
             * The text and comments of all minified modules.
             */
            const minifiedModules = new Map();
            /**
             * The text and comments of all minified chunks. Most of these are trivial, but the runtime chunk is a bit larger.
             */
            const minifiedAssets = new Map();
            let pendingMinificationRequests = 0;
            /**
             * Indicates that all files have been sent to the minifier and therefore that when pending hits 0, assets can be rehydrated.
             */
            let allRequestsIssued = false;
            let resolveMinifyPromise;
            const getRealId = (id) => this.hooks.finalModuleId.call(id);
            const postProcessCode = (code, context) => this.hooks.postProcessCodeFragment.call(code, context);
            /**
             * Callback to invoke when a file has finished minifying.
             */
            function onFileMinified() {
                if (--pendingMinificationRequests === 0 && allRequestsIssued) {
                    resolveMinifyPromise();
                }
            }
            /**
             * Callback to invoke for a chunk during render to replace the modules with CHUNK_MODULES_TOKEN
             */
            function dehydrateAsset(modules, chunk) {
                for (const mod of chunk.modulesIterable) {
                    if (mod.id === null || !submittedModules.has(mod.id)) {
                        console.error(`Chunk ${chunk.id} failed to render module ${mod.id} for ${mod.resource}`);
                    }
                }
                // Discard the rendered modules
                return new webpack_sources_1.RawSource(Constants_1.CHUNK_MODULES_TOKEN);
            }
            const { minifier } = this;
            const cleanupMinifier = minifier.ref && minifier.ref();
            const requestShortener = compilation.runtimeTemplate.requestShortener;
            /**
             * Extracts the code for the module and sends it to be minified.
             * Currently source maps are explicitly not supported.
             * @param {Source} source
             * @param {Module} mod
             */
            function minifyModule(source, mod) {
                const id = mod.id;
                if (id !== null && !submittedModules.has(id)) {
                    // options.chunk contains the current chunk, if needed
                    // Render the source, then hash, then persist hash -> module, return a placeholder
                    // Initially populate the map with unminified version; replace during callback
                    submittedModules.add(id);
                    const realId = getRealId(id);
                    if (realId !== undefined && !mod.skipMinification) {
                        const wrapped = new webpack_sources_1.ConcatSource(Constants_1.MODULE_WRAPPER_PREFIX + '\n', source, '\n' + Constants_1.MODULE_WRAPPER_SUFFIX);
                        const nameForMap = `(modules)/${realId}`;
                        const { source: wrappedCode, map } = useSourceMaps
                            ? wrapped.sourceAndMap()
                            : {
                                source: wrapped.source(),
                                map: undefined
                            };
                        const hash = hashCodeFragment(wrappedCode);
                        ++pendingMinificationRequests;
                        minifier.minify({
                            hash,
                            code: wrappedCode,
                            nameForMap: useSourceMaps ? nameForMap : undefined,
                            externals: undefined
                        }, (result) => {
                            if (isMinificationResultError(result)) {
                                compilation.errors.push(result.error);
                            }
                            else {
                                try {
                                    // Have the source map display the module id instead of the minifier boilerplate
                                    const sourceForMap = `// ${mod.readableIdentifier(requestShortener)}${wrappedCode.slice(Constants_1.MODULE_WRAPPER_PREFIX.length, -Constants_1.MODULE_WRAPPER_SUFFIX.length)}`;
                                    const { code: minified, map: minifierMap, extractedComments } = result;
                                    const rawOutput = useSourceMaps
                                        ? new webpack_sources_1.SourceMapSource(minified, // Code
                                        nameForMap, // File
                                        minifierMap, // Base source map
                                        sourceForMap, // Source from before transform
                                        map, // Source Map from before transform
                                        false // Remove original source
                                        )
                                        : new webpack_sources_1.RawSource(minified);
                                    const unwrapped = new webpack_sources_1.ReplaceSource(rawOutput);
                                    const len = minified.length;
                                    unwrapped.replace(0, Constants_1.MODULE_WRAPPER_PREFIX.length - 1, '');
                                    unwrapped.replace(len - Constants_1.MODULE_WRAPPER_SUFFIX.length, len - 1, '');
                                    const withIds = postProcessCode(unwrapped, mod.identifier());
                                    minifiedModules.set(realId, {
                                        source: new webpack_sources_1.CachedSource(withIds),
                                        extractedComments,
                                        module: mod
                                    });
                                }
                                catch (err) {
                                    compilation.errors.push(err);
                                }
                            }
                            onFileMinified();
                        });
                    }
                    else {
                        // Route any other modules straight through
                        minifiedModules.set(realId !== undefined ? realId : id, {
                            source: new webpack_sources_1.CachedSource(postProcessCode(new webpack_sources_1.ReplaceSource(source), mod.identifier())),
                            extractedComments: [],
                            module: mod
                        });
                    }
                }
                // Return something so that this stage still produces valid ECMAScript
                return new webpack_sources_1.RawSource('(function(){})');
            }
            // During code generation, send the generated code to the minifier and replace with a placeholder
            compilation.moduleTemplates.javascript.hooks.package.tap(TAP_AFTER, minifyModule);
            // This should happen before any other tasks that operate during optimizeChunkAssets
            compilation.hooks.optimizeChunkAssets.tapPromise(TAP_BEFORE, async (chunks) => {
                // Still need to minify the rendered assets
                for (const chunk of chunks) {
                    const externals = [];
                    const externalNames = new Map();
                    const chunkModuleSet = new Set();
                    const allChunkModules = chunk.modulesIterable;
                    let hasNonNumber = false;
                    for (const mod of allChunkModules) {
                        if (mod.id !== null) {
                            if (typeof mod.id !== 'number') {
                                hasNonNumber = true;
                            }
                            chunkModuleSet.add(mod.id);
                            if (mod.external) {
                                const key = `__WEBPACK_EXTERNAL_MODULE_${webpack.Template.toIdentifier(`${mod.id}`)}__`;
                                // The first two identifiers are used for function (module, exports) at the module site
                                const ordinal = 2 + externals.length;
                                const miniId = MinifiedIdentifier_1.getIdentifier(ordinal);
                                externals.push(key);
                                externalNames.set(key, miniId);
                            }
                        }
                    }
                    const chunkModules = Array.from(chunkModuleSet);
                    // Sort by id before rehydration in case we rehydrate a given chunk multiple times
                    chunkModules.sort(hasNonNumber
                        ? stringifyIdSortPredicate
                        : (x, y) => x - y);
                    for (const assetName of chunk.files) {
                        const asset = compilation.assets[assetName];
                        // Verify that this is a JS asset
                        if (/\.m?js(\?.+)?$/.test(assetName)) {
                            ++pendingMinificationRequests;
                            const rawCode = asset.source();
                            const nameForMap = `(chunks)/${assetName}`;
                            const hash = hashCodeFragment(rawCode);
                            minifier.minify({
                                hash,
                                code: rawCode,
                                nameForMap: useSourceMaps ? nameForMap : undefined,
                                externals
                            }, (result) => {
                                if (isMinificationResultError(result)) {
                                    compilation.errors.push(result.error);
                                    console.error(result.error);
                                }
                                else {
                                    try {
                                        const { code: minified, map: minifierMap, extractedComments } = result;
                                        let codeForMap = rawCode;
                                        if (useSourceMaps) {
                                            // Pretend the __WEBPACK_CHUNK_MODULES__ token is an array of module ids, so that the source map contains information about the module ids in the chunk
                                            codeForMap = codeForMap.replace(Constants_1.CHUNK_MODULES_TOKEN, JSON.stringify(chunkModules, undefined, 2));
                                        }
                                        const rawOutput = useSourceMaps
                                            ? new webpack_sources_1.SourceMapSource(minified, // Code
                                            nameForMap, // File
                                            minifierMap, // Base source map
                                            codeForMap, // Source from before transform
                                            undefined, // Source Map from before transform
                                            false // Remove original source
                                            )
                                            : new webpack_sources_1.RawSource(minified);
                                        const withIds = postProcessCode(new webpack_sources_1.ReplaceSource(rawOutput), assetName);
                                        minifiedAssets.set(assetName, {
                                            source: new webpack_sources_1.CachedSource(withIds),
                                            extractedComments,
                                            modules: chunkModules,
                                            chunk,
                                            fileName: assetName,
                                            externalNames
                                        });
                                    }
                                    catch (err) {
                                        compilation.errors.push(err);
                                    }
                                }
                                onFileMinified();
                            });
                        }
                        else {
                            // Skip minification for all other assets, though the modules still are
                            minifiedAssets.set(assetName, {
                                // Still need to restore ids
                                source: postProcessCode(new webpack_sources_1.ReplaceSource(asset), assetName),
                                extractedComments: [],
                                modules: chunkModules,
                                chunk,
                                fileName: assetName,
                                externalNames
                            });
                        }
                    }
                }
                allRequestsIssued = true;
                if (pendingMinificationRequests) {
                    await new Promise((resolve) => {
                        resolveMinifyPromise = resolve;
                    });
                }
                // Handle any error from the minifier.
                if (cleanupMinifier) {
                    await cleanupMinifier();
                }
                // All assets and modules have been minified, hand them off to be rehydrated
                // Clone the maps for safety, even though we won't be using them in the plugin anymore
                const assets = new Map(minifiedAssets);
                const modules = new Map(minifiedModules);
                await this.hooks.rehydrateAssets.promise({
                    assets,
                    modules
                }, compilation);
            });
            for (const template of [compilation.chunkTemplate, compilation.mainTemplate]) {
                template.hooks.modules.tap(TAP_AFTER, dehydrateAsset);
            }
        });
    }
}
exports.ModuleMinifierPlugin = ModuleMinifierPlugin;
//# sourceMappingURL=ModuleMinifierPlugin.js.map