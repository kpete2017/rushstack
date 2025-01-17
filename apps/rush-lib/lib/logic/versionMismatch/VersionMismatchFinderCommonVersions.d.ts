import { PackageJsonDependency, DependencyType } from '../../api/PackageJsonEditor';
import { CommonVersionsConfiguration } from '../../api/CommonVersionsConfiguration';
import { VersionMismatchFinderEntity } from './VersionMismatchFinderEntity';
export declare class VersionMismatchFinderCommonVersions extends VersionMismatchFinderEntity {
    private _fileManager;
    constructor(commonVersionsConfiguration: CommonVersionsConfiguration);
    get filePath(): string;
    get allDependencies(): ReadonlyArray<PackageJsonDependency>;
    tryGetDependency(packageName: string): PackageJsonDependency | undefined;
    tryGetDevDependency(packageName: string): PackageJsonDependency | undefined;
    addOrUpdateDependency(packageName: string, newVersion: string, dependencyType: DependencyType): void;
    saveIfModified(): boolean;
    private _getPackageJsonDependency;
}
//# sourceMappingURL=VersionMismatchFinderCommonVersions.d.ts.map