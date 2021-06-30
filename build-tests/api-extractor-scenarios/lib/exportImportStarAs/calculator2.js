"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.subtract = exports.add = void 0;
/**
 * Returns the sum of adding `b` to `a` for large integers
 * @param a - first number
 * @param b - second number
 * @returns Sum of adding `b` to `a`
 * @public
 */
function add(a, b) {
    return a + b;
}
exports.add = add;
/**
 * Returns the sum of subtracting `b` from `a` for large integers
 * @param a - first number
 * @param b - second number
 * @returns Sum of subtract `b` from `a`
 * @beta
 */
function subtract(a, b) {
    return a - b;
}
exports.subtract = subtract;
__exportStar(require("./common"), exports);
//# sourceMappingURL=calculator2.js.map