import * as babel from '@babel/standalone';
import { createSourceMappingPlugin } from './sourceMapper';
import type { DesignModeOptions } from '../types';

export function transformSourceCode(
  code: string,
  id: string,
  options: Required<DesignModeOptions>
): string {
  try {
    // Handle ESM/CJS interop
    const babelApi = (babel as any).default || babel;



    // 解析源码为AST
    // Use transform to get AST since parse might not be exposed directly
    const parseResult = babelApi.transform(code, {
      ast: true,
      code: false,
      sourceType: 'module',
      filename: id,
      presets: ['typescript', 'react'],

      parserOpts: {
        allowImportExportEverywhere: true,
        allowReturnOutsideFunction: true,
        createParenthesizedExpressions: true
      }
    });

    const ast = parseResult.ast;

    // 创建转换插件
    const plugin = createSourceMappingPlugin(id, options);

    // 转换AST
    const result = babelApi.transformFromAst(ast, code, {
      plugins: [plugin],
      sourceMaps: true,
      filename: id
    });

    return (result && result.code) || code;
  } catch (error) {
    if (options.verbose) {
      console.warn(`[appdev-design-mode] AST transformation failed for ${id}:`, error);
    }
    return code;
  }
}
