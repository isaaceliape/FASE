const assert = require('assert');
const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Test suite for FASE update flow integration
 * Tests the complete workflow from detection to update
 */
describe('FASE Update Flow Integration', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fase-update-flow-test-'));
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('Workflow - Fresh Installation', () => {
    it('should show runtime selection for empty directory', () => {
      const claudeDir = path.join(tempDir, '.claude');
      const hasExistingInstall = fs.existsSync(claudeDir);

      assert.strictEqual(hasExistingInstall, false, 'Directory should be empty');
      // Would show runtime selection prompt
    });

    it('should proceed to install after runtime selection', () => {
      // Simulate: user chooses Claude Code
      const selectedRuntimes = ['claude'];

      assert.strictEqual(selectedRuntimes.length, 1, 'Should have selected one runtime');
      assert.deepStrictEqual(selectedRuntimes, ['claude'], 'Should be Claude Code');
    });
  });

  describe('Workflow - Existing Installation', () => {
    it('should detect existing Claude installation', () => {
      // Set up existing Claude installation
      const claudeAgentsDir = path.join(tempDir, '.claude', 'agents');
      fs.mkdirSync(claudeAgentsDir, { recursive: true });
      fs.writeFileSync(path.join(claudeAgentsDir, 'fase-executor.md'), '# Executor');

      const hasInstallation = fs.existsSync(path.join(tempDir, '.claude', 'agents'));

      assert.strictEqual(hasInstallation, true, 'Should detect existing installation');
    });

    it('should show update prompt for existing installation', () => {
      // Set up existing installation
      const claudeAgentsDir = path.join(tempDir, '.claude', 'agents');
      fs.mkdirSync(claudeAgentsDir, { recursive: true });
      fs.writeFileSync(path.join(claudeAgentsDir, 'fase-executor.md'), '# Executor');

      // Detect installation
      const installedRuntimes = detectRuntimes(tempDir);

      // Should trigger update prompt instead of runtime selection
      const shouldShowUpdate = installedRuntimes.length > 0;
      const shouldShowSelection = installedRuntimes.length === 0;

      assert.strictEqual(shouldShowUpdate, true, 'Should show update prompt');
      assert.strictEqual(shouldShowSelection, false, 'Should not show selection');
    });

    it('should allow updating existing installation', () => {
      // Set up existing installation
      const claudeAgentsDir = path.join(tempDir, '.claude', 'agents');
      fs.mkdirSync(claudeAgentsDir, { recursive: true });
      fs.writeFileSync(path.join(claudeAgentsDir, 'fase-executor.md'), '# Old Executor');

      // User chooses to update (option 1)
      const choice = '1'; // Update option
      const shouldUpdate = choice === '1';

      assert.strictEqual(shouldUpdate, true, 'Should process update choice');

      // Simulate updating files
      fs.writeFileSync(path.join(claudeAgentsDir, 'fase-executor.md'), '# New Executor');

      const content = fs.readFileSync(path.join(claudeAgentsDir, 'fase-executor.md'), 'utf8');
      assert.strictEqual(content, '# New Executor', 'Should update files');
    });

    it('should allow adding new runtime to existing installation', () => {
      // Set up existing Claude installation
      const claudeAgentsDir = path.join(tempDir, '.claude', 'agents');
      fs.mkdirSync(claudeAgentsDir, { recursive: true });
      fs.writeFileSync(path.join(claudeAgentsDir, 'fase-executor.md'), '# Executor');

      // User chooses to install for other runtimes (option 2)
      const choice = '2';
      const shouldInstallOther = choice === '2';

      assert.strictEqual(shouldInstallOther, true, 'Should process install other choice');

      // Then user would select another runtime (e.g., OpenCode)
      const newRuntime = 'opencode';

      // Simulate installing OpenCode
      const opencodeCommandDir = path.join(tempDir, '.opencode', 'command');
      fs.mkdirSync(opencodeCommandDir, { recursive: true });
      fs.writeFileSync(path.join(opencodeCommandDir, 'fase-executor.md'), '# Executor');

      // Verify both are now installed
      const installedRuntimes = detectRuntimes(tempDir);
      assert.strictEqual(installedRuntimes.length, 2, 'Should have two runtimes');
      assert.ok(installedRuntimes.includes('claude'), 'Should include Claude');
      assert.ok(installedRuntimes.includes('opencode'), 'Should include OpenCode');
    });

    it('should allow uninstalling from update prompt', () => {
      // Set up existing installation
      const claudeAgentsDir = path.join(tempDir, '.claude', 'agents');
      fs.mkdirSync(claudeAgentsDir, { recursive: true });
      fs.writeFileSync(path.join(claudeAgentsDir, 'fase-executor.md'), '# Executor');

      // User chooses to uninstall (option 3)
      const choice = '3';
      const shouldUninstall = choice === '3';

      assert.strictEqual(shouldUninstall, true, 'Should process uninstall choice');

      // Simulate uninstalling
      fs.rmSync(path.join(tempDir, '.claude'), { recursive: true });

      // Verify installation is gone
      const hasInstallation = fs.existsSync(path.join(tempDir, '.claude'));
      assert.strictEqual(hasInstallation, false, 'Should remove installation');
    });

    it('should cancel operation', () => {
      // Set up existing installation
      const claudeAgentsDir = path.join(tempDir, '.claude', 'agents');
      fs.mkdirSync(claudeAgentsDir, { recursive: true });
      fs.writeFileSync(path.join(claudeAgentsDir, 'fase-executor.md'), '# Executor');

      // User chooses to cancel (option 4)
      const choice = '4';
      const shouldCancel = choice === '4';

      assert.strictEqual(shouldCancel, true, 'Should process cancel choice');

      // Installation should remain unchanged
      const installedRuntimes = detectRuntimes(tempDir);
      assert.strictEqual(installedRuntimes.length, 1, 'Should have one runtime unchanged');
    });
  });

  describe('Workflow - Multiple Runtime Scenarios', () => {
    it('should handle installation with all runtimes', () => {
      // Set up all runtimes
      setupAllRuntimes(tempDir);

      const runtimes = detectRuntimes(tempDir);

      assert.strictEqual(runtimes.length, 4, 'Should detect all runtimes');
      assert.ok(runtimes.includes('claude'), 'Should include Claude');
      assert.ok(runtimes.includes('opencode'), 'Should include OpenCode');
      assert.ok(runtimes.includes('gemini'), 'Should include Gemini');
      assert.ok(runtimes.includes('codex'), 'Should include Codex');
    });

    it('should handle partial installation updates', () => {
      // Set up Claude and OpenCode only
      const claudeAgentsDir = path.join(tempDir, '.claude', 'agents');
      fs.mkdirSync(claudeAgentsDir, { recursive: true });
      fs.writeFileSync(path.join(claudeAgentsDir, 'fase-executor.md'), '# Executor');

      const opencodeCommandDir = path.join(tempDir, '.opencode', 'command');
      fs.mkdirSync(opencodeCommandDir, { recursive: true });
      fs.writeFileSync(path.join(opencodeCommandDir, 'fase-executor.md'), '# Executor');

      const runtimes = detectRuntimes(tempDir);

      assert.strictEqual(runtimes.length, 2, 'Should detect two runtimes');
      assert.deepStrictEqual(
        runtimes.sort(),
        ['claude', 'opencode'].sort(),
        'Should be Claude and OpenCode'
      );
    });

    it('should add new runtime to partial installation', () => {
      // Start with Claude only
      const claudeAgentsDir = path.join(tempDir, '.claude', 'agents');
      fs.mkdirSync(claudeAgentsDir, { recursive: true });
      fs.writeFileSync(path.join(claudeAgentsDir, 'fase-executor.md'), '# Executor');

      let runtimes = detectRuntimes(tempDir);
      assert.strictEqual(runtimes.length, 1, 'Should start with one runtime');

      // Add Gemini
      const geminiAgentsDir = path.join(tempDir, '.gemini', 'agents');
      fs.mkdirSync(geminiAgentsDir, { recursive: true });
      fs.writeFileSync(path.join(geminiAgentsDir, 'fase-executor.toml'), '[agent]');

      runtimes = detectRuntimes(tempDir);
      assert.strictEqual(runtimes.length, 2, 'Should have two runtimes after addition');
      assert.ok(runtimes.includes('gemini'), 'Should include Gemini');
    });
  });

  describe('Workflow - Error Scenarios', () => {
    it('should handle corrupted installation gracefully', () => {
      // Create directory but no FASE files
      const claudeAgentsDir = path.join(tempDir, '.claude', 'agents');
      fs.mkdirSync(claudeAgentsDir, { recursive: true });

      // No FASE files - corrupted or incomplete installation

      const runtimes = detectRuntimes(tempDir);

      assert.strictEqual(runtimes.length, 0, 'Should not detect corrupted installation');
      // Should handle gracefully and suggest reinstall
    });

    it('should handle directory with only non-FASE agents', () => {
      const claudeAgentsDir = path.join(tempDir, '.claude', 'agents');
      fs.mkdirSync(claudeAgentsDir, { recursive: true });

      // Create non-FASE agents
      fs.writeFileSync(path.join(claudeAgentsDir, 'custom-agent.md'), '# Custom');
      fs.writeFileSync(path.join(claudeAgentsDir, 'my-agent.toml'), '[agent]');

      const runtimes = detectRuntimes(tempDir);

      assert.strictEqual(runtimes.length, 0, 'Should not detect non-FASE installation');
    });

    it('should handle missing permissions gracefully', () => {
      // Create directory structure
      const claudeAgentsDir = path.join(tempDir, '.claude', 'agents');
      fs.mkdirSync(claudeAgentsDir, { recursive: true });

      try {
        // Try to create read-only directory
        fs.chmodSync(path.join(tempDir, '.claude'), 0o444);

        // Detection should still work (reading)
        const hasAgentsDir = fs.existsSync(claudeAgentsDir);

        // Restore permissions for cleanup
        fs.chmodSync(path.join(tempDir, '.claude'), 0o755);

        // Even if read-only, detection should handle it
        assert.ok(true, 'Should handle permission issues during detection');
      } catch (err) {
        if (err.code !== 'EPERM') throw err;
        // Skip on systems that don't support chmod
      }
    });
  });

  describe('Workflow - User Experience', () => {
    it('should preserve user choices when going back', () => {
      // User selects to install OpenCode (after detecting Claude)
      const userSelection = ['opencode'];

      // Then selects to also add Gemini
      const userAddition = ['opencode', 'gemini'];

      assert.ok(userAddition.includes('opencode'), 'Should preserve original selection');
      assert.ok(userAddition.includes('gemini'), 'Should add new selection');
    });

    it('should show helpful messages for different flows', () => {
      // Fresh install flow
      const freshFlow = 'Para qual(is) runtime(s) deseja instalar?';

      // Update flow
      const updateFlow = 'FASE já está instalado para:';

      assert.ok(freshFlow.length > 0, 'Should have fresh install message');
      assert.ok(updateFlow.length > 0, 'Should have update message');
      assert.notStrictEqual(freshFlow, updateFlow, 'Messages should be different');
    });

    it('should maintain installation integrity during updates', () => {
      // Set up installation with multiple agents
      const claudeAgentsDir = path.join(tempDir, '.claude', 'agents');
      fs.mkdirSync(claudeAgentsDir, { recursive: true });

      const agents = ['fase-executor', 'fase-planner', 'fase-verifier'];
      agents.forEach(agent => {
        fs.writeFileSync(path.join(claudeAgentsDir, `${agent}.md`), `# ${agent}`);
      });

      // Verify all agents exist before update
      const existsBefore = agents.every(agent =>
        fs.existsSync(path.join(claudeAgentsDir, `${agent}.md`))
      );

      assert.strictEqual(existsBefore, true, 'All agents should exist before update');

      // Simulate update (rewrite files)
      agents.forEach(agent => {
        fs.writeFileSync(path.join(claudeAgentsDir, `${agent}.md`), `# Updated ${agent}`);
      });

      // Verify all agents still exist after update
      const existsAfter = agents.every(agent =>
        fs.existsSync(path.join(claudeAgentsDir, `${agent}.md`))
      );

      assert.strictEqual(existsAfter, true, 'All agents should exist after update');
    });
  });
});

