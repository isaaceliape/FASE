/**
 * GSD Tools Tests - frontmatter CLI integration
 *
 * Integration tests for the 4 frontmatter subcommands (get, set, merge, validate)
 * exercised through fase-tools.js via execSync.
 *
 * Note: js-yaml interprets unquoted numeric strings like "01" as integers.
 * Use quoted strings like '"01"' in YAML to preserve string representation.
 *
 * CLI commands may return exit 0 with error JSON for certain errors.
 * Tests check output content for error fields.
 */

const { test, describe, afterEach, beforeEach } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { runGsdTools, createTempProject, cleanup } = require('../helpers/helpers.cjs');

let tempDir = null;

beforeEach(() => {
  tempDir = createTempProject();
});

afterEach(() => {
  if (tempDir) {
    cleanup(tempDir);
    tempDir = null;
  }
});

function writeTempFile(content, subdir = 'etapas') {
  const subPath = path.join(tempDir, '.fase-ai', subdir);
  fs.mkdirSync(subPath, { recursive: true });
  const tmpFile = path.join(subPath, `test-${Date.now()}.md`);
  fs.writeFileSync(tmpFile, content, 'utf-8');
  return tmpFile;
}

function parseResult(result) {
  // Commands may return exit 0 with error JSON
  if (result.output) {
    try {
      return JSON.parse(result.output);
    } catch {
      return { raw: result.output };
    }
  }
  return { error: result.error };
}

// ─── frontmatter get ────────────────────────────────────────────────────────

describe('frontmatter get', () => {
  test('returns all fields as JSON', () => {
    const file = writeTempFile('---\nphase: "01"\nplan: "01"\ntype: execute\n---\nbody text');
    const result = runGsdTools(`frontmatter get ${file}`, tempDir);
    assert.ok(result.success, `Command failed: ${result.error}`);
    const parsed = parseResult(result);
    assert.strictEqual(parsed.phase, '01');
    assert.strictEqual(parsed.plan, '01');
    assert.strictEqual(parsed.type, 'execute');
  });

  test('returns specific field with --field', () => {
    const file = writeTempFile('---\nphase: "01"\nplan: "02"\ntype: tdd\n---\nbody');
    const result = runGsdTools(`frontmatter get ${file} --field phase`, tempDir);
    assert.ok(result.success, `Command failed: ${result.error}`);
    const parsed = parseResult(result);
    assert.strictEqual(parsed.phase, '01');
  });

  test('returns error for missing field', () => {
    const file = writeTempFile('---\nphase: "01"\n---\n');
    const result = runGsdTools(`frontmatter get ${file} --field nonexistent`, tempDir);
    assert.ok(result.success, 'Command should exit 0');
    const parsed = parseResult(result);
    assert.ok(parsed.error, 'Should have error field');
    assert.ok(parsed.error.includes('Campo não encontrado'), 'Error should mention "Campo não encontrado"');
  });

  test('returns error for missing file', () => {
    const result = runGsdTools(`frontmatter get ${path.join(tempDir, 'nonexistent.md')}`, tempDir);
    assert.ok(result.success, 'Command should exit 0 with error JSON');
    const parsed = parseResult(result);
    assert.ok(parsed.error, 'Should have error field');
  });

  test('handles file with no frontmatter', () => {
    const file = writeTempFile('Plain text with no frontmatter delimiters.');
    const result = runGsdTools(`frontmatter get ${file}`, tempDir);
    assert.ok(result.success, `Command failed: ${result.error}`);
    const parsed = parseResult(result);
    assert.deepStrictEqual(parsed, {}, 'Should return empty object for no frontmatter');
  });
});

// ─── frontmatter set ────────────────────────────────────────────────────────

