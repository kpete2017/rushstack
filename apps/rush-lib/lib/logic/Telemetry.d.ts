import { RushConfiguration } from '../api/RushConfiguration';
export interface ITelemetryData {
    name: string;
    duration: number;
    result: string;
    timestamp?: number;
    platform?: string;
    rushVersion?: string;
    extraData?: {
        [key: string]: string;
    };
}
export declare class Telemetry {
    private _enabled;
    private _store;
    private _dataFolder;
    private _rushConfiguration;
    constructor(rushConfiguration: RushConfiguration);
    log(telemetryData: ITelemetryData): void;
    flush(writeFile?: (file: string, data: string) => void): void;
    get store(): ITelemetryData[];
    /**
     * When there are too many log files, delete the old ones.
     */
    private _cleanUp;
    private _getFilePath;
}
//# sourceMappingURL=Telemetry.d.ts.map