import { IPackageJson } from '@rushstack/node-core-library';
/**
 * Parses the "scripts" section from package.json and provides support for executing scripts.
 */
export declare class ProjectCommandSet {
    readonly malformedScriptNames: string[];
    readonly commandNames: string[];
    private readonly _scriptsByName;
    constructor(packageJson: IPackageJson);
    tryGetScriptBody(commandName: string): string | undefined;
    getScriptBody(commandName: string): string;
}
//# sourceMappingURL=ProjectCommandSet.d.ts.map