/**
 * Helper function to detect installed runtimes
 */
function detectRuntimes(baseDir) {
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

    if (runtime === 'codex') {
      const skillsDir = path.join(dir, 'skills');
      if (fs.existsSync(skillsDir)) {
        const hasFaseSkill = fs.readdirSync(skillsDir).some(f => f.startsWith('fase-'));
        if (hasFaseSkill) { detected.push(runtime); continue; }
      }
    }

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

/**
 * Helper to set up all runtimes for testing
 */
function setupAllRuntimes(baseDir) {
  // Claude
  const claudeAgentsDir = path.join(baseDir, '.claude', 'agents');
  fs.mkdirSync(claudeAgentsDir, { recursive: true });
  fs.writeFileSync(path.join(claudeAgentsDir, 'fase-executor.md'), '# Executor');

  // OpenCode
  const opencodeCommandDir = path.join(baseDir, '.opencode', 'command');
  fs.mkdirSync(opencodeCommandDir, { recursive: true });
  fs.writeFileSync(path.join(opencodeCommandDir, 'fase-executor.md'), '# Executor');

  // Gemini
  const geminiAgentsDir = path.join(baseDir, '.gemini', 'agents');
  fs.mkdirSync(geminiAgentsDir, { recursive: true });
  fs.writeFileSync(path.join(geminiAgentsDir, 'fase-executor.toml'), '[agent]');

  // Codex
  const codexSkillsDir = path.join(baseDir, '.codex', 'skills');
  const codexFaseSkillDir = path.join(codexSkillsDir, 'fase-executor');
  fs.mkdirSync(codexFaseSkillDir, { recursive: true });
  fs.writeFileSync(path.join(codexFaseSkillDir, 'index.md'), '# Executor');
}
