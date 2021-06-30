"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
const node_core_library_1 = require("@rushstack/node-core-library");
const LocFileParser_1 = require("../utilities/LocFileParser");
const LoaderFactory_1 = require("./LoaderFactory");
const LoaderTerminalProvider_1 = require("../utilities/LoaderTerminalProvider");
exports.default = LoaderFactory_1.loaderFactory(function (locFilePath, content, options) {
    const locFileData = LocFileParser_1.LocFileParser.parseLocFile({
        content,
        filePath: locFilePath,
        terminal: new node_core_library_1.Terminal(LoaderTerminalProvider_1.LoaderTerminalProvider.getTerminalProviderForLoader(this)),
        resxNewlineNormalization: options.resxNewlineNormalization
    });
    const resultObject = {};
    for (const [stringName, stringValue] of Object.entries(locFileData)) {
        resultObject[stringName] = stringValue.value;
    }
    return resultObject;
});
//# sourceMappingURL=InPlaceLocFileLoader.js.map