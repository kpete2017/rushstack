"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("./../index");
describe('detokenize', function () {
    it('handles colors', function () {
        expect(index_1.detokenize('"[theme:name, default: #FFF]"')).toEqual('#FFF');
        expect(index_1.detokenize('"[theme: name, default: #FFF]"')).toEqual('#FFF');
        expect(index_1.detokenize('"[theme: name , default: #FFF  ]"')).toEqual('#FFF');
    });
    it('handles rgba', function () {
        expect(index_1.detokenize('"[theme:name, default: rgba(255,255,255,.5)]"')).toEqual('rgba(255,255,255,.5)');
    });
    it('handles fonts', function () {
        expect(index_1.detokenize('"[theme:name, default: "Segoe UI"]"')).toEqual('"Segoe UI"');
    });
    it('respects theme', function () {
        index_1.loadTheme({
            color: 'red'
        });
        try {
            expect(index_1.detokenize('"[theme:color, default: #FFF]"')).toEqual('red');
            expect(index_1.detokenize('"[theme: color , default: #FFF]"')).toEqual('red');
        }
        finally {
            index_1.loadTheme(undefined);
        }
    });
    it('ignores malformed themes', function () {
        expect(index_1.detokenize('"[theme:name, default: "Segoe UI"]')).toEqual('"[theme:name, default: "Segoe UI"]');
        expect(index_1.detokenize('"[theme:]"')).toEqual('"[theme:]"');
    });
    it('translates missing themes', function () {
        expect(index_1.detokenize('"[theme:name]"')).toEqual('inherit');
    });
    it('splits non-themable CSS', function () {
        var cssString = '.sampleClass\n{\n color: #FF0000;\n}\n';
        var arr = index_1.splitStyles(cssString);
        expect(arr).toHaveLength(1);
        expect(arr[0].rawString).toEqual(cssString);
    });
    it('splits themable CSS', function () {
        var arr = index_1.splitStyles('.firstClass { color: "[theme: firstColor ]";}\n' +
            ' .secondClass { color: "[theme:secondColor, default: #AAA]";}\n .coach { color: #333; }');
        expect(arr).toHaveLength(5);
        for (var i = 0; i < arr.length; i++) {
            if (i % 2 === 0) {
                // even index should be a string component
                expect(typeof arr[i].rawString).toEqual('string');
            }
            else {
                // odd index should be a theme instruction object
                expect(typeof arr[i].theme).toEqual('string');
            }
        }
    });
    it('passes the styles to loadStyles override callback', function () {
        var expected = 'xxx.foo { color: #FFF }xxx';
        var subject = undefined;
        var callback = function (str) {
            subject = 'xxx' + str + 'xxx';
        };
        index_1.configureLoadStyles(callback);
        index_1.loadStyles('.foo { color: "[theme:fooColor, default: #FFF]" }');
        expect(subject).toEqual(expected);
        index_1.configureLoadStyles(undefined);
    });
});
//# sourceMappingURL=index.test.js.map