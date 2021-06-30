"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocFileParser = void 0;
const node_core_library_1 = require("@rushstack/node-core-library");
const ResxReader_1 = require("./ResxReader");
const Constants_1 = require("./Constants");
const parseCache = new Map();
/**
 * @internal
 */
class LocFileParser {
    static parseLocFile(options) {
        const fileCacheKey = `${options.filePath}?${options.resxNewlineNormalization || 'none'}`;
        if (parseCache.has(fileCacheKey)) {
            const entry = parseCache.get(fileCacheKey);
            if (entry.content === options.content) {
                return entry.parsedFile;
            }
        }
        let parsedFile;
        if (/\.resx$/i.test(options.filePath)) {
            parsedFile = ResxReader_1.ResxReader.readResxAsLocFile(options.content, {
                terminal: options.terminal,
                resxFilePath: options.filePath,
                newlineNormalization: options.resxNewlineNormalization
            });
        }
        else {
            parsedFile = node_core_library_1.JsonFile.parseString(options.content);
            try {
                Constants_1.Constants.LOC_JSON_SCHEMA.validateObject(parsedFile, options.filePath);
            }
            catch (e) {
                options.terminal.writeError(`The loc file is invalid. Error: ${e}`);
            }
        }
        parseCache.set(fileCacheKey, { content: options.content, parsedFile });
        return parsedFile;
    }
}
exports.LocFileParser = LocFileParser;
//# sourceMappingURL=LocFileParser.js.map