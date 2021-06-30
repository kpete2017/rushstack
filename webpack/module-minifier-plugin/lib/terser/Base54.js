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
const terser = __importStar(require("terser"));
const Constants_1 = require("../Constants");
const base54 = terser.base54;
const coreReset = base54.reset;
base54.reset = () => {
    coreReset();
    for (let i = 0, len = Constants_1.IDENTIFIER_TRAILING_DIGITS.length; i < len; i++) {
        base54.consider(Constants_1.IDENTIFIER_TRAILING_DIGITS[i], len - i);
    }
    base54.sort();
};
base54.reset();
terser.AST_Toplevel.prototype.compute_char_frequency = () => {
    // TODO: Expose hook for exporting character frequency information for use in config
    base54.reset();
};
//#endregion
//# sourceMappingURL=Base54.js.map