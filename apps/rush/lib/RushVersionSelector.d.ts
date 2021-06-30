import { ILaunchOptions } from '@microsoft/rush-lib';
import { MinimalRushConfiguration } from './MinimalRushConfiguration';
export declare class RushVersionSelector {
    private _rushGlobalFolder;
    private _currentPackageVersion;
    constructor(currentPackageVersion: string);
    ensureRushVersionInstalledAsync(version: string, configuration: MinimalRushConfiguration | undefined, executeOptions: ILaunchOptions): Promise<void>;
}
//# sourceMappingURL=RushVersionSelector.d.ts.map