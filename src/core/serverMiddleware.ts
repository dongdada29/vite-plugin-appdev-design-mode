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
        // 现有端点
        case '/get-source':
          await handleGetSource(url, res, rootDir);
          break;
        case '/modify-source':
          await handleModifySource(req, res, rootDir);
          break;
        case '/health':
          await handleHealthCheck(res);
          break;

        // 新增端点
        case '/update':
          await handleUpdate(req, res, rootDir);
          break;
        case '/batch-update':
          await handleBatchUpdate(req, res, rootDir);
          break;
        case '/batch-update-status':
          await handleBatchUpdateStatus(req, res, rootDir);
          break;
        case '/undo':
          await handleUndo(req, res, rootDir);
          break;
        case '/redo':
          await handleRedo(req, res, rootDir);
          break;
        case '/get-history':
          await handleGetHistory(req, res, rootDir);
          break;
        case '/validate-update':
          await handleValidateUpdate(req, res, rootDir);
          break;

        default:
          res.statusCode = 404;
          res.end(JSON.stringify({
            error: 'Not found',
            requestedPath: url.pathname,
            availableEndpoints: [
              '/get-source',
              '/modify-source',
              '/update',
              '/batch-update',
              '/batch-update-status',
              '/undo',
              '/redo',
              '/get-history',
              '/validate-update',
              '/health'
            ]
          }));
      }
    } catch (error) {
      console.error('[DesignMode] Server middleware error:', error);
      res.statusCode = 500;
      res.end(
        JSON.stringify({
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
        })
      );
    }
  };
}

/**
 * 获取元素源码信息（增强版）
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

    // 检查文件是否存在
    try {
      await fs.promises.access(filePath, fs.constants.F_OK);
    } catch {
      res.statusCode = 404;
      res.end(JSON.stringify({ error: 'Source file not found', filePath }));
      return;
    }

    const fileContent = await fs.promises.readFile(filePath, 'utf-8');

    // 获取指定行
    const lines = fileContent.split('\n');
    const targetLine = Math.max(0, sourceInfo.lineNumber - 1);
    const contextLines = lines.slice(
      Math.max(0, targetLine - 5),
      Math.min(lines.length, targetLine + 5)
    );

    // 增强的返回数据
    const response = {
      sourceInfo: {
        ...sourceInfo,
        fileContent: fileContent,
        contextLines: contextLines,
        targetLineContent: lines[targetLine] || '',
        totalLines: lines.length,
        fileExists: true
      },
      elementMetadata: {
        tagName: extractTagNameFromLine(lines[targetLine]),
        estimatedClassName: extractClassNameFromLine(lines[targetLine]),
        lineContext: getLineContext(lines, targetLine)
      },
      fileStats: {
        size: fileContent.length,
        lastModified: (await fs.promises.stat(filePath)).mtime.getTime()
      }
    };

    res.statusCode = 200;
    res.end(JSON.stringify(response));
  } catch (error) {
    res.statusCode = 500;
    res.end(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error'
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

      const updatedContent = await smartReplaceInSource(
        fileContent,
        {
          lineNumber: sourceInfo.lineNumber,
          columnNumber: sourceInfo.columnNumber,
          newValue: newStyles,
          originalValue: oldStyles || '',
          type: 'style',
        },
        rootDir
      );

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
 * 统一更新接口
 * 支持样式、内容、属性更新
 */
