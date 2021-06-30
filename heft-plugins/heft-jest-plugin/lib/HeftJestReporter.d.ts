import { Reporter, Test, TestResult, AggregatedResult, Context, ReporterOnStartOptions, Config } from '@jest/reporters';
import type { HeftConfiguration } from '@rushstack/heft';
export interface IHeftJestReporterOptions {
    heftConfiguration: HeftConfiguration;
    debugMode: boolean;
}
/**
 * This custom reporter presents Jest test results using Heft's logging system.
 *
 * @privateRemarks
 * After making changes to this code, it's recommended to use `--debug-heft-reporter` to compare
 * with the output from Jest's default reporter, to check our output is consistent with typical
 * Jest behavior.
 *
 * For reference, Jest's default implementation is here:
 * https://github.com/facebook/jest/blob/master/packages/jest-reporters/src/default_reporter.ts
 */
export default class HeftJestReporter implements Reporter {
    private _terminal;
    private _buildFolder;
    private _debugMode;
    constructor(jestConfig: Config.GlobalConfig, options: IHeftJestReporterOptions);
    onTestStart(test: Test): Promise<void>;
    onTestResult(test: Test, testResult: TestResult, aggregatedResult: AggregatedResult): Promise<void>;
    private _writeConsoleOutput;
    private _writeConsoleOutputWithLabel;
    onRunStart(aggregatedResult: AggregatedResult, options: ReporterOnStartOptions): Promise<void>;
    onRunComplete(contexts: Set<Context>, results: AggregatedResult): Promise<void>;
    getLastError(): void;
    private _getTestPath;
    private _formatWithPlural;
}
//# sourceMappingURL=HeftJestReporter.d.ts.map