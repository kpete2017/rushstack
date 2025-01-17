"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseScriptAction = void 0;
const BaseRushAction_1 = require("../actions/BaseRushAction");
const RushConstants_1 = require("../../logic/RushConstants");
/**
 * Base class for command-line actions that are implemented using user-defined scripts.
 *
 * @remarks
 * Compared to the normal built-in actions, these actions are special because (1) they
 * can be discovered dynamically via common/config/command-line.json, and (2)
 * user-defined command-line parameters can be passed through to the script.
 *
 * The two subclasses are BulkScriptAction and GlobalScriptAction.
 */
class BaseScriptAction extends BaseRushAction_1.BaseRushAction {
    constructor(options) {
        super(options);
        this.customParameters = [];
        this._commandLineConfiguration = options.commandLineConfiguration;
    }
    defineScriptParameters() {
        if (!this._commandLineConfiguration) {
            return;
        }
        // Find any parameters that are associated with this command
        for (const parameterJson of this._commandLineConfiguration.parameters) {
            let associated = false;
            for (const associatedCommand of parameterJson.associatedCommands) {
                if (associatedCommand === this.actionName) {
                    associated = true;
                }
            }
            if (associated) {
                let customParameter;
                switch (parameterJson.parameterKind) {
                    case 'flag':
                        customParameter = this.defineFlagParameter({
                            parameterShortName: parameterJson.shortName,
                            parameterLongName: parameterJson.longName,
                            description: parameterJson.description,
                            required: parameterJson.required
                        });
                        break;
                    case 'choice':
                        customParameter = this.defineChoiceParameter({
                            parameterShortName: parameterJson.shortName,
                            parameterLongName: parameterJson.longName,
                            description: parameterJson.description,
                            required: parameterJson.required,
                            alternatives: parameterJson.alternatives.map((x) => x.name),
                            defaultValue: parameterJson.defaultValue
                        });
                        break;
                    case 'string':
                        customParameter = this.defineStringParameter({
                            parameterLongName: parameterJson.longName,
                            parameterShortName: parameterJson.shortName,
                            description: parameterJson.description,
                            required: parameterJson.required,
                            argumentName: parameterJson.argumentName
                        });
                        break;
                    default:
                        throw new Error(`${RushConstants_1.RushConstants.commandLineFilename} defines a parameter "${parameterJson.longName}"` +
                            ` using an unsupported parameter kind "${parameterJson.parameterKind}"`);
                }
                if (customParameter) {
                    this.customParameters.push(customParameter);
                }
            }
        }
    }
}
exports.BaseScriptAction = BaseScriptAction;
//# sourceMappingURL=BaseScriptAction.js.map