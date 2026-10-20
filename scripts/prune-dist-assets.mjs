import { readdir, rm, stat } from 'node:fs/promises';
import path from 'node:path';

const distAssets = path.resolve('dist/client/assets');
const rawExtensions = /\.(png|jpe?g)$/i;
let removed = 0;
let reclaimed = 0;

async function prune(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'optimized') await prune(fullPath);
      continue;
    }

    if (!rawExtensions.test(entry.name)) continue;
    const info = await stat(fullPath);
    await rm(fullPath);
    removed += 1;
    reclaimed += info.size;
  }
}

await prune(distAssets);
console.log(`Pruned ${removed} raw production image files (${(reclaimed / 1024 / 1024).toFixed(2)} MB).`);
