"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuildStage = exports.BuildStageHooks = exports.BundleSubstageHooks = exports.CompileSubstageHooks = exports.BuildSubstageHooksBase = void 0;
const tapable_1 = require("tapable");
const StageBase_1 = require("./StageBase");
const Logging_1 = require("../utilities/Logging");
/**
 * @public
 */
class BuildSubstageHooksBase {
    constructor() {
        this.run = new tapable_1.AsyncParallelHook();
    }
}
exports.BuildSubstageHooksBase = BuildSubstageHooksBase;
/**
 * @public
 */
class CompileSubstageHooks extends BuildSubstageHooksBase {
    constructor() {
        super(...arguments);
        /**
         * The `afterCompile` event is fired exactly once, after the "compile" stage completes its first operation.
         * The "bundle" stage will not begin until all event handlers have resolved their promises.  The behavior
         * of this event is the same in watch mode and non-watch mode.
         */
        this.afterCompile = new tapable_1.AsyncParallelHook();
        /**
         * The `afterRecompile` event is only used in watch mode.  It fires whenever the compiler's outputs have
         * been rebuilt.  The initial compilation fires the `afterCompile` event only, and then all subsequent iterations
         * fire the `afterRecompile` event only. Heft does not wait for the `afterRecompile` promises to resolve.
         */
        this.afterRecompile = new tapable_1.AsyncParallelHook();
    }
}
exports.CompileSubstageHooks = CompileSubstageHooks;
/**
 * @public
 */
class BundleSubstageHooks extends BuildSubstageHooksBase {
    constructor() {
        super(...arguments);
        this.configureWebpack = new tapable_1.AsyncSeriesWaterfallHook(['webpackConfiguration']);
        this.afterConfigureWebpack = new tapable_1.AsyncSeriesHook();
    }
}
exports.BundleSubstageHooks = BundleSubstageHooks;
/**
 * @public
 */
class BuildStageHooks extends StageBase_1.StageHooksBase {
    constructor() {
        super(...arguments);
        this.preCompile = new tapable_1.SyncHook([
            'preCompileStage'
        ]);
        this.compile = new tapable_1.SyncHook(['compileStage']);
        this.bundle = new tapable_1.SyncHook(['bundleStage']);
        this.postBuild = new tapable_1.SyncHook([
            'postBuildStage'
        ]);
    }
}
exports.BuildStageHooks = BuildStageHooks;
const WATCH_MODE_FINISHED_LOGGING_WORDS = {
    success: 'ready to continue',
    failure: 'continuing with errors'
};
class BuildStage extends StageBase_1.StageBase {
    constructor(heftConfiguration, loggingManager) {
        super(heftConfiguration, loggingManager, BuildStageHooks);
    }
    static defineStageStandardParameters(action) {
        return {
            productionFlag: action.defineFlagParameter({
                parameterLongName: '--production',
                description: 'If specified, build ship/production output'
            }),
            localeParameter: action.defineStringParameter({
                parameterLongName: '--locale',
                argumentName: 'LOCALE',
                description: 'Only build the specified locale, if applicable.'
            }),
            liteFlag: action.defineFlagParameter({
                parameterLongName: '--lite',
                parameterShortName: '-l',
                description: 'Perform a minimal build, skipping optional steps like linting.'
            }),
            typescriptMaxWriteParallelismParameter: action.defineIntegerParameter({
                parameterLongName: '--typescript-max-write-parallelism',
                argumentName: 'PARALLEILSM',
                description: 'Set this to change the maximum write parallelism. This parameter overrides ' +
                    'what is set in typescript.json. The default is 50.'
            }),
            maxOldSpaceSizeParameter: action.defineStringParameter({
                parameterLongName: '--max-old-space-size',
                argumentName: 'SIZE',
                description: 'Used to specify the max old space size.'
            })
        };
    }
    static getOptionsFromStandardParameters(standardParameters) {
        return {
            production: standardParameters.productionFlag.value,
            lite: standardParameters.liteFlag.value,
            locale: standardParameters.localeParameter.value,
            maxOldSpaceSize: standardParameters.maxOldSpaceSizeParameter.value,
            typescriptMaxWriteParallelism: standardParameters.typescriptMaxWriteParallelismParameter.value
        };
    }
    async getDefaultStagePropertiesAsync(options) {
        return {
            production: options.production,
            lite: options.lite,
            locale: options.locale,
            maxOldSpaceSize: options.maxOldSpaceSize,
            watchMode: options.watchMode,
            serveMode: options.serveMode
        };
    }
    async executeInnerAsync() {
        const preCompileSubstage = {
            hooks: new BuildSubstageHooksBase(),
            properties: {}
        };
        this.stageHooks.preCompile.call(preCompileSubstage);
        const compileStage = {
            hooks: new CompileSubstageHooks(),
            properties: {
                typescriptMaxWriteParallelism: this.stageOptions.typescriptMaxWriteParallelism
            }
        };
        this.stageHooks.compile.call(compileStage);
        const bundleStage = {
            hooks: new BundleSubstageHooks(),
            properties: {}
        };
        this.stageHooks.bundle.call(bundleStage);
        const postBuildStage = {
            hooks: new BuildSubstageHooksBase(),
            properties: {}
        };
        this.stageHooks.postBuild.call(postBuildStage);
        const watchMode = this.stageProperties.watchMode;
        await this._runSubstageWithLoggingAsync({
            buildStageName: 'Pre-compile',
            buildStage: preCompileSubstage,
            watchMode: watchMode
        });
        if (this.loggingManager.errorsHaveBeenEmitted && !watchMode) {
            return;
        }
        await this._runSubstageWithLoggingAsync({
            buildStageName: 'Compile',
            buildStage: compileStage,
            watchMode: watchMode
        });
        await compileStage.hooks.afterCompile.promise();
        if (this.loggingManager.errorsHaveBeenEmitted && !watchMode) {
            return;
        }
        bundleStage.properties.webpackConfiguration = await bundleStage.hooks.configureWebpack.promise(undefined);
        await bundleStage.hooks.afterConfigureWebpack.promise();
        await this._runSubstageWithLoggingAsync({
            buildStageName: 'Bundle',
            buildStage: bundleStage,
            watchMode: watchMode
        });
        if (this.loggingManager.errorsHaveBeenEmitted && !watchMode) {
            return;
        }
        await this._runSubstageWithLoggingAsync({
            buildStageName: 'Post-build',
            buildStage: postBuildStage,
            watchMode: watchMode
        });
    }
    async _runSubstageWithLoggingAsync({ buildStageName, buildStage, watchMode }) {
        if (buildStage.hooks.run.isUsed()) {
            await Logging_1.Logging.runFunctionWithLoggingBoundsAsync(this.globalTerminal, buildStageName, async () => await buildStage.hooks.run.promise(), watchMode ? WATCH_MODE_FINISHED_LOGGING_WORDS : undefined);
        }
    }
}
exports.BuildStage = BuildStage;
//# sourceMappingURL=BuildStage.js.map