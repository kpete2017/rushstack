"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
const PackageName_1 = require("../PackageName");
describe('PackageName', () => {
    describe('Test', () => {
        test('isValidName() positive test', () => {
            expect(PackageName_1.PackageName.isValidName('@microsoft/example-package')).toEqual(true);
        });
        test('isValidName() negative test', () => {
            expect(PackageName_1.PackageName.isValidName('@microsoft/example-package/path')).toEqual(false);
        });
        test('tryParse() tests', () => {
            expect(PackageName_1.PackageName.tryParse('@microsoft/example-package')).toEqual({
                scope: '@microsoft',
                unscopedName: 'example-package',
                error: ''
            });
            expect(PackageName_1.PackageName.tryParse('')).toEqual({
                scope: '',
                unscopedName: '',
                error: 'The package name must not be empty'
            });
            expect(PackageName_1.PackageName.tryParse(undefined) // eslint-disable-line @typescript-eslint/no-explicit-any
            ).toEqual({
                scope: '',
                unscopedName: '',
                error: 'The package name must not be null or undefined'
            });
            expect(PackageName_1.PackageName.tryParse('@microsoft')).toEqual({
                scope: '@microsoft',
                unscopedName: '',
                error: 'Error parsing "@microsoft": The scope must be followed by a slash'
            });
            expect(PackageName_1.PackageName.tryParse('@/example-package')).toEqual({
                scope: '@',
                unscopedName: 'example-package',
                error: 'Error parsing "@/example-package": The scope name cannot be empty'
            });
            expect(PackageName_1.PackageName.tryParse('@Microsoft/example-package')).toEqual({
                scope: '@Microsoft',
                unscopedName: 'example-package',
                error: 'The package scope "@Microsoft" must not contain upper case characters'
            });
            expect(PackageName_1.PackageName.tryParse('@micro!soft/example-package')).toEqual({
                scope: '@micro!soft',
                unscopedName: 'example-package',
                error: 'The package name "@micro!soft/example-package" contains an invalid character: "!"'
            });
            expect(PackageName_1.PackageName.tryParse('@microsoft/node-co~re-library')).toEqual({
                scope: '@microsoft',
                unscopedName: 'node-co~re-library',
                error: 'The package name "@microsoft/node-co~re-library" contains an invalid character: "~"'
            });
            expect(PackageName_1.PackageName.tryParse('@microsoft/example-package/path')).toEqual({
                scope: '@microsoft',
                unscopedName: 'example-package/path',
                error: 'The package name "@microsoft/example-package/path" contains an invalid character: "/"'
            });
        });
    });
    test('parse() test', () => {
        expect(() => {
            PackageName_1.PackageName.parse('@');
        }).toThrowError('The scope must be followed by a slash');
    });
    test('combineParts() tests', () => {
        expect(PackageName_1.PackageName.combineParts('@microsoft', 'example-package')).toEqual('@microsoft/example-package');
        expect(PackageName_1.PackageName.combineParts('', 'example-package')).toEqual('example-package');
    });
    test('combineParts() errors', () => {
        expect(() => {
            PackageName_1.PackageName.combineParts('', '@microsoft/example-package');
        }).toThrowError('The unscopedName cannot start with an "@" character');
        expect(() => {
            PackageName_1.PackageName.combineParts('@micr!osoft', 'example-package');
        }).toThrowError('The package name "@micr!osoft/example-package" contains an invalid character: "!"');
        expect(() => {
            PackageName_1.PackageName.combineParts('', '');
        }).toThrowError('The package name must not be empty');
    });
});
//# sourceMappingURL=PackageName.test.js.map