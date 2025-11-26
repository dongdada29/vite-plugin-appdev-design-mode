import { copyFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = resolve(__dirname, '..');
const distClientDir = resolve(root, 'dist/client');
const srcFile = resolve(root, 'src/client/index.tsx');
const distFile = resolve(distClientDir, 'index.tsx');

await mkdir(distClientDir, { recursive: true });
await copyFile(srcFile, distFile);

console.log(`[copy-client] Copied ${srcFile} -> ${distFile}`);

