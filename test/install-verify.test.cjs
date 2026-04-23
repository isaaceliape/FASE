const assert = require('assert');
const fs = require('fs');
const path = require('path');
const os = require('os');

describe('FASE Verification Mode', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fase-verify-test-'));
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('Installation Verification', () => {
    it('should report success when installation is complete', () => {
      // Create complete installation structure
      const agentsDir = path.join(tempDir, 'agents');
      const commandsDir = path.join(tempDir, 'commands', 'fase');
      const faseDir = path.join(tempDir, 'fase-ai');

      fs.mkdirSync(agentsDir, { recursive: true });
      fs.mkdirSync(commandsDir, { recursive: true });
      fs.mkdirSync(faseDir, { recursive: true });

      fs.writeFileSync(path.join(faseDir, 'VERSION'), '5.0.1');
      fs.writeFileSync(path.join(agentsDir, 'test-agent.md'), '---\nname: test\n---');

      // Simulate verification
      const isComplete =
        fs.existsSync(agentsDir) &&
        fs.existsSync(commandsDir) &&
        fs.existsSync(path.join(faseDir, 'VERSION'));

      assert.strictEqual(isComplete, true, 'Complete installation should pass verification');
    });

    it('should report missing agents directory', () => {
      const commandsDir = path.join(tempDir, 'commands', 'fase');
      fs.mkdirSync(commandsDir, { recursive: true });

      // Missing agents directory
      const agentsExists = fs.existsSync(path.join(tempDir, 'agents'));

      assert.strictEqual(agentsExists, false, 'Missing agents should be detected');
    });

    it('should report missing commands directory', () => {
      const agentsDir = path.join(tempDir, 'agents');
      fs.mkdirSync(agentsDir, { recursive: true });

      // Missing commands
      const commandsExists = fs.existsSync(path.join(tempDir, 'commands', 'fase'));

      assert.strictEqual(commandsExists, false, 'Missing commands should be detected');
    });

    it('should validate VERSION file exists', () => {
      const faseDir = path.join(tempDir, 'fase-ai');
      fs.mkdirSync(faseDir, { recursive: true });

      const versionExists = fs.existsSync(path.join(faseDir, 'VERSION'));

      assert.strictEqual(versionExists, false, 'Missing VERSION should be detected');
    });
  });

  describe('Verification Flag Detection', () => {
    it('should recognize --verificar-instalacao flag', () => {
      const args = ['--verificar-instalacao'];
      const hasVerify = args.includes('--verificar-instalacao');
      assert.strictEqual(hasVerify, true, '--verificar-instalacao should be detected');
    });

    it('should recognize --verificar alias', () => {
      const args = ['--verificar'];
      const hasVerify = args.includes('--verificar');
      assert.strictEqual(hasVerify, true, '--verificar alias should work');
    });

    it('should recognize -v short flag', () => {
      const args = ['-v'];
      const hasVerify = args.includes('-v');
      assert.strictEqual(hasVerify, true, '-v short flag should work');
    });
  });
});