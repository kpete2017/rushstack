declare global {
    namespace jest {
        interface Matchers<R, T = {}> {
            toMatchSet(expected: T): R;
        }
    }
}
export {};
//# sourceMappingURL=Selection.test.d.ts.map