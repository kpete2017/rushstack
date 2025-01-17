/**
 * The sorted sequence of leading digits for mangled identifiers
 * Computed from character frequency analysis of the source code for OneDrive
 * @public
 */
export declare const IDENTIFIER_LEADING_DIGITS: string;
/**
 * The sorted sequence of trailing digits for mangled identifiers
 * Computed from character frequency analysis of the source code for OneDrive
 * @public
 */
export declare const IDENTIFIER_TRAILING_DIGITS: string;
/**
 * Prefix to wrap `function (module, __webpack_exports__, __webpack_require__) { ... }` so that the minifier doesn't delete it.
 * Public because alternate Minifier implementations may wish to know about it.
 * @public
 */
export declare const MODULE_WRAPPER_PREFIX: '__MINIFY_MODULE__(';
/**
 * Suffix to wrap `function (module, __webpack_exports__, __webpack_require__) { ... }` so that the minifier doesn't delete it.
 * Public because alternate Minifier implementations may wish to know about it.
 * @public
 */
export declare const MODULE_WRAPPER_SUFFIX: ');';
/**
 * Token to replace the object or array of module definitions so that the minifier can operate on the Webpack runtime or chunk boilerplate in isolation
 * @public
 */
export declare const CHUNK_MODULES_TOKEN: '__WEBPACK_CHUNK_MODULES__';
/**
 * Stage # to use when this should be the first tap in the hook
 * @public
 */
export declare const STAGE_BEFORE: -100;
/**
 * Stage # to use when this should be the last tap in the hook
 * @public
 */
export declare const STAGE_AFTER: 100;
//# sourceMappingURL=Constants.d.ts.map