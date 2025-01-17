import { Terminal } from '@rushstack/node-core-library';
import { HeftConfiguration } from '../configuration/HeftConfiguration';
import { InternalHeftSession } from './InternalHeftSession';
export interface IPluginManagerOptions {
    terminal: Terminal;
    heftConfiguration: HeftConfiguration;
    internalHeftSession: InternalHeftSession;
}
export declare class PluginManager {
    private _terminal;
    private _heftConfiguration;
    private _internalHeftSession;
    private _appliedPlugins;
    private _appliedPluginNames;
    constructor(options: IPluginManagerOptions);
    initializeDefaultPlugins(): void;
    initializePlugin(pluginSpecifier: string, options?: object): void;
    initializePluginsFromConfigFileAsync(): Promise<void>;
    afterInitializeAllPlugins(): void;
    private _initializeResolvedPlugin;
    private _applyPlugin;
    private _loadAndValidatePluginPackage;
    private _resolvePlugin;
}
//# sourceMappingURL=PluginManager.d.ts.map