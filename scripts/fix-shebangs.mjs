#!/usr/bin/env node
/**
 * Fix shebangs in dist/ files to ensure proper execution
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const distDir = new URL('.', import.meta.url).pathname.replace('/dist/', '/dist/');
const files = readdirSync(distDir).filter(f => f.endsWith('.js'));

for (const file of files) {
  const filePath = join(distDir, file);
  let content = readFileSync(filePath, 'utf-8');
  
  // Ensure shebang is present
  if (!content.startsWith('#!')) {
    content = '#!/usr/bin/env node\n' + content;
    writeFileSync(filePath, content);
    console.log(`✓ Fixed shebang: ${file}`);
  }
}

console.log('Shebang fix complete!');
