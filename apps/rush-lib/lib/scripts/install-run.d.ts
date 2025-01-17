export declare const RUSH_JSON_FILENAME: string;
/**
 * Get the absolute path to the npm executable
 */
export declare function getNpmPath(): string;
export interface IPackageSpecifier {
    name: string;
    version: string | undefined;
}
/**
 * Find the absolute path to the folder containing rush.json
 */
export declare function findRushJsonFolder(): string;
export declare function installAndRun(packageName: string, packageVersion: string, packageBinName: string, packageBinArgs: string[]): number;
export declare function runWithErrorAndStatusCode(fn: () => number): void;
//# sourceMappingURL=install-run.d.ts.map