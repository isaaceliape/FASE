/**
 * Frontmatter — YAML frontmatter parsing, serialization, and CRUD commands
 *
 * Uses js-yaml for robust YAML parsing (fixes REG-04 quoted comma bug).
 */
export type FrontmatterValue = string | string[] | boolean | number | Record<string, unknown> | null;
export type ParsedFrontmatter = Record<string, FrontmatterValue>;
export interface FrontmatterSchema {
    required: string[];
}
export type MustHavesItem = string | Record<string, string | number | string[]>;
/**
 * Extract frontmatter from markdown content
 *
 * Parses YAML between --- delimiters using js-yaml.
 * Returns empty object if no frontmatter found.
 */
export declare function extractFrontmatter(content: string): ParsedFrontmatter;
/**
 * Serialize frontmatter object to YAML string
 *
 * Uses js-yaml dump with default formatting.
 */
export declare function reconstructFrontmatter(obj: ParsedFrontmatter): string;
/**
 * Replace or add frontmatter in content
 *
 * Preserves body content after frontmatter block.
 */
export declare function spliceFrontmatter(content: string, newObj: ParsedFrontmatter): string;
/**
 * Parse a specific block under must_haves in frontmatter
 *
 * Extracts items from a named block (truths, artifacts, key_links)
 * under must_haves with proper indentation handling.
 */
export declare function parseMustHavesBlock(content: string, blockName: string): MustHavesItem[];
export declare const FRONTMATTER_SCHEMAS: Record<string, FrontmatterSchema>;
export declare function cmdFrontmatterGet(cwd: string, filePath: string, field: string | undefined, raw: boolean): void;
export declare function cmdFrontmatterSet(cwd: string, filePath: string, field: string | undefined, value: string | undefined, raw: boolean): void;
export declare function cmdFrontmatterMerge(cwd: string, filePath: string, data: string | undefined, raw: boolean): void;
export declare function cmdFrontmatterValidate(cwd: string, filePath: string, schemaName: string | undefined, raw: boolean): void;
