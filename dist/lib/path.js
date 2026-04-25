/**
 * Path — Path validation and normalization utilities
 *
 * Provides guardrails for file operations within FASE directories.
 * Protects against path traversal attacks and ensures paths stay
 * within project boundaries.
 *
 * @module lib/path
 */
import path from 'path';
import { PathTraversalError } from './errors.js';
/**
 * Normalize path to use forward slashes (cross-platform)
 */
export function toPosixPath(p) {
    return p.split(path.sep).join('/');
}
/**
 * Guardrail: validates that a file path is inside .fase-ai directory
 *
 * @param cwd - Project root directory
 * @param filePath - Path to validate (relative or absolute)
 * @param operation - Description of operation for error message
 * @returns Resolved absolute path
 * @throws PathTraversalError if path escapes .fase-ai boundary
 */
export function ensureInsidePlanejamento(cwd, filePath, operation = 'file operation') {
    const fullPath = path.isAbsolute(filePath) ? filePath : path.join(cwd, filePath);
    const planejPath = path.join(cwd, '.fase-ai');
    const normalizedFull = path.normalize(fullPath);
    const normalizedPlanej = path.normalize(planejPath);
    if (!normalizedFull.startsWith(normalizedPlanej + path.sep) &&
        normalizedFull !== normalizedPlanej) {
        throw new PathTraversalError(`${operation} must be inside .fase-ai/: ${filePath}`, 'PATH_OUTSIDE_BOUNDARY', { path: filePath, boundary: '.fase-ai', operation });
    }
    return fullPath;
}
/**
 * Check if a path is inside .fase-ai without throwing
 *
 * @param cwd - Project root directory
 * @param filePath - Path to check
 * @returns true if path is inside .fase-ai
 */
export function isInsidePlanejamento(cwd, filePath) {
    const fullPath = path.isAbsolute(filePath) ? filePath : path.join(cwd, filePath);
    const planejPath = path.join(cwd, '.fase-ai');
    const normalizedFull = path.normalize(fullPath);
    const normalizedPlanej = path.normalize(planejPath);
    return (normalizedFull.startsWith(normalizedPlanej + path.sep) || normalizedFull === normalizedPlanej);
}
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
export function validatePathInsideCwd(cwd, userPath) {
    const resolved = path.resolve(cwd, userPath);
    const relative = path.relative(cwd, resolved);
    // Check if relative path tries to escape (starts with ..) or is absolute
    if (relative.startsWith('..') || path.isAbsolute(relative)) {
        throw new PathTraversalError(`Path traversal detected: "${userPath}" escapes project boundary`, 'PATH_TRAVERSAL_DETECTED', { userPath, resolved, cwd });
    }
    return resolved;
}
//# sourceMappingURL=path.js.map