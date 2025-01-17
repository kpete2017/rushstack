import { IFileSystemCreateLinkOptions } from '@rushstack/node-core-library';
import { RushConfiguration } from '../../api/RushConfiguration';
import { BasePackage } from './BasePackage';
export declare enum SymlinkKind {
    File = 0,
    Directory = 1
}
export interface IBaseLinkManagerCreateSymlinkOptions extends IFileSystemCreateLinkOptions {
    symlinkKind: SymlinkKind;
}
export declare abstract class BaseLinkManager {
    protected _rushConfiguration: RushConfiguration;
    constructor(rushConfiguration: RushConfiguration);
    protected static _createSymlink(options: IBaseLinkManagerCreateSymlinkOptions): void;
    /**
     * For a Package object that represents a top-level Rush project folder
     * (i.e. with source code that we will be building), this clears out its
     * node_modules folder and then recursively creates all the symlinked folders.
     */
    protected static _createSymlinksForTopLevelProject(localPackage: BasePackage): void;
    /**
     * This is a helper function used by createSymlinksForTopLevelProject().
     * It will recursively creates symlinked folders corresponding to each of the
     * Package objects in the provided tree.
     */
    private static _createSymlinksForDependencies;
    /**
     * Creates node_modules symlinks for all Rush projects defined in the RushConfiguration.
     * @param force - Normally the operation will be skipped if the links are already up to date;
     *   if true, this option forces the links to be recreated.
     */
    createSymlinksForProjects(force: boolean): Promise<void>;
    protected abstract _linkProjects(): Promise<void>;
}
//# sourceMappingURL=BaseLinkManager.d.ts.map