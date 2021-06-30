"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runParallel = void 0;
const os_1 = require("os");
const path_1 = require("path");
const WorkerPoolMinifier_1 = require("./WorkerPoolMinifier");
const WorkerPool_1 = require("./workerPool/WorkerPool");
/**
 * Formats a delta of `process.hrtime.bigint()` values as a string
 * @param timeNs
 */
function formatTime(timeNs) {
    let unit = 'ns';
    let fraction = 0n;
    if (timeNs > 1e3) {
        unit = 'us';
        fraction = timeNs % 1000n;
        timeNs /= 1000n;
    }
    if (timeNs > 1e3) {
        unit = 'ms';
        fraction = timeNs % 1000n;
        timeNs /= 1000n;
    }
    if (timeNs > 1e3) {
        unit = 's';
        fraction = timeNs % 1000n;
        timeNs /= 1000n;
    }
    return `${timeNs}.${('000' + fraction).slice(-3, -1)} ${unit}`;
}
async function runParallel(options) {
    const resolvedPath = path_1.resolve(options.configFilePath);
    const rawConfig = require(resolvedPath); // eslint-disable-line @typescript-eslint/no-var-requires
    const configArray = Array.isArray(rawConfig) ? rawConfig : [rawConfig];
    const configCount = configArray.length;
    const totalCpus = os_1.cpus().length;
    // TODO: Use all cores if not minifying
    const { maxCompilationThreads: maxConfiguredCompilationThreads = Math.max(totalCpus > 8 ? (totalCpus * 3) >> 2 : totalCpus >> 1, 1), sourceMap, usePortableModules } = options;
    const maxCompilationThreads = Math.min(configCount, maxConfiguredCompilationThreads);
    const maxCompressionThreads = Math.max(1, totalCpus - maxCompilationThreads);
    const minifier = new WorkerPoolMinifier_1.WorkerPoolMinifier({
        terserOptions: options.terserOptions,
        maxThreads: maxCompressionThreads
    });
    const minifierCleanup = minifier.ref();
    const webpackPool = new WorkerPool_1.WorkerPool({
        id: 'Webpack',
        maxWorkers: maxCompilationThreads,
        onWorkerDestroyed: () => {
            // Allocate the webpack worker to terser
            minifier.maxThreads++;
        },
        workerScriptPath: require.resolve('./workerPool/WebpackWorker'),
        workerData: {
            configFilePath: resolvedPath,
            sourceMap,
            usePortableModules
        }
    });
    let processed = 0;
    const startTime = process.hrtime.bigint();
    for (let i = 0; i < configCount; i++) {
        const webpackWorker = await webpackPool.checkoutWorkerAsync(true);
        const sendMinifierResult = (result) => {
            webpackWorker.postMessage(result);
        };
        const workerOnMessage = (message) => {
            if (typeof message === 'object') {
                return minifier.minify(message, sendMinifierResult);
            }
            ++processed;
            console.log(`${processed}/${configCount} complete (${formatTime(process.hrtime.bigint() - startTime)})`);
            webpackWorker.off('message', workerOnMessage);
            webpackPool.checkinWorker(webpackWorker);
        };
        webpackWorker.on('message', workerOnMessage);
        webpackWorker.postMessage(i);
    }
    await webpackPool.finishAsync();
    await minifierCleanup();
}
exports.runParallel = runParallel;
//# sourceMappingURL=ParallelCompiler.js.map