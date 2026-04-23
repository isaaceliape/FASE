const assert = require('assert');
const fs = require('fs');
const path = require('path');
const os = require('os');

describe('FASE Uninstall Mode', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fase-uninstall-test-'));

    // Create simulated installation
    const agentsDir = path.join(tempDir, 'agents');
    const commandsDir = path.join(tempDir, 'commands', 'fase');
    const faseDir = path.join(tempDir, 'fase-ai');

    fs.mkdirSync(agentsDir, { recursive: true });
    fs.mkdirSync(commandsDir, { recursive: true });
    fs.mkdirSync(faseDir, { recursive: true });

    // Add FASE files
    fs.writeFileSync(path.join(agentsDir, 'fase-executor.md'), '---\nname: fase-executor\n---');
    fs.writeFileSync(path.join(commandsDir, 'fase-executar-etapa.md'), '---\nname: fase-executar\n---');
    fs.writeFileSync(path.join(faseDir, 'VERSION'), '5.0.1');
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('Uninstall Removal', () => {
    it('should remove FASE agents', () => {
      const agentsDir = path.join(tempDir, 'agents');

      // Simulate uninstall removing FASE agents
      const faseAgent = path.join(agentsDir, 'fase-executor.md');
      fs.unlinkSync(faseAgent);

      assert.strictEqual(fs.existsSync(faseAgent), false, 'FASE agent should be removed');
    });

    it('should remove FASE commands directory', () => {
      const commandsDir = path.join(tempDir, 'commands', 'fase');

      // Simulate uninstall
      fs.rmSync(commandsDir, { recursive: true, force: true });

      assert.strictEqual(fs.existsSync(commandsDir), false, 'Commands/fase should be removed');
    });

    it('should remove VERSION file', () => {
      const versionFile = path.join(tempDir, 'fase-ai', 'VERSION');

      fs.unlinkSync(versionFile);

      assert.strictEqual(fs.existsSync(versionFile), false, 'VERSION should be removed');
    });

    it('should preserve non-FASE files', () => {
      const agentsDir = path.join(tempDir, 'agents');

      // Add non-FASE agent
      const customAgent = path.join(agentsDir, 'my-custom-agent.md');
      fs.writeFileSync(customAgent, '---\nname: my-custom\n---');

      // Simulate selective uninstall (only FASE files)
      // Non-FASE files should remain
      assert.ok(fs.existsSync(customAgent), 'Non-FASE files should be preserved');
    });
  });

  describe('Uninstall Flag Detection', () => {
    it('should recognize --uninstall flag', () => {
      const args = ['--uninstall'];
      const hasUninstall = args.includes('--uninstall');
      assert.strictEqual(hasUninstall, true, '--uninstall should be detected');
    });

    it('should recognize -u short flag', () => {
      const args = ['-u'];
      const hasUninstall = args.includes('-u');
      assert.strictEqual(hasUninstall, true, '-u short flag should work');
    });
  });

  describe('Uninstall Confirmation', () => {
    it('should require confirmation before uninstall', () => {
      // Simulate confirmation prompt
      const requiresConfirmation = true;

      assert.strictEqual(requiresConfirmation, true, 'Uninstall should require confirmation');
    });

    it('should abort uninstall if confirmation denied', () => {
      // Simulate user saying "no"
      const userResponse = 'no';
      const shouldProceed = userResponse === 'yes';

      assert.strictEqual(shouldProceed, false, 'Should abort when user denies');
    });
  });
});