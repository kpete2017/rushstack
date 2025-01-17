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
exports.Tslint = void 0;
const path = __importStar(require("path"));
const crypto = __importStar(require("crypto"));
const node_core_library_1 = require("@rushstack/node-core-library");
const LinterBase_1 = require("./LinterBase");
const FileError_1 = require("../../pluginFramework/logging/FileError");
class Tslint extends LinterBase_1.LinterBase {
    constructor(options) {
        super('tslint', options);
        this._tslint = require(options.tslintPackagePath);
        this._cachedFileSystem = options.cachedFileSystem;
    }
    /**
     * Returns the sha1 hash of the contents of the config file at the provided path and the
     * the configs files that the referenced file extends.
     *
     * @param previousHash - If supplied, the hash is updated with the contents of the
     * file's extended configs and itself before being returned. Passing a digested hash to
     * this parameter will result in an error.
     */
    static getConfigHash(configFilePath, terminal, cachedFileSystem, previousHash) {
        terminal.writeVerboseLine(`Examining config file "${configFilePath}"`);
        // if configFilePath is not a json file, assume that it is a package whose package.json
        // specifies a "main" file which is a config file, per the "extends" spec of tslint.json, found at
        //  https://palantir.github.io/tslint/usage/configuration/
        if (!configFilePath.endsWith('.json')) {
            configFilePath = node_core_library_1.Import.resolveModule({
                modulePath: configFilePath,
                baseFolderPath: path.dirname(configFilePath)
            });
        }
        const rawConfig = cachedFileSystem.readFile(configFilePath);
        const parsedConfig = node_core_library_1.JsonFile.parseString(rawConfig);
        const extendsProperty = parsedConfig.extends;
        let hash = previousHash || crypto.createHash('sha1');
        if (extendsProperty instanceof Array) {
            for (const extendFile of extendsProperty) {
                const extendFilePath = node_core_library_1.Import.resolveModule({
                    modulePath: extendFile,
                    baseFolderPath: path.dirname(configFilePath)
                });
                hash = Tslint.getConfigHash(extendFilePath, terminal, cachedFileSystem, hash);
            }
        }
        else if (extendsProperty) {
            // note that if we get here, extendsProperty is a string
            const extendsFullPath = node_core_library_1.Import.resolveModule({
                modulePath: extendsProperty,
                baseFolderPath: path.dirname(configFilePath)
            });
            hash = Tslint.getConfigHash(extendsFullPath, terminal, cachedFileSystem, hash);
        }
        return hash.update(rawConfig);
    }
    printVersionHeader() {
        this._terminal.writeLine(`Using TSLint version ${this._tslint.Linter.VERSION}`);
    }
    reportFailures() {
        var _a;
        if ((_a = this._lintResult.failures) === null || _a === void 0 ? void 0 : _a.length) {
            this._terminal.writeWarningLine(`Encountered ${this._lintResult.failures.length} TSLint issues${this._lintResult.failures.length > 1 ? 's' : ''}:`);
            for (const tslintFailure of this._lintResult.failures) {
                const buildFolderRelativeFilename = path.relative(this._buildFolderPath, tslintFailure.getFileName());
                const { line, character } = tslintFailure.getStartPosition().getLineAndCharacter();
                const formattedFailure = `(${tslintFailure.getRuleName()}) ${tslintFailure.getFailure()}`;
                const errorObject = new FileError_1.FileError(formattedFailure, buildFolderRelativeFilename, line + 1, character + 1);
                switch (tslintFailure.getRuleSeverity()) {
                    case 'error': {
                        this._scopedLogger.emitError(errorObject);
                        break;
                    }
                    case 'warning': {
                        this._scopedLogger.emitWarning(errorObject);
                        break;
                    }
                }
            }
        }
    }
    get cacheVersion() {
        const tslintConfigHash = Tslint.getConfigHash(this._linterConfigFilePath, this._terminal, this._cachedFileSystem);
        const tslintConfigVersion = `${this._tslint.Linter.VERSION}_${tslintConfigHash.digest('hex')}`;
        return tslintConfigVersion;
    }
    async initializeAsync(tsProgram) {
        this._tslintConfiguration = this._tslint.Configuration.loadConfigurationFromPath(this._linterConfigFilePath);
        this._linter = new this._tslint.Linter({
            fix: false,
            rulesDirectory: this._tslintConfiguration.rulesDirectory
        }, tsProgram);
        this._enabledRules = this._linter.getEnabledRules(this._tslintConfiguration, false);
        this._ruleSeverityMap = new Map(this._enabledRules.map((rule) => [
            rule.getOptions().ruleName,
            rule.getOptions().ruleSeverity
        ]));
    }
    lintFile(sourceFile) {
        // Some of this code comes from here:
        // https://github.com/palantir/tslint/blob/24d29e421828348f616bf761adb3892bcdf51662/src/linter.ts#L161-L179
        // Modified to only lint files that have changed and that we care about
        const failures = this._linter.getAllFailures(sourceFile, this._enabledRules);
        for (const failure of failures) {
            const severity = this._ruleSeverityMap.get(failure.getRuleName());
            if (severity === undefined) {
                throw new Error(`Severity for rule '${failure.getRuleName()}' not found`);
            }
            failure.setRuleSeverity(severity);
        }
        return failures;
    }
    lintingFinished(failures) {
        this._linter.failures = failures;
        this._lintResult = this._linter.getResult();
    }
    async isFileExcludedAsync(filePath) {
        return this._tslint.Configuration.isFileExcluded(filePath, this._tslintConfiguration);
    }
}
exports.Tslint = Tslint;
//# sourceMappingURL=Tslint.js.map