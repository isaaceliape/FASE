/**
 * Config — Configuration loading and CLI operations
 *
 * Provides:
 * - Config interface and loading utilities
 * - CLI commands for config CRUD (ensure-section, set, get)
 *
 * @module lib/config
 */
/**
 * FASE configuration structure
 */
export interface Config {
    model_profile: string;
    commit_docs: boolean;
    search_gitignored: boolean;
    branching_strategy: string;
    etapa_branch_template: string;
    milestone_branch_template: string;
    research: boolean;
    plan_checker: boolean;
    verifier: boolean;
    nyquist_validation: boolean;
    parallelization: boolean;
    brave_search: boolean;
    model_overrides: Record<string, string> | null;
}
/**
 * Safely read a file, returning null if it doesn't exist
 *
 * @param filePath - Path to file
 * @returns File content or null if not found
 */
export declare function safeReadFile(filePath: string): string | null;
/**
 * Load FASE configuration from .fase-ai/config.json
 *
 * Merges user config with defaults, handles migration of deprecated keys.
 *
 * @param cwd - Project root directory
 * @returns Config object with all settings
 */
export declare function loadConfig(cwd: string): Config;
export declare function cmdConfigEnsureSection(cwd: string, raw: boolean): void;
export declare function cmdConfigSet(cwd: string, keyPath: string, value: string, raw: boolean): void;
export declare function cmdConfigGet(cwd: string, keyPath: string, raw: boolean): void;
