"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DecoratorExample = void 0;
function jsonSerialized(target, propertyKey) { }
function jsonFormat(value) {
    return function (target, propertyKey) { };
}
/** @public */
class DecoratorExample {
}
__decorate([
    jsonSerialized,
    jsonFormat('mm/dd/yy')
], DecoratorExample.prototype, "creationDate", void 0);
exports.DecoratorExample = DecoratorExample;
//# sourceMappingURL=DecoratorExample.js.map