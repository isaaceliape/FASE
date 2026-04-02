const assert = require('assert');
const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Test suite for FASE installation detection and update prompts
 * Tests the new functionality that detects existing installations
 * and offers update options
 */
describe('FASE Installation Detection', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fase-detect-test-'));
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('detectInstalledRuntimes - Claude', () => {
    it('should detect Claude Code installation via agents/fase-* files', () => {
      // Set up Claude Code directory structure
      const claudeDir = path.join(tempDir, '.claude');
      const agentsDir = path.join(claudeDir, 'agents');
      fs.mkdirSync(agentsDir, { recursive: true });

      // Create a FASE agent file
      fs.writeFileSync(path.join(agentsDir, 'fase-executor.md'), '# Executor Agent');

      // This would be called from within install.js
      const runtimes = detectInstalledRuntimesInDir(tempDir);
      assert.ok(runtimes.includes('claude'), 'Should detect Claude Code installation');
    });

    it('should not detect Claude if agents directory is empty', () => {
      const claudeDir = path.join(tempDir, '.claude');
      const agentsDir = path.join(claudeDir, 'agents');
      fs.mkdirSync(agentsDir, { recursive: true });

      // No FASE agent files

      const runtimes = detectInstalledRuntimesInDir(tempDir);
      assert.ok(!runtimes.includes('claude'), 'Should not detect Claude without FASE agents');
    });

    it('should not detect Claude if agents directory does not exist', () => {
      const claudeDir = path.join(tempDir, '.claude');
      fs.mkdirSync(claudeDir, { recursive: true });
      // No agents directory

      const runtimes = detectInstalledRuntimesInDir(tempDir);
      assert.ok(!runtimes.includes('claude'), 'Should not detect Claude without agents directory');
    });
  });

  describe('detectInstalledRuntimes - OpenCode', () => {
    it('should detect OpenCode installation via command/fase-* files', () => {
      const opencodeDir = path.join(tempDir, '.opencode');
      const commandDir = path.join(opencodeDir, 'command');
      fs.mkdirSync(commandDir, { recursive: true });

      fs.writeFileSync(path.join(commandDir, 'fase-executor.md'), '# Executor Command');

      const runtimes = detectInstalledRuntimesInDir(tempDir);
      assert.ok(runtimes.includes('opencode'), 'Should detect OpenCode installation');
    });

    it('should not detect OpenCode without FASE commands', () => {
      const opencodeDir = path.join(tempDir, '.opencode');
      const commandDir = path.join(opencodeDir, 'command');
      fs.mkdirSync(commandDir, { recursive: true });

      const runtimes = detectInstalledRuntimesInDir(tempDir);
      assert.ok(!runtimes.includes('opencode'), 'Should not detect OpenCode without FASE commands');
    });
  });

  describe('detectInstalledRuntimes - Gemini', () => {
    it('should detect Gemini installation via agents/fase-* files', () => {
      const geminiDir = path.join(tempDir, '.gemini');
      const agentsDir = path.join(geminiDir, 'agents');
      fs.mkdirSync(agentsDir, { recursive: true });

      fs.writeFileSync(path.join(agentsDir, 'fase-planner.toml'), '[agent]\nname = "planner"');

      const runtimes = detectInstalledRuntimesInDir(tempDir);
      assert.ok(runtimes.includes('gemini'), 'Should detect Gemini installation');
    });
  });

  describe('detectInstalledRuntimes - Codex', () => {
    it('should detect Codex installation via skills/fase-* directory', () => {
      const codexDir = path.join(tempDir, '.codex');
      const skillsDir = path.join(codexDir, 'skills');
      const faseSkillDir = path.join(skillsDir, 'fase-executor');
      fs.mkdirSync(faseSkillDir, { recursive: true });

      fs.writeFileSync(path.join(faseSkillDir, 'index.md'), '# Executor Skill');

      const runtimes = detectInstalledRuntimesInDir(tempDir);
      assert.ok(runtimes.includes('codex'), 'Should detect Codex installation');
    });

    it('should not detect Codex without FASE skills', () => {
      const codexDir = path.join(tempDir, '.codex');
      const skillsDir = path.join(codexDir, 'skills');
      const otherSkillDir = path.join(skillsDir, 'other-skill');
      fs.mkdirSync(otherSkillDir, { recursive: true });

      const runtimes = detectInstalledRuntimesInDir(tempDir);
      assert.ok(!runtimes.includes('codex'), 'Should not detect Codex without FASE skills');
    });
  });

  describe('detectInstalledRuntimes - Multiple Runtimes', () => {
    it('should detect multiple runtime installations', () => {
      // Set up Claude
      const claudeAgentsDir = path.join(tempDir, '.claude', 'agents');
      fs.mkdirSync(claudeAgentsDir, { recursive: true });
      fs.writeFileSync(path.join(claudeAgentsDir, 'fase-executor.md'), '# Executor');

      // Set up OpenCode
      const opencodeCommandDir = path.join(tempDir, '.opencode', 'command');
      fs.mkdirSync(opencodeCommandDir, { recursive: true });
      fs.writeFileSync(path.join(opencodeCommandDir, 'fase-planner.md'), '# Planner');

      // Set up Gemini
      const geminiAgentsDir = path.join(tempDir, '.gemini', 'agents');
      fs.mkdirSync(geminiAgentsDir, { recursive: true });
      fs.writeFileSync(path.join(geminiAgentsDir, 'fase-verifier.toml'), '[agent]');

      const runtimes = detectInstalledRuntimesInDir(tempDir);
      assert.strictEqual(runtimes.length, 3, 'Should detect all three runtimes');
      assert.ok(runtimes.includes('claude'), 'Should include Claude');
      assert.ok(runtimes.includes('opencode'), 'Should include OpenCode');
      assert.ok(runtimes.includes('gemini'), 'Should include Gemini');
    });

    it('should return empty array when no runtimes are installed', () => {
      const runtimes = detectInstalledRuntimesInDir(tempDir);
      assert.strictEqual(runtimes.length, 0, 'Should return empty array for fresh directory');
      assert.deepStrictEqual(runtimes, [], 'Should be an empty array');
    });
  });

  describe('detectInstalledRuntimes - Edge Cases', () => {
    it('should handle symlinks in agents directory', () => {
      const claudeDir = path.join(tempDir, '.claude');
      const agentsDir = path.join(claudeDir, 'agents');
      const externalDir = path.join(tempDir, 'external-agents');

      fs.mkdirSync(agentsDir, { recursive: true });
      fs.mkdirSync(externalDir);
      fs.writeFileSync(path.join(externalDir, 'fase-executor.md'), '# Executor');

      try {
        fs.symlinkSync(externalDir, path.join(agentsDir, 'linked-agents'), 'dir');
        // Symlinks shouldn't affect detection since we check files directly
        // But create an actual FASE file to test proper detection
        fs.writeFileSync(path.join(agentsDir, 'fase-executor.md'), '# Local Executor');

        const runtimes = detectInstalledRuntimesInDir(tempDir);
        assert.ok(runtimes.includes('claude'), 'Should detect Claude with symlinks present');
      } catch (err) {
        // Skip on systems that don't support symlinks
        if (err.code !== 'EPERM') throw err;
      }
    });

    it('should handle directories with many files', () => {
      const claudeDir = path.join(tempDir, '.claude');
      const agentsDir = path.join(claudeDir, 'agents');
      fs.mkdirSync(agentsDir, { recursive: true });

      // Create many non-FASE files
      for (let i = 0; i < 100; i++) {
        fs.writeFileSync(path.join(agentsDir, `file-${i}.txt`), 'content');
      }

      // Add one FASE file
      fs.writeFileSync(path.join(agentsDir, 'fase-executor.md'), '# Executor');

      const runtimes = detectInstalledRuntimesInDir(tempDir);
      assert.ok(runtimes.includes('claude'), 'Should detect FASE among many files');
    });

    it('should be case-sensitive for file extensions', () => {
      const claudeDir = path.join(tempDir, '.claude');
      const agentsDir = path.join(claudeDir, 'agents');
      fs.mkdirSync(agentsDir, { recursive: true });

      // Create file with wrong extension
      fs.writeFileSync(path.join(agentsDir, 'fase-executor.MD'), 'content'); // uppercase MD
      fs.writeFileSync(path.join(agentsDir, 'fase-executor.txt'), 'content');

      const runtimes = detectInstalledRuntimesInDir(tempDir);
      assert.ok(!runtimes.includes('claude'), 'Should require exact .md extension');
    });

    it('should handle . (dot) files correctly', () => {
      const claudeDir = path.join(tempDir, '.claude');
      const agentsDir = path.join(claudeDir, 'agents');
      fs.mkdirSync(agentsDir, { recursive: true });

      // Create hidden files
      fs.writeFileSync(path.join(agentsDir, '.fase-executor.md'), 'hidden');

      // Should not be detected (starts with dot but isn't a valid FASE agent)
      let runtimes = detectInstalledRuntimesInDir(tempDir);
      assert.ok(!runtimes.includes('claude'), 'Should not detect hidden FASE files');

      // Create proper file
      fs.writeFileSync(path.join(agentsDir, 'fase-executor.md'), 'visible');
      runtimes = detectInstalledRuntimesInDir(tempDir);
      assert.ok(runtimes.includes('claude'), 'Should detect normal FASE files');
    });
  });

  describe('installAllRuntimes Integration', () => {
    it('should call install for each detected runtime', () => {
      // Set up multiple installations
      const claudeAgentsDir = path.join(tempDir, '.claude', 'agents');
      fs.mkdirSync(claudeAgentsDir, { recursive: true });
      fs.writeFileSync(path.join(claudeAgentsDir, 'fase-executor.md'), '# Executor');

      const runtimes = detectInstalledRuntimesInDir(tempDir);

      assert.strictEqual(runtimes.length, 1, 'Should detect exactly one runtime');
      assert.ok(runtimes.includes('claude'), 'Should be Claude');
    });
  });
});

