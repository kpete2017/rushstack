"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocFileTypingsGenerator = void 0;
const typings_generator_1 = require("@rushstack/typings-generator");
const LocFileParser_1 = require("./utilities/LocFileParser");
/**
 * This is a simple tool that generates .d.ts files for .loc.json and .resx files.
 *
 * @public
 */
class LocFileTypingsGenerator extends typings_generator_1.StringValuesTypingsGenerator {
    constructor(options) {
        super(Object.assign(Object.assign({}, options), { fileExtensions: ['.resx', '.loc.json'], parseAndGenerateTypings: (fileContents, filePath) => {
                const locFileData = LocFileParser_1.LocFileParser.parseLocFile({
                    filePath: filePath,
                    content: fileContents,
                    terminal: this._options.terminal,
                    resxNewlineNormalization: options.resxNewlineNormalization
                });
                const typings = [];
                // eslint-disable-next-line guard-for-in
                for (const stringName in locFileData) {
                    typings.push({
                        exportName: stringName,
                        comment: locFileData[stringName].comment
                    });
                }
                return { typings };
            } }));
    }
}
exports.LocFileTypingsGenerator = LocFileTypingsGenerator;
//# sourceMappingURL=LocFileTypingsGenerator.js.map