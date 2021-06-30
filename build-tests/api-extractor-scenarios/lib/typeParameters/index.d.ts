/** @public */
export declare class GenericClass<T> {
}
/** @public */
export declare class GenericClassWithConstraint<T extends string> {
}
/** @public */
export declare class GenericClassWithDefault<T = number> {
}
/** @public */
export declare class ClassWithGenericMethod {
    method<T>(): void;
}
/** @public */
export interface GenericInterface<T> {
}
/** @public */
export interface InterfaceWithGenericCallSignature {
    <T>(): void;
}
/** @public */
export interface InterfaceWithGenericConstructSignature {
    new <T>(): T;
}
/** @public */
export declare function genericFunction<T>(): void;
/** @public */
export declare type GenericTypeAlias<T> = T;
//# sourceMappingURL=index.d.ts.map