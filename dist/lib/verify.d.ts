/**
 * Verify — Verification suite, consistency, and health validation
 *
 * This module provides verification functions for FASE project validation.
 * Core utilities are in submodules:
 *   - verify/types.ts: Health and verification interfaces
 *   - verify/verify-files.ts: Artifact and key link verification
 *   - verify/verify-structure.ts: Plan structure and consistency validation
 *   - verify/validate-health.ts: Project health validation with repair
 *   - verification-utils.ts: Shared helper functions
 */
export { ValidateHealthOptions } from './verify/types.js';
export { cmdVerifyArtifacts, cmdVerifyKeyLinks } from './verify/verify-files.js';
export { cmdVerifyPlanStructure, cmdVerifyPhaseCompleteness, cmdValidateConsistency } from './verify/verify-structure.js';
export { cmdValidateHealth } from './verify/validate-health.js';
/**
 * Verify SUMMARY.md file references and commit hashes.
 * Checks file creation references, git commit validity, and self-check section.
 */
export declare function cmdVerifySummary(cwd: string, summaryPath: string, checkFileCount: number, raw: boolean): void;
/**
 * Verify @ and backtick file references in content.
 * Checks that all referenced files exist on disk.
 */
export declare function cmdVerifyReferences(cwd: string, filePath: string, raw: boolean): void;
/**
 * Verify git commit hashes exist in history.
 * Checks each hash is a valid commit object.
 */
export declare function cmdVerifyCommits(cwd: string, hashes: string[], raw: boolean): void;
