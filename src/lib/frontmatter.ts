/**
 * Frontmatter — YAML frontmatter parsing, serialization, and CRUD commands
 *
 * Uses js-yaml for robust YAML parsing (fixes REG-04 quoted comma bug).
 */

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { output } from './core.js';
import { safeReadFile } from './config.js';
import { ensureInsidePlanejamento } from './path.js';
import { ValidationError } from './errors.js';

// ─── Types ────────────────────────────────────────────────────────────────────

export type FrontmatterValue =
  | string
  | string[]
  | boolean
  | number
  | Record<string, unknown>
  | null;
export type ParsedFrontmatter = Record<string, FrontmatterValue>;

export interface FrontmatterSchema {
  required: string[];
}

export type MustHavesItem = string | Record<string, string | number | string[]>;

// ─── Parsing engine ───────────────────────────────────────────────────────────

/**
 * Extract frontmatter from markdown content
 *
 * Parses YAML between --- delimiters using js-yaml.
 * Returns empty object if no frontmatter found.
 */
export function extractFrontmatter(content: string): ParsedFrontmatter {
  const match = content.match(/^---\n([\s\S]+?)\n---/);
  if (!match) return {};

  try {
    const parsed = yaml.load(match[1]) as Record<string, unknown>;
    return parsed as ParsedFrontmatter;
  } catch {
    // YAML parse error - return empty object
    return {};
  }
}

/**
 * Serialize frontmatter object to YAML string
 *
 * Uses js-yaml dump with default formatting.
 */
export function reconstructFrontmatter(obj: ParsedFrontmatter): string {
  return yaml.dump(obj, { indent: 2, lineWidth: -1 });
}

/**
 * Replace or add frontmatter in content
 *
 * Preserves body content after frontmatter block.
 */
export function spliceFrontmatter(content: string, newObj: ParsedFrontmatter): string {
  const yamlStr = reconstructFrontmatter(newObj);
  const match = content.match(/^---\n[\s\S]+?\n---/);
  if (match) {
    return `---\n${yamlStr}---` + content.slice(match[0].length);
  }
  return `---\n${yamlStr}---\n\n` + content;
}

/**
 * Parse a specific block under must_haves in frontmatter
 *
 * Extracts items from a named block (truths, artifacts, key_links)
 * under must_haves with proper indentation handling.
 */
export function parseMustHavesBlock(content: string, blockName: string): MustHavesItem[] {
  const fm = extractFrontmatter(content);
  const mustHaves = fm.must_haves as Record<string, unknown> | undefined;
  if (!mustHaves) return [];

  const block = mustHaves[blockName];
  if (!block) return [];

  if (Array.isArray(block)) {
    return block as MustHavesItem[];
  }

  return [];
}

// ─── Frontmatter CRUD commands ────────────────────────────────────────────────

export const FRONTMATTER_SCHEMAS: Record<string, FrontmatterSchema> = {
  plan: {
    required: [
      'etapa',
      'plan',
      'type',
      'etapa',
      'depends_on',
      'files_modified',
      'autonomous',
      'must_haves',
    ],
  },
  summary: { required: ['etapa', 'plan', 'subsystem', 'tags', 'duration', 'completed'] },
  verification: { required: ['etapa', 'verified', 'status', 'score'] },
};

export function cmdFrontmatterGet(
  cwd: string,
  filePath: string,
  field: string | undefined,
  raw: boolean
): void {
  if (!filePath) {
    throw new ValidationError('caminho do arquivo obrigatório', 'MISSING_FILE_PATH');
  }
  const fullPath = path.isAbsolute(filePath) ? filePath : path.join(cwd, filePath);
  const content = safeReadFile(fullPath);
  if (!content) {
    output({ error: 'Arquivo não encontrado', path: filePath }, raw);
    return;
  }
  const fm = extractFrontmatter(content);
  if (field) {
    const value = fm[field];
    if (value === undefined) {
      output({ error: 'Campo não encontrado', field }, raw);
      return;
    }
    output({ [field]: value }, raw, JSON.stringify(value));
  } else {
    output(fm, raw);
  }
}

