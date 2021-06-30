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
exports.ApiReportGenerator = void 0;
const ts = __importStar(require("typescript"));
const node_core_library_1 = require("@rushstack/node-core-library");
const api_extractor_model_1 = require("@microsoft/api-extractor-model");
const Collector_1 = require("../collector/Collector");
const TypeScriptHelpers_1 = require("../analyzer/TypeScriptHelpers");
const Span_1 = require("../analyzer/Span");
const AstDeclaration_1 = require("../analyzer/AstDeclaration");
const AstImport_1 = require("../analyzer/AstImport");
const AstSymbol_1 = require("../analyzer/AstSymbol");
const StringWriter_1 = require("./StringWriter");
const DtsEmitHelpers_1 = require("./DtsEmitHelpers");
const AstNamespaceImport_1 = require("../analyzer/AstNamespaceImport");
const SourceFileLocationFormatter_1 = require("../analyzer/SourceFileLocationFormatter");
class ApiReportGenerator {
    /**
     * Compares the contents of two API files that were created using ApiFileGenerator,
     * and returns true if they are equivalent.  Note that these files are not normally edited
     * by a human; the "equivalence" comparison here is intended to ignore spurious changes that
     * might be introduced by a tool, e.g. Git newline normalization or an editor that strips
     * whitespace when saving.
     */
    static areEquivalentApiFileContents(actualFileContent, expectedFileContent) {
        // NOTE: "\s" also matches "\r" and "\n"
        const normalizedActual = actualFileContent.replace(/[\s]+/g, ' ');
        const normalizedExpected = expectedFileContent.replace(/[\s]+/g, ' ');
        return normalizedActual === normalizedExpected;
    }
    static generateReviewFileContent(collector) {
        const stringWriter = new StringWriter_1.StringWriter();
        stringWriter.writeLine([
            `## API Report File for "${collector.workingPackage.name}"`,
            ``,
            `> Do not edit this file. It is a report generated by [API Extractor](https://api-extractor.com/).`,
            ``
        ].join('\n'));
        // Write the opening delimiter for the Markdown code fence
        stringWriter.writeLine('```ts\n');
        // Emit the triple slash directives
        let directivesEmitted = false;
        for (const typeDirectiveReference of Array.from(collector.dtsTypeReferenceDirectives).sort()) {
            // https://github.com/microsoft/TypeScript/blob/611ebc7aadd7a44a4c0447698bfda9222a78cb66/src/compiler/declarationEmitter.ts#L162
            stringWriter.writeLine(`/// <reference types="${typeDirectiveReference}" />`);
            directivesEmitted = true;
        }
        for (const libDirectiveReference of Array.from(collector.dtsLibReferenceDirectives).sort()) {
            stringWriter.writeLine(`/// <reference lib="${libDirectiveReference}" />`);
            directivesEmitted = true;
        }
        if (directivesEmitted) {
            stringWriter.writeLine();
        }
        // Emit the imports
        let importsEmitted = false;
        for (const entity of collector.entities) {
            if (entity.astEntity instanceof AstImport_1.AstImport) {
                DtsEmitHelpers_1.DtsEmitHelpers.emitImport(stringWriter, entity, entity.astEntity);
                importsEmitted = true;
            }
        }
        if (importsEmitted) {
            stringWriter.writeLine();
        }
        // Emit the regular declarations
        for (const entity of collector.entities) {
            const astEntity = entity.astEntity;
            if (entity.consumable) {
                const exportsToEmit = new Map();
                for (const exportName of entity.exportNames) {
                    if (!entity.shouldInlineExport) {
                        exportsToEmit.set(exportName, { exportName, associatedMessages: [] });
                    }
                }
                if (astEntity instanceof AstSymbol_1.AstSymbol) {
                    // Emit all the declarations for this entity
                    for (const astDeclaration of astEntity.astDeclarations || []) {
                        // Get the messages associated with this declaration
                        const fetchedMessages = collector.messageRouter.fetchAssociatedMessagesForReviewFile(astDeclaration);
                        // Peel off the messages associated with an export statement and store them
                        // in IExportToEmit.associatedMessages (to be processed later).  The remaining messages will
                        // added to messagesToReport, to be emitted next to the declaration instead of the export statement.
                        const messagesToReport = [];
                        for (const message of fetchedMessages) {
                            if (message.properties.exportName) {
                                const exportToEmit = exportsToEmit.get(message.properties.exportName);
                                if (exportToEmit) {
                                    exportToEmit.associatedMessages.push(message);
                                    continue;
                                }
                            }
                            messagesToReport.push(message);
                        }
                        stringWriter.write(ApiReportGenerator._getAedocSynopsis(collector, astDeclaration, messagesToReport));
                        const span = new Span_1.Span(astDeclaration.declaration);
                        const apiItemMetadata = collector.fetchApiItemMetadata(astDeclaration);
                        if (apiItemMetadata.isPreapproved) {
                            ApiReportGenerator._modifySpanForPreapproved(span);
                        }
                        else {
                            ApiReportGenerator._modifySpan(collector, span, entity, astDeclaration, false);
                        }
                        span.writeModifiedText(stringWriter.stringBuilder);
                        stringWriter.writeLine('\n');
                    }
                }
                if (astEntity instanceof AstNamespaceImport_1.AstNamespaceImport) {
                    const astModuleExportInfo = astEntity.fetchAstModuleExportInfo(collector);
                    if (entity.nameForEmit === undefined) {
                        // This should never happen
                        throw new node_core_library_1.InternalError('referencedEntry.nameForEmit is undefined');
                    }
                    if (astModuleExportInfo.starExportedExternalModules.size > 0) {
                        // We could support this, but we would need to find a way to safely represent it.
                        throw new Error(`The ${entity.nameForEmit} namespace import includes a start export, which is not supported:\n` +
                            SourceFileLocationFormatter_1.SourceFileLocationFormatter.formatDeclaration(astEntity.declaration));
                    }
                    // Emit a synthetic declaration for the namespace.  It will look like this:
                    //
                    //    declare namespace example {
                    //      export {
                    //        f1,
                    //        f2
                    //      }
                    //    }
                    //
                    // Note that we do not try to relocate f1()/f2() to be inside the namespace because other type
                    // signatures may reference them directly (without using the namespace qualifier).
                    stringWriter.writeLine(`declare namespace ${entity.nameForEmit} {`);
                    // all local exports of local imported module are just references to top-level declarations
                    stringWriter.writeLine('  export {');
                    const exportClauses = [];
                    for (const [exportedName, exportedEntity] of astModuleExportInfo.exportedLocalEntities) {
                        const collectorEntity = collector.tryGetCollectorEntity(exportedEntity);
                        if (collectorEntity === undefined) {
                            // This should never happen
                            // top-level exports of local imported module should be added as collector entities before
                            throw new node_core_library_1.InternalError(`Cannot find collector entity for ${entity.nameForEmit}.${exportedEntity.localName}`);
                        }
                        if (collectorEntity.nameForEmit === exportedName) {
                            exportClauses.push(collectorEntity.nameForEmit);
                        }
                        else {
                            exportClauses.push(`${collectorEntity.nameForEmit} as ${exportedName}`);
                        }
                    }
                    stringWriter.writeLine(exportClauses.map((x) => `    ${x}`).join(',\n'));
                    stringWriter.writeLine('  }'); // end of "export { ... }"
                    stringWriter.writeLine('}'); // end of "declare namespace { ... }"
                }
                // Now emit the export statements for this entity.
                for (const exportToEmit of exportsToEmit.values()) {
                    // Write any associated messages
                    for (const message of exportToEmit.associatedMessages) {
                        ApiReportGenerator._writeLineAsComments(stringWriter, 'Warning: ' + message.formatMessageWithoutLocation());
                    }
                    DtsEmitHelpers_1.DtsEmitHelpers.emitNamedExport(stringWriter, exportToEmit.exportName, entity);
                    stringWriter.writeLine();
                }
            }
        }
        DtsEmitHelpers_1.DtsEmitHelpers.emitStarExports(stringWriter, collector);
        // Write the unassociated warnings at the bottom of the file
        const unassociatedMessages = collector.messageRouter.fetchUnassociatedMessagesForReviewFile();
        if (unassociatedMessages.length > 0) {
            stringWriter.writeLine();
            ApiReportGenerator._writeLineAsComments(stringWriter, 'Warnings were encountered during analysis:');
            ApiReportGenerator._writeLineAsComments(stringWriter, '');
            for (const unassociatedMessage of unassociatedMessages) {
                ApiReportGenerator._writeLineAsComments(stringWriter, unassociatedMessage.formatMessageWithLocation(collector.workingPackage.packageFolder));
            }
        }
        if (collector.workingPackage.tsdocComment === undefined) {
            stringWriter.writeLine();
            ApiReportGenerator._writeLineAsComments(stringWriter, '(No @packageDocumentation comment for this package)');
        }
        // Write the closing delimiter for the Markdown code fence
        stringWriter.writeLine('\n```');
        // Remove any trailing spaces
        return stringWriter.toString().replace(ApiReportGenerator._trimSpacesRegExp, '');
    }
    /**
     * Before writing out a declaration, _modifySpan() applies various fixups to make it nice.
     */
    static _modifySpan(collector, span, entity, astDeclaration, insideTypeLiteral) {
        // Should we process this declaration at all?
        // eslint-disable-next-line no-bitwise
        if ((astDeclaration.modifierFlags & ts.ModifierFlags.Private) !== 0) {
            span.modification.skipAll();
            return;
        }
        const previousSpan = span.previousSibling;
        let recurseChildren = true;
        let sortChildren = false;
        switch (span.kind) {
            case ts.SyntaxKind.JSDocComment:
                span.modification.skipAll();
                // For now, we don't transform JSDoc comment nodes at all
                recurseChildren = false;
                break;
            case ts.SyntaxKind.ExportKeyword:
            case ts.SyntaxKind.DefaultKeyword:
            case ts.SyntaxKind.DeclareKeyword:
                // Delete any explicit "export" or "declare" keywords -- we will re-add them below
                span.modification.skipAll();
                break;
            case ts.SyntaxKind.InterfaceKeyword:
            case ts.SyntaxKind.ClassKeyword:
            case ts.SyntaxKind.EnumKeyword:
            case ts.SyntaxKind.NamespaceKeyword:
            case ts.SyntaxKind.ModuleKeyword:
            case ts.SyntaxKind.TypeKeyword:
            case ts.SyntaxKind.FunctionKeyword:
                // Replace the stuff we possibly deleted above
                let replacedModifiers = '';
                if (entity.shouldInlineExport) {
                    replacedModifiers = 'export ' + replacedModifiers;
                }
                if (previousSpan && previousSpan.kind === ts.SyntaxKind.SyntaxList) {
                    // If there is a previous span of type SyntaxList, then apply it before any other modifiers
                    // (e.g. "abstract") that appear there.
                    previousSpan.modification.prefix = replacedModifiers + previousSpan.modification.prefix;
                }
                else {
                    // Otherwise just stick it in front of this span
                    span.modification.prefix = replacedModifiers + span.modification.prefix;
                }
                break;
            case ts.SyntaxKind.SyntaxList:
                if (span.parent) {
                    if (AstDeclaration_1.AstDeclaration.isSupportedSyntaxKind(span.parent.kind)) {
                        // If the immediate parent is an API declaration, and the immediate children are API declarations,
                        // then sort the children alphabetically
                        sortChildren = true;
                    }
                    else if (span.parent.kind === ts.SyntaxKind.ModuleBlock) {
                        // Namespaces are special because their chain goes ModuleDeclaration -> ModuleBlock -> SyntaxList
                        sortChildren = true;
                    }
                }
                break;
            case ts.SyntaxKind.VariableDeclaration:
                if (!span.parent) {
                    // The VariableDeclaration node is part of a VariableDeclarationList, however
                    // the Entry.followedSymbol points to the VariableDeclaration part because
                    // multiple definitions might share the same VariableDeclarationList.
                    //
                    // Since we are emitting a separate declaration for each one, we need to look upwards
                    // in the ts.Node tree and write a copy of the enclosing VariableDeclarationList
                    // content (e.g. "var" from "var x=1, y=2").
                    const list = TypeScriptHelpers_1.TypeScriptHelpers.matchAncestor(span.node, [
                        ts.SyntaxKind.VariableDeclarationList,
                        ts.SyntaxKind.VariableDeclaration
                    ]);
                    if (!list) {
                        // This should not happen unless the compiler API changes somehow
                        throw new node_core_library_1.InternalError('Unsupported variable declaration');
                    }
                    const listPrefix = list
                        .getSourceFile()
                        .text.substring(list.getStart(), list.declarations[0].getStart());
                    span.modification.prefix = listPrefix + span.modification.prefix;
                    span.modification.suffix = ';';
                    if (entity.shouldInlineExport) {
                        span.modification.prefix = 'export ' + span.modification.prefix;
                    }
                }
                break;
            case ts.SyntaxKind.Identifier:
                const referencedEntity = collector.tryGetEntityForIdentifierNode(span.node);
                if (referencedEntity) {
                    if (!referencedEntity.nameForEmit) {
                        // This should never happen
                        throw new node_core_library_1.InternalError('referencedEntry.nameForEmit is undefined');
                    }
                    span.modification.prefix = referencedEntity.nameForEmit;
                    // For debugging:
                    // span.modification.prefix += '/*R=FIX*/';
                }
                else {
                    // For debugging:
                    // span.modification.prefix += '/*R=KEEP*/';
                }
                break;
            case ts.SyntaxKind.TypeLiteral:
                insideTypeLiteral = true;
                break;
        }
        if (recurseChildren) {
            for (const child of span.children) {
                let childAstDeclaration = astDeclaration;
                if (AstDeclaration_1.AstDeclaration.isSupportedSyntaxKind(child.kind)) {
                    childAstDeclaration = collector.astSymbolTable.getChildAstDeclarationByNode(child.node, astDeclaration);
                    if (sortChildren) {
                        span.modification.sortChildren = true;
                        child.modification.sortKey = Collector_1.Collector.getSortKeyIgnoringUnderscore(childAstDeclaration.astSymbol.localName);
                    }
                    if (!insideTypeLiteral) {
                        const messagesToReport = collector.messageRouter.fetchAssociatedMessagesForReviewFile(childAstDeclaration);
                        const aedocSynopsis = ApiReportGenerator._getAedocSynopsis(collector, childAstDeclaration, messagesToReport);
                        const indentedAedocSynopsis = ApiReportGenerator._addIndentAfterNewlines(aedocSynopsis, child.getIndent());
                        child.modification.prefix = indentedAedocSynopsis + child.modification.prefix;
                    }
                }
                ApiReportGenerator._modifySpan(collector, child, entity, childAstDeclaration, insideTypeLiteral);
            }
        }
    }
    /**
     * For declarations marked as `@preapproved`, this is used instead of _modifySpan().
     */
    static _modifySpanForPreapproved(span) {
        // Match something like this:
        //
        //   ClassDeclaration:
        //     SyntaxList:
        //       ExportKeyword:  pre=[export] sep=[ ]
        //       DeclareKeyword:  pre=[declare] sep=[ ]
        //     ClassKeyword:  pre=[class] sep=[ ]
        //     Identifier:  pre=[_PreapprovedClass] sep=[ ]
        //     FirstPunctuation:  pre=[{] sep=[\n\n    ]
        //     SyntaxList:
        //       ...
        //     CloseBraceToken:  pre=[}]
        //
        // or this:
        //   ModuleDeclaration:
        //     SyntaxList:
        //       ExportKeyword:  pre=[export] sep=[ ]
        //       DeclareKeyword:  pre=[declare] sep=[ ]
        //     NamespaceKeyword:  pre=[namespace] sep=[ ]
        //     Identifier:  pre=[_PreapprovedNamespace] sep=[ ]
        //     ModuleBlock:
        //       FirstPunctuation:  pre=[{] sep=[\n\n    ]
        //       SyntaxList:
        //         ...
        //       CloseBraceToken:  pre=[}]
        //
        // And reduce it to something like this:
        //
        //   // @internal (undocumented)
        //   class _PreapprovedClass { /* (preapproved) */ }
        //
        let skipRest = false;
        for (const child of span.children) {
            if (skipRest || child.kind === ts.SyntaxKind.SyntaxList || child.kind === ts.SyntaxKind.JSDocComment) {
                child.modification.skipAll();
            }
            if (child.kind === ts.SyntaxKind.Identifier) {
                skipRest = true;
                child.modification.omitSeparatorAfter = true;
                child.modification.suffix = ' { /* (preapproved) */ }';
            }
        }
    }
    /**
     * Writes a synopsis of the AEDoc comments, which indicates the release tag,
     * whether the item has been documented, and any warnings that were detected
     * by the analysis.
     */
    static _getAedocSynopsis(collector, astDeclaration, messagesToReport) {
        const stringWriter = new StringWriter_1.StringWriter();
        for (const message of messagesToReport) {
            ApiReportGenerator._writeLineAsComments(stringWriter, 'Warning: ' + message.formatMessageWithoutLocation());
        }
        if (!collector.isAncillaryDeclaration(astDeclaration)) {
            const footerParts = [];
            const apiItemMetadata = collector.fetchApiItemMetadata(astDeclaration);
            if (!apiItemMetadata.releaseTagSameAsParent) {
                if (apiItemMetadata.effectiveReleaseTag !== api_extractor_model_1.ReleaseTag.None) {
                    footerParts.push(api_extractor_model_1.ReleaseTag.getTagName(apiItemMetadata.effectiveReleaseTag));
                }
            }
            if (apiItemMetadata.isSealed) {
                footerParts.push('@sealed');
            }
            if (apiItemMetadata.isVirtual) {
                footerParts.push('@virtual');
            }
            if (apiItemMetadata.isOverride) {
                footerParts.push('@override');
            }
            if (apiItemMetadata.isEventProperty) {
                footerParts.push('@eventProperty');
            }
            if (apiItemMetadata.tsdocComment) {
                if (apiItemMetadata.tsdocComment.deprecatedBlock) {
                    footerParts.push('@deprecated');
                }
            }
            if (apiItemMetadata.needsDocumentation) {
                footerParts.push('(undocumented)');
            }
            if (footerParts.length > 0) {
                if (messagesToReport.length > 0) {
                    ApiReportGenerator._writeLineAsComments(stringWriter, ''); // skip a line after the warnings
                }
                ApiReportGenerator._writeLineAsComments(stringWriter, footerParts.join(' '));
            }
        }
        return stringWriter.toString();
    }
    static _writeLineAsComments(stringWriter, line) {
        const lines = node_core_library_1.Text.convertToLf(line).split('\n');
        for (const realLine of lines) {
            stringWriter.write('// ');
            stringWriter.write(realLine);
            stringWriter.writeLine();
        }
    }
    static _addIndentAfterNewlines(text, indent) {
        if (text.length === 0 || indent.length === 0) {
            return text;
        }
        return node_core_library_1.Text.replaceAll(text, '\n', '\n' + indent);
    }
}
exports.ApiReportGenerator = ApiReportGenerator;
ApiReportGenerator._trimSpacesRegExp = / +$/gm;
//# sourceMappingURL=ApiReportGenerator.js.map