import { IBaseCommandLineDefinition, IBaseCommandLineDefinitionWithArgument } from './CommandLineDefinition';
/**
 * Identifies the kind of a CommandLineParameter.
 * @public
 */
export declare enum CommandLineParameterKind {
    /** Indicates a CommandLineChoiceParameter */
    Choice = 0,
    /** Indicates a CommandLineFlagParameter */
    Flag = 1,
    /** Indicates a CommandLineIntegerParameter */
    Integer = 2,
    /** Indicates a CommandLineStringParameter */
    String = 3,
    /** Indicates a CommandLineStringListParameter */
    StringList = 4
}
/**
 * The base class for the various command-line parameter types.
 * @public
 */
export declare abstract class CommandLineParameter {
    private static _longNameRegExp;
    private static _shortNameRegExp;
    private static _environmentVariableRegExp;
    /**
     * A unique internal key used to retrieve the value from the parser's dictionary.
     * @internal
     */
    _parserKey: string | undefined;
    /** {@inheritDoc IBaseCommandLineDefinition.parameterLongName} */
    readonly longName: string;
    /** {@inheritDoc IBaseCommandLineDefinition.parameterShortName} */
    readonly shortName: string | undefined;
    /** {@inheritDoc IBaseCommandLineDefinition.description} */
    readonly description: string;
    /** {@inheritDoc IBaseCommandLineDefinition.required} */
    readonly required: boolean;
    /** {@inheritDoc IBaseCommandLineDefinition.environmentVariable} */
    readonly environmentVariable: string | undefined;
    /** {@inheritDoc IBaseCommandLineDefinition.undocumentedSynonyms } */
    readonly undocumentedSynonyms: string[] | undefined;
    /** @internal */
    constructor(definition: IBaseCommandLineDefinition);
    /**
     * Called internally by CommandLineParameterProvider._processParsedData()
     * @internal
     */
    abstract _setValue(data: any): void;
    /**
     * Returns additional text used by the help formatter.
     * @internal
     */
    _getSupplementaryNotes(supplementaryNotes: string[]): void;
    /**
     * Indicates the type of parameter.
     */
    abstract get kind(): CommandLineParameterKind;
    /**
     * Append the parsed values to the provided string array.
     * @remarks
     * Sometimes a command line parameter is not used directly, but instead gets passed through to another
     * tool that will use it.  For example if our parameter comes in as "--max-count 3", then we might want to
     * call `child_process.spawn()` and append ["--max-count", "3"] to the args array for that tool.
     * appendToArgList() appends zero or more strings to the provided array, based on the input command-line
     * that we parsed.
     *
     * If the parameter was omitted from our command-line and has no default value, then
     * nothing will be appended.  If the short name was used, the long name will be appended instead.
     * @param argList - the parsed strings will be appended to this string array
     */
    abstract appendToArgList(argList: string[]): void;
    /**
     * Internal usage only.  Used to report unexpected output from the argparse library.
     */
    protected reportInvalidData(data: any): never;
    protected validateDefaultValue(hasDefaultValue: boolean): void;
}
/**
 * The common base class for parameters types that receive an argument.
 *
 * @remarks
 * An argument is an accompanying command-line token, such as "123" in the
 * example "--max-count 123".
 * @public
 */
export declare abstract class CommandLineParameterWithArgument extends CommandLineParameter {
    private static _invalidArgumentNameRegExp;
    /** {@inheritDoc IBaseCommandLineDefinitionWithArgument.argumentName} */
    readonly argumentName: string;
    /** {@inheritDoc IBaseCommandLineDefinitionWithArgument.completions} */
    readonly completions: (() => Promise<string[]>) | undefined;
    /** @internal */
    constructor(definition: IBaseCommandLineDefinitionWithArgument);
}
//# sourceMappingURL=BaseClasses.d.ts.map