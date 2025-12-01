import * as fs from 'fs';
import * as babel from '@babel/standalone';
import traverse from '@babel/traverse';
import * as t from '@babel/types';

/**
 * Check if element at given position contains only static text
 * @param filePath - Path to the file
 * @param lineNumber - Line number (1-based)
 * @param columnNumber - Column number (0-based per Babel convention)
 * @returns true if element contains only static text
 */
export async function checkForStaticText(
  filePath: string,
  lineNumber: number,
  columnNumber: number
): Promise<boolean> {
  try {
    const code = await fs.promises.readFile(filePath, 'utf-8');

    // Parse the code
    const ast = babel.transform(code, {
      ast: true,
      code: false,
      filename: filePath,
      presets: ['@babel/preset-typescript', '@babel/preset-react'],
      parserOpts: {
        plugins: ['typescript', 'jsx', 'classProperties'],
        sourceType: 'module',
      },
    }).ast;

    if (!ast) return false;

    let isStatic = false;
    let found = false;

    // Traverse AST to find the element
    traverse(ast, {
      JSXOpeningElement(path: any) {
        if (found) return;

        const node = path.node;
        if (!node.loc) return;

        // Check if this is the target element
        // Note: Babel line numbers are 1-based, columns are 0-based
        if (
          node.loc.start.line === lineNumber &&
          node.loc.start.column === columnNumber
        ) {
          found = true;
          const element = path.parent; // JSXElement

          if (t.isJSXElement(element)) {
            const children = element.children;

            // Check if all children are static text
            isStatic = children.every((child: any) => {
              if (t.isJSXText(child)) {
                return true; // Static text node
              }
              if (t.isJSXExpressionContainer(child)) {
                // Check if expression is a string literal
                const expr = child.expression;
                return t.isStringLiteral(expr) || t.isTemplateLiteral(expr);
              }
              return false; // Other nodes (components, etc.) make it non-static
            });
          }
        }
      },
    });

    return found && isStatic;
  } catch (error) {
    console.error('[AST Utils] Error checking for static text:', error);
    return false;
  }
}

/**
 * Parse AST from source code
 */
export function parseAST(code: string, filePath: string): any {
  try {
    const result = babel.transform(code, {
      ast: true,
      code: false,
      filename: filePath,
      presets: ['@babel/preset-typescript', '@babel/preset-react'],
      parserOpts: {
        plugins: ['typescript', 'jsx', 'classProperties'],
        sourceType: 'module',
      },
    });
    return result.ast;
  } catch (error) {
    console.error('[AST Utils] Error parsing AST:', error);
    return null;
  }
}
