/**
 * Core — Cross-cutting utilities for FASE commands
 *
 * This module provides output helpers and misc utilities that don't
 * belong to specific domains like path, git, models, config, or phase.
 *
 * Phase-related types and utilities moved to phase.ts for better locality.
 * Re-exported here for backward compatibility.
 */
export { EtapaInfo, MilestoneInfo, ArchivedEtapaEntry, RoadmapEtapaInfo, MilestoneEtapaFilter, escapeRegex, normalizeEtapaNome, compareEtapaNum, searchEtapaInDir, findEtapaInternal, getArchivedEtapasDirs, getRoadmapEtapaInternal, getMilestoneInfo, getMilestoneEtapaFilter, } from './phase.js';
export { toPosixPath } from './path.js';
/**
 * Output a JSON result to stdout.
 * For large payloads (>50KB), writes to a temp file and outputs @file:path.
 */
export declare function output(result: unknown, raw?: boolean, rawValue?: unknown): void;
/**
 * Output an error message to stderr and exit.
 */
export declare function error(message: string): never;
/**
 * Check if a path exists relative to cwd.
 */
export declare function pathExistsInternal(cwd: string, targetPath: string): boolean;
/**
 * Generate a slug from text (lowercase, replace non-alphanumeric with hyphens).
 */
export declare function generateSlugInternal(text: string | null | undefined): string | null;
/**
 * Resolve model for an agent type based on config profile.
 * Imports MODEL_PROFILES inline to avoid circular dependency.
 */
export declare function resolveModelInternal(cwd: string, agentType: string): string;
/**
 * Check if there's enough disk space at the target path.
 */
export declare function checkDiskSpace(targetPath: string, minBytes?: number): boolean;
/**
 * Validate environment variables and return status.
 */
export declare function validateEnvVars(): {
    valid: boolean;
    missing: string[];
    warnings: string[];
};
