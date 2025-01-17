"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebClient = exports.WebClientProxy = void 0;
const os = __importStar(require("os"));
const process = __importStar(require("process"));
const fetch = __importStar(require("node-fetch"));
const node_core_library_1 = require("@rushstack/node-core-library");
const createHttpsProxyAgent = node_core_library_1.Import.lazy('https-proxy-agent', require);
var WebClientProxy;
(function (WebClientProxy) {
    WebClientProxy[WebClientProxy["None"] = 0] = "None";
    WebClientProxy[WebClientProxy["Detect"] = 1] = "Detect";
    WebClientProxy[WebClientProxy["Fiddler"] = 2] = "Fiddler";
})(WebClientProxy = exports.WebClientProxy || (exports.WebClientProxy = {}));
class WebClient {
    constructor() {
        this.standardHeaders = new fetch.Headers();
        this.accept = '*/*';
        this.userAgent = `rush node/${process.version} ${os.platform()} ${os.arch()}`;
        this.proxy = WebClientProxy.Detect;
    }
    static mergeHeaders(target, source) {
        source.forEach((value, name) => {
            target.set(name, value);
        });
    }
    addBasicAuthHeader(userName, password) {
        this.standardHeaders.set('Authorization', 'Basic ' + Buffer.from(userName + ':' + password).toString('base64'));
    }
    async fetchAsync(url, options) {
        const headers = new fetch.Headers();
        WebClient.mergeHeaders(headers, this.standardHeaders);
        if (options === null || options === void 0 ? void 0 : options.headers) {
            WebClient.mergeHeaders(headers, options.headers);
        }
        if (this.userAgent) {
            headers.set('user-agent', this.userAgent);
        }
        if (this.accept) {
            headers.set('accept', this.accept);
        }
        let proxyUrl = '';
        switch (this.proxy) {
            case WebClientProxy.Detect:
                if (process.env.HTTPS_PROXY) {
                    proxyUrl = process.env.HTTPS_PROXY;
                }
                else if (process.env.HTTP_PROXY) {
                    proxyUrl = process.env.HTTP_PROXY;
                }
                break;
            case WebClientProxy.Fiddler:
                // For debugging, disable cert validation
                // eslint-disable-next-line
                process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
                proxyUrl = 'http://localhost:8888/';
                break;
        }
        let agent = undefined;
        if (proxyUrl) {
            agent = createHttpsProxyAgent(proxyUrl);
        }
        const timeoutMs = (options === null || options === void 0 ? void 0 : options.timeoutMs) !== undefined ? options.timeoutMs : 15 * 1000; // 15 seconds
        const requestInit = {
            method: options === null || options === void 0 ? void 0 : options.verb,
            headers: headers,
            agent: agent,
            timeout: timeoutMs
        };
        const putOptions = options;
        if (putOptions === null || putOptions === void 0 ? void 0 : putOptions.body) {
            requestInit.body = putOptions.body;
        }
        return await fetch.default(url, requestInit);
    }
}
exports.WebClient = WebClient;
//# sourceMappingURL=WebClient.js.map