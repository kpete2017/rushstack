"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.runScenarios = void 0;
const fs = require("fs");
const path = require("path");
const node_core_library_1 = require("@rushstack/node-core-library");
const api_extractor_1 = require("@microsoft/api-extractor");
function runScenarios(buildConfigPath) {
    const buildConfig = node_core_library_1.JsonFile.load(buildConfigPath);
    const entryPoints = [];
    // TODO: Eliminate this workaround
    // See GitHub issue https://github.com/microsoft/rushstack/issues/1017
    for (const scenarioFolderName of buildConfig.scenarioFolderNames) {
        const entryPoint = path.resolve(`./lib/${scenarioFolderName}/index.d.ts`);
        entryPoints.push(entryPoint);
        const overridesPath = path.resolve(`./src/${scenarioFolderName}/config/api-extractor-overrides.json`);
        const apiExtractorJsonOverrides = fs.existsSync(overridesPath) ? node_core_library_1.JsonFile.load(overridesPath) : {};
        const apiExtractorJson = Object.assign({ $schema: 'https://developer.microsoft.com/json-schemas/api-extractor/v7/api-extractor.schema.json', mainEntryPointFilePath: entryPoint, apiReport: {
                enabled: true,
                reportFolder: `<projectFolder>/etc/test-outputs/${scenarioFolderName}`
            }, dtsRollup: {
                enabled: true,
                untrimmedFilePath: `<projectFolder>/etc/test-outputs/${scenarioFolderName}/rollup.d.ts`
            }, docModel: {
                enabled: true,
                apiJsonFilePath: `<projectFolder>/etc/test-outputs/${scenarioFolderName}/<unscopedPackageName>.api.json`
            }, messages: {
                extractorMessageReporting: {
                    // For test purposes, write these warnings into .api.md
                    // TODO: Capture the full list of warnings in the tracked test output file
                    'ae-cyclic-inherit-doc': {
                        logLevel: 'warning',
                        addToApiReportFile: true
                    },
                    'ae-unresolved-link': {
                        logLevel: 'warning',
                        addToApiReportFile: true
                    }
                }
            }, testMode: true }, apiExtractorJsonOverrides);
        const apiExtractorJsonPath = `./temp/configs/api-extractor-${scenarioFolderName}.json`;
        node_core_library_1.JsonFile.save(apiExtractorJson, apiExtractorJsonPath, { ensureFolderExists: true });
    }
    let compilerState = undefined;
    let anyErrors = false;
    process.exitCode = 1;
    for (const scenarioFolderName of buildConfig.scenarioFolderNames) {
        const apiExtractorJsonPath = `./temp/configs/api-extractor-${scenarioFolderName}.json`;
        console.log('Scenario: ' + scenarioFolderName);
        // Run the API Extractor command-line
        const extractorConfig = api_extractor_1.ExtractorConfig.loadFileAndPrepare(apiExtractorJsonPath);
        if (!compilerState) {
            compilerState = api_extractor_1.CompilerState.create(extractorConfig, {
                additionalEntryPoints: entryPoints
            });
        }
        const extractorResult = api_extractor_1.Extractor.invoke(extractorConfig, {
            localBuild: true,
            showVerboseMessages: true,
            messageCallback: (message) => {
                switch (message.messageId) {
                    case "console-api-report-created" /* ApiReportCreated */:
                        // This script deletes the outputs for a clean build, so don't issue a warning if the file gets created
                        message.logLevel = "none" /* None */;
                        break;
                    case "console-preamble" /* Preamble */:
                        // Less verbose output
                        message.logLevel = "none" /* None */;
                        break;
                }
            },
            compilerState
        });
        if (extractorResult.errorCount > 0) {
            anyErrors = true;
        }
    }
    if (!anyErrors) {
        process.exitCode = 0;
    }
}
exports.runScenarios = runScenarios;
//# sourceMappingURL=runScenarios.js.map