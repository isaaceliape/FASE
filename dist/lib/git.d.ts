/**
 * Git — Git operations and utilities
 *
 * Provides git command execution and .gitignore checking.
 * All git operations are centralized here for testability.
 *
 * @module lib/git
 */
/**
 * Result of a git command execution
 */
export interface GitResult {
    exitCode: number;
    stdout: string;
    stderr: string;
}
/**
 * Check if a path is gitignored
 *
 * Uses git check-ignore to test against .gitignore rules.
 *
 * @param cwd - Project root directory
 * @param targetPath - Path to check
 * @returns true if path matches .gitignore rules
 */
export declare function isGitIgnored(cwd: string, targetPath: string): boolean;
/**
 * Execute a git command and return structured result
 *
 * @param cwd - Project root directory
 * @param args - Git command arguments
 * @returns GitResult with exitCode, stdout, stderr
 */
export declare function execGit(cwd: string, args: string[]): GitResult;
