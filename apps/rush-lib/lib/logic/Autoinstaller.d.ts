import { RushConfiguration } from '../api/RushConfiguration';
export declare class Autoinstaller {
    name: string;
    private _rushConfiguration;
    constructor(autoinstallerName: string, rushConfiguration: RushConfiguration);
    get folderFullPath(): string;
    get shrinkwrapFilePath(): string;
    get packageJsonPath(): string;
    static validateName(autoinstallerName: string): void;
    update(): void;
}
//# sourceMappingURL=Autoinstaller.d.ts.map