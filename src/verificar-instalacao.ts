import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import { createLogger } from './lib/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logger = createLogger();

// Colors
const cyan = '\x1b[36m';
const green = '\x1b[32m';
const yellow = '\x1b[33m';
const red = '\x1b[31m';
const dim = '\x1b[2m';
const reset = '\x1b[0m';
const bold = '\x1b[1m';

// Get version from package.json
const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf-8'));

interface Suggestion {
  priority: number;
  issue: string;
  command: string;
  description: string;
}

interface Runtime {
  name: string;
  configDir: string;
  settingsFile?: string;
  commandsDir?: string;
  hooksDir?: string;
  commandPattern?: RegExp;
  hookPattern?: RegExp;
  configFile?: string;
  skillsDir?: string;
  skillPattern?: RegExp;
  installFlag: string;
}

/**
 * Run a shell command and return output
 */
function run(command: string): string {
  try {
    return execSync(command, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
  } catch (e: unknown) {
    const err = e as { stdout?: unknown };
    const stdout = err.stdout;
    if (typeof stdout === 'string') return stdout.trim();
    if (stdout instanceof Buffer) return stdout.toString().trim();
    return '';
  }
}

/**
 * Check if file exists
 */
function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}

/**
 * Check if directory exists
 */
function dirExists(dirPath: string): boolean {
  return fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
}

/**
 * Count files matching pattern in directory
 */
function countFiles(dirPath: string, pattern: RegExp): number {
  if (!dirExists(dirPath)) return 0;
  try {
    const files = fs.readdirSync(dirPath).filter((f: string) => pattern.test(f));
    return files.length;
  } catch {
    return 0;
  }
}

/**
 * Count files matching pattern in directory (recursive for skills)
 */
function countFilesRecursive(dirPath: string, pattern: RegExp): number {
  if (!dirExists(dirPath)) return 0;
  try {
    let count = 0;
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory() && entry.name.startsWith('fase-')) {
        if (pattern.test('SKILL.md') && fileExists(path.join(dirPath, entry.name, 'SKILL.md'))) {
          count++;
        }
      } else if (entry.isFile() && pattern.test(entry.name)) {
        count++;
      }
    }
    return count;
  } catch {
    return 0;
  }
}

/**
 * Get global npm prefix
 */
function getNpmPrefix(): string {
  try {
    return execSync('npm prefix -g', { encoding: 'utf8' }).trim();
  } catch {
    return '';
  }
}

// Main verification logic
logger.info('\n' + cyan + '  ═══════════════════════════════════════════════════════════' + reset);
logger.info(cyan + '  RELATÓRIO DE VERIFICAÇÃO FASE. v' + pkg.version + reset);
logger.info(cyan + '  ═══════════════════════════════════════════════════════════' + reset + '\n');

const issues: string[] = [];
const suggestions: Suggestion[] = [];

// 1. Check global package installation
logger.info(bold + '📦 INSTALAÇÃO DO PACOTE' + reset);
const npmPrefix = getNpmPrefix();
const globalPkgPath = npmPrefix ? path.join(npmPrefix, 'node_modules', 'fase-ai') : '';
const isInstalled = globalPkgPath && fileExists(globalPkgPath);

if (isInstalled) {
  logger.info(`  ${green}✓${reset} Status: ${green}INSTALADO${reset}`);
  try {
    const version = run('npx fase-ai --version 2>/dev/null') || pkg.version;
    logger.info(`  ${green}✓${reset} Versão: ${version}`);
    logger.info(`  ${green}✓${reset} Localização: ${globalPkgPath}`);
  } catch {
    logger.info(`  ${yellow}⚠${reset} Versão: ${pkg.version} (package.json)`);
    logger.info(`  ${yellow}⚠${reset} Localização: ${globalPkgPath}`);
  }
} else {
  logger.info(`  ${red}✗${reset} Status: ${red}NÃO INSTALADO${reset}`);
  issues.push('Pacote fase-ai não instalado globalmente');
  suggestions.push({
    priority: 1,
    issue: 'Pacote não instalado',
    command: 'npm install -g fase-ai@latest',
    description: 'Instalar FASE globalmente'
  });
}

logger.info('');

// 2. Check runtimes
logger.info(bold + '🔧 RUNTIMES CONFIGURADOS' + reset);

const runtimes: Runtime[] = [
  {
    name: 'Claude Code',
    configDir: path.join(os.homedir(), '.claude'),
    settingsFile: path.join(os.homedir(), '.claude', 'settings.json'),
    commandsDir: path.join(os.homedir(), '.claude', 'commands'),
    hooksDir: path.join(os.homedir(), '.claude', 'hooks'),
    commandPattern: /^fase-.*\.md$/,
    hookPattern: /^fase-.*\.js$/,
    installFlag: '--claude'
  },
  {
    name: 'OpenCode',
    configDir: path.join(os.homedir(), '.config', 'opencode'),
    settingsFile: path.join(os.homedir(), '.config', 'opencode', 'opencode.json'),
    commandsDir: path.join(os.homedir(), '.config', 'opencode', 'command'),
    commandPattern: /^fase-.*\.md$/,
    installFlag: '--opencode'
  },
  {
    name: 'Gemini',
    configDir: path.join(os.homedir(), '.gemini'),
    settingsFile: path.join(os.homedir(), '.gemini', 'settings.json'),
    commandsDir: path.join(os.homedir(), '.gemini', 'commands'),
    commandPattern: /^fase-.*\.toml$/,
    installFlag: '--gemini'
  },
  {
    name: 'Codex',
    configDir: path.join(os.homedir(), '.codex'),
    configFile: path.join(os.homedir(), '.codex', 'config.toml'),
    skillsDir: path.join(os.homedir(), '.codex', 'skills'),
    skillPattern: /^fase-/,
    installFlag: '--codex'
  },
  {
    name: 'GitHub Copilot',
    configDir: path.join(os.homedir(), '.github-copilot'),
    settingsFile: path.join(os.homedir(), '.github-copilot', '.copilot-settings.json'),
    commandsDir: path.join(os.homedir(), '.github-copilot', 'commands'),
    hooksDir: path.join(os.homedir(), '.github-copilot', 'hooks'),
    commandPattern: /^fase-.*\.md$/,
    hookPattern: /^fase-.*\.js$/,
    installFlag: '--github-copilot'
  }
];

