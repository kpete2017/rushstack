"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See the @microsoft/rush package's LICENSE file for license information.
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
exports.ReadmeAction = void 0;
const path = __importStar(require("path"));
const node_core_library_1 = require("@rushstack/node-core-library");
const rush_lib_1 = require("@microsoft/rush-lib");
const ts_command_line_1 = require("@rushstack/ts-command-line");
const GENERATED_PROJECT_SUMMARY_START_COMMENT_TEXT = '<!-- GENERATED PROJECT SUMMARY START -->';
const GENERATED_PROJECT_SUMMARY_END_COMMENT_TEXT = '<!-- GENERATED PROJECT SUMMARY END -->';
class ReadmeAction extends ts_command_line_1.CommandLineAction {
    constructor() {
        super({
            actionName: 'readme',
            summary: 'Generates README.md project table based on rush.json inventory',
            documentation: "Use this to update the repo's README.md"
        });
    }
    static _isPublished(project) {
        return project.shouldPublish || !!project.versionPolicyName;
    }
    async onExecute() {
        // abstract
        const rushConfiguration = rush_lib_1.RushConfiguration.loadFromDefaultLocation();
        const repoReadmePath = path.resolve(rushConfiguration.rushJsonFolder, 'README.md');
        const existingReadme = await node_core_library_1.FileSystem.readFileAsync(repoReadmePath);
        const generatedProjectSummaryStartIndex = existingReadme.indexOf(GENERATED_PROJECT_SUMMARY_START_COMMENT_TEXT);
        const generatedProjectSummaryEndIndex = existingReadme.indexOf(GENERATED_PROJECT_SUMMARY_END_COMMENT_TEXT);
        if (generatedProjectSummaryStartIndex === -1 || generatedProjectSummaryEndIndex === -1) {
            throw new Error(`Unable to find "${GENERATED_PROJECT_SUMMARY_START_COMMENT_TEXT}" or ` +
                `"${GENERATED_PROJECT_SUMMARY_END_COMMENT_TEXT}" comment in "${repoReadmePath}"`);
        }
        const readmePrefix = existingReadme.substr(0, generatedProjectSummaryStartIndex + GENERATED_PROJECT_SUMMARY_START_COMMENT_TEXT.length);
        const readmePostfix = existingReadme.substr(generatedProjectSummaryEndIndex);
        const builder = new node_core_library_1.StringBuilder();
        const orderedProjects = [...rushConfiguration.projects];
        node_core_library_1.Sort.sortBy(orderedProjects, (x) => x.projectRelativeFolder);
        builder.append(readmePrefix);
        builder.append('\n');
        builder.append('\n');
        builder.append('## Published Packages\n\n');
        builder.append('<!-- the table below was generated using the ./repo-scripts/repo-toolbox script -->\n\n');
        builder.append('| Folder | Version | Changelog | Package |\n');
        builder.append('| ------ | ------- | --------- | ------- |\n');
        for (const project of orderedProjects.filter((x) => ReadmeAction._isPublished(x))) {
            // Example:
            //
            // | [/apps/api-extractor](./apps/api-extractor/)
            // | [![npm version](https://badge.fury.io/js/%40microsoft%2Fapi-extractor.svg
            //     )](https://badge.fury.io/js/%40microsoft%2Fapi-extractor)
            // | [changelog](./apps/api-extractor/CHANGELOG.md)
            // | [@microsoft/api-extractor](https://www.npmjs.com/package/@microsoft/api-extractor)
            // |
            const scopedName = project.packageName; // "@microsoft/api-extractor"
            const folderPath = project.projectRelativeFolder; // "apps/api-extractor"
            let escapedScopedName = scopedName; // "%40microsoft%2Fapi-extractor"
            escapedScopedName = node_core_library_1.Text.replaceAll(escapedScopedName, '/', '%2F');
            escapedScopedName = node_core_library_1.Text.replaceAll(escapedScopedName, '@', '%40');
            // | [/apps/api-extractor](./apps/api-extractor/)
            builder.append(`| [/${folderPath}](./${folderPath}/) `);
            // | [![npm version](https://badge.fury.io/js/%40microsoft%2Fapi-extractor.svg
            //     )](https://badge.fury.io/js/%40microsoft%2Fapi-extractor)
            builder.append(`| [![npm version](https://badge.fury.io/js/${escapedScopedName}.svg)]` +
                `(https://badge.fury.io/js/${escapedScopedName}) `);
            let hasChangeLog = true;
            if (project.versionPolicy instanceof rush_lib_1.LockStepVersionPolicy) {
                if (project.versionPolicy.mainProject) {
                    if (project.versionPolicy.mainProject !== project.packageName) {
                        hasChangeLog = false;
                    }
                }
            }
            // | [changelog](./apps/api-extractor/CHANGELOG.md)
            if (hasChangeLog) {
                builder.append(`| [changelog](./${folderPath}/CHANGELOG.md) `);
            }
            else {
                builder.append(`| `);
            }
            // | [@microsoft/api-extractor](https://www.npmjs.com/package/@microsoft/api-extractor)
            builder.append(`| [${scopedName}](https://www.npmjs.com/package/${scopedName}) `);
            builder.append(`|\n`);
        }
        builder.append('\n\n## Unpublished Local Projects\n\n');
        builder.append('<!-- the table below was generated using the ./repo-scripts/repo-toolbox script -->\n\n');
        builder.append('| Folder | Description |\n');
        builder.append('| ------ | -----------|\n');
        for (const project of orderedProjects.filter((x) => !ReadmeAction._isPublished(x))) {
            const folderPath = project.projectRelativeFolder; // "apps/api-extractor"
            // | [/apps/api-extractor](./apps/api-extractor/)
            builder.append(`| [/${folderPath}](./${folderPath}/) `);
            const description = (project.packageJson.description || '').replace(/[\n\r|]+/g, '');
            builder.append(`| ${description} `);
            builder.append(`|\n`);
        }
        builder.append(readmePostfix);
        console.log(`Writing ${repoReadmePath}`);
        node_core_library_1.FileSystem.writeFile(repoReadmePath, builder.toString());
        console.log('\nSuccess.');
    }
    onDefineParameters() {
        // abstract
    }
}
exports.ReadmeAction = ReadmeAction;
//# sourceMappingURL=ReadmeAction.js.map