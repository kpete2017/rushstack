import { Path } from '@jest/types/build/Config';
interface IResolverOptions {
    allowPnp?: boolean;
    basedir: Path;
    browser?: boolean;
    defaultResolver: (path: Path, options: IResolverOptions) => Path;
    extensions?: string[];
    moduleDirectory?: string[];
    paths?: Path[];
    rootDir?: Path;
    packageFilter?: unknown;
}
declare function resolve(request: string, options: IResolverOptions): string;
export = resolve;
//# sourceMappingURL=jest-improved-resolver.d.ts.map