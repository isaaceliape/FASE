/**
 * Phase — Unified Phase/Etapa/Milestone module
 *
 * Deepening of scattered Phase concept. Previously:
 * - EtapaInfo, MilestoneInfo, RoadmapEtapaInfo in core.ts
 * - findEtapaInternal, getMilestoneInfo in core.ts
 * - Etapa operations in etapa.ts
 * - Milestone operations in milestone.ts
 * - Roadmap operations in roadmap.ts
 * - State management in state.ts
 *
 * Now: One module for Phase-related types and utilities.
 * Each file imports from this seam instead of core.ts.
 */
/**
 * Phase/Etapa information from disk
 */
export interface EtapaInfo {
    found: boolean;
    directory: string;
    phase_number: string;
    phase_name: string | null;
    phase_slug: string | null;
    plans: string[];
    summaries: string[];
    incomplete_plans: string[];
    has_research: boolean;
    has_context: boolean;
    has_verification: boolean;
    archived?: string;
}
/**
 * Milestone information from ROADMAP.md
 */
export interface MilestoneInfo {
    version: string;
    name: string;
}
/**
 * Archived phase entry
 */
export interface ArchivedEtapaEntry {
    name: string;
    milestone: string;
    basePath: string;
    fullPath: string;
}
/**
 * Phase information from ROADMAP.md section
 */
export interface RoadmapEtapaInfo {
    found: boolean;
    phase_number: string;
    phase_name: string;
    goal: string | null;
    section: string;
}
/**
 * Filter function for milestone phases
 */
export type MilestoneEtapaFilter = ((dirName: string) => boolean) & {
    phaseCount: number;
};
/**
 * Escape a value for use in regex patterns
 */
export declare function escapeRegex(value: unknown): string;
/**
 * Normalize an etapa number to canonical form
 * Examples: 1 → 01, 3A → 03A, 2.1 → 02.1
 */
export declare function normalizeEtapaNome(etapa: unknown): string;
/**
 * Compare two etapa numbers for sorting
 */
export declare function compareEtapaNum(a: string, b: string): number;
/**
 * Search for an etapa directory in a base directory
 */
export declare function searchEtapaInDir(baseDir: string, relBase: string, normalized: string): EtapaInfo | null;
/**
 * Find an etapa directory by number (current or archived)
 */
export declare function findEtapaInternal(cwd: string, etapa: string): EtapaInfo | null;
/**
 * Get all archived etapa directories
 */
export declare function getArchivedEtapasDirs(cwd: string): ArchivedEtapaEntry[];
/**
 * Get phase information from ROADMAP.md section
 */
export declare function getRoadmapEtapaInternal(cwd: string, etapaNum: string | number): RoadmapEtapaInfo | null;
/**
 * Get current milestone information from ROADMAP.md
 */
export declare function getMilestoneInfo(cwd: string): MilestoneInfo;
/**
 * Get a filter function for milestone phases
 */
export declare function getMilestoneEtapaFilter(cwd: string): MilestoneEtapaFilter;
