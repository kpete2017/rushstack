import { Terminal } from '@rushstack/node-core-library';
/**
 * The interface for a debug certificate instance
 *
 * @public
 */
export interface ICertificate {
    /**
     * Generated pem certificate contents
     */
    pemCertificate: string | undefined;
    /**
     * Private key used to sign the pem certificate
     */
    pemKey: string | undefined;
}
/**
 * A utility class to handle generating, trusting, and untrustring a debug certificate.
 * Contains two public methods to `ensureCertificate` and `untrustCertificate`.
 * @public
 */
export declare class CertificateManager {
    private _certificateStore;
    private _getCertUtilPathPromise;
    constructor();
    /**
     * Get a dev certificate from the store, or optionally, generate a new one
     * and trust it if one doesn't exist in the store.
     *
     * @public
     */
    ensureCertificateAsync(canGenerateNewCertificate: boolean, terminal: Terminal): Promise<ICertificate>;
    /**
     * Attempt to locate a previously generated debug certificate and untrust it.
     *
     * @public
     */
    untrustCertificateAsync(terminal: Terminal): Promise<boolean>;
    private _createDevelopmentCertificate;
    private _tryTrustCertificateAsync;
    private _trySetFriendlyNameAsync;
    private _ensureCertificateInternalAsync;
    private _certificateHasSubjectAltName;
}
//# sourceMappingURL=CertificateManager.d.ts.map