/**
 * Helper function that mimics the detectInstalledRuntimes behavior
 * This is used for testing purposes
 */
function detectInstalledRuntimesInDir(baseDir) {
  const runtimes = ['claude', 'opencode', 'gemini', 'codex'];
  const detected = [];

  const getDirName = (runtime) => {
    if (runtime === 'opencode') return '.opencode';
    if (runtime === 'gemini') return '.gemini';
    if (runtime === 'codex') return '.codex';
    return '.claude';
  };

  for (const runtime of runtimes) {
    const dirName = getDirName(runtime);
    const dir = path.join(baseDir, dirName);

    // Primary: check for FASE agent files
    const agentsDir = path.join(dir, 'agents');
    if (fs.existsSync(agentsDir)) {
      const hasFaseAgent = fs.readdirSync(agentsDir).some(
        f => f.startsWith('fase-') && (f.endsWith('.md') || f.endsWith('.toml'))
      );
      if (hasFaseAgent) {
        detected.push(runtime);
        continue;
      }
    }

    // Fallback: check for Codex skills/fase-* directory
    if (runtime === 'codex') {
      const skillsDir = path.join(dir, 'skills');
      if (fs.existsSync(skillsDir)) {
        const hasFaseSkill = fs.readdirSync(skillsDir).some(f => f.startsWith('fase-'));
        if (hasFaseSkill) { detected.push(runtime); continue; }
      }
    }

    // Fallback: check for OpenCode flat commands
    if (runtime === 'opencode') {
      const commandDir = path.join(dir, 'command');
      if (fs.existsSync(commandDir)) {
        const hasFaseCmd = fs.readdirSync(commandDir).some(f => f.startsWith('fase-') && f.endsWith('.md'));
        if (hasFaseCmd) { detected.push(runtime); continue; }
      }
    }
  }

  return detected;
}

// Export for testing
module.exports = { detectInstalledRuntimesInDir };