async function handleUpdate(req: any, res: any, rootDir: string) {
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
      const updateData = JSON.parse(body);
      const { filePath, line, column, newValue, originalValue, type } = updateData;

      // 参数验证
      if (!filePath || line === undefined || column === undefined || newValue === undefined || !type) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: 'Missing required parameters' }));
        return;
      }

      if (!['style', 'content', 'attribute'].includes(type)) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: 'Invalid update type' }));
        return;
      }

      // 读取并修改文件
      const fullFilePath = path.resolve(rootDir, filePath);

      // 检查文件是否存在
      try {
        await fs.promises.access(fullFilePath, fs.constants.F_OK);
      } catch {
        res.statusCode = 404;
        res.end(JSON.stringify({ error: 'Source file not found', filePath }));
        return;
      }

      const fileContent = await fs.promises.readFile(fullFilePath, 'utf-8');
      const lines = fileContent.split('\n');
      const targetLine = Math.max(0, line - 1);

      if (targetLine >= lines.length) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: `Line ${line} exceeds file length (${lines.length} lines)` }));
        return;
      }

      // 智能文本替换
      const updatedContent = await smartReplaceInSource(
        fileContent,
        {
          lineNumber: line,
          columnNumber: column,
          newValue,
          originalValue,
          type
        },
        rootDir
      );

      // 创建备份
      const backupPath = `${fullFilePath}.backup.${Date.now()}`;
      await fs.promises.writeFile(backupPath, fileContent, 'utf-8');

      // 写回文件
      await fs.promises.writeFile(fullFilePath, updatedContent, 'utf-8');

      // 记录操作
      const updateRecord = {
        id: `update_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        filePath,
        line,
        column,
        type,
        newValue,
        originalValue,
        timestamp: Date.now(),
        backupPath
      };

      res.statusCode = 200;
      res.end(
        JSON.stringify({
          success: true,
          message: 'Update completed successfully',
          updateRecord,
          affectedLines: {
            before: lines[targetLine],
            after: updatedContent.split('\n')[targetLine]
          }
        })
      );
    } catch (error) {
      res.statusCode = 500;
      res.end(
        JSON.stringify({
          error: error instanceof Error ? error.message : 'Unknown error',
          details: error instanceof Error ? error.stack : undefined
        })
      );
    }
  });
}

/**
 * 批量更新接口
 */
async function handleBatchUpdate(req: any, res: any, rootDir: string) {
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
      const { updates } = JSON.parse(body);

      if (!Array.isArray(updates) || updates.length === 0) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: 'No updates provided or invalid format' }));
        return;
      }

      // 验证批量更新
      const validationResults = await Promise.allSettled(
        updates.map(update => validateUpdateRequest(update, rootDir))
      );

      // 创建批量更新会话
      const batchId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const batchSession: {
        id: string;
        timestamp: number;
        totalUpdates: number;
        successfulUpdates: number;
        failedUpdates: number;
        updates: any[];
      } = {
        id: batchId,
        timestamp: Date.now(),
        totalUpdates: updates.length,
        successfulUpdates: 0,
        failedUpdates: 0,
        updates: []
      };

      // 处理每个更新
      const results = [];
      for (let i = 0; i < updates.length; i++) {
        const update = updates[i];
        const validation = validationResults[i];

        if (validation.status === 'rejected') {
          results.push({
            success: false,
            error: validation.reason,
            update
          });
          batchSession.failedUpdates++;
          continue;
        }

        try {
          const result = await processSingleUpdate(update, rootDir, batchId);
          results.push(result);
          if (result.success) {
            batchSession.successfulUpdates++;
          } else {
            batchSession.failedUpdates++;
          }
          batchSession.updates.push(result);
        } catch (error) {
          results.push({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            update
          });
          batchSession.failedUpdates++;
          batchSession.updates.push(results[results.length - 1]);
        }
      }

      // 保存批量更新会话到文件
      const sessionFile = path.join(rootDir, '.appdev_batch_sessions.json');
      let sessions = {};
      try {
        const existingSessionsContent = await fs.promises.readFile(sessionFile, 'utf-8');
        sessions = JSON.parse(existingSessionsContent);
      } catch {
        // 文件不存在或无法读取，创建新的
      }

      (sessions as any)[batchId] = batchSession;
      await fs.promises.writeFile(sessionFile, JSON.stringify(sessions, null, 2), 'utf-8');

      res.statusCode = 200;
      res.end(
        JSON.stringify({
          batchId,
          success: batchSession.failedUpdates === 0,
          summary: {
            total: updates.length,
            successful: batchSession.successfulUpdates,
            failed: batchSession.failedUpdates
          },
          results
        })
      );
    } catch (error) {
      res.statusCode = 500;
      res.end(
        JSON.stringify({
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      );
    }
  });
}

/**
 * 批量更新状态查询
 */
async function handleBatchUpdateStatus(req: any, res: any, rootDir: string) {
  const batchId = req.url.split('?')[1]?.split('=')[1];

  if (!batchId) {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: 'Missing batchId' }));
    return;
  }

  try {
    const sessionFile = path.join(rootDir, '.appdev_batch_sessions.json');
    let sessions = {};

    try {
      const existingSessionsContent = await fs.promises.readFile(sessionFile, 'utf-8');
      sessions = JSON.parse(existingSessionsContent);
    } catch {
      // 文件不存在
      res.statusCode = 404;
      res.end(JSON.stringify({ error: 'Batch session not found' }));
      return;
    }

    const session = (sessions as any)[batchId];
    if (!session) {
      res.statusCode = 404;
      res.end(JSON.stringify({ error: 'Batch session not found' }));
      return;
    }

    res.statusCode = 200;
    res.end(JSON.stringify({
      success: true,
      session
    }));
  } catch (error) {
    res.statusCode = 500;
    res.end(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    );
  }
}

/**
 * 撤销操作
 */
async function handleUndo(req: any, res: any, rootDir: string) {
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
      const { batchId } = JSON.parse(body);

      if (!batchId) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: 'Missing batchId' }));
        return;
      }

      // 查找并恢复备份文件
      const backupFiles = await fs.promises.readdir(rootDir);
      const matchingBackups = backupFiles
        .filter(file => file.startsWith('.') && file.includes('.backup.') && file.includes(batchId));

      if (matchingBackups.length === 0) {
        res.statusCode = 404;
        res.end(JSON.stringify({ error: 'No backup files found for this batch' }));
        return;
      }

      // 找到最新的备份文件
      const latestBackup = matchingBackups.sort().pop()!;
      const backupPath = path.join(rootDir, latestBackup);
      const originalFile = backupPath.replace(/\.backup\.\d+$/, '');

      // 恢复备份
      const backupContent = await fs.promises.readFile(backupPath, 'utf-8');
      await fs.promises.writeFile(originalFile, backupContent, 'utf-8');

      // 删除备份文件
      await fs.promises.unlink(backupPath);

      res.statusCode = 200;
      res.end(
        JSON.stringify({
          success: true,
          message: 'Undo completed successfully',
          restoredFile: originalFile,
          backupFile: backupPath
        })
      );
    } catch (error) {
      res.statusCode = 500;
      res.end(
        JSON.stringify({
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      );
    }
  });
}

/**
 * 重做操作
 */
async function handleRedo(req: any, res: any, rootDir: string) {
  // 重做操作的实现逻辑
  // 这里可以基于历史记录重新应用之前的更新
  res.statusCode = 501;
  res.end(JSON.stringify({ error: 'Redo operation not yet implemented' }));
}

/**
 * 获取更新历史
 */
async function handleGetHistory(req: any, res: any, rootDir: string) {
  try {
    const sessionFile = path.join(rootDir, '.appdev_batch_sessions.json');
    let sessions = {};

    try {
      const existingSessionsContent = await fs.promises.readFile(sessionFile, 'utf-8');
      sessions = JSON.parse(existingSessionsContent);
    } catch {
      // 文件不存在，返回空历史
    }

    res.statusCode = 200;
    res.end(JSON.stringify({
      success: true,
      history: sessions
    }));
  } catch (error) {
    res.statusCode = 500;
    res.end(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    );
  }
}

/**
 * 验证更新请求
 */
async function handleValidateUpdate(req: any, res: any, rootDir: string) {
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
      const updateData = JSON.parse(body);
      const validation = await validateUpdateRequest(updateData, rootDir);

      res.statusCode = 200;
      res.end(JSON.stringify({
        success: true,
        validation
      }));
    } catch (error) {
      res.statusCode = 500;
      res.end(
        JSON.stringify({
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      );
    }
  });
}

/**
 * 辅助函数
 */

// 解析elementId获取源码位置
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

// 智能替换源码
async function smartReplaceInSource(
  content: string,
  options: {
    lineNumber: number;
    columnNumber: number;
    newValue: string;
    originalValue?: string;
    type: 'style' | 'content' | 'attribute';
  },
  rootDir: string
): Promise<string> {
  const lines = content.split('\n');
  const targetLine = Math.max(0, options.lineNumber - 1);

  if (targetLine >= lines.length) {
    throw new Error(`Line ${options.lineNumber} exceeds file length`);
  }

  const line = lines[targetLine];
  let newLine = line;

  try {
    switch (options.type) {
      case 'style':
        // 处理样式更新
        newLine = await smartReplaceStyle(line, options);
        break;
      case 'content':
        // 处理内容更新
        newLine = await smartReplaceContent(line, options);
        break;
      case 'attribute':
        // 处理属性更新
        newLine = await smartReplaceAttribute(line, options);
        break;
    }

    lines[targetLine] = newLine;
    return lines.join('\n');
  } catch (error) {
    console.error('[DesignMode] Smart replace failed:', error);
    return line; // Fallback to original line
  }
}

// 智能样式替换
async function smartReplaceStyle(line: string, options: any): Promise<string> {
  // 这里可以实现更复杂的样式替换逻辑
  // 比如使用AST解析或者正则表达式匹配
  if (options.originalValue && line.includes(options.originalValue)) {
    return line.replace(
      new RegExp(escapeRegExp(options.originalValue), 'g'),
      options.newValue
    );
  }

  // 如果没有原始值，使用列号信息进行更精确的替换
  const parts = line.split('=');
  if (parts.length >= 2) {
    const attributeName = parts[0].trim();
    const attributeValue = parts.slice(1).join('=').trim();
    const newAttributeValue = options.newValue;

    if (attributeName === 'className') {
      return `${attributeName}={${newAttributeValue}}`;
    }
  }

  return options.newValue;
}

// 智能内容替换
async function smartReplaceContent(line: string, options: any): Promise<string> {
  // 对于React JSX内容，可以使用更精确的替换
  if (options.originalValue && line.includes(options.originalValue)) {
    return line.replace(
      new RegExp(escapeRegExp(options.originalValue), 'g'),
      options.newValue
    );
  }

  // 如果在标签内容中，尝试替换标签内容部分
  const contentMatch = line.match(/>([^<]*)</);
  if (contentMatch && contentMatch[1] === options.originalValue) {
    return line.replace(contentMatch[0], `>${options.newValue}<`);
  }

  return options.newValue;
}

// 智能属性替换
async function smartReplaceAttribute(line: string, options: any): Promise<string> {
  // 实现属性替换逻辑
  return line.replace(
    new RegExp(`${options.attributeName}="[^"]*"`),
    `${options.attributeName}="${options.newValue}"`
  );
}

