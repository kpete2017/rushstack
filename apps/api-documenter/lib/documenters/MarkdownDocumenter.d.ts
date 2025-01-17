import { ApiModel } from '@microsoft/api-extractor-model';
import { DocumenterConfig } from './DocumenterConfig';
export interface IMarkdownDocumenterOptions {
    apiModel: ApiModel;
    documenterConfig: DocumenterConfig | undefined;
    outputFolder: string;
}
/**
 * Renders API documentation in the Markdown file format.
 * For more info:  https://en.wikipedia.org/wiki/Markdown
 */
export declare class MarkdownDocumenter {
    private readonly _apiModel;
    private readonly _documenterConfig;
    private readonly _tsdocConfiguration;
    private readonly _markdownEmitter;
    private readonly _outputFolder;
    private readonly _pluginLoader;
    constructor(options: IMarkdownDocumenterOptions);
    generateFiles(): void;
    private _writeApiItemPage;
    private _writeHeritageTypes;
    private _writeRemarksSection;
    private _writeThrowsSection;
    /**
     * GENERATE PAGE: MODEL
     */
    private _writeModelTable;
    /**
     * GENERATE PAGE: PACKAGE or NAMESPACE
     */
    private _writePackageOrNamespaceTables;
    /**
     * GENERATE PAGE: CLASS
     */
    private _writeClassTables;
    /**
     * GENERATE PAGE: ENUM
     */
    private _writeEnumTables;
    /**
     * GENERATE PAGE: INTERFACE
     */
    private _writeInterfaceTables;
    /**
     * GENERATE PAGE: FUNCTION-LIKE
     */
    private _writeParameterTables;
    private _createParagraphForTypeExcerpt;
    private _appendExcerptWithHyperlinks;
    private _appendExcerptTokenWithHyperlinks;
    private _createTitleCell;
    /**
     * This generates a DocTableCell for an ApiItem including the summary section and "(BETA)" annotation.
     *
     * @remarks
     * We mostly assume that the input is an ApiDocumentedItem, but it's easier to perform this as a runtime
     * check than to have each caller perform a type cast.
     */
    private _createDescriptionCell;
    private _createModifiersCell;
    private _createPropertyTypeCell;
    private _writeBreadcrumb;
    private _writeBetaWarning;
    private _appendSection;
    private _appendAndMergeSection;
    private _getFilenameForApiItem;
    private _getLinkFilenameForApiItem;
    private _deleteOldOutputFiles;
}
//# sourceMappingURL=MarkdownDocumenter.d.ts.map