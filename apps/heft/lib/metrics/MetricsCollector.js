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
exports.MetricsCollector = exports.MetricsCollectorHooks = void 0;
const os = __importStar(require("os"));
const tapable_1 = require("tapable");
const perf_hooks_1 = require("perf_hooks");
const node_core_library_1 = require("@rushstack/node-core-library");
/**
 * Tap these hooks to record build metrics, to a file, for example.
 *
 * @public
 */
class MetricsCollectorHooks {
    constructor() {
        /**
         * This hook is called when a metric is recorded.
         */
        this.recordMetric = new tapable_1.SyncHook([
            'metricName',
            'metricsData'
        ]);
        /**
         * This hook is called when collected metrics should be flushed
         */
        this.flush = new tapable_1.AsyncParallelHook();
        /**
         * This hook is called when collected metrics should be flushed and no more metrics will be collected.
         */
        this.flushAndTeardown = new tapable_1.AsyncParallelHook();
    }
}
exports.MetricsCollectorHooks = MetricsCollectorHooks;
/**
 * @internal
 * A simple performance metrics collector. A plugin is required to pipe data anywhere.
 */
class MetricsCollector {
    constructor() {
        this.hooks = new MetricsCollectorHooks();
        this._hasBeenTornDown = false;
    }
    /**
     * Start metrics log timer.
     */
    setStartTime() {
        this._startTimeMs = perf_hooks_1.performance.now();
    }
    /**
     * Record metrics to the installed plugin(s).
     *
     * @param command - Describe the user command, e.g. `start` or `build`
     * @param params - Optional parameters
     */
    record(command, performanceData) {
        if (this._startTimeMs === undefined) {
            throw new node_core_library_1.InternalError('MetricsCollector has not been initialized with setStartTime() yet');
        }
        if (this._hasBeenTornDown) {
            throw new node_core_library_1.InternalError('MetricsCollector has been torn down.');
        }
        if (!command) {
            throw new node_core_library_1.InternalError('The command name must be specified.');
        }
        const filledPerformanceData = Object.assign({ taskTotalExecutionMs: (perf_hooks_1.performance.now() - this._startTimeMs) / 1000 }, (performanceData || {}));
        const metricsData = {
            command: command,
            taskTotalExecutionMs: filledPerformanceData.taskTotalExecutionMs,
            machineOs: process.platform,
            machineArch: process.arch,
            machineCores: os.cpus().length,
            machineProcessor: os.cpus()[0].model,
            machineTotalMemoryMB: os.totalmem()
        };
        this.hooks.recordMetric.call('inner_loop_heft', metricsData);
    }
    /**
     * Flushes all pending logged metrics.
     */
    async flushAsync() {
        if (this._hasBeenTornDown) {
            throw new Error('MetricsCollector has been torn down.');
        }
        await this.hooks.flush.promise();
    }
    /**
     * Flushes all pending logged metrics and closes the MetricsCollector instance.
     */
    async flushAndTeardownAsync() {
        if (this._hasBeenTornDown) {
            throw new Error('MetricsCollector has already been torn down.');
        }
        await this.hooks.flushAndTeardown.promise();
        this._hasBeenTornDown = true;
    }
}
exports.MetricsCollector = MetricsCollector;
//# sourceMappingURL=MetricsCollector.js.map