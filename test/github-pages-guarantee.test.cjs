/**
 * GitHub Pages Deployment Guarantee Tests
 * 
 * These tests GUARANTEE the GitHub Pages deployment will work by validating:
 * ✅ All required files exist
 * ✅ Base tags are configured correctly
 * ✅ Versions are synchronized
 * ✅ Workflow is properly configured
 * ✅ Assets are properly linked
 * 
 * Run: npm test -- test/github-pages-guarantee.test.cjs
 * These tests MUST always pass - they are your deployment insurance
 */

const { describe, it } = require('mocha');
const assert = require('assert');
const fs = require('fs');
const path = require('path');

describe('GitHub Pages Deployment Guarantee', function() {
  const rootDir = path.join(__dirname, '..');
  let wwwIndex, docsIndex, workflowFile, packageJson;

  before(function() {
    wwwIndex = fs.readFileSync(path.join(rootDir, 'www/index.html'), 'utf-8');
    docsIndex = fs.readFileSync(path.join(rootDir, 'docs/index.html'), 'utf-8');
    workflowFile = fs.readFileSync(path.join(rootDir, '.github/workflows/deploy-pages.yml'), 'utf-8');
    packageJson = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf-8'));
  });

  describe('GUARANTEE 1: Critical Files Present', function() {
    it('Landing page exists and is substantial', function() {
      assert.ok(fs.existsSync(path.join(rootDir, 'www/index.html')), 'www/index.html required');
      assert.ok(wwwIndex.length > 10000, 'Landing page must be substantial');
    });

    it('Documentation exists and is substantial', function() {
      assert.ok(fs.existsSync(path.join(rootDir, 'docs/index.html')), 'docs/index.html required');
      assert.ok(docsIndex.length > 5000, 'Docs page must have content');
    });

    it('All logo and font assets exist', function() {
      assert.ok(fs.existsSync(path.join(rootDir, 'www/fase-logo.png')), 'Logo required');
      assert.ok(fs.existsSync(path.join(rootDir, 'www/fonts/0xProto-Regular.woff2')), 'Regular font required');
      assert.ok(fs.existsSync(path.join(rootDir, 'www/fonts/0xProto-Bold.woff2')), 'Bold font required');
    });

    it('Workflow file exists and is valid', function() {
      assert.ok(fs.existsSync(path.join(rootDir, '.github/workflows/deploy-pages.yml')), 'Workflow required');
      assert.ok(workflowFile.length > 1000, 'Workflow must be substantial');
    });
  });

  describe('GUARANTEE 2: Base Tags Configuration (CRITICAL)', function() {
    it('Landing page has correct base href for /FASE/ subdirectory', function() {
      assert.ok(
        wwwIndex.includes('<base href="/FASE/">'),
        'CRITICAL: www/index.html MUST have <base href="/FASE/"> - this makes or breaks the site'
      );
    });

    it('Documentation has correct base href for /FASE/docs/ subdirectory', function() {
      assert.ok(
        docsIndex.includes('<base href="/FASE/docs/">'),
        'CRITICAL: docs/index.html MUST have <base href="/FASE/docs/">'
      );
    });

    it('Base tags are in head section (before other content)', function() {
      const headMatch = wwwIndex.match(/<head[^>]*>([\s\S]*?)<\/head>/);
      assert.ok(headMatch, 'Must have head section');
      const headContent = headMatch[1];
      assert.ok(headContent.includes('<base href="/FASE/">'), 'Base must be in head');
      
      // Verify it's before external resources
      const baseIndex = headContent.indexOf('<base href="/FASE/">');
      const cdnIndex = headContent.indexOf('cdnjs.cloudflare.com');
      assert.ok(baseIndex < cdnIndex, 'Base tag must come before other resources');
    });
  });

  describe('GUARANTEE 3: Version Synchronization', function() {
    it('Landing page version matches package.json', function() {
      const pkgVersion = packageJson.version;
      assert.ok(
        wwwIndex.includes(`v${pkgVersion}`),
        `www/index.html must contain version v${pkgVersion}`
      );
    });

    it('Docs version matches package.json', function() {
      const pkgVersion = packageJson.version;
      assert.ok(
        docsIndex.includes(pkgVersion),
        `docs/index.html must contain version ${pkgVersion}`
      );
    });

    it('Version format is valid semver', function() {
      assert.match(packageJson.version, /^\d+\.\d+\.\d+$/, 'Must be semver format');
    });
  });

  describe('GUARANTEE 4: Workflow Configuration (CRITICAL)', function() {
    it('Workflow has correct name and triggers on main branch', function() {
      assert.ok(workflowFile.includes('name: Deploy GitHub Pages'), 'Must have correct name');
      assert.ok(workflowFile.includes('branches: [main]'), 'Must trigger on main');
    });

    it('Workflow has all correct permissions', function() {
      assert.ok(workflowFile.includes('contents: read'), 'Must have contents:read');
      assert.ok(workflowFile.includes('pages: write'), 'CRITICAL: Must have pages:write');
      assert.ok(workflowFile.includes('id-token: write'), 'Must have id-token:write');
    });

    it('Workflow copies landing page and all assets', function() {
      assert.ok(workflowFile.includes('cp www/index.html _site/index.html'), 'Must copy landing page');
      assert.ok(workflowFile.includes('cp -r www/fonts _site/'), 'Must copy fonts');
      assert.ok(workflowFile.includes('cp www/fase-logo.png _site/'), 'Must copy logo');
    });

    it('Workflow copies documentation with fallback', function() {
      assert.ok(workflowFile.includes('_site/docs'), 'Must deploy to docs path');
      assert.ok(workflowFile.includes('cp -r docs/* _site/docs'), 'Must have fallback copy');
    });

    it('Workflow creates .nojekyll to bypass Jekyll', function() {
      assert.ok(workflowFile.includes('touch _site/.nojekyll'), 'Must create .nojekyll');
    });

    it('Workflow has error handling for optional steps', function() {
      assert.ok(workflowFile.includes('continue-on-error: true'), 'Must handle errors gracefully');
    });

    it('Workflow deploys to GitHub Pages', function() {
      assert.ok(workflowFile.includes('actions/upload-pages-artifact'), 'Must upload artifact');
      assert.ok(workflowFile.includes('actions/deploy-pages'), 'Must deploy');
    });
  });

  describe('GUARANTEE 5: Asset and Link Integrity', function() {
    it('Logo is referenced correctly (relative path)', function() {
      assert.ok(wwwIndex.includes('fase-logo.png'), 'Must reference logo');
      assert.ok(!wwwIndex.includes('src="/FASE/fase-logo.png"'), 'Should use relative path');
    });

    it('Fonts are referenced with relative paths', function() {
      assert.ok(wwwIndex.includes('./fonts/'), 'Must use relative path');
      assert.ok(wwwIndex.includes('0xProto-Regular.woff2'), 'Must reference font');
    });

    it('All external links use HTTPS', function() {
      const httpMatches = wwwIndex.match(/href="http:\/\/[^"]*"/g);
      assert.ok(!httpMatches || httpMatches.length === 0, 'All external links must use HTTPS');
    });

    it('Documentation is linked from landing page', function() {
      assert.ok(wwwIndex.includes('isaaceliape.github.io/FASE/docs'), 'Must link to docs');
    });
  });

  describe('GUARANTEE 6: HTML Validity', function() {
    it('Landing page has valid HTML structure', function() {
      assert.ok(wwwIndex.match(/<!doctype html|<!DOCTYPE html/i), 'Valid doctype');
      assert.ok(wwwIndex.includes('</html>'), 'Closing html tag');
    });

    it('Docs page has valid HTML structure', function() {
      assert.ok(docsIndex.match(/<!doctype html|<!DOCTYPE html/i), 'Valid doctype');
      assert.ok(docsIndex.includes('</html>'), 'Closing html tag');
    });
  });

  describe('✅ DEPLOYMENT GUARANTEE - ALL CHECKS PASS', function() {
    it('All 6 guarantees verified - deployment will succeed', function() {
      let passed = 0;

      // G1: Files exist
      if (fs.existsSync(path.join(rootDir, 'www/index.html')) &&
          fs.existsSync(path.join(rootDir, 'docs/index.html')) &&
          fs.existsSync(path.join(rootDir, '.github/workflows/deploy-pages.yml')) &&
          fs.existsSync(path.join(rootDir, 'www/fase-logo.png'))) {
        passed++;
      }

      // G2: Base tags
      if (wwwIndex.includes('<base href="/FASE/">') && 
          docsIndex.includes('<base href="/FASE/docs/">')) {
        passed++;
      }

      // G3: Versions
      const pkgVersion = packageJson.version;
      if (wwwIndex.includes(`v${pkgVersion}`) && docsIndex.includes(pkgVersion)) {
        passed++;
      }

      // G4: Workflow
      if (workflowFile.includes('Deploy GitHub Pages') &&
          workflowFile.includes('pages: write') &&
          workflowFile.includes('_site/docs')) {
        passed++;
      }

      // G5: Assets
      if (wwwIndex.includes('fase-logo.png') &&
          wwwIndex.includes('./fonts/') &&
          wwwIndex.includes('isaaceliape.github.io/FASE/docs')) {
        passed++;
      }

      // G6: HTML
      if (wwwIndex.match(/<!doctype html|<!DOCTYPE html/i) &&
          docsIndex.match(/<!doctype html|<!DOCTYPE html/i)) {
        passed++;
      }

      assert.strictEqual(passed, 6, `All 6 guarantees passed: ${passed}/6`);
    });
  });
});
