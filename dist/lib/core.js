/**
 * Core — Cross-cutting utilities for FASE commands
 *
 * This module provides output helpers and misc utilities that don't
 * belong to specific domains like path, git, models, config, or phase.
 *
 * Phase-related types and utilities moved to phase.ts for better locality.
 * Re-exported here for backward compatibility.
 */
import fs from 'fs';
import path from 'path';
import os from 'os';
import { execSync } from 'child_process';
import { MODEL_PROFILES } from './models.js';
// ─── Re-export from phase.ts for backward compatibility ───────────────────────
export { escapeRegex, normalizeEtapaNome, compareEtapaNum, searchEtapaInDir, findEtapaInternal, getArchivedEtapasDirs, getRoadmapEtapaInternal, getMilestoneInfo, getMilestoneEtapaFilter, } from './phase.js';
// ─── Re-export from path.ts for backward compatibility ────────────────────────
export { toPosixPath } from './path.js';
// ─── Re-export from models.ts for backward compatibility ──────────────────────
export { MODEL_PROFILES } from './models.js';
// ─── Output helpers ───────────────────────────────────────────────────────────
/**
 * Output a JSON result to stdout.
 * For large payloads (>50KB), writes to a temp file and outputs @file:path.
 */
export function output(result, raw, rawValue) {
    if (raw && rawValue !== undefined) {
        process.stdout.write(String(rawValue));
    }
    else {
        const json = JSON.stringify(result, null, 2);
        if (json.length > 50000) {
            const tmpPath = path.join(os.tmpdir(), `gsd-${Date.now()}.json`);
            fs.writeFileSync(tmpPath, json, 'utf-8');
            process.stdout.write('@file:' + tmpPath);
        }
        else {
            process.stdout.write(json);
        }
    }
    process.exit(0);
}
/**
 * Output an error message to stderr and exit.
 */
export function error(message) {
    process.stderr.write('Erro: ' + message + '\n');
    process.exit(1);
}
// ─── Misc utilities ───────────────────────────────────────────────────────────
/**
 * Check if a path exists relative to cwd.
 */
export function pathExistsInternal(cwd, targetPath) {
    const fullPath = path.isAbsolute(targetPath) ? targetPath : path.join(cwd, targetPath);
    try {
        fs.statSync(fullPath);
        return true;
    }
    catch {
        return false;
    }
}
/**
 * Generate a slug from text (lowercase, replace non-alphanumeric with hyphens).
 */
export function generateSlugInternal(text) {
    if (!text)
        return null;
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}
/**
 * Resolve model for an agent type based on config profile.
 * Reads config from .fase-ai/config.json and uses MODEL_PROFILES from models.ts.
 */
export function resolveModelInternal(cwd, agentType) {
    const configPath = path.join(cwd, '.fase-ai', 'config.json');
    let configProfile = 'balanced';
    let modelOverrides = null;
    try {
        const raw = fs.readFileSync(configPath, 'utf-8');
        const parsed = JSON.parse(raw);
        configProfile = parsed['model_profile'] ?? 'balanced';
        modelOverrides = parsed['model_overrides'] ?? null;
    }
    catch {
        // Use defaults if config not found
    }
    const override = modelOverrides?.[agentType];
    if (override) {
        return override === 'opus' ? 'inherit' : override;
    }
    const agentModels = MODEL_PROFILES[agentType];
    if (!agentModels)
        return 'sonnet';
    const resolved = agentModels[configProfile] || agentModels['balanced'] || 'sonnet';
    return resolved === 'opus' ? 'inherit' : resolved;
}
// ─── Disk space utilities ─────────────────────────────────────────────────────
/**
 * Check if there's enough disk space at the target path.
 */
export function checkDiskSpace(targetPath, minBytes = 1024 * 1024) {
    try {
        const dir = path.dirname(targetPath);
        if (process.platform === 'win32') {
            const driveLetter = dir[0];
            const output = execSync(`fsutil volume diskfree ${driveLetter}:`, { encoding: 'utf8' });
            const match = output.match(/Total free bytes\s*:\s*(\d+)/);
            if (match) {
                const freeBytes = parseInt(match[1], 10);
                return freeBytes >= minBytes;
            }
        }
        else {
            const output = execSync(`df -k "${dir}" | tail -1`, { encoding: 'utf8' });
            const parts = output.trim().split(/\s+/);
            if (parts.length >= 4) {
                const availableKB = parseInt(parts[3], 10) * 1024;
                return availableKB >= minBytes;
            }
        }
        process.stderr.write(`[core:checkDiskSpace] Unable to determine disk space for ${dir}\n`);
        return true;
    }
    catch (err) {
        process.stderr.write(`[core:checkDiskSpace] Failed to check disk space: ${err.message}\n`);
        return true;
    }
}
// ─── Environment utilities ────────────────────────────────────────────────────
/**
 * Validate environment variables and return status.
 */
export function validateEnvVars() {
    const result = {
        valid: true,
        missing: [],
        warnings: [],
    };
    if (!process.env.BRAVE_API_KEY) {
        result.warnings.push('BRAVE_API_KEY not set — Brave search features will be disabled');
    }
    result.warnings.forEach((warn) => {
        process.stderr.write(`[env] Warning: ${warn}\n`);
    });
    return result;
}
//# sourceMappingURL=core.js.map