describe('frontmatter set', () => {
  test('updates existing field', () => {
    const file = writeTempFile('---\nphase: "01"\ntype: execute\n---\nbody');
    const result = runGsdTools(`frontmatter set ${file} --field phase --value "02"`, tempDir);
    assert.ok(result.success, `Command failed: ${result.error}`);
    const parsed = parseResult(result);
    assert.ok(!parsed.error, `Command returned error: ${parsed.error}`);

    const content = fs.readFileSync(file, 'utf-8');
    const { extractFrontmatter } = require('../../dist/lib/frontmatter.js');
    const fm = extractFrontmatter(content);
    assert.strictEqual(fm.phase, '02');
  });

  test('adds new field', () => {
    const file = writeTempFile('---\nphase: "01"\n---\nbody');
    const result = runGsdTools(`frontmatter set ${file} --field status --value "active"`, tempDir);
    assert.ok(result.success, `Command failed: ${result.error}`);
    const parsed = parseResult(result);
    assert.ok(!parsed.error, `Command returned error: ${parsed.error}`);

    const content = fs.readFileSync(file, 'utf-8');
    const { extractFrontmatter } = require('../../dist/lib/frontmatter.js');
    const fm = extractFrontmatter(content);
    assert.strictEqual(fm.status, 'active');
  });

  test('handles JSON array value', () => {
    const file = writeTempFile('---\nphase: "01"\n---\nbody');
    const result = runGsdTools(['frontmatter', 'set', file, '--field', 'tags', '--value', '["a","b"]'], tempDir);
    assert.ok(result.success, `Command failed: ${result.error}`);
    const parsed = parseResult(result);
    assert.ok(!parsed.error, `Command returned error: ${parsed.error}`);

    const content = fs.readFileSync(file, 'utf-8');
    const { extractFrontmatter } = require('../../dist/lib/frontmatter.js');
    const fm = extractFrontmatter(content);
    assert.ok(Array.isArray(fm.tags), 'tags should be an array');
    assert.deepStrictEqual(fm.tags, ['a', 'b']);
  });

  test('returns error for missing file', () => {
    const result = runGsdTools(`frontmatter set ${path.join(tempDir, 'nonexistent.md')} --field phase --value "01"`, tempDir);
    assert.ok(result.success, 'Command should exit 0 with error JSON');
    const parsed = parseResult(result);
    assert.ok(parsed.error, 'Should have error field');
  });

  test('preserves body content after set', () => {
    const bodyText = '\n\n# My Heading\n\nSome paragraph.';
    const file = writeTempFile('---\nphase: "01"\n---' + bodyText);
    const result = runGsdTools(`frontmatter set ${file} --field phase --value "02"`, tempDir);
    assert.ok(result.success, `Command failed: ${result.error}`);
    const parsed = parseResult(result);
    assert.ok(!parsed.error, `Command returned error: ${parsed.error}`);

    const content = fs.readFileSync(file, 'utf-8');
    assert.ok(content.includes('# My Heading'), 'heading should be preserved');
    assert.ok(content.includes('Some paragraph'), 'body content should be preserved');
  });
});

// ─── frontmatter merge ──────────────────────────────────────────────────────

describe('frontmatter merge', () => {
  test('merges multiple fields into frontmatter', () => {
    const file = writeTempFile('---\nphase: "01"\n---\nbody');
    const result = runGsdTools(['frontmatter', 'merge', file, '--data', '{"plan":"02","type":"tdd"}'], tempDir);
    assert.ok(result.success, `Command failed: ${result.error}`);
    const parsed = parseResult(result);
    assert.ok(!parsed.error, `Command returned error: ${parsed.error}`);

    const content = fs.readFileSync(file, 'utf-8');
    const { extractFrontmatter } = require('../../dist/lib/frontmatter.js');
    const fm = extractFrontmatter(content);
    assert.strictEqual(fm.phase, '01', 'original field should be preserved');
    assert.strictEqual(fm.plan, '02', 'merged field should be present');
    assert.strictEqual(fm.type, 'tdd', 'merged field should be present');
  });

  test('overwrites existing fields on conflict', () => {
    const file = writeTempFile('---\nphase: "01"\ntype: execute\n---\nbody');
    const result = runGsdTools(['frontmatter', 'merge', file, '--data', '{"phase":"02"}'], tempDir);
    assert.ok(result.success, `Command failed: ${result.error}`);
    const parsed = parseResult(result);
    assert.ok(!parsed.error, `Command returned error: ${parsed.error}`);

    const content = fs.readFileSync(file, 'utf-8');
    const { extractFrontmatter } = require('../../dist/lib/frontmatter.js');
    const fm = extractFrontmatter(content);
    assert.strictEqual(fm.phase, '02', 'conflicting field should be overwritten');
    assert.strictEqual(fm.type, 'execute', 'non-conflicting field should be preserved');
  });

  test('returns error for missing file', () => {
    const result = runGsdTools(`frontmatter merge ${path.join(tempDir, 'nonexistent.md')} --data '{"phase":"01"}'`, tempDir);
    assert.ok(result.success, 'Command should exit 0 with error JSON');
    const parsed = parseResult(result);
    assert.ok(parsed.error, 'Should have error field');
  });

  test('returns error for invalid JSON data', () => {
    const file = writeTempFile('---\nphase: "01"\n---\nbody');
    const result = runGsdTools(`frontmatter merge ${file} --data 'not json'`, tempDir);
    // ValidationError throws and causes non-zero exit
    assert.ok(!result.success || result.output?.includes('error'), 'Command should fail or return error');
    const errorMsg = result.error || result.output;
    assert.ok(errorMsg?.includes('JSON'), 'Error should mention JSON');
  });
});

