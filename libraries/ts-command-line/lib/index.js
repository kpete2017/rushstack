"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * An object-oriented command-line parser for TypeScript projects.
 *
 * @packageDocumentation
 */
var CommandLineAction_1 = require("./providers/CommandLineAction");
Object.defineProperty(exports, "CommandLineAction", { enumerable: true, get: function () { return CommandLineAction_1.CommandLineAction; } });
var BaseClasses_1 = require("./parameters/BaseClasses");
Object.defineProperty(exports, "CommandLineParameterKind", { enumerable: true, get: function () { return BaseClasses_1.CommandLineParameterKind; } });
Object.defineProperty(exports, "CommandLineParameter", { enumerable: true, get: function () { return BaseClasses_1.CommandLineParameter; } });
Object.defineProperty(exports, "CommandLineParameterWithArgument", { enumerable: true, get: function () { return BaseClasses_1.CommandLineParameterWithArgument; } });
var CommandLineFlagParameter_1 = require("./parameters/CommandLineFlagParameter");
Object.defineProperty(exports, "CommandLineFlagParameter", { enumerable: true, get: function () { return CommandLineFlagParameter_1.CommandLineFlagParameter; } });
var CommandLineStringParameter_1 = require("./parameters/CommandLineStringParameter");
Object.defineProperty(exports, "CommandLineStringParameter", { enumerable: true, get: function () { return CommandLineStringParameter_1.CommandLineStringParameter; } });
var CommandLineStringListParameter_1 = require("./parameters/CommandLineStringListParameter");
Object.defineProperty(exports, "CommandLineStringListParameter", { enumerable: true, get: function () { return CommandLineStringListParameter_1.CommandLineStringListParameter; } });
var CommandLineIntegerParameter_1 = require("./parameters/CommandLineIntegerParameter");
Object.defineProperty(exports, "CommandLineIntegerParameter", { enumerable: true, get: function () { return CommandLineIntegerParameter_1.CommandLineIntegerParameter; } });
var CommandLineChoiceParameter_1 = require("./parameters/CommandLineChoiceParameter");
Object.defineProperty(exports, "CommandLineChoiceParameter", { enumerable: true, get: function () { return CommandLineChoiceParameter_1.CommandLineChoiceParameter; } });
var CommandLineRemainder_1 = require("./parameters/CommandLineRemainder");
Object.defineProperty(exports, "CommandLineRemainder", { enumerable: true, get: function () { return CommandLineRemainder_1.CommandLineRemainder; } });
var CommandLineParameterProvider_1 = require("./providers/CommandLineParameterProvider");
Object.defineProperty(exports, "CommandLineParameterProvider", { enumerable: true, get: function () { return CommandLineParameterProvider_1.CommandLineParameterProvider; } });
var CommandLineParser_1 = require("./providers/CommandLineParser");
Object.defineProperty(exports, "CommandLineParser", { enumerable: true, get: function () { return CommandLineParser_1.CommandLineParser; } });
var DynamicCommandLineAction_1 = require("./providers/DynamicCommandLineAction");
Object.defineProperty(exports, "DynamicCommandLineAction", { enumerable: true, get: function () { return DynamicCommandLineAction_1.DynamicCommandLineAction; } });
var DynamicCommandLineParser_1 = require("./providers/DynamicCommandLineParser");
Object.defineProperty(exports, "DynamicCommandLineParser", { enumerable: true, get: function () { return DynamicCommandLineParser_1.DynamicCommandLineParser; } });
var CommandLineHelper_1 = require("./CommandLineHelper");
Object.defineProperty(exports, "CommandLineHelper", { enumerable: true, get: function () { return CommandLineHelper_1.CommandLineHelper; } });
//# sourceMappingURL=index.js.map