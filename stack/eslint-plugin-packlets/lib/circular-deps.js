"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.circularDeps = void 0;
const experimental_utils_1 = require("@typescript-eslint/experimental-utils");
const PackletAnalyzer_1 = require("./PackletAnalyzer");
const DependencyAnalyzer_1 = require("./DependencyAnalyzer");
const Path_1 = require("./Path");
const circularDeps = {
    meta: {
        type: 'problem',
        messages: { 'circular-import': 'Packlet imports create a circular reference:\n{{report}}' },
        schema: [
            {
                type: 'object',
                additionalProperties: false
            }
        ],
        docs: {
            description: 'Check for circular dependencies between packlets',
            category: 'Best Practices',
            recommended: 'warn',
            url: 'https://www.npmjs.com/package/@rushstack/eslint-plugin-packlets'
        }
    },
    create: (context) => {
        // Example: /path/to/my-project/src/packlets/my-packlet/index.ts
        const inputFilePath = context.getFilename();
        // Example: /path/to/my-project/tsconfig.json
        const program = experimental_utils_1.ESLintUtils.getParserServices(context).program;
        const tsconfigFilePath = program.getCompilerOptions()['configFilePath'];
        const packletAnalyzer = PackletAnalyzer_1.PackletAnalyzer.analyzeInputFile(inputFilePath, tsconfigFilePath);
        if (packletAnalyzer.nothingToDo) {
            return {};
        }
        return {
            // Match the first node in the source file.  Ideally we should be matching "Program > :first-child"
            // so a warning doesn't highlight the whole file.  But that's blocked behind a bug in the query selector:
            // https://github.com/estools/esquery/issues/114
            Program: (node) => {
                if (packletAnalyzer.isEntryPoint && !packletAnalyzer.error) {
                    const packletImports = DependencyAnalyzer_1.DependencyAnalyzer.checkEntryPointForCircularImport(packletAnalyzer.inputFilePackletName, packletAnalyzer, program);
                    if (packletImports) {
                        const tsconfigFileFolder = Path_1.Path.dirname(tsconfigFilePath);
                        const affectedPackletNames = packletImports.map((x) => x.packletName);
                        // If 3 different packlets form a circular dependency, we don't need to report the same warning 3 times.
                        // Instead, only report the warning for the alphabetically smallest packlet.
                        affectedPackletNames.sort();
                        if (affectedPackletNames[0] === packletAnalyzer.inputFilePackletName) {
                            let report = '';
                            for (const packletImport of packletImports) {
                                const filePath = Path_1.Path.relative(tsconfigFileFolder, packletImport.fromFilePath);
                                report += `"${packletImport.packletName}" is referenced by ${filePath}\n`;
                            }
                            context.report({
                                node: node,
                                messageId: 'circular-import',
                                data: { report: report }
                            });
                        }
                    }
                }
            }
        };
    }
};
exports.circularDeps = circularDeps;
//# sourceMappingURL=circular-deps.js.map