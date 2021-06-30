"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runAsync = void 0;
const JestPlugin_1 = require("../JestPlugin");
async function runAsync(options) {
    // Use the shared config file directly
    const jestPluginOptions = {
        configurationPath: './includes/jest-shared.config.json',
        disableConfigurationModuleResolution: false
    };
    await JestPlugin_1.JestPlugin._setupJestAsync(options.scopedLogger, options.heftConfiguration, options.debugMode, options.properties, jestPluginOptions);
}
exports.runAsync = runAsync;
//# sourceMappingURL=setupJestPlugin.js.map