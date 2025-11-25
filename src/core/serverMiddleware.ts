import type { ViteDevServer } from 'vite';
import type { DesignModeOptions } from '../types';
import * as fs from 'fs';
import * as path from 'path';

export function createServerMiddleware(
  options: Required<DesignModeOptions>,
  rootDir: string
) {
  return async (req: any, res: any) => {
    const url = new URL(req.url, 'http://localhost');

    try {
      switch (url.pathname) {
        case '/__appdev_design_mode/get-source':
          await handleGetSource(url, res, rootDir);
          break;
        case '/__appdev_design_mode/modify-source':
          await handleModifySource(req, res, rootDir);
          break;
        case '/__appdev_design_mode/health':
          await handleHealthCheck(res);
          break;
        default:
          res.statusCode = 404;
          res.end(JSON.stringify({ error: 'Not found' }));
      }
    } catch (error) {
      res.statusCode = 500;
      res.end(
        JSON.stringify({
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      );
    }
  };
}

/**
 * 获取元素源码信息
 */
async function handleGetSource(url: URL, res: any, rootDir: string) {
  const elementId = url.searchParams.get('elementId');

  if (!elementId) {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: 'Missing elementId parameter' }));
    return;
  }

  try {
    // 解析elementId获取文件位置
    const sourceInfo = parseElementId(elementId);

    if (!sourceInfo) {
      res.statusCode = 400;
      res.end(JSON.stringify({ error: 'Invalid elementId format' }));
      return;
    }

    // 读取文件内容
    const filePath = path.resolve(rootDir, sourceInfo.fileName);
    const fileContent = await fs.promises.readFile(filePath, 'utf-8');

    // 获取指定行
    const lines = fileContent.split('\n');
    const targetLine = Math.max(0, sourceInfo.lineNumber - 1);
    const contextLines = lines.slice(
      Math.max(0, targetLine - 2),
      Math.min(lines.length, targetLine + 3)
    );

    res.statusCode = 200;
    res.end(
      JSON.stringify({
        sourceInfo: {
          ...sourceInfo,
          fileContent: fileContent,
          contextLines: contextLines.join('\n'),
          targetLineContent: lines[targetLine] || '',
        },
      })
    );
  } catch (error) {
    res.statusCode = 500;
    res.end(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    );
  }
}

/**
 * 修改源码
 */
async function handleModifySource(req: any, res: any, rootDir: string) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  let body = '';
  req.on('data', (chunk: any) => {
    body += chunk.toString();
  });

  req.on('end', async () => {
    try {
      const { elementId, newStyles, oldStyles } = JSON.parse(body);

      if (!elementId || newStyles === undefined) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: 'Missing required parameters' }));
        return;
      }

      // 解析elementId
      const sourceInfo = parseElementId(elementId);
      if (!sourceInfo) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: 'Invalid elementId format' }));
        return;
      }

      // 读取并修改文件
      const filePath = path.resolve(rootDir, sourceInfo.fileName);
      const fileContent = await fs.promises.readFile(filePath, 'utf-8');

      const updatedContent = replaceInSource(fileContent, {
        lineNumber: sourceInfo.lineNumber,
        oldStyles: oldStyles || '',
        newStyles: newStyles,
      });

      // 写回文件
      await fs.promises.writeFile(filePath, updatedContent, 'utf-8');

      res.statusCode = 200;
      res.end(
        JSON.stringify({
          success: true,
          message: 'Source modified successfully',
          sourceInfo,
        })
      );
    } catch (error) {
      res.statusCode = 500;
      res.end(
        JSON.stringify({
          error: error instanceof Error ? error.message : 'Unknown error',
        })
      );
    }
  });
}

/**
 * 健康检查
 */
async function handleHealthCheck(res: any) {
  res.statusCode = 200;
  res.end(
    JSON.stringify({
      status: 'ok',
      timestamp: Date.now(),
      plugin: '@xagi/vite-plugin-design-mode',
    })
  );
}

/**
 * 解析elementId获取源码位置
 */
function parseElementId(
  elementId: string
): { fileName: string; lineNumber: number; columnNumber: number } | null {
  const parts = elementId.split('_');
  if (parts.length === 0) return null;

  const [filePosition, ...rest] = parts;
  const positionParts = filePosition.split(':');

  if (positionParts.length !== 3) return null;

  const [fileName, lineNumberStr, columnNumberStr] = positionParts;
  const lineNumber = parseInt(lineNumberStr);
  const columnNumber = parseInt(columnNumberStr);

  if (isNaN(lineNumber) || isNaN(columnNumber)) return null;

  return {
    fileName,
    lineNumber,
    columnNumber,
  };
}

/**
 * 在源码中进行精确替换
 */
function replaceInSource(
  content: string,
  options: { lineNumber: number; oldStyles?: string; newStyles: string }
): string {
  const lines = content.split('\n');
  const targetLine = Math.max(0, options.lineNumber - 1);

  if (targetLine >= lines.length) {
    throw new Error(`Line number ${options.lineNumber} exceeds file length`);
  }

  const line = lines[targetLine];

  if (options.oldStyles && line.includes(options.oldStyles)) {
    // 使用字符串替换
    const newLine = line.replace(
      new RegExp(escapeRegExp(options.oldStyles), 'g'),
      options.newStyles
    );
    lines[targetLine] = newLine;
  } else {
    // 如果没有找到旧样式，直接替换整行（谨慎操作）
    lines[targetLine] = options.newStyles;
  }

  return lines.join('\n');
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
