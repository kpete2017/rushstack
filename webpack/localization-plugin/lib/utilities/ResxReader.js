"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResxReader = void 0;
const node_core_library_1 = require("@rushstack/node-core-library");
const xmldoc_1 = require("xmldoc");
const STRING_NAME_RESX = /^[A-z_$][A-z0-9_$]*$/;
class ResxReader {
    static readResxFileAsLocFile(options) {
        const resxContents = node_core_library_1.FileSystem.readFile(options.resxFilePath);
        return ResxReader.readResxAsLocFile(resxContents, options);
    }
    static readResxAsLocFile(resxContents, options) {
        const writeError = options.terminal.writeErrorLine.bind(options.terminal);
        const writeWarning = options.terminal.writeWarningLine.bind(options.terminal);
        const loggingFunctions = {
            logError: (message) => writeError(message),
            logWarning: (message) => writeWarning(message),
            logFileError: (message, filePath, line, position) => {
                ResxReader._logWithLocation(writeError, message, filePath, line, position);
            },
            logFileWarning: (message, filePath, line, position) => {
                ResxReader._logWithLocation(writeWarning, message, filePath, line, position);
            }
        };
        return this._readResxAsLocFileInternal({
            resxFilePath: options.resxFilePath,
            resxContents,
            loggingFunctions,
            newlineNormalization: options.newlineNormalization
        });
    }
    static _readResxAsLocFileInternal(options) {
        const xmlDocument = new xmldoc_1.XmlDocument(options.resxContents);
        if (xmlDocument.name !== 'root') {
            ResxReader._logErrorWithLocation(options, `Expected RESX to have a "root" element, found "${xmlDocument.name}"`, xmlDocument);
        }
        const locFile = {};
        for (const childNode of xmlDocument.children) {
            switch (childNode.type) {
                case 'element': {
                    switch (childNode.name) {
                        case 'data': {
                            const stringName = childNode.attr.name;
                            if (!stringName) {
                                ResxReader._logErrorWithLocation(options, 'Unexpected missing or empty string name', childNode);
                            }
                            else if (!STRING_NAME_RESX.test(stringName)) {
                                ResxReader._logErrorWithLocation(options, `Invalid string name "${stringName}"`, childNode);
                            }
                            else {
                                if (locFile.hasOwnProperty(stringName)) {
                                    ResxReader._logErrorWithLocation(options, `Duplicate string value "${stringName}"`, childNode);
                                }
                                const locString = ResxReader._readDataElement(options, childNode);
                                if (locString) {
                                    locFile[stringName] = locString;
                                }
                            }
                            break;
                        }
                        // Other allowed elements
                        case 'xsd:schema':
                        case 'resheader':
                            break;
                        default:
                            ResxReader._logErrorWithLocation(options, `Unexpected RESX element ${childNode.name}`, childNode);
                    }
                    break;
                }
                case 'text': {
                    if (childNode.text.trim() !== '') {
                        ResxReader._logErrorWithLocation(options, 'Found unexpected non-empty text node in RESX');
                    }
                    break;
                }
                case 'comment':
                    break;
                default:
                    ResxReader._logErrorWithLocation(options, `Unexpected ${childNode.type} child in RESX`);
                    break;
            }
        }
        return locFile;
    }
    static _readDataElement(options, dataElement) {
        let foundCommentElement = false;
        let foundValueElement = false;
        let comment = undefined;
        let value = undefined;
        for (const childNode of dataElement.children) {
            switch (childNode.type) {
                case 'element': {
                    switch (childNode.name) {
                        case 'value': {
                            if (foundValueElement) {
                                ResxReader._logErrorWithLocation(options, 'Duplicate <value> element found', childNode);
                            }
                            else {
                                foundValueElement = true;
                                value = ResxReader._readTextElement(options, childNode);
                                if (value && options.newlineNormalization) {
                                    value = node_core_library_1.Text.convertTo(value, options.newlineNormalization);
                                }
                            }
                            break;
                        }
                        case 'comment': {
                            if (foundCommentElement) {
                                ResxReader._logErrorWithLocation(options, 'Duplicate <comment> element found', childNode);
                            }
                            else {
                                foundCommentElement = true;
                                comment = ResxReader._readTextElement(options, childNode);
                            }
                            break;
                        }
                        default:
                            ResxReader._logErrorWithLocation(options, `Unexpected RESX element ${childNode.name}`, childNode);
                            break;
                    }
                    break;
                }
                case 'text': {
                    if (childNode.text.trim() !== '') {
                        ResxReader._logErrorWithLocation(options, 'Found unexpected non-empty text node in RESX <data> element', dataElement);
                    }
                    break;
                }
                case 'comment':
                    break;
                default:
                    ResxReader._logErrorWithLocation(options, `Unexpected ${childNode.type} child in RESX <data> element`, dataElement);
            }
        }
        if (!foundValueElement) {
            ResxReader._logErrorWithLocation(options, 'Missing string value in <data> element', dataElement);
        }
        else {
            if (comment === undefined) {
                ResxReader._logWarningWithLocation(options, 'Missing string comment in <data> element', dataElement);
            }
            return {
                value: value || '',
                comment
            };
        }
    }
    static _readTextElement(options, element) {
        let foundText = undefined;
        for (const childNode of element.children) {
            switch (childNode.type) {
                case 'cdata':
                case 'text': {
                    if (foundText !== undefined) {
                        ResxReader._logErrorWithLocation(options, 'More than one child node found containing text content', element);
                        break;
                    }
                    foundText = childNode.type === 'text' ? childNode.text : childNode.cdata;
                    break;
                }
                case 'comment':
                    break;
                case 'element':
                    ResxReader._logErrorWithLocation(options, `Unexpected element`, childNode);
                    break;
                default:
                    ResxReader._logErrorWithLocation(options, `Unexpected ${element.type} child`, element);
                    break;
            }
        }
        return foundText;
    }
    static _logErrorWithLocation(options, message, element) {
        if (element) {
            options.loggingFunctions.logFileError(message, options.resxFilePath, element.line + 1, element.column + 1);
        }
        else {
            options.loggingFunctions.logFileError(message, options.resxFilePath);
        }
    }
    static _logWarningWithLocation(options, message, element) {
        if (element) {
            options.loggingFunctions.logFileWarning(message, options.resxFilePath, element.line + 1, element.column + 1);
        }
        else {
            options.loggingFunctions.logFileWarning(message, options.resxFilePath);
        }
    }
    static _logWithLocation(loggingFn, message, filePath, line, position) {
        let location;
        if (position !== undefined) {
            location = `${filePath}(${line},${position})`;
        }
        else if (line !== undefined) {
            location = `${filePath}(${line})`;
        }
        else {
            location = filePath;
        }
        loggingFn(`${location}: ${message}`);
    }
}
exports.ResxReader = ResxReader;
//# sourceMappingURL=ResxReader.js.map