export declare enum SupportedSerializableArgType {
    Undefined = 0,
    Null = 1,
    Primitive = 2,
    Error = 3,
    FileError = 4
}
export interface ISerializedErrorValue {
    errorMessage: string;
    errorStack: string | undefined;
}
export interface ISerializedFileErrorValue extends ISerializedErrorValue {
    filePath: string;
    line: number | undefined;
    column: number | undefined;
}
export interface ISubprocessApiCallArg {
    type: SupportedSerializableArgType;
}
export interface ISubprocessApiCallArgWithValue<TValue = string | number | boolean | object> extends ISubprocessApiCallArg {
    type: SupportedSerializableArgType;
    value: TValue;
}
export interface ISubprocessMessageBase {
    type: string;
}
//# sourceMappingURL=SubprocessCommunication.d.ts.map