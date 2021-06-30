"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * api-extractor-lib1-test
 *
 * @remarks
 * This library is consumed by api-extractor-scenarios.
 *
 * @packageDocumentation
 */
const Lib1ForgottenExport_1 = require("./Lib1ForgottenExport");
/** @public */
class Lib1Class extends Lib1ForgottenExport_1.Lib1ForgottenExport {
    get readonlyProperty() {
        return 'hello';
    }
    get writeableProperty() {
        return 'hello';
    }
    set writeableProperty(value) { }
}
exports.Lib1Class = Lib1Class;
//# sourceMappingURL=index.js.map