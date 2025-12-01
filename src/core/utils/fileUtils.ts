import * as fs from 'fs';
import * as path from 'path';

/**
 * Read request body from HTTP request
 */
export async function readBody(req: any): Promise<string> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk: any) => {
      body += chunk.toString();
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

/**
 * Read file content safely
 */
export async function readFile(filePath: string, rootDir: string): Promise<string> {
  const fullPath = path.resolve(rootDir, filePath);

  // Check if file exists
  try {
    await fs.promises.access(fullPath, fs.constants.F_OK);
  } catch {
    throw new Error(`File not found: ${filePath}`);
  }

  return fs.promises.readFile(fullPath, 'utf-8');
}

/**
 * Write file content safely with backup
 */
export async function writeFile(
  filePath: string,
  content: string,
  rootDir: string,
  createBackup: boolean = true
): Promise<string | null> {
  const fullPath = path.resolve(rootDir, filePath);

  let backupPath: string | null = null;

  if (createBackup) {
    // Create backup
    try {
      const existingContent = await fs.promises.readFile(fullPath, 'utf-8');
      backupPath = `${fullPath}.backup.${Date.now()}`;
      await fs.promises.writeFile(backupPath, existingContent, 'utf-8');
    } catch {
      // File might not exist yet, skip backup
    }
  }

  await fs.promises.writeFile(fullPath, content, 'utf-8');
  return backupPath;
}

/**
 * Check if file exists
 */
export async function fileExists(filePath: string, rootDir: string): Promise<boolean> {
  const fullPath = path.resolve(rootDir, filePath);
  try {
    await fs.promises.access(fullPath, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get file stats
 */
export async function getFileStats(filePath: string, rootDir: string) {
  const fullPath = path.resolve(rootDir, filePath);
  const stats = await fs.promises.stat(fullPath);
  return {
    size: stats.size,
    lastModified: stats.mtime.getTime(),
    created: stats.birthtime.getTime(),
  };
}
