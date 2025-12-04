import { watch } from 'node:fs';
import { cp, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = resolve(__dirname, '..');
const srcClientDir = resolve(root, 'src/client');
const distClientDir = resolve(root, 'dist/client');

// 初始复制
async function copyClient() {
  try {
    await mkdir(distClientDir, { recursive: true });
    await cp(srcClientDir, distClientDir, { recursive: true, force: true });
    console.log(`[copy-client] Copied ${srcClientDir} -> ${distClientDir}`);
  } catch (error) {
    console.error('[copy-client] Error:', error);
  }
}

// 执行清理脚本
async function cleanMaps() {
  try {
    await execAsync('node scripts/clean-maps.mjs', { cwd: root });
  } catch (error) {
    // 忽略错误，clean-maps 可能在某些情况下失败
  }
}

// 防抖函数
let copyTimeout = null;
function debouncedCopy() {
  if (copyTimeout) {
    clearTimeout(copyTimeout);
  }
  copyTimeout = setTimeout(async () => {
    await copyClient();
    await cleanMaps();
  }, 300); // 300ms 防抖
}

// 初始复制
await copyClient();
await cleanMaps();

// 监听 src/client 目录变化
console.log('[watch-copy] Watching for changes in src/client...');
const watcher = watch(srcClientDir, { recursive: true }, (eventType, filename) => {
  if (filename && (eventType === 'change' || eventType === 'rename')) {
    console.log(`[watch-copy] File ${eventType}: ${filename}`);
    debouncedCopy();
  }
});

// 处理错误
watcher.on('error', (error) => {
  console.error('[watch-copy] Watch error:', error);
});

// 保持进程运行
process.on('SIGINT', () => {
  console.log('\n[watch-copy] Stopping watch...');
  watcher.close();
  process.exit(0);
});

