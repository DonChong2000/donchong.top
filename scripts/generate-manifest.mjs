// Generates src/lib/image-dimensions.json with width, height, and blurDataURL
// for every image in public/images/. Run via `pnpm prebuild` or manually.

import fs from 'fs';
import path from 'path';
import { imageSize } from 'image-size';
import sharp from 'sharp';

const PUBLIC_DIR = path.resolve(import.meta.dirname, '../public/images');
const MANIFEST_PATH = path.resolve(
  import.meta.dirname,
  '../src/lib/image-dimensions.json',
);

function walk(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walk(full));
    } else {
      results.push(full);
    }
  }
  return results;
}

const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif']);
const files = walk(PUBLIC_DIR).filter((f) =>
  IMAGE_EXTS.has(path.extname(f).toLowerCase()),
);

console.log(`Processing ${files.length} images...`);

const manifest = {};

for (const file of files) {
  const urlPath =
    '/images/' +
    path.relative(PUBLIC_DIR, file).replace(/\\/g, '/');

  // Dimensions
  try {
    const buf = fs.readFileSync(file);
    const dims = imageSize(new Uint8Array(buf));
    const entry = { width: dims.width, height: dims.height };

    // Blur placeholder
    try {
      const blurBuf = await sharp(file).resize(8).png().toBuffer();
      entry.blurDataURL = `data:image/png;base64,${blurBuf.toString('base64')}`;
    } catch {
      // Skip blur for unsupported formats
    }

    manifest[urlPath] = entry;
  } catch (e) {
    console.warn(`Skipping ${urlPath}: ${e.message}`);
  }
}

// Sort keys for stable output
const sorted = Object.fromEntries(
  Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)),
);

fs.writeFileSync(MANIFEST_PATH, JSON.stringify(sorted, null, 2) + '\n');
console.log(`Wrote ${Object.keys(sorted).length} entries to ${MANIFEST_PATH}`);
