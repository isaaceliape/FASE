/**
 * Post-build script: restore shebangs and set executable permissions on CLI entry points.
 *
 * TypeScript does not preserve `#!/usr/bin/env node` lines during compilation
 * because they are not valid JS/TS syntax. This script prepends the shebang
 * to compiled CLI files and marks them executable.
 */

import { readFileSync, writeFileSync, chmodSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST_DIR = join(__dirname, '..', 'dist');

const SHEBANG = '#!/usr/bin/env node\n';
const CLI_FILES = ['install.js', 'verificar-instalacao.js'];

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
