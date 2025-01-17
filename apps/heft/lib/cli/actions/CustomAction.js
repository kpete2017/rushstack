"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomAction = void 0;
const HeftActionBase_1 = require("./HeftActionBase");
class CustomAction extends HeftActionBase_1.HeftActionBase {
    constructor(customActionOptions, options) {
        super({
            actionName: customActionOptions.actionName,
            documentation: customActionOptions.documentation,
            summary: customActionOptions.summary || ''
        }, options);
        this._customActionOptions = customActionOptions;
    }
    onDefineParameters() {
        super.onDefineParameters();
        this._parameterValues = new Map();
        for (const [callbackValueName, untypedParameterOption] of Object.entries(this._customActionOptions.parameters || {})) {
            if (this._parameterValues.has(callbackValueName)) {
                throw new Error(`Duplicate callbackValueName: ${callbackValueName}`);
            }
            let getParameterValue;
            const parameterOption = untypedParameterOption;
            switch (parameterOption.kind) {
                case 'flag': {
                    const parameter = this.defineFlagParameter({
                        parameterLongName: parameterOption.parameterLongName,
                        description: parameterOption.description
                    });
                    getParameterValue = () => parameter.value;
                    break;
                }
                case 'string': {
                    const parameter = this.defineStringParameter({
                        parameterLongName: parameterOption.parameterLongName,
                        description: parameterOption.description,
                        argumentName: 'VALUE'
                    });
                    getParameterValue = () => parameter.value;
                    break;
                }
                case 'integer': {
                    const parameter = this.defineIntegerParameter({
                        parameterLongName: parameterOption.parameterLongName,
                        description: parameterOption.description,
                        argumentName: 'VALUE'
                    });
                    getParameterValue = () => parameter.value;
                    break;
                }
                case 'stringList': {
                    const parameter = this.defineStringListParameter({
                        parameterLongName: parameterOption.parameterLongName,
                        description: parameterOption.description,
                        argumentName: 'VALUE'
                    });
                    getParameterValue = () => parameter.values;
                    break;
                }
                default: {
                    throw new Error(`Unrecognized parameter kind "${parameterOption.kind}" for parameter "${parameterOption.parameterLongName}`);
                }
            }
            this._parameterValues.set(callbackValueName, getParameterValue);
        }
    }
    async actionExecuteAsync() {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const parameterValues = {};
        for (const [callbackName, getParameterValue] of this._parameterValues.entries()) {
            parameterValues[callbackName] = getParameterValue();
        }
        await this._customActionOptions.callback(parameterValues);
    }
}
exports.CustomAction = CustomAction;
//# sourceMappingURL=CustomAction.js.map