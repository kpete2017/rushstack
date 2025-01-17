import { HeftActionBase, IHeftActionBaseOptions } from './HeftActionBase';
/** @beta */
export interface ICustomActionParameterFlag extends ICustomActionParameterBase<boolean> {
    kind: 'flag';
}
/** @beta */
export interface ICustomActionParameterInteger extends ICustomActionParameterBase<number> {
    kind: 'integer';
}
/** @beta */
export interface ICustomActionParameterString extends ICustomActionParameterBase<string> {
    kind: 'string';
}
/** @beta */
export interface ICustomActionParameterStringList extends ICustomActionParameterBase<ReadonlyArray<string>> {
    kind: 'stringList';
}
/** @beta */
export interface ICustomActionParameterBase<TParameter extends CustomActionParameterType> {
    kind: 'flag' | 'integer' | 'string' | 'stringList';
    parameterLongName: string;
    description: string;
}
/** @beta */
export declare type ICustomActionParameter<TParameter> = TParameter extends boolean ? ICustomActionParameterFlag : TParameter extends number ? ICustomActionParameterInteger : TParameter extends string ? ICustomActionParameterString : TParameter extends ReadonlyArray<string> ? ICustomActionParameterStringList : never;
/** @beta */
export declare type CustomActionParameterType = string | boolean | number | ReadonlyArray<string> | undefined;
/** @beta */
export interface ICustomActionOptions<TParameters> {
    actionName: string;
    documentation: string;
    summary?: string;
    parameters?: {
        [K in keyof TParameters]: ICustomActionParameter<TParameters[K]>;
    };
    callback: (parameters: TParameters) => void | Promise<void>;
}
export declare class CustomAction<TParameters> extends HeftActionBase {
    private _customActionOptions;
    private _parameterValues;
    constructor(customActionOptions: ICustomActionOptions<TParameters>, options: IHeftActionBaseOptions);
    onDefineParameters(): void;
    protected actionExecuteAsync(): Promise<void>;
}
//# sourceMappingURL=CustomAction.d.ts.map