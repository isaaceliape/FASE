/**
 * Config — Configuration loading and CLI operations
 *
 * Provides:
 * - Config interface and loading utilities
 * - CLI commands for config CRUD (ensure-section, set, get)
 *
 * @module lib/config
 */

import fs from 'fs';
import path from 'path';
import { output } from './core.js';
import { ConfigError, ValidationError, FileError } from './errors.js';

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Utilities ────────────────────────────────────────────────────────────────

/**
 * Safely read a file, returning null if it doesn't exist
 *
 * @param filePath - Path to file
 * @returns File content or null if not found
 */
export function safeReadFile(filePath: string): string | null {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch {
    return null;
  }
}

/**
 * Load FASE configuration from .fase-ai/config.json
 *
 * Merges user config with defaults, handles migration of deprecated keys.
 *
 * @param cwd - Project root directory
 * @returns Config object with all settings
 */
export function loadConfig(cwd: string): Config {
  const configPath = path.join(cwd, '.fase-ai', 'config.json');
  const defaults: Config = {
    model_profile: 'balanced',
    commit_docs: true,
    search_gitignored: false,
    branching_strategy: 'none',
    etapa_branch_template: 'gsd/phase-{phase}-{slug}',
    milestone_branch_template: 'gsd/{milestone}-{slug}',
    research: true,
    plan_checker: true,
    verifier: true,
    nyquist_validation: true,
    parallelization: true,
    brave_search: false,
    model_overrides: null,
  };

  try {
    const raw = fs.readFileSync(configPath, 'utf-8');
    const parsed: Record<string, unknown> = JSON.parse(raw);

    // Migrate deprecated "depth" key to "granularity" with value mapping
    if ('depth' in parsed && !('granularity' in parsed)) {
      const depthToGranularity: Record<string, string> = {
        quick: 'coarse',
        standard: 'standard',
        comprehensive: 'fine',
      };
      parsed['granularity'] = depthToGranularity[parsed['depth'] as string] ?? parsed['depth'];
      delete parsed['depth'];
      try {
        fs.writeFileSync(configPath, JSON.stringify(parsed, null, 2), 'utf-8');
      } catch (err) {
        process.stderr.write(
          `[config:loadConfig] Failed to migrate config: ${(err as Error).message}\n`
        );
      }
    }

    const get = (key: string, nested?: { section: string; field: string }): unknown => {
      if (parsed[key] !== undefined) return parsed[key];
      if (nested) {
        const section = parsed[nested.section];
        if (section && typeof section === 'object' && section !== null) {
          const val = (section as Record<string, unknown>)[nested.field];
          if (val !== undefined) return val;
        }
      }
      return undefined;
    };

    const parallelization = (() => {
      const val = get('parallelization');
      if (typeof val === 'boolean') return val;
      if (typeof val === 'object' && val !== null && 'enabled' in val)
        return (val as { enabled: boolean }).enabled;
      return defaults.parallelization;
    })();

    return {
      model_profile: (get('model_profile') ?? defaults.model_profile) as string,
      commit_docs: (get('commit_docs', { section: 'planning', field: 'commit_docs' }) ??
        defaults.commit_docs) as boolean,
      search_gitignored: (get('search_gitignored', {
        section: 'planning',
        field: 'search_gitignored',
      }) ?? defaults.search_gitignored) as boolean,
      branching_strategy: (get('branching_strategy', {
        section: 'git',
        field: 'branching_strategy',
      }) ?? defaults.branching_strategy) as string,
      etapa_branch_template: (get('etapa_branch_template', {
        section: 'git',
        field: 'etapa_branch_template',
      }) ?? defaults.etapa_branch_template) as string,
      milestone_branch_template: (get('milestone_branch_template', {
        section: 'git',
        field: 'milestone_branch_template',
      }) ?? defaults.milestone_branch_template) as string,
      research: (get('research', { section: 'workflow', field: 'research' }) ??
        defaults.research) as boolean,
      plan_checker: (get('plan_checker', { section: 'workflow', field: 'plan_check' }) ??
        defaults.plan_checker) as boolean,
      verifier: (get('verifier', { section: 'workflow', field: 'verifier' }) ??
        defaults.verifier) as boolean,
      nyquist_validation: (get('nyquist_validation', {
        section: 'workflow',
        field: 'nyquist_validation',
      }) ?? defaults.nyquist_validation) as boolean,
      parallelization,
      brave_search: (get('brave_search') ?? defaults.brave_search) as boolean,
      model_overrides:
        (parsed['model_overrides'] as Record<string, string> | null | undefined) ?? null,
    };
  } catch (err) {
    process.stderr.write(
      `[config:loadConfig] Failed to load config from ${configPath}: ${(err as Error).message}\n`
    );
    return defaults;
  }
}

