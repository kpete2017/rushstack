"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExamplePlugin01 = void 0;
const tapable_1 = require("tapable");
class ExamplePlugin01 {
    constructor() {
        this.pluginName = "example-plugin-01" /* ExamplePlugin01 */;
    }
    get accessor() {
        return this._accessor;
    }
    apply(heftSession, heftConfiguration) {
        this._accessor = {
            exampleHook: new tapable_1.SyncHook()
        };
        heftSession.hooks.build.tap("example-plugin-01" /* ExamplePlugin01 */, (build) => {
            build.hooks.preCompile.tap("example-plugin-01" /* ExamplePlugin01 */, (preCompile) => {
                preCompile.hooks.run.tap("example-plugin-01" /* ExamplePlugin01 */, () => {
                    this.accessor.exampleHook.call();
                });
            });
        });
    }
}
exports.ExamplePlugin01 = ExamplePlugin01;
exports.default = new ExamplePlugin01();
//# sourceMappingURL=index.js.map