// 验证更新请求
async function validateUpdateRequest(update: any, rootDir: string): Promise<{ valid: boolean; errors: string[] }> {
  const errors: string[] = [];

  // 检查必要字段
  if (!update.filePath) errors.push('Missing filePath');
  if (update.line === undefined) errors.push('Missing line');
  if (update.column === undefined) errors.push('Missing column');
  if (update.newValue === undefined) errors.push('Missing newValue');
  if (!update.type) errors.push('Missing type');

  // 检查文件路径
  if (update.filePath) {
    const fullPath = path.resolve(rootDir, update.filePath);
    try {
      await fs.promises.access(fullPath, fs.constants.F_OK);
    } catch {
      errors.push(`File not found: ${update.filePath}`);
    }
  }

  // 检查更新类型
  if (update.type && !['style', 'content', 'attribute'].includes(update.type)) {
    errors.push(`Invalid update type: ${update.type}`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// 处理单个更新
async function processSingleUpdate(update: any, rootDir: string, batchId: string): Promise<any> {
  try {
    const validation = await validateUpdateRequest(update, rootDir);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.errors.join(', '),
        update
      };
    }

    const fullFilePath = path.resolve(rootDir, update.filePath);
    const fileContent = await fs.promises.readFile(fullFilePath, 'utf-8');

    const updatedContent = await smartReplaceInSource(
      fileContent,
      {
        lineNumber: update.line,
        columnNumber: update.column,
        newValue: update.newValue,
        originalValue: update.originalValue,
        type: update.type
      },
      rootDir
    );

    // 创建备份
    const backupPath = `${fullFilePath}.backup.${Date.now()}`;
    await fs.promises.writeFile(fullFilePath, fileContent, 'utf-8');

    // 写回文件
    await fs.promises.writeFile(fullFilePath, updatedContent, 'utf-8');

    return {
      success: true,
      update,
      affectedLines: {
        before: fileContent.split('\n')[update.line - 1],
        after: updatedContent.split('\n')[update.line - 1]
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      update
    };
  }
}

// 检查文件是否有修改
async function checkForModifications(filePath: string): Promise<boolean> {
  try {
    const stat = await fs.promises.stat(filePath);
    const lastModified = stat.mtime.getTime();
    const now = Date.now();

    // 如果文件在最近5分钟内被修改过
    return (now - lastModified) < 5 * 60 * 1000;
  } catch {
    return false;
  }
}

// 从行中提取标签名
function extractTagNameFromLine(line: string): string {
  const tagMatch = line.match(/<(\w+)/);
  return tagMatch ? tagMatch[1] : 'unknown';
}

// 从行中提取类名
function extractClassNameFromLine(line: string): string {
  const classMatch = line.match(/className\s*=\s*["']([^"']+)["']/);
  return classMatch ? classMatch[1] : '';
}

// 获取行的上下文信息
function getLineContext(lines: string[], targetLine: number): { before: string; current: string; after: string } {
  return {
    before: lines[Math.max(0, targetLine - 1)] || '',
    current: lines[targetLine] || '',
    after: lines[Math.min(lines.length - 1, targetLine + 1)] || ''
  };
}

// 转义正则表达式
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
