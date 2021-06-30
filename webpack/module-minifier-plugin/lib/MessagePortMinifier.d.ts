/// <reference types="node" />
import { IModuleMinificationCallback, IModuleMinificationRequest, IModuleMinifier } from './ModuleMinifierPlugin.types';
import { MessagePort } from 'worker_threads';
/**
 * Minifier implementation that outsources requests to the other side of a MessagePort
 * @public
 */
export declare class MessagePortMinifier implements IModuleMinifier {
    readonly port: MessagePort;
    private readonly _callbacks;
    constructor(port: MessagePort);
    /**
     * No-op code transform.
     * @param request - The request to process
     * @param callback - The callback to invoke
     */
    minify(request: IModuleMinificationRequest, callback: IModuleMinificationCallback): void;
}
//# sourceMappingURL=MessagePortMinifier.d.ts.map