#!/usr/bin/env node
// Migration script: Move images from src/app/.../images/ to public/images/<route>/
// and generate a dimension manifest for the remark plugin.
// Also strips boilerplate imports from MDX files and replaces direct img[...] usage.

import fs from 'fs';
import path from 'path';
import { imageSize } from 'image-size';

const ROOT = path.resolve(import.meta.dirname, '..');
const SRC_APP = path.join(ROOT, 'src', 'app');
const PUBLIC_IMAGES = path.join(ROOT, 'public', 'images');
const MANIFEST_PATH = path.join(ROOT, 'src', 'lib', 'image-dimensions.json');

// ── Step 1: Discover image directories ──────────────────────────────────────

function findImageDirs(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'images') {
        results.push(full);
      } else {
        results.push(...findImageDirs(full));
      }
    }
  }
  return results;
}

// ── Step 2: Copy images & build manifest ────────────────────────────────────

function routeFromImageDir(imageDir) {
  // src/app/hobbies/factorio/images → hobbies/factorio
  const rel = path.relative(SRC_APP, imageDir).replace(/\\/g, '/');
  return rel.replace(/\/images$/, '');
}

const manifest = {};
const imageDirs = findImageDirs(SRC_APP);

console.log(`Found ${imageDirs.length} image directories`);

for (const imageDir of imageDirs) {
  const route = routeFromImageDir(imageDir);
  const destDir = path.join(PUBLIC_IMAGES, route);
  fs.mkdirSync(destDir, { recursive: true });

  const files = fs.readdirSync(imageDir).filter((f) => {
    const ext = f.split('.').pop().toLowerCase();
    return ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'avif'].includes(ext);
  });

  for (const file of files) {
    const srcFile = path.join(imageDir, file);
    const destFile = path.join(destDir, file);
    fs.copyFileSync(srcFile, destFile);

    // URL path with encoded filename
    const urlPath = `/images/${route}/${encodeURIComponent(file)}`;

    try {
      const buffer = fs.readFileSync(srcFile);
      const dims = imageSize(new Uint8Array(buffer));
      manifest[urlPath] = { width: dims.width, height: dims.height };
    } catch {
      // SVGs or broken files - skip dimensions
      manifest[urlPath] = { width: 800, height: 600 };
    }

    console.log(`  Copied: ${route}/${file}`);
  }
}

fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n');
console.log(`\nManifest written to ${MANIFEST_PATH} (${Object.keys(manifest).length} entries)`);

// ── Step 3: Update MDX files ────────────────────────────────────────────────

// All MDX files that use getImageMap
const mdxFiles = findMdxFilesWithGetImageMap(SRC_APP);

function findMdxFilesWithGetImageMap(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findMdxFilesWithGetImageMap(full));
    } else if (entry.name.endsWith('.mdx')) {
      const content = fs.readFileSync(full, 'utf8');
      if (content.includes('getImageMap')) {
        results.push(full);
      }
    }
  }
  return results;
}

function mdxRouteFromFile(mdxFile) {
  // src/app/hobbies/factorio/page.mdx → hobbies/factorio
  const rel = path.relative(SRC_APP, mdxFile).replace(/\\/g, '/');
  return rel.replace(/\/page\.mdx$/, '');
}

/**
 * Check if a line is inside a fenced code block.
 * We track open/close of ``` fences.
 */
function buildCodeBlockMap(lines) {
  const inCodeBlock = new Array(lines.length).fill(false);
  let inside = false;
  for (let i = 0; i < lines.length; i++) {
    if (/^```/.test(lines[i].trimStart())) {
      inside = !inside;
      inCodeBlock[i] = true; // The fence line itself
    } else {
      inCodeBlock[i] = inside;
    }
  }
  return inCodeBlock;
}

console.log(`\nUpdating ${mdxFiles.length} MDX files...`);

for (const mdxFile of mdxFiles) {
  let content = fs.readFileSync(mdxFile, 'utf8');
  const route = mdxRouteFromFile(mdxFile);
  const lines = content.split('\n');
  const inCodeBlock = buildCodeBlockMap(lines);

  const newLines = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Skip lines in code blocks
    if (inCodeBlock[i]) {
      newLines.push(line);
      continue;
    }

    // Remove boilerplate imports (not inside code blocks)
    if (/^\s*import\s+Image\s+from\s+['"]next\/image['"];?\s*$/.test(line)) {
      console.log(`  ${route}: removed Image import (line ${i + 1})`);
      continue;
    }
    if (/^\s*import\s+\{\s*getImageMap\s*\}\s+from\s+['"]@\/lib\/imgMap['"];?\s*$/.test(line)) {
      console.log(`  ${route}: removed getImageMap import (line ${i + 1})`);
      continue;
    }
    if (/^\s*export\s+const\s+img\s*=\s*getImageMap\(import\.meta\.url\);?\s*$/.test(line)) {
      console.log(`  ${route}: removed img export (line ${i + 1})`);
      continue;
    }

    // Replace direct img['name'] references in JSX src attributes
    // Pattern: src={img['name']} or src: img['name']
    let modified = line;

    // Handle src={img['name']} → src="/images/<route>/name"
    modified = modified.replace(
      /src=\{img\['([^']+)'\]\}/g,
      (_, name) => {
        const urlPath = `/images/${route}/${encodeURIComponent(name)}`;
        const dims = manifest[urlPath];
        const widthHeight = dims ? ` width={${dims.width}} height={${dims.height}}` : '';
        console.log(`  ${route}: replaced img['${name}'] → "${urlPath}" (line ${i + 1})`);
        return `src="${urlPath}"${widthHeight}`;
      },
    );

    // Handle src: img['name'] → src: '/images/<route>/name'  (GalleryGrid items)
    modified = modified.replace(
      /src:\s*img\['([^']+)'\]/g,
      (_, name) => {
        const urlPath = `/images/${route}/${encodeURIComponent(name)}`;
        console.log(`  ${route}: replaced src: img['${name}'] → '${urlPath}' (line ${i + 1})`);
        return `src: '${urlPath}'`;
      },
    );

    // Remove placeholder="blur" from direct Image JSX (not in code blocks)
    modified = modified.replace(/\s*placeholder=["']blur["']/g, '');

    newLines.push(modified);
  }

  // Clean up consecutive blank lines left by removed imports
  const cleaned = newLines.join('\n').replace(/\n{3,}/g, '\n\n');
  fs.writeFileSync(mdxFile, cleaned);
}

console.log('\nMigration complete!');
console.log('Next steps:');
console.log('  1. Update src/components/mdx.tsx to export Image globally');
console.log('  2. Rewrite src/mdx/remark-wiki-link-images.mjs');
console.log('  3. Delete src/lib/imgMap.js');
console.log('  4. Delete src/app/**/images/ directories');
console.log('  5. Update documentation in projects/this-site/page.mdx');
console.log('  6. Run pnpm build to verify');
