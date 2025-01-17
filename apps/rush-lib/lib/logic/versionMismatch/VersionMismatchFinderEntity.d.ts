import { PackageJsonDependency, DependencyType } from '../../api/PackageJsonEditor';
export interface IVersionMismatchFinderEntityOptions {
    friendlyName: string;
    cyclicDependencyProjects: Set<string>;
    skipRushCheck?: boolean;
}
export declare abstract class VersionMismatchFinderEntity {
    readonly friendlyName: string;
    readonly cyclicDependencyProjects: Set<string>;
    readonly skipRushCheck: boolean | undefined;
    constructor(options: IVersionMismatchFinderEntityOptions);
    abstract get filePath(): string;
    abstract get allDependencies(): ReadonlyArray<PackageJsonDependency>;
    abstract tryGetDependency(packageName: string): PackageJsonDependency | undefined;
    abstract tryGetDevDependency(packageName: string): PackageJsonDependency | undefined;
    abstract addOrUpdateDependency(packageName: string, newVersion: string, dependencyType: DependencyType): void;
    abstract saveIfModified(): boolean;
}
//# sourceMappingURL=VersionMismatchFinderEntity.d.ts.map