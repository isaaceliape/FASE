/**
 * Path — Path validation and normalization utilities
 *
 * Provides guardrails for file operations within FASE directories.
 * Protects against path traversal attacks and ensures paths stay
 * within project boundaries.
 *
 * @module lib/path
 */
/**
 * Normalize path to use forward slashes (cross-platform)
 */
export declare function toPosixPath(p: string): string;
/**
 * Guardrail: validates that a file path is inside .fase-ai directory
 *
 * @param cwd - Project root directory
 * @param filePath - Path to validate (relative or absolute)
 * @param operation - Description of operation for error message
 * @returns Resolved absolute path
 * @throws PathTraversalError if path escapes .fase-ai boundary
 */
export declare function ensureInsidePlanejamento(cwd: string, filePath: string, operation?: string): string;
/**
 * Check if a path is inside .fase-ai without throwing
 *
 * @param cwd - Project root directory
 * @param filePath - Path to check
 * @returns true if path is inside .fase-ai
 */
export declare function isInsidePlanejamento(cwd: string, filePath: string): boolean;
/**
 * Guardrail: validates that a user-provided path doesn't escape project boundary
 *
 * Protects against path traversal attacks via ../../../etc/passwd patterns.
 *
 * @param cwd - Project root directory (trusted base)
 * @param userPath - User-provided path (untrusted input)
 * @returns Resolved absolute path if valid
 * @throws PathTraversalError if path escapes project boundary
 */
export declare function validatePathInsideCwd(cwd: string, userPath: string): string;
