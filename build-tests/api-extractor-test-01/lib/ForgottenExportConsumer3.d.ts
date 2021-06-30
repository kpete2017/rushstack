/**
 * This class is indirectly consumed by ForgottenExportConsumer3.
 */
export interface IForgottenIndirectDependency {
}
/**
 * This class is directly consumed by ForgottenExportConsumer3.
 */
export interface IForgottenDirectDependency {
    member: IForgottenIndirectDependency;
}
/**
 * This class directly consumes IForgottenDirectDependency
 * and indirectly consumes IForgottenIndirectDependency.
 * @beta
 */
export declare class ForgottenExportConsumer3 {
    test2(): IForgottenDirectDependency | undefined;
}
//# sourceMappingURL=ForgottenExportConsumer3.d.ts.map