// ─── CLI Commands ─────────────────────────────────────────────────────────────

export function cmdConfigEnsureSection(cwd: string, raw: boolean): void {
  const configPath = path.join(cwd, '.fase-ai', 'config.json');
  const planejamentoDir = path.join(cwd, '.fase-ai');

  try {
    if (!fs.existsSync(planejamentoDir)) {
      fs.mkdirSync(planejamentoDir, { recursive: true });
    }
  } catch (err) {
    throw new FileError('Falha ao criar diretório .fase-ai', 'MKDIR_FAILED', {
      path: planejamentoDir,
      error: (err as Error).message,
    });
  }

  if (fs.existsSync(configPath)) {
    output({ created: false, reason: 'already_exists' }, raw, 'exists');
    return;
  }

  const hasBraveSearch = !!process.env['BRAVE_API_KEY'];
  const userDefaults: Record<string, unknown> = {};

  const hardcoded = {
    model_profile: 'balanced',
    commit_docs: true,
    search_gitignored: false,
    branching_strategy: 'none',
    etapa_branch_template: 'gsd/phase-{phase}-{slug}',
    milestone_branch_template: 'gsd/{milestone}-{slug}',
    workflow: {
      research: true,
      plan_check: true,
      verifier: true,
      nyquist_validation: true,
    },
    parallelization: true,
    brave_search: hasBraveSearch,
  };

  const defaults = {
    ...hardcoded,
    ...userDefaults,
    workflow: {
      ...hardcoded.workflow,
      ...((userDefaults['workflow'] as Record<string, unknown>) ?? {}),
    },
  };

  try {
    fs.writeFileSync(configPath, JSON.stringify(defaults, null, 2), 'utf-8');
    output({ created: true, path: '.fase-ai/config.json' }, raw, 'created');
  } catch (err) {
    throw new FileError('Falha ao criar config.json', 'WRITE_FAILED', {
      path: configPath,
      error: (err as Error).message,
    });
  }
}

export function cmdConfigSet(cwd: string, keyPath: string, value: string, raw: boolean): void {
  const configPath = path.join(cwd, '.fase-ai', 'config.json');

  if (!keyPath) {
    throw new ValidationError('Uso: config-set <chave.caminho> <valor>', 'MISSING_KEY_PATH');
  }

  let parsedValue: unknown = value;
  if (value === 'true') parsedValue = true;
  else if (value === 'false') parsedValue = false;
  else if (!isNaN(Number(value)) && value !== '') parsedValue = Number(value);

  let config: Record<string, unknown> = {};
  try {
    if (fs.existsSync(configPath)) {
      config = JSON.parse(fs.readFileSync(configPath, 'utf-8')) as Record<string, unknown>;
    }
  } catch (err) {
    throw new ConfigError('Falha ao ler config.json', 'READ_FAILED', {
      path: configPath,
      error: (err as Error).message,
    });
  }

  const keys = keyPath.split('.');
  let current: Record<string, unknown> = config;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (current[key] === undefined || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key] as Record<string, unknown>;
  }
  current[keys[keys.length - 1]] = parsedValue;

  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
    output({ updated: true, key: keyPath, value: parsedValue }, raw, `${keyPath}=${parsedValue}`);
  } catch (err) {
    throw new FileError('Falha ao escrever config.json', 'WRITE_FAILED', {
      path: configPath,
      error: (err as Error).message,
    });
  }
}

export function cmdConfigGet(cwd: string, keyPath: string, raw: boolean): void {
  const configPath = path.join(cwd, '.fase-ai', 'config.json');

  if (!keyPath) {
    throw new ValidationError('Uso: config-get <chave.caminho>', 'MISSING_KEY_PATH');
  }

  let config: Record<string, unknown> = {};
  try {
    if (fs.existsSync(configPath)) {
      config = JSON.parse(fs.readFileSync(configPath, 'utf-8')) as Record<string, unknown>;
    } else {
      throw new ConfigError('Nenhum config.json encontrado', 'FILE_NOT_FOUND', {
        path: configPath,
      });
    }
  } catch (err) {
    if (err instanceof ConfigError) throw err;
    throw new ConfigError('Falha ao ler config.json', 'READ_FAILED', {
      path: configPath,
      error: (err as Error).message,
    });
  }

  const keys = keyPath.split('.');
  let current: unknown = config;
  for (const key of keys) {
    if (current === undefined || current === null || typeof current !== 'object') {
      throw new ValidationError(`Chave não encontrada: ${keyPath}`, 'KEY_NOT_FOUND', {
        keyPath,
        key,
      });
    }
    current = (current as Record<string, unknown>)[key];
  }

  if (current === undefined) {
    throw new ValidationError(`Chave não encontrada: ${keyPath}`, 'KEY_NOT_FOUND', { keyPath });
  }

  output(current, raw, String(current));
}
