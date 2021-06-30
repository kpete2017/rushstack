"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
const node_core_library_1 = require("@rushstack/node-core-library");
const LocFileParser_1 = require("../utilities/LocFileParser");
const LoaderFactory_1 = require("./LoaderFactory");
const EntityMarker_1 = require("../utilities/EntityMarker");
const LoaderTerminalProvider_1 = require("../utilities/LoaderTerminalProvider");
exports.default = LoaderFactory_1.loaderFactory(function (locFilePath, content, options) {
    const { pluginInstance } = options;
    const terminal = new node_core_library_1.Terminal(LoaderTerminalProvider_1.LoaderTerminalProvider.getTerminalProviderForLoader(this));
    const locFileData = LocFileParser_1.LocFileParser.parseLocFile({
        content,
        terminal,
        filePath: locFilePath,
        resxNewlineNormalization: options.resxNewlineNormalization
    });
    const { additionalLoadedFilePaths, errors } = pluginInstance.addDefaultLocFile(terminal, locFilePath, locFileData);
    for (const additionalFile of additionalLoadedFilePaths) {
        this.dependency(additionalFile);
    }
    for (const error of errors) {
        this.emitError(error);
    }
    const resultObject = {};
    // eslint-disable-next-line guard-for-in
    for (const stringName in locFileData) {
        const stringKey = `${locFilePath}?${stringName}`;
        if (pluginInstance.stringKeys.has(stringKey)) {
            resultObject[stringName] = pluginInstance.stringKeys.get(stringKey).value;
        }
        else {
            throw new Error(`Unexpected - missing placeholder for string key "${stringKey}"`);
        }
    }
    EntityMarker_1.EntityMarker.markEntity(this._module, true);
    return resultObject;
});
//# sourceMappingURL=LocLoader.js.map