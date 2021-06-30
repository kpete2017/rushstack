"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExamplePlugin02 = void 0;
class ExamplePlugin02 {
    constructor() {
        this.pluginName = "example-plugin-02" /* ExamplePlugin02 */;
    }
    apply(heftSession, heftConfiguration) {
        heftSession.requestAccessToPluginByName("example-plugin-01" /* ExamplePlugin01 */, (accessor) => {
            accessor.exampleHook.tap("example-plugin-02" /* ExamplePlugin02 */, () => {
                heftConfiguration.globalTerminal.writeLine(`!!!!!!!!!!!!!!! Plugin "${"example-plugin-01" /* ExamplePlugin01 */}" hook called !!!!!!!!!!!!!!! `);
            });
        });
    }
}
exports.ExamplePlugin02 = ExamplePlugin02;
exports.default = new ExamplePlugin02();
//# sourceMappingURL=index.js.map