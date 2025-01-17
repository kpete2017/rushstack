import * as webpack from 'webpack';
/**
 * @public
 */
export interface ILocalizedWebpackChunk extends webpack.compilation.Chunk {
    localizedFiles?: {
        [locale: string]: string;
    };
}
//# sourceMappingURL=webpackInterfaces.d.ts.map