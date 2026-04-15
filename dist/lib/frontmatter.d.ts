/**
 * Frontmatter — YAML frontmatter parsing, serialization, and CRUD commands
 */
export type FrontmatterValue = string | string[] | boolean | number | Record<string, unknown> | null;
export type ParsedFrontmatter = Record<string, FrontmatterValue>;
export interface FrontmatterSchema {
    required: string[];
}
export type MustHavesItem = string | Record<string, string | number | string[]>;
export declare function extractFrontmatter(content: string): ParsedFrontmatter;
export declare function reconstructFrontmatter(obj: ParsedFrontmatter): string;
export declare function spliceFrontmatter(content: string, newObj: ParsedFrontmatter): string;
export declare function parseMustHavesBlock(content: string, blockName: string): MustHavesItem[];
export declare const FRONTMATTER_SCHEMAS: Record<string, FrontmatterSchema>;
export declare function cmdFrontmatterGet(cwd: string, filePath: string, field: string | undefined, raw: boolean): void;
export declare function cmdFrontmatterSet(cwd: string, filePath: string, field: string | undefined, value: string | undefined, raw: boolean): void;
export declare function cmdFrontmatterMerge(cwd: string, filePath: string, data: string | undefined, raw: boolean): void;
export declare function cmdFrontmatterValidate(cwd: string, filePath: string, schemaName: string | undefined, raw: boolean): void;