// ─── frontmatter validate ───────────────────────────────────────────────────

describe('frontmatter validate', () => {
  test('reports valid for complete plan frontmatter', () => {
    const content = `---
phase: "01"
plan: "01"
type: execute
etapa: 1
depends_on: []
files_modified: [src/auth.ts]
autonomous: true
must_haves:
  truths:
    - "All tests pass"
---
body`;
    const file = writeTempFile(content);
    const result = runGsdTools(`frontmatter validate ${file} --schema plan`, tempDir);
    assert.ok(result.success, `Command failed: ${result.error}`);
    const parsed = parseResult(result);
    assert.ok(!parsed.error, `Command returned error: ${parsed.error}`);
    assert.strictEqual(parsed.valid, true, 'Should be valid');
    assert.deepStrictEqual(parsed.missing, [], 'No fields should be missing');
    assert.strictEqual(parsed.schema, 'plan');
  });

  test('reports invalid with missing fields', () => {
    const file = writeTempFile('---\nphase: "01"\n---\nbody');
    const result = runGsdTools(`frontmatter validate ${file} --schema plan`, tempDir);
    assert.ok(result.success, `Command failed: ${result.error}`);
    const parsed = parseResult(result);
    assert.ok(!parsed.error, `Command returned error: ${parsed.error}`);
    assert.strictEqual(parsed.valid, false, 'Should be invalid');
    assert.ok(parsed.missing.length > 0, 'Should have missing fields');
    assert.ok(parsed.missing.includes('plan'), 'plan should be in missing');
    assert.ok(parsed.missing.includes('type'), 'type should be in missing');
    assert.ok(parsed.missing.includes('must_haves'), 'must_haves should be in missing');
  });

  test('validates against summary schema', () => {
    const content = `---
etapa: 1
plan: "01"
subsystem: testing
tags: [unit-tests, yaml]
duration: 5min
completed: 2026-02-25
---
body`;
    const file = writeTempFile(content);
    const result = runGsdTools(`frontmatter validate ${file} --schema summary`, tempDir);
    assert.ok(result.success, `Command failed: ${result.error}`);
    const parsed = parseResult(result);
    assert.ok(!parsed.error, `Command returned error: ${parsed.error}`);
    assert.strictEqual(parsed.valid, true, 'Should be valid for summary schema');
    assert.strictEqual(parsed.schema, 'summary');
  });

  test('validates against verification schema', () => {
    const content = `---
etapa: 1
verified: 2026-02-25
status: passed
score: 5/5
---
body`;
    const file = writeTempFile(content);
    const result = runGsdTools(`frontmatter validate ${file} --schema verification`, tempDir);
    assert.ok(result.success, `Command failed: ${result.error}`);
    const parsed = parseResult(result);
    assert.ok(!parsed.error, `Command returned error: ${parsed.error}`);
    assert.strictEqual(parsed.valid, true, 'Should be valid for verification schema');
    assert.strictEqual(parsed.schema, 'verification');
  });

  test('returns error for unknown schema', () => {
    const file = writeTempFile('---\nphase: "01"\n---\n');
    const result = runGsdTools(`frontmatter validate ${file} --schema unknown`, tempDir);
    // Should fail with non-zero exit code (ValidationError throws)
    assert.ok(!result.success, 'Command should fail with non-zero exit code');
    assert.ok(result.error.includes('Esquema desconhecido'), 'Error should mention unknown schema');
  });

  test('returns error for missing file', () => {
    const result = runGsdTools(`frontmatter validate ${path.join(tempDir, 'nonexistent.md')} --schema plan`, tempDir);
    assert.ok(result.success, 'Command should exit 0 with error JSON');
    const parsed = parseResult(result);
    assert.ok(parsed.error, 'Should have error field');
  });
});