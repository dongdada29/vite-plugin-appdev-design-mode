import { cp, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = resolve(__dirname, '..');
const srcClientDir = resolve(root, 'src/client');
const distClientDir = resolve(root, 'dist/client');

await mkdir(distClientDir, { recursive: true });
await cp(srcClientDir, distClientDir, { recursive: true, force: true });

console.log(`[copy-client] Copied ${srcClientDir} -> ${distClientDir}`);

