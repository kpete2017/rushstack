/// <reference types="node" />
import * as fetch from 'node-fetch';
export declare type WebClientResponse = fetch.Response;
export interface IWebFetchOptionsBase {
    timeoutMs?: number;
    verb?: 'GET' | 'PUT';
    headers?: fetch.Headers;
}
export interface IGetFetchOptions extends IWebFetchOptionsBase {
    verb: 'GET' | never;
}
export interface IPutFetchOptions extends IWebFetchOptionsBase {
    verb: 'PUT';
    body?: Buffer;
}
export declare enum WebClientProxy {
    None = 0,
    Detect = 1,
    Fiddler = 2
}
export declare class WebClient {
    readonly standardHeaders: fetch.Headers;
    accept: string | undefined;
    userAgent: string | undefined;
    proxy: WebClientProxy;
    constructor();
    static mergeHeaders(target: fetch.Headers, source: fetch.Headers): void;
    addBasicAuthHeader(userName: string, password: string): void;
    fetchAsync(url: string, options?: IGetFetchOptions | IPutFetchOptions): Promise<WebClientResponse>;
}
//# sourceMappingURL=WebClient.d.ts.map