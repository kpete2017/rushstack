import { ISetWebpackPublicPathOptions } from './SetPublicPathPlugin';
/**
 * @public
 */
export declare const registryVariableName: string;
export interface IInternalOptions extends ISetWebpackPublicPathOptions {
    webpackPublicPathVariable?: string;
    regexName?: string;
    linePrefix?: string;
}
export declare function getSetPublicPathCode(options: IInternalOptions, emitWarning: (warning: string) => void): string;
/**
 * /**
 * This function returns a block of JavaScript that maintains a global register of script tags.
 *
 * @param debug - If true, the code returned code is not minified. Defaults to false.
 *
 * @public
 */
export declare function getGlobalRegisterCode(debug?: boolean): string;
//# sourceMappingURL=codeGenerator.d.ts.map