"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const webpack_sources_1 = require("webpack-sources");
const RehydrateAsset_1 = require("../RehydrateAsset");
const Constants_1 = require("../Constants");
const modules = new Map();
modules.set('a', {
    source: new webpack_sources_1.RawSource('foo'),
    extractedComments: [],
    module: undefined
});
modules.set('b', {
    source: new webpack_sources_1.RawSource('bar'),
    extractedComments: [],
    module: undefined
});
modules.set('0b', {
    source: new webpack_sources_1.RawSource('baz'),
    extractedComments: [],
    module: undefined
});
modules.set('=', {
    source: new webpack_sources_1.RawSource('bak'),
    extractedComments: [],
    module: undefined
});
modules.set('a0', {
    source: new webpack_sources_1.RawSource('bal'),
    extractedComments: [],
    module: undefined
});
modules.set(0, {
    source: new webpack_sources_1.RawSource('fizz'),
    extractedComments: [],
    module: undefined
});
modules.set(2, {
    source: new webpack_sources_1.RawSource('buzz'),
    extractedComments: [],
    module: undefined
});
modules.set(255, {
    source: new webpack_sources_1.RawSource('__WEBPACK_EXTERNAL_MODULE_fizz__'),
    extractedComments: [],
    module: undefined
});
for (let i = 14; i < 30; i++) {
    if (i !== 25) {
        modules.set(i, {
            source: new webpack_sources_1.RawSource('bozz'),
            extractedComments: [],
            module: undefined
        });
    }
}
modules.set(25, {
    source: new webpack_sources_1.RawSource('bang'),
    extractedComments: [],
    module: undefined
});
for (let i = 1000; i < 1010; i++) {
    modules.set(i, {
        source: new webpack_sources_1.RawSource(`b${i}`),
        extractedComments: [],
        module: undefined
    });
}
const banner = `/* fnord */\n`;
describe('rehydrateAsset', () => {
    it('uses an object for non-numeric ids', () => {
        const asset = {
            source: new webpack_sources_1.RawSource(`<before>${Constants_1.CHUNK_MODULES_TOKEN}<after>`),
            modules: ['a', 'b', '0b', '=', 'a0'],
            extractedComments: [],
            fileName: 'test',
            chunk: undefined,
            externalNames: new Map()
        };
        const result = RehydrateAsset_1.rehydrateAsset(asset, modules, banner).source();
        const expected = `/* fnord */\n<before>{a:foo,b:bar,"0b":baz,"=":bak,a0:bal}<after>`;
        if (result !== expected) {
            throw new Error(`Expected ${expected} but received ${result}`);
        }
    });
    it('uses an object for widely separated ids', () => {
        const asset = {
            source: new webpack_sources_1.RawSource(`<before>${Constants_1.CHUNK_MODULES_TOKEN}<after>`),
            modules: [0, 25],
            extractedComments: [],
            fileName: 'test',
            chunk: undefined,
            externalNames: new Map()
        };
        const result = RehydrateAsset_1.rehydrateAsset(asset, modules, banner).source();
        const expected = `/* fnord */\n<before>{0:fizz,25:bang}<after>`;
        if (result !== expected) {
            throw new Error(`Expected ${expected} but received ${result}`);
        }
    });
    it('uses a regular array for a couple missing leading elements', () => {
        const asset = {
            source: new webpack_sources_1.RawSource(`<before>${Constants_1.CHUNK_MODULES_TOKEN}<after>`),
            modules: [2],
            extractedComments: [],
            fileName: 'test',
            chunk: undefined,
            externalNames: new Map()
        };
        const result = RehydrateAsset_1.rehydrateAsset(asset, modules, banner).source();
        const expected = `/* fnord */\n<before>[,,buzz]<after>`;
        if (result !== expected) {
            throw new Error(`Expected ${expected} but received ${result}`);
        }
    });
    it('uses a regular array for several missing leading elements', () => {
        const asset = {
            source: new webpack_sources_1.RawSource(`<before>${Constants_1.CHUNK_MODULES_TOKEN}<after>`),
            modules: [14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29],
            extractedComments: [],
            fileName: 'test',
            chunk: undefined,
            externalNames: new Map()
        };
        const result = RehydrateAsset_1.rehydrateAsset(asset, modules, banner).source();
        const expected = `/* fnord */\n<before>[,,,,,,,,,,,,,,bozz,bozz,bozz,bozz,bozz,bozz,bozz,bozz,bozz,bozz,bozz,bang,bozz,bozz,bozz,bozz]<after>`;
        if (result !== expected) {
            throw new Error(`Expected ${expected} but received ${result}`);
        }
    });
    it('uses a concat array for a tight cluster of ids', () => {
        const asset = {
            source: new webpack_sources_1.RawSource(`<before>${Constants_1.CHUNK_MODULES_TOKEN}<after>`),
            modules: [1000, 1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008, 1009],
            extractedComments: [],
            fileName: 'test',
            chunk: undefined,
            externalNames: new Map()
        };
        const result = RehydrateAsset_1.rehydrateAsset(asset, modules, banner).source();
        const expected = `/* fnord */\n<before>Array(1000).concat([b1000,b1001,b1002,b1003,b1004,b1005,b1006,b1007,b1008,b1009])<after>`;
        if (result !== expected) {
            throw new Error(`Expected ${expected} but received ${result}`);
        }
    });
    it('uses a concat spacer for multiple tight clusters of ids', () => {
        const asset = {
            source: new webpack_sources_1.RawSource(`<before>${Constants_1.CHUNK_MODULES_TOKEN}<after>`),
            modules: [0, 2, 1000, 1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008, 1009],
            extractedComments: [],
            fileName: 'test',
            chunk: undefined,
            externalNames: new Map()
        };
        const result = RehydrateAsset_1.rehydrateAsset(asset, modules, banner).source();
        const expected = `/* fnord */\n<before>[fizz,,buzz].concat(Array(997),[b1000,b1001,b1002,b1003,b1004,b1005,b1006,b1007,b1008,b1009])<after>`;
        if (result !== expected) {
            throw new Error(`Expected ${expected} but received ${result}`);
        }
    });
    it('supports a concat spacer and leading ids', () => {
        const asset = {
            source: new webpack_sources_1.RawSource(`<before>${Constants_1.CHUNK_MODULES_TOKEN}<after>`),
            modules: [2, 1000, 1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008, 1009],
            extractedComments: [],
            fileName: 'test',
            chunk: undefined,
            externalNames: new Map()
        };
        const result = RehydrateAsset_1.rehydrateAsset(asset, modules, banner).source();
        const expected = `/* fnord */\n<before>[,,buzz].concat(Array(997),[b1000,b1001,b1002,b1003,b1004,b1005,b1006,b1007,b1008,b1009])<after>`;
        if (result !== expected) {
            throw new Error(`Expected ${expected} but received ${result}`);
        }
    });
    it('reprocesses external names', () => {
        const asset = {
            source: new webpack_sources_1.RawSource(`<before>${Constants_1.CHUNK_MODULES_TOKEN}<after>`),
            modules: [255],
            extractedComments: [],
            fileName: 'test',
            chunk: undefined,
            externalNames: new Map([['__WEBPACK_EXTERNAL_MODULE_fizz__', 'TREBLE']])
        };
        const result = RehydrateAsset_1.rehydrateAsset(asset, modules, banner).source();
        const expected = `/* fnord */\n<before>{255:TREBLE}<after>`;
        if (result !== expected) {
            throw new Error(`Expected ${expected} but received ${result}`);
        }
    });
});
//# sourceMappingURL=RehydrateAsset.test.js.map