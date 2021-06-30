import { Terminal } from '@rushstack/node-core-library';
import { RushConfigurationProject } from '../api/RushConfigurationProject';
export interface ITarOptionsBase {
    logFilePath: string;
}
export interface IUntarOptions extends ITarOptionsBase {
    archivePath: string;
    outputFolderPath: string;
}
export interface ICreateArchiveOptions extends ITarOptionsBase {
    archivePath: string;
    paths: string[];
    project: RushConfigurationProject;
}
export declare class TarExecutable {
    private _tarExecutablePath;
    private constructor();
    static tryInitialize(terminal: Terminal): TarExecutable | undefined;
    /**
     * @returns
     * The "tar" exit code
     */
    tryUntarAsync(options: IUntarOptions): Promise<number>;
    /**
     * @returns
     * The "tar" exit code
     */
    tryCreateArchiveFromProjectPathsAsync(options: ICreateArchiveOptions): Promise<number>;
    private _spawnTarWithLoggingAsync;
}
//# sourceMappingURL=TarExecutable.d.ts.map