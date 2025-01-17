"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuildAction = void 0;
const HeftActionBase_1 = require("./HeftActionBase");
const Logging_1 = require("../../utilities/Logging");
const BuildStage_1 = require("../../stages/BuildStage");
class BuildAction extends HeftActionBase_1.HeftActionBase {
    constructor(heftActionOptions, commandLineActionOptions = {
        actionName: 'build',
        summary: 'Build the project.',
        documentation: ''
    }) {
        super(commandLineActionOptions, heftActionOptions);
    }
    onDefineParameters() {
        super.onDefineParameters();
        this._buildStandardParameters = BuildStage_1.BuildStage.defineStageStandardParameters(this);
        this._productionFlag = this._buildStandardParameters.productionFlag;
        this._liteFlag = this._buildStandardParameters.liteFlag;
        this._watchFlag = this.defineFlagParameter({
            parameterLongName: '--watch',
            description: 'If provided, run tests in watch mode.'
        });
        this._cleanFlag = this.defineFlagParameter({
            parameterLongName: '--clean',
            description: 'If specified, clean the package before building.'
        });
    }
    async actionExecuteAsync() {
        await this.runCleanIfRequestedAsync();
        await this.runBuildAsync();
    }
    async runCleanIfRequestedAsync() {
        if (this._cleanFlag.value) {
            const cleanStage = this.stages.cleanStage;
            const cleanStageOptions = {};
            await cleanStage.initializeAsync(cleanStageOptions);
            await Logging_1.Logging.runFunctionWithLoggingBoundsAsync(this.terminal, 'Clean', async () => await cleanStage.executeAsync());
        }
    }
    async runBuildAsync() {
        const buildStage = this.stages.buildStage;
        const buildStageOptions = Object.assign(Object.assign({}, BuildStage_1.BuildStage.getOptionsFromStandardParameters(this._buildStandardParameters)), { watchMode: this._watchFlag.value, serveMode: false });
        await buildStage.initializeAsync(buildStageOptions);
        await buildStage.executeAsync();
    }
    async afterExecuteAsync() {
        if (this._watchFlag.value) {
            await new Promise(() => {
                /* never continue if in --watch mode */
            });
        }
    }
}
exports.BuildAction = BuildAction;
//# sourceMappingURL=BuildAction.js.map