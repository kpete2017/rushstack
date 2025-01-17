"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
Object.defineProperty(exports, "__esModule", { value: true });
exports.Deserializer = void 0;
const ApiClass_1 = require("./ApiClass");
const ApiEntryPoint_1 = require("./ApiEntryPoint");
const ApiMethod_1 = require("./ApiMethod");
const ApiModel_1 = require("./ApiModel");
const ApiNamespace_1 = require("./ApiNamespace");
const ApiPackage_1 = require("./ApiPackage");
const ApiInterface_1 = require("./ApiInterface");
const ApiPropertySignature_1 = require("./ApiPropertySignature");
const ApiMethodSignature_1 = require("./ApiMethodSignature");
const ApiProperty_1 = require("./ApiProperty");
const ApiEnumMember_1 = require("./ApiEnumMember");
const ApiEnum_1 = require("./ApiEnum");
const ApiConstructor_1 = require("./ApiConstructor");
const ApiConstructSignature_1 = require("./ApiConstructSignature");
const ApiFunction_1 = require("./ApiFunction");
const ApiCallSignature_1 = require("./ApiCallSignature");
const ApiIndexSignature_1 = require("./ApiIndexSignature");
const ApiTypeAlias_1 = require("./ApiTypeAlias");
const ApiVariable_1 = require("./ApiVariable");
class Deserializer {
    static deserialize(context, jsonObject) {
        const options = {};
        switch (jsonObject.kind) {
            case "Class" /* Class */:
                ApiClass_1.ApiClass.onDeserializeInto(options, context, jsonObject);
                return new ApiClass_1.ApiClass(options);
            case "CallSignature" /* CallSignature */:
                ApiCallSignature_1.ApiCallSignature.onDeserializeInto(options, context, jsonObject);
                return new ApiCallSignature_1.ApiCallSignature(options);
            case "Constructor" /* Constructor */:
                ApiConstructor_1.ApiConstructor.onDeserializeInto(options, context, jsonObject);
                return new ApiConstructor_1.ApiConstructor(options);
            case "ConstructSignature" /* ConstructSignature */:
                ApiConstructSignature_1.ApiConstructSignature.onDeserializeInto(options, context, jsonObject);
                return new ApiConstructSignature_1.ApiConstructSignature(options);
            case "EntryPoint" /* EntryPoint */:
                ApiEntryPoint_1.ApiEntryPoint.onDeserializeInto(options, context, jsonObject);
                return new ApiEntryPoint_1.ApiEntryPoint(options);
            case "Enum" /* Enum */:
                ApiEnum_1.ApiEnum.onDeserializeInto(options, context, jsonObject);
                return new ApiEnum_1.ApiEnum(options);
            case "EnumMember" /* EnumMember */:
                ApiEnumMember_1.ApiEnumMember.onDeserializeInto(options, context, jsonObject);
                return new ApiEnumMember_1.ApiEnumMember(options);
            case "Function" /* Function */:
                ApiFunction_1.ApiFunction.onDeserializeInto(options, context, jsonObject);
                return new ApiFunction_1.ApiFunction(options);
            case "IndexSignature" /* IndexSignature */:
                ApiIndexSignature_1.ApiIndexSignature.onDeserializeInto(options, context, jsonObject);
                return new ApiIndexSignature_1.ApiIndexSignature(options);
            case "Interface" /* Interface */:
                ApiInterface_1.ApiInterface.onDeserializeInto(options, context, jsonObject);
                return new ApiInterface_1.ApiInterface(options);
            case "Method" /* Method */:
                ApiMethod_1.ApiMethod.onDeserializeInto(options, context, jsonObject);
                return new ApiMethod_1.ApiMethod(options);
            case "MethodSignature" /* MethodSignature */:
                ApiMethodSignature_1.ApiMethodSignature.onDeserializeInto(options, context, jsonObject);
                return new ApiMethodSignature_1.ApiMethodSignature(options);
            case "Model" /* Model */:
                return new ApiModel_1.ApiModel();
            case "Namespace" /* Namespace */:
                ApiNamespace_1.ApiNamespace.onDeserializeInto(options, context, jsonObject);
                return new ApiNamespace_1.ApiNamespace(options);
            case "Package" /* Package */:
                ApiPackage_1.ApiPackage.onDeserializeInto(options, context, jsonObject);
                return new ApiPackage_1.ApiPackage(options);
            case "Property" /* Property */:
                ApiProperty_1.ApiProperty.onDeserializeInto(options, context, jsonObject);
                return new ApiProperty_1.ApiProperty(options);
            case "PropertySignature" /* PropertySignature */:
                ApiPropertySignature_1.ApiPropertySignature.onDeserializeInto(options, context, jsonObject);
                return new ApiPropertySignature_1.ApiPropertySignature(options);
            case "TypeAlias" /* TypeAlias */:
                ApiTypeAlias_1.ApiTypeAlias.onDeserializeInto(options, context, jsonObject);
                return new ApiTypeAlias_1.ApiTypeAlias(options);
            case "Variable" /* Variable */:
                ApiVariable_1.ApiVariable.onDeserializeInto(options, context, jsonObject);
                return new ApiVariable_1.ApiVariable(options);
            default:
                throw new Error(`Failed to deserialize unsupported API item type ${JSON.stringify(jsonObject.kind)}`);
        }
    }
}
exports.Deserializer = Deserializer;
//# sourceMappingURL=Deserializer.js.map