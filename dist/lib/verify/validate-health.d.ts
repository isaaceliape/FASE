/**
 * Validate Health — Project health validation with auto-repair
 *
 * Comprehensive health checks for FASE project structure with optional repair.
 */
import { ValidateHealthOptions } from './types.js';
/**
 * Validate project health and optionally repair issues.
 * Checks PROJECT.md, ROADMAP.md, STATE.md, config.json, and phase directories.
 */
export declare function cmdValidateHealth(cwd: string, options: ValidateHealthOptions, raw: boolean): void;
