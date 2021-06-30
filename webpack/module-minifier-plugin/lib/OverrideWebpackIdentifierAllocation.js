"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
const webpack_1 = require("webpack");
const MinifiedIdentifier_1 = require("./MinifiedIdentifier");
// Configure webpack to use the same identifier allocation logic as Terser to maximize gzip compressibility
webpack_1.Template.numberToIdentifer = MinifiedIdentifier_1.getIdentifier;
//# sourceMappingURL=OverrideWebpackIdentifierAllocation.js.map