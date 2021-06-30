/**
 * The ForgottenExportConsumer2 class relies on this IForgottenExport.
 *
 * This should end up as a non-exported "IForgottenExport_2" in the index.d.ts.
 * It is renamed to avoid a conflict with the IForgottenExport from ForgottenExportConsumer1.
 */
export interface IForgottenExport {
    instance2: string;
}
/** @public */
export declare class ForgottenExportConsumer2 {
    test2(): IForgottenExport | undefined;
}
//# sourceMappingURL=ForgottenExportConsumer2.d.ts.map