export function cmdFrontmatterSet(
  cwd: string,
  filePath: string,
  field: string | undefined,
  value: string | undefined,
  raw: boolean
): void {
  if (!filePath || !field || value === undefined) {
    throw new ValidationError('arquivo, campo e valor obrigatórios', 'MISSING_REQUIRED_PARAMS');
  }
  try {
    const fullPath = ensureInsidePlanejamento(cwd, filePath, 'frontmatter set');
    if (!fs.existsSync(fullPath)) {
      output({ error: 'Arquivo não encontrado', path: filePath }, raw);
      return;
    }
    const content = fs.readFileSync(fullPath, 'utf-8');
    const fm = extractFrontmatter(content);
    let parsedValue: unknown;
    try {
      parsedValue = JSON.parse(value);
    } catch {
      parsedValue = value;
    }
    fm[field] = parsedValue as FrontmatterValue;
    const newContent = spliceFrontmatter(content, fm);
    fs.writeFileSync(fullPath, newContent, 'utf-8');
    output({ updated: true, field, value: parsedValue }, raw, 'true');
  } catch (err) {
    output({ error: (err as Error).message }, raw);
  }
}

export function cmdFrontmatterMerge(
  cwd: string,
  filePath: string,
  data: string | undefined,
  raw: boolean
): void {
  if (!filePath || !data) {
    throw new ValidationError('arquivo e dados obrigatórios', 'MISSING_REQUIRED_PARAMS');
  }
  try {
    const fullPath = ensureInsidePlanejamento(cwd, filePath, 'frontmatter merge');
    if (!fs.existsSync(fullPath)) {
      output({ error: 'Arquivo não encontrado', path: filePath }, raw);
      return;
    }
    const content = fs.readFileSync(fullPath, 'utf-8');
    const fm = extractFrontmatter(content);
    let mergeData: ParsedFrontmatter;
    try {
      mergeData = JSON.parse(data) as ParsedFrontmatter;
    } catch {
      throw new ValidationError('JSON inválido para --data', 'INVALID_JSON');
    }
    Object.assign(fm, mergeData);
    const newContent = spliceFrontmatter(content, fm);
    fs.writeFileSync(fullPath, newContent, 'utf-8');
    output({ merged: true, fields: Object.keys(mergeData) }, raw, 'true');
  } catch (err) {
    output({ error: (err as Error).message }, raw);
  }
}

export function cmdFrontmatterValidate(
  cwd: string,
  filePath: string,
  schemaName: string | undefined,
  raw: boolean
): void {
  if (!filePath || !schemaName) {
    throw new ValidationError('arquivo e esquema obrigatórios', 'MISSING_REQUIRED_PARAMS');
  }
  const schema = FRONTMATTER_SCHEMAS[schemaName];
  if (!schema) {
    throw new ValidationError(
      `Esquema desconhecido: ${schemaName}. Disponíveis: ${Object.keys(FRONTMATTER_SCHEMAS).join(', ')}`,
      'UNKNOWN_SCHEMA'
    );
  }
  try {
    const fullPath = ensureInsidePlanejamento(cwd, filePath, 'frontmatter validate');
    const content = safeReadFile(fullPath);
    if (!content) {
      output({ error: 'Arquivo não encontrado', path: filePath }, raw);
      return;
    }
    const fm = extractFrontmatter(content);
    const missing = schema.required.filter((f) => fm[f] === undefined);
    const present = schema.required.filter((f) => fm[f] !== undefined);
    output(
      { valid: missing.length === 0, missing, present, schema: schemaName },
      raw,
      missing.length === 0 ? 'valid' : 'invalid'
    );
  } catch (err) {
    output({ error: (err as Error).message }, raw);
  }
}
