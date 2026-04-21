// ANSI Color codes for terminal output
export const cyan = '\x1b[36m';
export const green = '\x1b[32m';
export const yellow = '\x1b[33m';
export const dim = '\x1b[2m';
export const reset = '\x1b[0m';

// Codex configuration constants
// Note: Agent TOML files are automatically fixed for escaping issues:
// - Backticks in code blocks: \` → \\` (escape backslashes for TOML)
// - Pipes in grep patterns: \| → | (pipes don't need escaping in grep -E)
// - Parentheses in grep: \( → \\( (escape backslashes for TOML)
export const FASE_CODEX_MARKER = '# FASE Agent Configuration \u2014 managed by fase-ai installer';

export const CODEX_AGENT_SANDBOX = {
  'fase-executor': 'workspace-write',
  'fase-planner': 'workspace-write',
  'fase-phase-researcher': 'workspace-write',
  'fase-project-researcher': 'workspace-write',
  'fase-research-synthesizer': 'workspace-write',
  'fase-verifier': 'workspace-write',
  'fase-codebase-mapper': 'workspace-write',
  'fase-roadmapper': 'workspace-write',
  'fase-debugger': 'workspace-write',
  'fase-plan-checker': 'read-only',
  'fase-integration-checker': 'read-only',
};
