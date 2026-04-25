/**
 * Git — Git operations and utilities
 *
 * Provides git command execution and .gitignore checking.
 * All git operations are centralized here for testability.
 *
 * @module lib/git
 */
import { execSync } from 'child_process';
/**
 * Check if a path is gitignored
 *
 * Uses git check-ignore to test against .gitignore rules.
 *
 * @param cwd - Project root directory
 * @param targetPath - Path to check
 * @returns true if path matches .gitignore rules
 */
export function isGitIgnored(cwd, targetPath) {
    try {
        // --no-index checks .gitignore rules regardless of whether the file is tracked.
        execSync('git check-ignore -q --no-index -- ' + targetPath.replace(/[^a-zA-Z0-9._\-/]/g, ''), {
            cwd,
            stdio: 'pipe',
        });
        return true;
    }
    catch {
        return false;
    }
}
/**
 * Execute a git command and return structured result
 *
 * @param cwd - Project root directory
 * @param args - Git command arguments
 * @returns GitResult with exitCode, stdout, stderr
 */
export function execGit(cwd, args) {
    try {
        const escaped = args.map((a) => {
            if (/^[a-zA-Z0-9._\-/=:@]+$/.test(a))
                return a;
            return "'" + a.replace(/'/g, "'\\''") + "'";
        });
        const stdout = execSync('git ' + escaped.join(' '), {
            cwd,
            stdio: 'pipe',
            encoding: 'utf-8',
        });
        return { exitCode: 0, stdout: stdout.trim(), stderr: '' };
    }
    catch (err) {
        const e = err;
        return {
            exitCode: e.status ?? 1,
            stdout: (e.stdout ?? '').toString().trim(),
            stderr: (e.stderr ?? '').toString().trim(),
        };
    }
}
//# sourceMappingURL=git.js.map