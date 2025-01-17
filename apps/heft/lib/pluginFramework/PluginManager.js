"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.PluginManager = void 0;
const node_core_library_1 = require("@rushstack/node-core-library");
const CoreConfigFiles_1 = require("../utilities/CoreConfigFiles");
// Default plugins
const CopyFilesPlugin_1 = require("../plugins/CopyFilesPlugin");
const TypeScriptPlugin_1 = require("../plugins/TypeScriptPlugin/TypeScriptPlugin");
const DeleteGlobsPlugin_1 = require("../plugins/DeleteGlobsPlugin");
const CopyStaticAssetsPlugin_1 = require("../plugins/CopyStaticAssetsPlugin");
const RunScriptPlugin_1 = require("../plugins/RunScriptPlugin");
const ApiExtractorPlugin_1 = require("../plugins/ApiExtractorPlugin/ApiExtractorPlugin");
const SassTypingsPlugin_1 = require("../plugins/SassTypingsPlugin/SassTypingsPlugin");
const ProjectValidatorPlugin_1 = require("../plugins/ProjectValidatorPlugin");
const ToolPackageResolver_1 = require("../utilities/ToolPackageResolver");
const NodeServicePlugin_1 = require("../plugins/NodeServicePlugin");
class PluginManager {
    constructor(options) {
        this._appliedPlugins = [];
        this._appliedPluginNames = new Set();
        this._terminal = options.terminal;
        this._heftConfiguration = options.heftConfiguration;
        this._internalHeftSession = options.internalHeftSession;
    }
    initializeDefaultPlugins() {
        const taskPackageResolver = new ToolPackageResolver_1.ToolPackageResolver();
        this._applyPlugin(new TypeScriptPlugin_1.TypeScriptPlugin(taskPackageResolver));
        this._applyPlugin(new CopyStaticAssetsPlugin_1.CopyStaticAssetsPlugin());
        this._applyPlugin(new CopyFilesPlugin_1.CopyFilesPlugin());
        this._applyPlugin(new DeleteGlobsPlugin_1.DeleteGlobsPlugin());
        this._applyPlugin(new RunScriptPlugin_1.RunScriptPlugin());
        this._applyPlugin(new ApiExtractorPlugin_1.ApiExtractorPlugin(taskPackageResolver));
        this._applyPlugin(new SassTypingsPlugin_1.SassTypingsPlugin());
        this._applyPlugin(new ProjectValidatorPlugin_1.ProjectValidatorPlugin());
        this._applyPlugin(new NodeServicePlugin_1.NodeServicePlugin());
    }
    initializePlugin(pluginSpecifier, options) {
        const resolvedPluginPath = this._resolvePlugin(pluginSpecifier);
        this._initializeResolvedPlugin(resolvedPluginPath, options);
    }
    async initializePluginsFromConfigFileAsync() {
        const heftConfigurationJson = await CoreConfigFiles_1.CoreConfigFiles.heftConfigFileLoader.tryLoadConfigurationFileForProjectAsync(this._heftConfiguration.globalTerminal, this._heftConfiguration.buildFolder, this._heftConfiguration.rigConfig);
        const heftPluginSpecifiers = (heftConfigurationJson === null || heftConfigurationJson === void 0 ? void 0 : heftConfigurationJson.heftPlugins) || [];
        for (const pluginSpecifier of heftPluginSpecifiers) {
            this._initializeResolvedPlugin(pluginSpecifier.plugin, pluginSpecifier.options);
        }
    }
    afterInitializeAllPlugins() {
        for (const appliedPlugin of this._appliedPlugins) {
            this._internalHeftSession.applyPluginHooks(appliedPlugin);
        }
    }
    _initializeResolvedPlugin(resolvedPluginPath, options) {
        const plugin = this._loadAndValidatePluginPackage(resolvedPluginPath, options);
        if (this._appliedPluginNames.has(plugin.pluginName)) {
            throw new Error(`Error applying plugin "${resolvedPluginPath}": A plugin with name "${plugin.pluginName}" has ` +
                'already been applied');
        }
        else {
            this._applyPlugin(plugin, options);
        }
    }
    _applyPlugin(plugin, options) {
        try {
            const heftSession = this._internalHeftSession.getSessionForPlugin(plugin);
            plugin.apply(heftSession, this._heftConfiguration, options);
            this._appliedPlugins.push(plugin);
            this._appliedPluginNames.add(plugin.pluginName);
        }
        catch (e) {
            throw new node_core_library_1.InternalError(`Error applying "${plugin.pluginName}": ${e}`);
        }
    }
    _loadAndValidatePluginPackage(resolvedPluginPath, options) {
        let pluginPackage;
        try {
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const loadedPluginPackage = require(resolvedPluginPath);
            pluginPackage = loadedPluginPackage.default || loadedPluginPackage;
        }
        catch (e) {
            throw new node_core_library_1.InternalError(`Error loading plugin package from "${resolvedPluginPath}": ${e}`);
        }
        if (!pluginPackage) {
            throw new node_core_library_1.InternalError(`Plugin package loaded from "${resolvedPluginPath}" is null or undefined.`);
        }
        this._terminal.writeVerboseLine(`Loaded plugin package from "${resolvedPluginPath}"`);
        if (!pluginPackage.apply || typeof pluginPackage.apply !== 'function') {
            throw new node_core_library_1.InternalError(`Plugin packages must define an "apply" function. The plugin loaded from "${resolvedPluginPath}" ` +
                'either doesn\'t define an "apply" property, or its value isn\'t a function.');
        }
        if (!pluginPackage.pluginName || typeof pluginPackage.pluginName !== 'string') {
            throw new node_core_library_1.InternalError(`Plugin packages must define a "pluginName" property. The plugin loaded from "${resolvedPluginPath}" ` +
                'either doesn\'t define a "pluginName" property, or its value isn\'t a string.');
        }
        if (options && pluginPackage.optionsSchema) {
            try {
                pluginPackage.optionsSchema.validateObject(options, 'config/heft.json');
            }
            catch (e) {
                throw new Error(`Provided options for plugin "${pluginPackage.pluginName}" did not match the provided plugin schema.\n${e}`);
            }
        }
        return pluginPackage;
    }
    _resolvePlugin(pluginSpecifier) {
        let resolvedPluginPath;
        this._terminal.writeVerboseLine(`Resolving plugin ${pluginSpecifier}`);
        try {
            resolvedPluginPath = node_core_library_1.Import.resolveModule({
                modulePath: pluginSpecifier,
                baseFolderPath: this._heftConfiguration.buildFolder
            });
        }
        catch (e) {
            throw new node_core_library_1.InternalError(`Error resolving specified plugin "${pluginSpecifier}". Resolve error: ${e}`);
        }
        if (!resolvedPluginPath) {
            throw new node_core_library_1.InternalError(`Error resolving specified plugin "${pluginSpecifier}".`);
        }
        this._terminal.writeVerboseLine(`Resolved plugin path to ${resolvedPluginPath}`);
        return resolvedPluginPath;
    }
}
exports.PluginManager = PluginManager;
//# sourceMappingURL=PluginManager.js.map