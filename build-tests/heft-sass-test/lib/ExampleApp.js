// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import * as React from 'react';
import styles from './styles.sass';
import oldStyles from './stylesCSS.css';
import altSyntaxStyles from './stylesAltSyntax.scss';
/**
 * This React component renders the application page.
 */
var ExampleApp = /** @class */ (function (_super) {
    __extends(ExampleApp, _super);
    function ExampleApp() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ExampleApp.prototype.render = function () {
        // Test 3 different style syntaxes: .sass, .css, and .scss, as well as imports.
        return (React.createElement("div", { className: oldStyles.container },
            React.createElement("div", { className: styles.exampleApp },
                React.createElement("h2", { className: styles.exampleImport }, "Hello, world!"),
                React.createElement("p", { className: altSyntaxStyles.label }, "Here is an example styled button:"),
                React.createElement("button", { className: styles.exampleButton }, "Example Button"))));
    };
    return ExampleApp;
}(React.Component));
export { ExampleApp };
//# sourceMappingURL=ExampleApp.js.map