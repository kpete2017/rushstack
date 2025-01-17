"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandLineParameterProvider = void 0;
const argparse = __importStar(require("argparse"));
const BaseClasses_1 = require("../parameters/BaseClasses");
const CommandLineFlagParameter_1 = require("../parameters/CommandLineFlagParameter");
const CommandLineStringParameter_1 = require("../parameters/CommandLineStringParameter");
const CommandLineStringListParameter_1 = require("../parameters/CommandLineStringListParameter");
const CommandLineIntegerParameter_1 = require("../parameters/CommandLineIntegerParameter");
const CommandLineChoiceParameter_1 = require("../parameters/CommandLineChoiceParameter");
const CommandLineRemainder_1 = require("../parameters/CommandLineRemainder");
/**
 * This is the common base class for CommandLineAction and CommandLineParser
 * that provides functionality for defining command-line parameters.
 *
 * @public
 */
class CommandLineParameterProvider {
    /** @internal */
    // Third party code should not inherit subclasses or call this constructor
    constructor() {
        this._parameters = [];
        this._parametersByLongName = new Map();
    }
    /**
     * Returns a collection of the parameters that were defined for this object.
     */
    get parameters() {
        return this._parameters;
    }
    /**
     * If {@link CommandLineParameterProvider.defineCommandLineRemainder} was called,
     * this object captures any remaining command line arguments after the recognized portion.
     */
    get remainder() {
        return this._remainder;
    }
    /**
     * Defines a command-line parameter whose value must be a string from a fixed set of
     * allowable choices (similar to an enum).
     *
     * @remarks
     * Example of a choice parameter:
     * ```
     * example-tool --log-level warn
     * ```
     */
    defineChoiceParameter(definition) {
        const parameter = new CommandLineChoiceParameter_1.CommandLineChoiceParameter(definition);
        this._defineParameter(parameter);
        return parameter;
    }
    /**
     * Returns the CommandLineChoiceParameter with the specified long name.
     * @remarks
     * This method throws an exception if the parameter is not defined.
     */
    getChoiceParameter(parameterLongName) {
        return this._getParameter(parameterLongName, BaseClasses_1.CommandLineParameterKind.Choice);
    }
    /**
     * Defines a command-line switch whose boolean value is true if the switch is provided,
     * and false otherwise.
     *
     * @remarks
     * Example usage of a flag parameter:
     * ```
     * example-tool --debug
     * ```
     */
    defineFlagParameter(definition) {
        const parameter = new CommandLineFlagParameter_1.CommandLineFlagParameter(definition);
        this._defineParameter(parameter);
        return parameter;
    }
    /**
     * Returns the CommandLineFlagParameter with the specified long name.
     * @remarks
     * This method throws an exception if the parameter is not defined.
     */
    getFlagParameter(parameterLongName) {
        return this._getParameter(parameterLongName, BaseClasses_1.CommandLineParameterKind.Flag);
    }
    /**
     * Defines a command-line parameter whose argument is an integer.
     *
     * @remarks
     * Example usage of an integer parameter:
     * ```
     * example-tool --max-attempts 5
     * ```
     */
    defineIntegerParameter(definition) {
        const parameter = new CommandLineIntegerParameter_1.CommandLineIntegerParameter(definition);
        this._defineParameter(parameter);
        return parameter;
    }
    /**
     * Returns the CommandLineIntegerParameter with the specified long name.
     * @remarks
     * This method throws an exception if the parameter is not defined.
     */
    getIntegerParameter(parameterLongName) {
        return this._getParameter(parameterLongName, BaseClasses_1.CommandLineParameterKind.Integer);
    }
    /**
     * Defines a command-line parameter whose argument is a single text string.
     *
     * @remarks
     * Example usage of a string parameter:
     * ```
     * example-tool --message "Hello, world!"
     * ```
     */
    defineStringParameter(definition) {
        const parameter = new CommandLineStringParameter_1.CommandLineStringParameter(definition);
        this._defineParameter(parameter);
        return parameter;
    }
    /**
     * Returns the CommandLineStringParameter with the specified long name.
     * @remarks
     * This method throws an exception if the parameter is not defined.
     */
    getStringParameter(parameterLongName) {
        return this._getParameter(parameterLongName, BaseClasses_1.CommandLineParameterKind.String);
    }
    /**
     * Defines a command-line parameter whose argument is a single text string.  The parameter can be
     * specified multiple times to build a list.
     *
     * @remarks
     * Example usage of a string list parameter:
     * ```
     * example-tool --add file1.txt --add file2.txt --add file3.txt
     * ```
     */
    defineStringListParameter(definition) {
        const parameter = new CommandLineStringListParameter_1.CommandLineStringListParameter(definition);
        this._defineParameter(parameter);
        return parameter;
    }
    /**
     * Defines a rule that captures any remaining command line arguments after the recognized portion.
     *
     * @remarks
     * This feature is useful for commands that pass their arguments along to an external tool, relying on
     * that tool to perform validation.  (It could also be used to parse parameters without any validation
     * or documentation, but that is not recommended.)
     *
     * Example of capturing the remainder after an optional flag parameter.
     * ```
     * example-tool --my-flag this is the remainder
     * ```
     *
     * In the "--help" documentation, the remainder rule will be represented as "...".
     */
    defineCommandLineRemainder(definition) {
        if (this._remainder) {
            throw new Error('defineRemainingArguments() has already been called for this provider');
        }
        this._remainder = new CommandLineRemainder_1.CommandLineRemainder(definition);
        const argparseOptions = {
            help: this._remainder.description,
            nargs: argparse.Const.REMAINDER,
            metavar: '"..."'
        };
        this._getArgumentParser().addArgument(argparse.Const.REMAINDER, argparseOptions);
        return this._remainder;
    }
    /**
     * Returns the CommandLineStringListParameter with the specified long name.
     * @remarks
     * This method throws an exception if the parameter is not defined.
     */
    getStringListParameter(parameterLongName) {
        return this._getParameter(parameterLongName, BaseClasses_1.CommandLineParameterKind.StringList);
    }
    /**
     * Generates the command-line help text.
     */
    renderHelpText() {
        return this._getArgumentParser().formatHelp();
    }
    /** @internal */
    _processParsedData(data) {
        // Fill in the values for the parameters
        for (const parameter of this._parameters) {
            const value = data[parameter._parserKey]; // eslint-disable-line @typescript-eslint/no-explicit-any
            parameter._setValue(value);
        }
        if (this.remainder) {
            this.remainder._setValue(data[argparse.Const.REMAINDER]);
        }
    }
    _generateKey() {
        return 'key_' + (CommandLineParameterProvider._keyCounter++).toString();
    }
    _getParameter(parameterLongName, expectedKind) {
        const parameter = this._parametersByLongName.get(parameterLongName);
        if (!parameter) {
            throw new Error(`The parameter "${parameterLongName}" is not defined`);
        }
        if (parameter.kind !== expectedKind) {
            throw new Error(`The parameter "${parameterLongName}" is of type "${BaseClasses_1.CommandLineParameterKind[parameter.kind]}"` +
                ` whereas the caller was expecting "${BaseClasses_1.CommandLineParameterKind[expectedKind]}".`);
        }
        return parameter;
    }
    _defineParameter(parameter) {
        if (this._remainder) {
            throw new Error('defineCommandLineRemainder() was already called for this provider;' +
                ' no further parameters can be defined');
        }
        const names = [];
        if (parameter.shortName) {
            names.push(parameter.shortName);
        }
        names.push(parameter.longName);
        parameter._parserKey = this._generateKey();
        let finalDescription = parameter.description;
        const supplementaryNotes = [];
        parameter._getSupplementaryNotes(supplementaryNotes);
        if (supplementaryNotes.length > 0) {
            // If they left the period off the end of their sentence, then add one.
            if (finalDescription.match(/[a-z0-9]"?\s*$/i)) {
                finalDescription = finalDescription.trimRight() + '.';
            }
            // Append the supplementary text
            finalDescription += ' ' + supplementaryNotes.join(' ');
        }
        // NOTE: Our "environmentVariable" feature takes precedence over argparse's "defaultValue",
        // so we have to reimplement that feature.
        const argparseOptions = {
            help: finalDescription,
            dest: parameter._parserKey,
            metavar: parameter.argumentName || undefined,
            required: parameter.required
        };
        switch (parameter.kind) {
            case BaseClasses_1.CommandLineParameterKind.Choice:
                const choiceParameter = parameter;
                argparseOptions.choices = choiceParameter.alternatives;
                break;
            case BaseClasses_1.CommandLineParameterKind.Flag:
                argparseOptions.action = 'storeTrue';
                break;
            case BaseClasses_1.CommandLineParameterKind.Integer:
                argparseOptions.type = 'int';
                break;
            case BaseClasses_1.CommandLineParameterKind.String:
                break;
            case BaseClasses_1.CommandLineParameterKind.StringList:
                argparseOptions.action = 'append';
                break;
        }
        const argumentParser = this._getArgumentParser();
        argumentParser.addArgument(names, Object.assign({}, argparseOptions));
        if (parameter.undocumentedSynonyms && parameter.undocumentedSynonyms.length > 0) {
            argumentParser.addArgument(parameter.undocumentedSynonyms, Object.assign(Object.assign({}, argparseOptions), { help: argparse.Const.SUPPRESS }));
        }
        this._parameters.push(parameter);
        this._parametersByLongName.set(parameter.longName, parameter);
    }
}
exports.CommandLineParameterProvider = CommandLineParameterProvider;
CommandLineParameterProvider._keyCounter = 0;
//# sourceMappingURL=CommandLineParameterProvider.js.map