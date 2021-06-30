"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
const Text_1 = require("../Text");
describe('Text', () => {
    describe('padEnd', () => {
        test("Throws an exception if the padding character isn't a single character", () => {
            expect(() => Text_1.Text.padEnd('123', 1, '')).toThrow();
            expect(() => Text_1.Text.padEnd('123', 1, '  ')).toThrow();
        });
        test("Doesn't change the string if it's already at or greater than the minimum length", () => {
            expect(Text_1.Text.padEnd('12345', 5)).toEqual('12345');
            expect(Text_1.Text.padEnd('123456', 5)).toEqual('123456');
            expect(Text_1.Text.padEnd('12345', 5, '0')).toEqual('12345');
            expect(Text_1.Text.padEnd('123456', 5, '0')).toEqual('123456');
        });
        test('Appends the default character (spaces) to the end of a string', () => {
            expect(Text_1.Text.padEnd('', 5)).toEqual('     ');
            expect(Text_1.Text.padEnd('123', 5)).toEqual('123  ');
        });
        test('Appends the characters to the end of a string', () => {
            expect(Text_1.Text.padEnd('', 5, '0')).toEqual('00000');
            expect(Text_1.Text.padEnd('123', 5, '0')).toEqual('12300');
        });
    });
    describe('padStart', () => {
        test("Throws an exception if the padding character isn't a single character", () => {
            expect(() => Text_1.Text.padStart('123', 1, '')).toThrow();
            expect(() => Text_1.Text.padStart('123', 1, '  ')).toThrow();
        });
        test("Doesn't change the string if it's already at or greater than the minimum length", () => {
            expect(Text_1.Text.padStart('12345', 5)).toEqual('12345');
            expect(Text_1.Text.padStart('123456', 5)).toEqual('123456');
            expect(Text_1.Text.padStart('12345', 5, '0')).toEqual('12345');
            expect(Text_1.Text.padStart('123456', 5, '0')).toEqual('123456');
        });
        test('Appends the default character (spaces) to the end of a string', () => {
            expect(Text_1.Text.padStart('', 5)).toEqual('     ');
            expect(Text_1.Text.padStart('123', 5)).toEqual('  123');
        });
        test('Appends the characters to the end of a string', () => {
            expect(Text_1.Text.padStart('', 5, '0')).toEqual('00000');
            expect(Text_1.Text.padStart('123', 5, '0')).toEqual('00123');
        });
    });
    describe('truncateWithEllipsis', () => {
        test('Throws an exception if the maximum length is less than zero', () => {
            expect(() => Text_1.Text.truncateWithEllipsis('123', -1)).toThrow();
        });
        test("Doesn't change the string if it's already shorter than the maximum length", () => {
            expect(Text_1.Text.truncateWithEllipsis('', 2)).toEqual('');
            expect(Text_1.Text.truncateWithEllipsis('1', 2)).toEqual('1');
            expect(Text_1.Text.truncateWithEllipsis('12', 2)).toEqual('12');
            expect(Text_1.Text.truncateWithEllipsis('123', 5)).toEqual('123');
            expect(Text_1.Text.truncateWithEllipsis('1234', 5)).toEqual('1234');
        });
        test('Truncates strings', () => {
            expect(Text_1.Text.truncateWithEllipsis('123', 0)).toEqual('');
            expect(Text_1.Text.truncateWithEllipsis('123', 2)).toEqual('12');
            expect(Text_1.Text.truncateWithEllipsis('12345', 5)).toEqual('12345');
            expect(Text_1.Text.truncateWithEllipsis('123456', 5)).toEqual('12...');
        });
    });
    describe('convertToLf', () => {
        test('degenerate adjacent newlines', () => {
            expect(Text_1.Text.convertToLf('')).toEqual('');
            expect(Text_1.Text.convertToLf('\n')).toEqual('\n');
            expect(Text_1.Text.convertToLf('\r')).toEqual('\n');
            expect(Text_1.Text.convertToLf('\n\n')).toEqual('\n\n');
            expect(Text_1.Text.convertToLf('\r\n')).toEqual('\n');
            expect(Text_1.Text.convertToLf('\n\r')).toEqual('\n');
            expect(Text_1.Text.convertToLf('\r\r')).toEqual('\n\n');
            expect(Text_1.Text.convertToLf('\n\n\n')).toEqual('\n\n\n');
            expect(Text_1.Text.convertToLf('\r\n\n')).toEqual('\n\n');
            expect(Text_1.Text.convertToLf('\n\r\n')).toEqual('\n\n');
            expect(Text_1.Text.convertToLf('\r\r\n')).toEqual('\n\n');
            expect(Text_1.Text.convertToLf('\n\n\r')).toEqual('\n\n');
            expect(Text_1.Text.convertToLf('\r\n\r')).toEqual('\n\n');
            expect(Text_1.Text.convertToLf('\n\r\r')).toEqual('\n\n');
            expect(Text_1.Text.convertToLf('\r\r\r')).toEqual('\n\n\n');
        });
        test('degenerate mixed newlines', () => {
            expect(Text_1.Text.convertToLf('\nX\n\r')).toEqual('\nX\n');
            expect(Text_1.Text.convertToLf('\rX\r')).toEqual('\nX\n');
            expect(Text_1.Text.convertToLf('\r \n')).toEqual('\n \n');
        });
    });
});
//# sourceMappingURL=Text.test.js.map