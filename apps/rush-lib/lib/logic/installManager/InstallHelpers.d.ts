/// <reference types="node" />
import { RushConfiguration } from '../../api/RushConfiguration';
import { RushGlobalFolder } from '../../api/RushGlobalFolder';
export declare class InstallHelpers {
    static generateCommonPackageJson(rushConfiguration: RushConfiguration, dependencies?: Map<string, string>): void;
    static getPackageManagerEnvironment(rushConfiguration: RushConfiguration, options?: {
        debug?: boolean;
    }): NodeJS.ProcessEnv;
    /**
     * If the "(p)npm-local" symlink hasn't been set up yet, this creates it, installing the
     * specified (P)npm version in the user's home directory if needed.
     */
    static ensureLocalPackageManager(rushConfiguration: RushConfiguration, rushGlobalFolder: RushGlobalFolder, maxInstallAttempts: number): Promise<void>;
    private static _mergeEnvironmentVariables;
}
//# sourceMappingURL=InstallHelpers.d.ts.map