"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiDocumenterPluginManifest = void 0;
const RushStackFeature_1 = require("./RushStackFeature");
exports.apiDocumenterPluginManifest = {
    manifestVersion: 1000,
    features: [
        {
            featureName: 'rush-stack-markdown-documenter',
            kind: 'MarkdownDocumenterFeature',
            subclass: RushStackFeature_1.RushStackFeature
        }
    ]
};
//# sourceMappingURL=index.js.map