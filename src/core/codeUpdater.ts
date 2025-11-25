import fs from 'fs';
import path from 'path';
import { IncomingMessage, ServerResponse } from 'http';
import * as babelApi from '@babel/standalone';
import traverse from '@babel/traverse';

export interface UpdateRequest {
  filePath: string;
  line: number;
  column: number;
  newValue: string;
  type: 'style' | 'content';
}

export async function handleUpdate(req: IncomingMessage, res: ServerResponse, root: string) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.end('Method Not Allowed');
    return;
  }

  const body = await readBody(req);
  try {
    const data = JSON.parse(body) as UpdateRequest;
    const { filePath, line, column, newValue, type } = data;

    // Resolve absolute path
    const absolutePath = path.isAbsolute(filePath) ? filePath : path.resolve(root, filePath);

    if (!fs.existsSync(absolutePath)) {
      res.statusCode = 404;
      res.end('File not found');
      return;
    }

    const sourceCode = fs.readFileSync(absolutePath, 'utf-8');
    const newSourceCode = updateSourceCode(sourceCode, line, column, newValue, type);

    if (newSourceCode === sourceCode) {
      res.statusCode = 400;
      res.end(JSON.stringify({ success: false, message: 'Could not locate element to update' }));
      return;
    }

    fs.writeFileSync(absolutePath, newSourceCode, 'utf-8');

    console.log(`[appdev-design-mode] Updated ${path.relative(root, absolutePath)}`);

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: true, message: 'File updated successfully' }));

  } catch (error) {
    console.error('[appdev-design-mode] Error handling update:', error);
    res.statusCode = 500;
    res.end(JSON.stringify({ success: false, error: String(error) }));
  }
}

function updateSourceCode(code: string, targetLine: number, targetColumn: number, newValue: string, type: 'style' | 'content'): string {
  let result = code;
  let matchFound = false;

  try {
    const ast = babelApi.transform(code, {
      presets: ['typescript', 'react'],
      filename: 'file.tsx', // Dummy filename for parsing
      ast: true,
      code: false,
    }).ast;

    if (!ast) return code;

    // We need to use the traverse from the standalone bundle if possible,
    // but @babel/standalone usually exposes it.
    // However, babelApi.transform returns a File node, we can traverse it.
    // Note: @babel/standalone exports `traverse` as default or named?
    // Usually it's available on babel object.
    // Let's check imports. We imported `traverse` from `@babel/traverse` but that might not be available at runtime if not bundled.
    // Since we are in a Vite plugin (Node env), we should use the installed `@babel/traverse` if available,
    // OR use `babelApi.traverse` if exposed.
    // The `astTransformer.ts` didn't use traverse, it used `transform`.
    // Let's assume `babelApi.traverse` is available or we can walk manually.
    // Actually, since we are in Node, we can require `@babel/traverse`.
    // But let's try to use a simple walker if traverse is tricky with standalone types.

    // Wait, I imported `traverse` from `@babel/traverse`. If it's in devDependencies, it should work in the plugin.

    traverse(ast, {
      enter(path) {
        if (matchFound) return;

        const node = path.node;
        if (!node.loc) return;

        // Check if this node matches the target location
        // The targetLine/Column points to the opening tag of the JSX element
        if (node.type === 'JSXOpeningElement') {
           if (node.loc.start.line === targetLine && node.loc.start.column === targetColumn) {
             // Found the element!
             if (type === 'style') {
               // Update className
               const classNameAttr = node.attributes.find(
                 (attr: any) => attr.type === 'JSXAttribute' && attr.name.name === 'className'
               ) as any;

               if (classNameAttr && classNameAttr.type === 'JSXAttribute' && classNameAttr.value && classNameAttr.value.type === 'StringLiteral') {
                 // Replace existing className
                 const start = classNameAttr.value.start!;
                 const end = classNameAttr.value.end!;
                 // StringLiteral includes quotes, so we replace the whole thing or just content?
                 // newValue usually is just the class string.
                 // We should preserve quotes.
                 // Let's assume we replace the whole value with `"${newValue}"`
                 result = result.slice(0, start) + `"${newValue}"` + result.slice(end);
                 matchFound = true;
               } else if (!classNameAttr) {
                 // Add className attribute
                 // Insert before the end of opening tag
                 // This is tricky with simple string replacement without messing up formatting
                 // For now, let's only support updating existing className
                 // Or we can append it to the end of attributes
                 const endOfTagName = node.name.end!;
                 result = result.slice(0, endOfTagName) + ` className="${newValue}"` + result.slice(endOfTagName);
                 matchFound = true;
               }
             }
           }
        } else if (type === 'content') {
           // For content, the line/col might point to the element, and we want to update its text children
           // OR the line/col points to the text node itself.
           // Usually data-source is on the Element.
           // So if we find the Element, we look for its children.
           if (node.type === 'JSXElement' && node.openingElement.loc?.start.line === targetLine && node.openingElement.loc?.start.column === targetColumn) {
              // Simple case: Single text child
              const textChild = node.children.find(child => child.type === 'JSXText');
              if (textChild && textChild.loc) {
                 const start = textChild.start!;
                 const end = textChild.end!;
                 result = result.slice(0, start) + newValue + result.slice(end);
                 matchFound = true;
              }
           }
        }
      }
    });

  } catch (e) {
    console.error('AST Traversal Error:', e);
  }

  return result;
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      resolve(body);
    });
    req.on('error', reject);
  });
}
