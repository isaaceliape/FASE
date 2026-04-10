/**
 * Post-build script: restore shebangs and set executable permissions on CLI entry points.
 *
 * TypeScript does not preserve `#!/usr/bin/env node` lines during compilation
 * because they are not valid JS/TS syntax. This script prepends the shebang
 * to compiled CLI files and marks them executable.
 */

import { readFileSync, writeFileSync, chmodSync, copyFileSync, mkdirSync, existsSync, readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST_DIR = join(__dirname, '..', 'dist');
const SRC_DIR = join(__dirname, '..', 'src');

const SHEBANG = '#!/usr/bin/env node\n';
const CLI_FILES = ['install.js', 'verificar-instalacao.js'];
const HOOK_FILES = ['fase-check-update.js', 'fase-context-monitor.js', 'fase-statusline.js'];

// Copy hooks from src/hooks to dist/hooks
const srcHooksDir = join(SRC_DIR, 'hooks');
const distHooksDir = join(DIST_DIR, 'hooks');

if (existsSync(srcHooksDir)) {
  if (!existsSync(distHooksDir)) {
    mkdirSync(distHooksDir, { recursive: true });
  }
  
  for (const file of readdirSync(srcHooksDir)) {
    if (file.endsWith('.js')) {
      const srcPath = join(srcHooksDir, file);
      const destPath = join(distHooksDir, file);
      copyFileSync(srcPath, destPath);
      console.log(`  ✓ copied hooks/${file}`);
    }
  }
}

// Process CLI entry points
for (const file of CLI_FILES) {
  const filePath = join(DIST_DIR, file);
  let content;
  try {
    content = readFileSync(filePath, 'utf-8');
  } catch {
    console.warn(`  skip ${file} — not found in dist/ (not yet converted)`);
    continue;
  }
  if (!content.startsWith('#!')) {
    writeFileSync(filePath, SHEBANG + content);
    console.log(`  ✓ shebang added to ${file}`);
  } else {
    console.log(`  ✓ ${file} already has shebang`);
  }
  chmodSync(filePath, 0o755);
}

// Process hook files
const HOOKS_DIR = join(DIST_DIR, 'hooks');
for (const file of HOOK_FILES) {
  const filePath = join(HOOKS_DIR, file);
  let content;
  try {
    content = readFileSync(filePath, 'utf-8');
  } catch {
    console.warn(`  skip hooks/${file} — not found`);
    continue;
  }
  if (!content.startsWith('#!')) {
    writeFileSync(filePath, SHEBANG + content);
    console.log(`  ✓ shebang added to hooks/${file}`);
  } else {
    console.log(`  ✓ hooks/${file} already has shebang`);
  }
  chmodSync(filePath, 0o755);
}
