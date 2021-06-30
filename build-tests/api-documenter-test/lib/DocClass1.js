"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocClassInterfaceMerge = exports.DocClass1 = exports.Generic = exports.EcmaSmbols = exports.DocBaseClass = exports.SystemEvent = void 0;
/**
 * A class used to exposed events.
 * @public
 * {@docCategory SystemEvent}
 *
 * @myCustomTag
 */
class SystemEvent {
    /**
     * Adds an handler for the event.
     */
    addHandler(handler) { }
}
exports.SystemEvent = SystemEvent;
/**
 * Example base class
 * @public
 * {@docCategory DocBaseClass}
 */
class DocBaseClass {
    constructor(x) { }
}
exports.DocBaseClass = DocBaseClass;
/**
 * A namespace containing an ECMAScript symbol
 * @public
 */
var EcmaSmbols;
(function (EcmaSmbols) {
    /**
     * An ECMAScript symbol
     */
    EcmaSmbols.example = Symbol('EcmaSmbols.exampleSymbol');
})(EcmaSmbols = exports.EcmaSmbols || (exports.EcmaSmbols = {}));
/**
 * Generic class.
 * @public
 */
class Generic {
}
exports.Generic = Generic;
/**
 * This is an example class.
 *
 * @remarks
 * {@link DocClass1.(exampleFunction:1)|Link to overload 1}
 *
 * {@link DocClass1.(exampleFunction:2)|Link to overload 2}
 *
 * @public
 * {@docCategory DocClass1}
 */
class DocClass1 extends DocBaseClass {
    /**
     * An internal class constructor.
     * @internal
     */
    constructor(name) {
        super();
    }
    exampleFunction(x, y) {
        return x;
    }
    get readonlyProperty() {
        return 'hello';
    }
    get writeableProperty() {
        return 'hello';
    }
    set writeableProperty(value) { }
    /**
     * An example with tables:
     * @remarks
     * <table>
     *  <tr>
     *    <td>John</td>
     *    <td>Doe</td>
     *  </tr>
     * </table>
     */
    tableExample() { }
    /**
     * Example: "\{ \\"maxItemsToShow\\": 123 \}"
     *
     * The regular expression used to validate the constraints is /^[a-zA-Z0-9\\-_]+$/
     */
    interestingEdgeCases() { }
    /**
     * @deprecated Use `otherThing()` instead.
     */
    deprecatedExample() { }
    /**
     * Returns the sum of two numbers.
     *
     * @remarks
     * This illustrates usage of the `@example` block tag.
     *
     * @param x - the first number to add
     * @param y - the second number to add
     * @returns the sum of the two numbers
     *
     * @example
     * Here's a simple example:
     * ```
     * // Prints "2":
     * console.log(DocClass1.sumWithExample(1,1));
     * ```
     * @example
     * Here's an example with negative numbers:
     * ```
     * // Prints "0":
     * console.log(DocClass1.sumWithExample(1,-1));
     * ```
     */
    static sumWithExample(x, y) {
        return x + y;
    }
}
exports.DocClass1 = DocClass1;
/**
 * Class that merges with interface
 *
 * @remarks
 * {@link (DocClassInterfaceMerge:class)|Link to class}
 *
 * {@link (DocClassInterfaceMerge:interface)|Link to interface}
 *
 * @public
 */
class DocClassInterfaceMerge {
}
exports.DocClassInterfaceMerge = DocClassInterfaceMerge;
//# sourceMappingURL=DocClass1.js.map