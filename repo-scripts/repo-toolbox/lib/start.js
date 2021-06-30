"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See the @microsoft/rush package's LICENSE file for license information.
Object.defineProperty(exports, "__esModule", { value: true });
const ToolboxCommandLine_1 = require("./ToolboxCommandLine");
console.log('repo-toolbox\n');
const commandLine = new ToolboxCommandLine_1.ToolboxCommandLine();
commandLine.execute().catch(console.error); // CommandLineParser.execute() should never reject the promise
//# sourceMappingURL=start.js.map