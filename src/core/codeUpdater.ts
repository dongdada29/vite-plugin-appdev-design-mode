import fs from 'fs';
import path from 'path';
import { IncomingMessage, ServerResponse } from 'http';

export interface UpdateRequest {
  filePath: string;
  line: number;
  column: number;
  newValue: string;
  type: 'style' | 'content';
  originalValue?: string; // 添加原始值用于匹配
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
    const { filePath, newValue, type, originalValue } = data;

    console.log('[appdev-design-mode] Update request:', { filePath, type, newValue: newValue.substring(0, 50) });

    // Resolve absolute path
    const absolutePath = path.isAbsolute(filePath) ? filePath : path.resolve(root, filePath);

    if (!fs.existsSync(absolutePath)) {
      console.error('[appdev-design-mode] File not found:', absolutePath);
      res.statusCode = 404;
      res.end('File not found');
      return;
    }

    let sourceCode = fs.readFileSync(absolutePath, 'utf-8');
    let updated = false;

    if (type === 'content' && originalValue) {
      // 使用原始值进行精确匹配和替换
      // 转义特殊字符
      const escapedOriginal = originalValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(>\\s*)${escapedOriginal}(\\s*<)`, 'g');

      const newSourceCode = sourceCode.replace(regex, `$1${newValue}$2`);

      if (newSourceCode !== sourceCode) {
        fs.writeFileSync(absolutePath, newSourceCode, 'utf-8');
        updated = true;
        console.log(`[appdev-design-mode] Updated ${path.relative(root, absolutePath)}`);
      }
    } else if (type === 'style') {
      // TODO: 实现样式更新
      console.log('[appdev-design-mode] Style update not yet implemented');
    }

    if (updated) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: true, message: 'File updated successfully' }));
    } else {
      console.warn('[appdev-design-mode] Could not update file - no match found');
      res.statusCode = 400;
      res.end(JSON.stringify({ success: false, message: 'Could not locate content to update' }));
    }

  } catch (error) {
    console.error('[appdev-design-mode] Error handling update:', error);
    res.statusCode = 500;
    res.end(JSON.stringify({ success: false, error: String(error) }));
  }
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
