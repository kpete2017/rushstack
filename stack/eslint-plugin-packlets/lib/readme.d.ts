import type { TSESLint } from '@typescript-eslint/experimental-utils';
export declare type MessageIds = 'missing-readme' | 'error-reading-file' | 'readme-too-short';
declare type Options = [{
    minimumReadmeWords?: number;
}];
declare const readme: TSESLint.RuleModule<MessageIds, Options>;
export { readme };
//# sourceMappingURL=readme.d.ts.map