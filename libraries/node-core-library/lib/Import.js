"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Import = void 0;
const path = __importStar(require("path"));
const importLazy = require("import-lazy");
const Resolve = __importStar(require("resolve"));
const nodeModule = require("module");
const PackageJsonLookup_1 = require("./PackageJsonLookup");
const FileSystem_1 = require("./FileSystem");
/**
 * Helpers for resolving and importing Node.js modules.
 * @public
 */
class Import {
    static get _builtInModules() {
        if (!Import.__builtInModules) {
            Import.__builtInModules = new Set(nodeModule.builtinModules);
        }
        return Import.__builtInModules;
    }
    /**
     * Provides a way to improve process startup times by lazy-loading imported modules.
     *
     * @remarks
     * This is a more structured wrapper for the {@link https://www.npmjs.com/package/import-lazy|import-lazy}
     * package.  It enables you to replace an import like this:
     *
     * ```ts
     * import * as example from 'example'; // <-- 100ms load time
     *
     * if (condition) {
     *   example.doSomething();
     * }
     * ```
     *
     * ...with a pattern like this:
     *
     * ```ts
     * const example: typeof import('example') = Import.lazy('example', require);
     *
     * if (condition) {
     *   example.doSomething(); // <-- 100ms load time occurs here, only if needed
     * }
     * ```
     *
     * The implementation relies on JavaScript's `Proxy` feature to intercept access to object members.  Thus
     * it will only work correctly with certain types of module exports.  If a particular export isn't well behaved,
     * you may need to find (or introduce) some other module in your dependency graph to apply the optimization to.
     *
     * Usage guidelines:
     *
     * - Always specify types using `typeof` as shown above.
     *
     * - Never apply lazy-loading in a way that would convert the module's type to `any`. Losing type safety
     *   seriously impacts the maintainability of the code base.
     *
     * - In cases where the non-runtime types are needed, import them separately using the `Types` suffix:
     *
     * ```ts
     * const example: typeof import('example') = Import.lazy('example', require);
     * import type * as exampleTypes from 'example';
     * ```
     *
     * - If the imported module confusingly has the same name as its export, then use the Module suffix:
     *
     * ```ts
     * const exampleModule: typeof import('../../logic/Example') = Import.lazy(
     *   '../../logic/Example', require);
     * import type * as exampleTypes from '../../logic/Example';
     * ```
     *
     * - If the exports cause a lot of awkwardness (e.g. too many expressions need to have `exampleModule.` inserted
     *   into them), or if some exports cannot be proxied (e.g. `Import.lazy('example', require)` returns a function
     *   signature), then do not lazy-load that module.  Instead, apply lazy-loading to some other module which is
     *   better behaved.
     *
     * - It's recommended to sort imports in a standard ordering:
     *
     * ```ts
     * // 1. external imports
     * import * as path from 'path';
     * import { Import, JsonFile, JsonObject } from '@rushstack/node-core-library';
     *
     * // 2. local imports
     * import { LocalFile } from './path/LocalFile';
     *
     * // 3. lazy-imports (which are technically variables, not imports)
     * const semver: typeof import('semver') = Import.lazy('semver', require);
     * ```
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static lazy(moduleName, require) {
        const importLazyLocal = importLazy(require);
        return importLazyLocal(moduleName);
    }
    /**
     * This resolves a module path using similar logic as the Node.js `require.resolve()` API,
     * but supporting extra features such as specifying the base folder.
     *
     * @remarks
     * A module path is a text string that might appear in a statement such as
     * `import { X } from "____";` or `const x = require("___");`.  The implementation is based
     * on the popular `resolve` NPM package.
     *
     * Suppose `example` is an NPM package whose entry point is `lib/index.js`:
     * ```ts
     * // Returns "/path/to/project/node_modules/example/lib/index.js"
     * Import.resolveModule({ modulePath: 'example' });
     *
     * // Returns "/path/to/project/node_modules/example/lib/other.js"
     * Import.resolveModule({ modulePath: 'example/lib/other' });
     * ```
     * If you need to determine the containing package folder
     * (`/path/to/project/node_modules/example`), use {@link Import.resolvePackage} instead.
     *
     * @returns the absolute path of the resolved module.
     * If {@link IImportResolveOptions.includeSystemModules} is specified
     * and a system module is found, then its name is returned without any file path.
     */
    static resolveModule(options) {
        const { modulePath } = options;
        if (path.isAbsolute(modulePath)) {
            return modulePath;
        }
        const normalizedRootPath = FileSystem_1.FileSystem.getRealPath(options.baseFolderPath);
        if (modulePath.startsWith('.')) {
            // This looks like a conventional relative path
            return path.resolve(normalizedRootPath, modulePath);
        }
        if (options.includeSystemModules === true && Import._builtInModules.has(modulePath)) {
            return modulePath;
        }
        if (options.allowSelfReference === true) {
            const ownPackage = Import._getPackageName(options.baseFolderPath);
            if (ownPackage && modulePath.startsWith(ownPackage.packageName)) {
                const packagePath = modulePath.substr(ownPackage.packageName.length + 1);
                return path.resolve(ownPackage.packageRootPath, packagePath);
            }
        }
        try {
            return Resolve.sync(
            // Append a slash to the package name to ensure `resolve.sync` doesn't attempt to return a system package
            options.includeSystemModules !== true && modulePath.indexOf('/') === -1
                ? `${modulePath}/`
                : modulePath, {
                basedir: normalizedRootPath,
                preserveSymlinks: false
            });
        }
        catch (e) {
            throw new Error(`Cannot find module "${modulePath}" from "${options.baseFolderPath}".`);
        }
    }
    /**
     * Performs module resolution to determine the folder where a package is installed.
     *
     * @remarks
     * Suppose `example` is an NPM package whose entry point is `lib/index.js`:
     * ```ts
     * // Returns "/path/to/project/node_modules/example"
     * Import.resolvePackage({ packageName: 'example' });
     * ```
     *
     * If you need to resolve a module path, use {@link Import.resolveModule} instead:
     * ```ts
     * // Returns "/path/to/project/node_modules/example/lib/index.js"
     * Import.resolveModule({ modulePath: 'example' });
     * ```
     *
     * @returns the absolute path of the package folder.
     * If {@link IImportResolveOptions.includeSystemModules} is specified
     * and a system module is found, then its name is returned without any file path.
     */
    static resolvePackage(options) {
        const { packageName } = options;
        if (options.includeSystemModules && Import._builtInModules.has(packageName)) {
            return packageName;
        }
        const normalizedRootPath = FileSystem_1.FileSystem.getRealPath(options.baseFolderPath);
        if (options.allowSelfReference) {
            const ownPackage = Import._getPackageName(options.baseFolderPath);
            if (ownPackage && ownPackage.packageName === packageName) {
                return ownPackage.packageRootPath;
            }
        }
        try {
            const resolvedPath = Resolve.sync(packageName, {
                basedir: normalizedRootPath,
                preserveSymlinks: false,
                packageFilter: (pkg) => {
                    // Hardwire "main" to point to a file that is guaranteed to exist.
                    // This helps resolve packages such as @types/node that have no entry point.
                    // And then we can use path.dirname() below to locate the package folder,
                    // even if the real entry point was in an subfolder with arbitrary nesting.
                    pkg.main = 'package.json';
                    return pkg;
                }
            });
            const packagePath = path.dirname(resolvedPath);
            const packageJson = PackageJsonLookup_1.PackageJsonLookup.instance.loadPackageJson(path.join(packagePath, 'package.json'));
            if (packageJson.name === packageName) {
                return packagePath;
            }
            else {
                throw new Error();
            }
        }
        catch (e) {
            throw new Error(`Cannot find package "${packageName}" from "${options.baseFolderPath}".`);
        }
    }
    static _getPackageName(rootPath) {
        const packageJsonPath = PackageJsonLookup_1.PackageJsonLookup.instance.tryGetPackageJsonFilePathFor(rootPath);
        if (packageJsonPath) {
            const packageJson = PackageJsonLookup_1.PackageJsonLookup.instance.loadPackageJson(packageJsonPath);
            return {
                packageRootPath: path.dirname(packageJsonPath),
                packageName: packageJson.name
            };
        }
        else {
            return undefined;
        }
    }
}
exports.Import = Import;
//# sourceMappingURL=Import.js.map