for (const runtime of runtimes) {
  const isConfigured = dirExists(runtime.configDir);
  const statusColor = isConfigured ? green : yellow;
  const statusText = isConfigured ? 'CONFIGURADO' : 'NÃO_CONFIGURADO';

  logger.info(`\n  ${bold}${runtime.name}:${reset} ${statusColor}${statusText}${reset}`);

  if (isConfigured) {
    // Check settings/config
    let hasSettings = false;
    let settingsLabel = 'Settings';

    if (runtime.name === 'Codex') {
      hasSettings = runtime.configFile !== undefined && fileExists(runtime.configFile);
      settingsLabel = 'Config';
    } else {
      hasSettings = runtime.settingsFile !== undefined && fileExists(runtime.settingsFile);
    }

    if (hasSettings) {
      logger.info(`    ${green}✓${reset} ${settingsLabel}: OK`);
    } else {
      logger.info(`    ${yellow}⚠${reset} ${settingsLabel}: MISSING`);
      issues.push(`${runtime.name}: ${settingsLabel} ausente`);
      suggestions.push({
        priority: 2,
        issue: `${runtime.name} sem configuração`,
        command: `npx fase-ai ${runtime.installFlag}`,
        description: `Configurar FASE para ${runtime.name}`
      });
    }

    // Check commands/skills
    let commandCount = 0;
    let commandLabel = 'Comandos FASE';

    if (runtime.name === 'Codex') {
      commandCount = runtime.skillsDir !== undefined && runtime.skillPattern !== undefined
        ? countFilesRecursive(runtime.skillsDir, runtime.skillPattern)
        : 0;
      commandLabel = 'Skills FASE';
    } else if (runtime.commandsDir && runtime.commandPattern) {
      commandCount = countFiles(runtime.commandsDir, runtime.commandPattern);
    }

    if (commandCount > 0) {
      logger.info(`    ${green}✓${reset} ${commandLabel}: ${commandCount} encontrados`);
    } else {
      logger.info(`    ${red}✗${reset} ${commandLabel}: ${green}0${reset} encontrados`);
      issues.push(`${runtime.name}: Sem comandos FASE instalados`);
      suggestions.push({
        priority: 2,
        issue: `${runtime.name} sem comandos`,
        command: `npx fase-ai ${runtime.installFlag}`,
        description: `Instalar comandos FASE para ${runtime.name}`
      });
    }

    // Check hooks (Claude Code only)
    if (runtime.hooksDir) {
      const hookCount = countFiles(runtime.hooksDir, runtime.hookPattern || /^fase-.*\.js$/);
      if (hookCount > 0) {
        logger.info(`    ${green}✓${reset} Hooks: ${hookCount} encontrados`);
      } else {
        logger.info(`    ${yellow}⚠${reset} Hooks: ${yellow}0${reset} encontrados`);
        // Hooks are optional, so just a warning
      }
    }
  } else {
    logger.info(`    ${dim}- Settings: MISSING${reset}`);
    logger.info(`    ${dim}- Comandos FASE: 0 encontrados${reset}`);
  }
}

logger.info('');

logger.info('');

// 5. Summary
logger.info(cyan + '═══════════════════════════════════════════════════════════' + reset);

if (issues.length === 0) {
  logger.info(`\n  ${green}${bold}✅ FASE. está instalado e configurado corretamente!${reset}\n`);
} else {
  logger.info(`\n  ${red}${bold}⚠️  ${issues.length} PROBLEMA(S) ENCONTRADO(S):${reset}\n`);

  for (let i = 0; i < issues.length; i++) {
    logger.info(`  ${i + 1}. ${yellow}${issues[i]}${reset}`);
  }

  logger.info(`\n  ${bold}💡 AÇÕES SUGERIDAS:${reset}\n`);

  // Sort suggestions by priority
  suggestions.sort((a: Suggestion, b: Suggestion) => a.priority - b.priority);

  for (let i = 0; i < suggestions.length; i++) {
    const s = suggestions[i];
    logger.info(`  ${i + 1}. ${yellow}${s.issue}${reset}`);
    logger.info(`     ${dim}Comando:${reset} ${cyan}${s.command}${reset}`);
    logger.info(`     ${dim}${s.description}${reset}\n`);
  }
}

logger.info(cyan + '═══════════════════════════════════════════════════════════' + reset + '\n');

// Exit with appropriate code
process.exit(issues.length > 0 ? 1 : 0);
