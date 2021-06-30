"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
const Enum_1 = require("../Enum");
// Bidirectional map
var NumericEnum;
(function (NumericEnum) {
    NumericEnum[NumericEnum["Apple"] = 1] = "Apple";
    NumericEnum[NumericEnum["Banana"] = 2] = "Banana";
})(NumericEnum || (NumericEnum = {}));
// Unidirectional map
var StringEnum;
(function (StringEnum) {
    StringEnum["Apple"] = "apple";
    StringEnum["Banana"] = "banana";
})(StringEnum || (StringEnum = {}));
var MixedEnum;
(function (MixedEnum) {
    // Bidirectional map
    MixedEnum[MixedEnum["Apple"] = 1] = "Apple";
    // Unidirectional map
    MixedEnum["Banana"] = "banana";
})(MixedEnum || (MixedEnum = {}));
describe('Enum', () => {
    test('tryGetValueByKey', () => {
        // NumericEnum
        const numeric1 = Enum_1.Enum.tryGetValueByKey(NumericEnum, 'Apple');
        expect(numeric1).toBe(NumericEnum.Apple);
        const numeric2 = Enum_1.Enum.tryGetValueByKey(NumericEnum, 'Coconut');
        expect(numeric2).toBeUndefined();
        // StringEnum
        const string1 = Enum_1.Enum.tryGetValueByKey(StringEnum, 'Apple');
        expect(string1).toBe(StringEnum.Apple);
        const string2 = Enum_1.Enum.tryGetValueByKey(StringEnum, 'Coconut');
        expect(string2).toBeUndefined();
        // MixedEnum
        const mixed1 = Enum_1.Enum.tryGetValueByKey(MixedEnum, 'Apple');
        expect(mixed1).toBe(MixedEnum.Apple);
        const mixed2 = Enum_1.Enum.tryGetValueByKey(MixedEnum, 'Banana');
        expect(mixed2).toBe(MixedEnum.Banana);
        const mixed3 = Enum_1.Enum.tryGetValueByKey(MixedEnum, 'Coconut');
        expect(mixed3).toBeUndefined();
    });
    test('tryGetKeyByNumber', () => {
        // NumericEnum
        const numeric1 = Enum_1.Enum.tryGetKeyByNumber(NumericEnum, NumericEnum.Apple);
        expect(numeric1).toBe('Apple');
        const numeric2 = Enum_1.Enum.tryGetKeyByNumber(NumericEnum, -1);
        expect(numeric2).toBeUndefined();
        // StringEnum
        // Not allowed because values must be numeric:
        // const string1: string | undefined = Enum.tryGetKeyByNumber(StringEnum, StringEnum.Apple);
        const string2 = Enum_1.Enum.tryGetKeyByNumber(StringEnum, -1);
        expect(string2).toBeUndefined();
        // MixedEnum
        const mixed1 = Enum_1.Enum.tryGetKeyByNumber(MixedEnum, MixedEnum.Apple);
        expect(mixed1).toBe('Apple');
        // Not allowed because values must be numeric:
        // const mixed2: string | undefined = Enum.tryGetKeyByNumber(MixedEnum, MixedEnum.Banana);
        const mixed3 = Enum_1.Enum.tryGetKeyByNumber(MixedEnum, -1);
        expect(mixed3).toBeUndefined();
    });
});
//# sourceMappingURL=Enum.test.js.map