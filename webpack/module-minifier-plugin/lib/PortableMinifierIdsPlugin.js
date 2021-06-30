"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PortableMinifierModuleIdsPlugin = void 0;
const crypto_1 = require("crypto");
const RequestShortener_1 = __importDefault(require("webpack/lib/RequestShortener"));
const Constants_1 = require("./Constants");
const PLUGIN_NAME = 'PortableMinifierModuleIdsPlugin';
const TAP_BEFORE = {
    name: PLUGIN_NAME,
    stage: Constants_1.STAGE_BEFORE
};
const TAP_AFTER = {
    name: PLUGIN_NAME,
    stage: Constants_1.STAGE_AFTER
};
const STABLE_MODULE_ID_PREFIX = '__MODULEID_SHA_';
const STABLE_MODULE_ID_REGEX = /['"]?(__MODULEID_SHA_[0-9a-f]+)['"]?/g;
/**
 * Plugin responsible for converting the Webpack module ids (of whatever variety) to stable ids before code is handed to the minifier, then back again.
 * Uses the node module identity of the target module. Will emit an error if it encounters multiple versions of the same package in the same compilation.
 * @public
 */
class PortableMinifierModuleIdsPlugin {
    constructor(minifierHooks) {
        this._minifierHooks = minifierHooks;
    }
    apply(compiler) {
        // Ensure that "EXTERNAL MODULE: " comments are portable and module version invariant
        const baseShorten = RequestShortener_1.default.prototype.shorten;
        RequestShortener_1.default.prototype.shorten = function (request) {
            const baseResult = baseShorten.call(this, request);
            const nodeModules = '/node_modules/';
            if (!baseResult) {
                return baseResult;
            }
            const nodeModulesIndex = baseResult.lastIndexOf(nodeModules);
            if (nodeModulesIndex < 0) {
                return baseResult;
            }
            const nodeModulePath = baseResult.slice(nodeModulesIndex + nodeModules.length);
            this.cache.set(request, nodeModulePath);
            return nodeModulePath;
        };
        const nameByResource = new Map();
        /**
         * Figure out portable ids for modules by using their id based on the node module resolution algorithm
         */
        compiler.hooks.normalModuleFactory.tap(PLUGIN_NAME, (nmf) => {
            nmf.hooks.module.tap(PLUGIN_NAME, (mod, data) => {
                const { resourceResolveData: resolveData } = data;
                if (resolveData) {
                    const { descriptionFileData: packageJson, relativePath } = resolveData;
                    if (packageJson && relativePath) {
                        const nodeId = `${packageJson.name}${relativePath.slice(1).replace(/\.js(on)?$/, '')}`;
                        nameByResource.set(mod.resource, nodeId);
                        return mod;
                    }
                }
                console.error(`Missing resolution data for ${mod.resource}`);
                return mod;
            });
        });
        const stableIdToFinalId = new Map();
        this._minifierHooks.finalModuleId.tap(PLUGIN_NAME, (id) => {
            return id === undefined ? id : stableIdToFinalId.get(id);
        });
        this._minifierHooks.postProcessCodeFragment.tap(PLUGIN_NAME, (source, context) => {
            const code = source.original().source();
            STABLE_MODULE_ID_REGEX.lastIndex = -1;
            // RegExp.exec uses null or an array as the return type, explicitly
            let match = null;
            while ((match = STABLE_MODULE_ID_REGEX.exec(code))) {
                const id = match[1];
                const mapped = stableIdToFinalId.get(id);
                if (mapped === undefined) {
                    console.error(`Missing module id for ${id} in ${context}!`);
                }
                source.replace(match.index, STABLE_MODULE_ID_REGEX.lastIndex - 1, JSON.stringify(mapped));
            }
            return source;
        });
        compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
            stableIdToFinalId.clear();
            // Make module ids portable immediately before rendering.
            // Unfortunately, other means of altering these ids don't work in Webpack 4 without a lot more code and work.
            // Namely, a number of functions reference "module.id" directly during code generation
            compilation.hooks.beforeChunkAssets.tap(TAP_AFTER, () => {
                // For tracking collisions
                const resourceById = new Map();
                for (const mod of compilation.modules) {
                    const originalId = mod.id;
                    // Need to handle ConcatenatedModules, which don't have the resource property directly
                    const resource = (mod.rootModule || mod).resource;
                    // Map to the friendly node module identifier
                    const preferredId = nameByResource.get(resource);
                    if (preferredId) {
                        const hashId = crypto_1.createHash('sha256').update(preferredId).digest('hex');
                        // This is designed to be an easily regex-findable string
                        const stableId = `${STABLE_MODULE_ID_PREFIX}${hashId}`;
                        const existingResource = resourceById.get(stableId);
                        if (existingResource) {
                            compilation.errors.push(new Error(`Module id collision for ${resource} with ${existingResource}.\n This means you are bundling multiple versions of the same module.`));
                        }
                        stableIdToFinalId.set(stableId, originalId);
                        // Record to detect collisions
                        resourceById.set(stableId, resource);
                        mod.id = stableId;
                    }
                }
            });
            // This is the hook immediately following chunk asset rendering. Fix the module ids.
            compilation.hooks.additionalChunkAssets.tap(TAP_BEFORE, () => {
                // Restore module ids in case any later hooks need them
                for (const mod of compilation.modules) {
                    const stableId = mod.id;
                    const finalId = stableIdToFinalId.get(stableId);
                    if (finalId !== undefined) {
                        mod.id = finalId;
                    }
                }
            });
        });
    }
}
exports.PortableMinifierModuleIdsPlugin = PortableMinifierModuleIdsPlugin;
//# sourceMappingURL=PortableMinifierIdsPlugin.js.map