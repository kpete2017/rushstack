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
exports.readme = void 0;
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const experimental_utils_1 = require("@typescript-eslint/experimental-utils");
const PackletAnalyzer_1 = require("./PackletAnalyzer");
const readme = {
    meta: {
        type: 'problem',
        messages: {
            'missing-readme': 'The ESLint configuration requires each packlet to provide a README.md file summarizing' +
                ' its purpose and usage: {{readmePath}}',
            'readme-too-short': 'The ESLint configuration requires at least {{minimumReadmeWords}} words of documentation in the' +
                ' README.md file: {{readmePath}}',
            'error-reading-file': 'Error reading input file {{readmePath}}:\n{{errorMessage}}'
        },
        schema: [
            {
                type: 'object',
                properties: {
                    minimumReadmeWords: {
                        type: 'number'
                    }
                },
                additionalProperties: false
            }
        ],
        docs: {
            description: 'Require each packlet folder to have a README.md file summarizing its purpose and usage',
            category: 'Best Practices',
            // Too strict to be recommended in the default configuration
            recommended: false,
            url: 'https://www.npmjs.com/package/@rushstack/eslint-plugin-packlets'
        }
    },
    create: (context) => {
        var _a;
        const minimumReadmeWords = ((_a = context.options[0]) === null || _a === void 0 ? void 0 : _a.minimumReadmeWords) || 10;
        // Example: /path/to/my-project/src/packlets/my-packlet/index.ts
        const inputFilePath = context.getFilename();
        // Example: /path/to/my-project/tsconfig.json
        const tsconfigFilePath = experimental_utils_1.ESLintUtils.getParserServices(context).program.getCompilerOptions()['configFilePath'];
        const packletAnalyzer = PackletAnalyzer_1.PackletAnalyzer.analyzeInputFile(inputFilePath, tsconfigFilePath);
        if (!packletAnalyzer.nothingToDo && !packletAnalyzer.error) {
            if (packletAnalyzer.isEntryPoint) {
                return {
                    Program: (node) => {
                        const readmePath = path.join(packletAnalyzer.packletsFolderPath, packletAnalyzer.inputFilePackletName, 'README.md');
                        try {
                            if (!fs.existsSync(readmePath)) {
                                context.report({
                                    node: node,
                                    messageId: 'missing-readme',
                                    data: { readmePath }
                                });
                            }
                            else {
                                if (minimumReadmeWords > 0) {
                                    const readmeContent = fs.readFileSync(readmePath).toString();
                                    const words = readmeContent.split(/[^a-z'"]+/i).filter((x) => x.length > 0);
                                    if (words.length < minimumReadmeWords) {
                                        context.report({
                                            node: node,
                                            messageId: 'readme-too-short',
                                            data: { readmePath, minimumReadmeWords }
                                        });
                                    }
                                }
                            }
                        }
                        catch (error) {
                            context.report({
                                node: node,
                                messageId: 'error-reading-file',
                                data: { readmePath, errorMessage: error.toString() }
                            });
                        }
                    }
                };
            }
        }
        return {};
    }
};
exports.readme = readme;
//# sourceMappingURL=readme.js.map