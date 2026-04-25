/**
 * Core — Shared utilities, types, and internal helpers
 *
 * Provides:
 * - Output helpers (output, error)
 * - Phase/Etapa utilities (will move to unified Phase module)
 * - Roadmap utilities
 * - Misc utilities
 *
 * Note: Path utilities moved to lib/path.ts
 * Note: Git utilities moved to lib/git.ts
 * Note: Model profiles moved to lib/models.ts
 * Note: Config loading moved to lib/config.ts
 *
 * @module lib/core
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
export interface MilestoneInfo {
    version: string;
    name: string;
}
export interface ArchivedEtapaEntry {
    name: string;
    milestone: string;
    basePath: string;
    fullPath: string;
}
export interface RoadmapEtapaInfo {
    found: boolean;
    phase_number: string;
    phase_name: string;
    goal: string | null;
    section: string;
}
export type MilestoneEtapaFilter = ((dirName: string) => boolean) & {
    phaseCount: number;
};
export declare function output(result: unknown, raw?: boolean, rawValue?: unknown): void;
export declare function error(message: string): never;
export declare function escapeRegex(value: unknown): string;
export declare function normalizeEtapaNome(etapa: unknown): string;
export declare function compareEtapaNum(a: string, b: string): number;
export declare function toPosixPath(p: string): string;
export declare function searchEtapaInDir(baseDir: string, relBase: string, normalized: string): EtapaInfo | null;
export declare function findEtapaInternal(cwd: string, etapa: string): EtapaInfo | null;
export declare function getArchivedEtapasDirs(cwd: string): ArchivedEtapaEntry[];
export declare function getRoadmapEtapaInternal(cwd: string, etapaNum: string | number): RoadmapEtapaInfo | null;
export declare function getMilestoneInfo(cwd: string): MilestoneInfo;
export declare function getMilestoneEtapaFilter(cwd: string): MilestoneEtapaFilter;
export declare function pathExistsInternal(cwd: string, targetPath: string): boolean;
export declare function generateSlugInternal(text: string | null | undefined): string | null;
/**
 * Resolve model for an agent type based on config profile
 *
 * @param cwd - Project root directory
 * @param agentType - Agent type name
 * @returns Resolved model name or 'inherit' for opus
 */
export declare function resolveModelInternal(cwd: string, agentType: string): string;
/**
 * Validate environment variables and return status.
 * @returns Object with valid status, missing vars, and warnings
 */
export declare function validateEnvVars(): {
    valid: boolean;
    missing: string[];
    warnings: string[];
};
/**
 * Check if there's enough disk space at the target path.
 * @param targetPath - Path where file will be written
 * @param minBytes - Minimum required bytes (default: 1MB)
 * @returns true if enough space is available
 */
export declare function checkDiskSpace(targetPath: string, minBytes?: number): boolean;
