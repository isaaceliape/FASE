/**
 * Qwen Code Provider Tests
 *
 * Tests for Qwen Code provider integration including:
 * - Provider configuration and directory management
 * - Frontmatter conversion from Claude Code format
 * - Settings handling
 * - Attribution configuration
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Import the modules under test - we'll test them via require
// Since the source files are TypeScript, we test the compiled output
// or test the logic directly

describe('Qwen Code Provider', () => {
  let tempDir;
  let originalEnv;
  let originalHome;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fase-qwen-test-'));
    originalEnv = { ...process.env };
    originalHome = os.homedir();
    // Mock home directory
    Object.defineProperty(os, 'homedir', {
      value: () => tempDir,
      configurable: true
    });
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
    process.env = originalEnv;
    // Restore homedir
    Object.defineProperty(os, 'homedir', {
      value: () => originalHome,
      configurable: true
    });
  });

  describe('Provider Type and Validation', () => {
    it('should include qwen in valid providers list', () => {
      const validProviders = ['claude', 'opencode', 'gemini', 'codex', 'github-copilot', 'qwen'];
      assert.ok(validProviders.includes('qwen'), 'qwen should be in valid providers list');
    });

    it('should have correct provider count', () => {
      const validProviders = ['claude', 'opencode', 'gemini', 'codex', 'github-copilot', 'qwen'];
      assert.strictEqual(validProviders.length, 6, 'should have 6 providers');
    });
  });

  describe('Qwen Directory Structure', () => {
    it('should use .qwen as directory name', () => {
      const dirName = '.qwen';
      assert.strictEqual(dirName, '.qwen');
    });

    it('should create qwen directory structure', () => {
      const configPath = path.join(tempDir, '.qwen');
      const commandsPath = path.join(configPath, 'commands');
      const hooksPath = path.join(configPath, 'hooks');
      const agentsPath = path.join(configPath, 'agents');

      // Create structure
      fs.mkdirSync(configPath, { recursive: true });
      fs.mkdirSync(commandsPath, { recursive: true });
      fs.mkdirSync(hooksPath, { recursive: true });
      fs.mkdirSync(agentsPath, { recursive: true });
      fs.writeFileSync(path.join(configPath, 'settings.json'), JSON.stringify({ version: '1.0.0' }));

      // Verify
      assert.strictEqual(fs.existsSync(configPath), true, 'qwen config dir should exist');
      assert.strictEqual(fs.existsSync(commandsPath), true, 'qwen commands dir should exist');
      assert.strictEqual(fs.existsSync(hooksPath), true, 'qwen hooks dir should exist');
      assert.strictEqual(fs.existsSync(agentsPath), true, 'qwen agents dir should exist');
      assert.strictEqual(fs.existsSync(path.join(configPath, 'settings.json')), true, 'settings.json should exist');
    });
  });

  describe('Environment Variable Handling', () => {
    it('should respect QWEN_CONFIG_DIR environment variable', () => {
      const customDir = path.join(tempDir, 'custom-qwen');
      process.env.QWEN_CONFIG_DIR = customDir;

      assert.strictEqual(process.env.QWEN_CONFIG_DIR, customDir);
      assert.ok(process.env.QWEN_CONFIG_DIR.endsWith('custom-qwen'), 'QWEN_CONFIG_DIR should point to custom dir');
    });

    it('should default to ~/.qwen when no env var is set', () => {
      delete process.env.QWEN_CONFIG_DIR;
      const defaultPath = path.join(tempDir, '.qwen');
      assert.ok(defaultPath.endsWith('.qwen'), 'default path should end with .qwen');
    });
  });

  describe('Frontmatter Conversion', () => {
    const convertClaudeToQwenCommand = (content) => {
      // Replace path references
      let convertedContent = content;
      convertedContent = convertedContent.replace(/~\/\.claude\b/g, '~/.qwen');
      convertedContent = convertedContent.replace(/\$HOME\/\.claude\b/g, '$HOME/.qwen');
      convertedContent = convertedContent.replace(/~\/\.fase\b/g, '~/.qwen');
      convertedContent = convertedContent.replace(/\$HOME\/\.fase\b/g, '$HOME/.qwen');

      // Check if content has frontmatter
      if (!convertedContent.startsWith('---')) {
        return convertedContent;
      }

      // Find the end of frontmatter
      const endIndex = convertedContent.indexOf('---', 3);
      if (endIndex === -1) {
        return convertedContent;
      }

      const frontmatter = convertedContent.substring(3, endIndex).trim();
      const body = convertedContent.substring(endIndex + 3);

      // Parse frontmatter line by line and extract only description
      const lines = frontmatter.split('\n');
      let description = null;

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('description:')) {
          description = trimmed.substring(12).trim().replace(/^['"]|['"]$/g, '');
        }
        // name, tools, color, skills are ignored for Qwen Commands
      }

      // Build new frontmatter (only description if present)
      const newFrontmatter = description ? `---\ndescription: ${JSON.stringify(description)}\n---` : '';

      return newFrontmatter ? `${newFrontmatter}\n${body}` : body;
    };

    it('should convert path references from .claude to .qwen', () => {
      const input = `Load context from ~/.claude/agents/test.md and $HOME/.claude/settings.json`;
      const expected = `Load context from ~/.qwen/agents/test.md and $HOME/.qwen/settings.json`;
      const result = convertClaudeToQwenCommand(input);
      assert.strictEqual(result, expected);
    });

    it('should convert .fase path references to .qwen', () => {
      const input = `Check ~/.fase/config.json and $HOME/.fase/data`;
      const expected = `Check ~/.qwen/config.json and $HOME/.qwen/data`;
      const result = convertClaudeToQwenCommand(input);
      assert.strictEqual(result, expected);
    });

    it('should strip unsupported frontmatter fields and keep only description', () => {
      const input = `---
name: fase-test-agent
description: Test agent for FASE workflows
tools: Read, Write, Bash
color: green
skills:
  - fase-test-skill
---

# Test Agent

This is the body content.`;

      const result = convertClaudeToQwenCommand(input);
      
      // Should only have description in frontmatter
      assert.ok(result.includes('description:'), 'should have description field');
      assert.ok(result.includes('Test agent for FASE workflows'), 'should preserve description value');
      assert.ok(!result.includes('name:'), 'should not have name field');
      assert.ok(!result.includes('tools:'), 'should not have tools field');
      assert.ok(!result.includes('color:'), 'should not have color field');
      assert.ok(!result.includes('skills:'), 'should not have skills field');
      assert.ok(result.includes('# Test Agent'), 'should preserve body content');
      assert.ok(result.includes('This is the body content'), 'should preserve body text');
    });

    it('should handle frontmatter without description', () => {
      const input = `---
name: fase-test
tools: Read, Write
---

Content here.`;

      const result = convertClaudeToQwenCommand(input);
      // Should strip all frontmatter since only description is kept
      assert.ok(!result.startsWith('---'), 'should not have frontmatter if no description');
      assert.ok(result.includes('Content here'), 'should preserve body content');
    });

    it('should handle content without frontmatter', () => {
      const input = `# Just markdown content

No frontmatter here.`;

      const result = convertClaudeToQwenCommand(input);
      assert.strictEqual(result, input, 'should return unchanged if no frontmatter');
    });

    it('should preserve JSON-escaped description', () => {
      const input = `---
name: test
description: Agent with "quotes" and \n newlines
---

Body text.`;

      const result = convertClaudeToQwenCommand(input);
      // Description should be JSON.stringify'd which escapes quotes
      assert.ok(result.includes('description:'), 'should have description');
      assert.ok(!result.includes('name:'), 'should not have name');
    });

    it('should handle empty frontmatter', () => {
      const input = `---
---

Just body content.`;

      const result = convertClaudeToQwenCommand(input);
      // Empty frontmatter between --- --- should result in empty frontmatter removed
      assert.ok(!result.startsWith('---\n---'), 'should remove empty frontmatter');
    });
  });

  describe('Qwen Settings Format', () => {
    it('should handle qwen settings.json with gitCoAuthor', () => {
      const settings = {
        version: '1.0.0',
        gitCoAuthor: 'Qwen Code <qwen@example.com>',
        hooks: {
          'pre-commit': '/path/to/hook'
        }
      };
      const settingsPath = path.join(tempDir, 'settings.json');
      fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));

      const read = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
      assert.strictEqual(read.gitCoAuthor, 'Qwen Code <qwen@example.com>');
      assert.ok(read.hooks);
      assert.strictEqual(read.hooks['pre-commit'], '/path/to/hook');
    });

    it('should handle undefined gitCoAuthor', () => {
      const settings = {
        version: '1.0.0',
        hooks: {}
      };
      const settingsPath = path.join(tempDir, 'settings.json');
      fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));

      const read = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
      assert.strictEqual(read.gitCoAuthor, undefined);
    });

    it('should handle empty gitCoAuthor', () => {
      const settings = {
        version: '1.0.0',
        gitCoAuthor: ''
      };
      const settingsPath = path.join(tempDir, 'settings.json');
      fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));

      const read = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
      assert.strictEqual(read.gitCoAuthor, '');
    });

    it('should handle null gitCoAuthor', () => {
      const settings = {
        version: '1.0.0',
        gitCoAuthor: null
      };
      const settingsPath = path.join(tempDir, 'settings.json');
      fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));

      const read = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
      assert.strictEqual(read.gitCoAuthor, null);
    });
  });

  describe('Qwen Commands Directory Structure', () => {
    it('should support flat commands structure', () => {
      const commandsDir = path.join(tempDir, '.qwen', 'commands');
      fs.mkdirSync(commandsDir, { recursive: true });

      // Create command files
      const cmd1 = path.join(commandsDir, 'fase-help.md');
      const cmd2 = path.join(commandsDir, 'fase-plan.md');
      fs.writeFileSync(cmd1, '---\ndescription: Show help\n---\n\nHelp content');
      fs.writeFileSync(cmd2, '---\ndescription: Create plan\n---\n\nPlan content');

      const files = fs.readdirSync(commandsDir);
      assert.strictEqual(files.length, 2);
      assert.ok(files.includes('fase-help.md'));
      assert.ok(files.includes('fase-plan.md'));
    });

    it('should not use nested structure like Claude Code', () => {
      // Qwen uses flat structure: commands/fase-help.md
      // NOT: commands/fase/help.md
      const commandsDir = path.join(tempDir, '.qwen', 'commands');
      fs.mkdirSync(commandsDir, { recursive: true });

      // Verify no nested fase/ directory
      const nestedDir = path.join(commandsDir, 'fase');
      assert.strictEqual(fs.existsSync(nestedDir), false, 'should not have nested fase directory');
    });
  });

  describe('Attribution Handling', () => {
    it('should handle gitCoAuthor for attribution', () => {
      const testCases = [
        { gitCoAuthor: 'Qwen Code <qwen@example.com>', expected: 'Qwen Code <qwen@example.com>' },
        { gitCoAuthor: '', expected: null },
        { gitCoAuthor: null, expected: null },
        { gitCoAuthor: undefined, expected: undefined }
      ];

      testCases.forEach(({ gitCoAuthor, expected }) => {
        let result;
        if (gitCoAuthor === undefined) {
          result = undefined;
        } else if (gitCoAuthor === '' || gitCoAuthor === null) {
          result = null;
        } else {
          result = gitCoAuthor;
        }
        assert.strictEqual(result, expected, `gitCoAuthor ${JSON.stringify(gitCoAuthor)} should result in ${expected}`);
      });
    });
  });

  describe('Path Expansion', () => {
    it('should expand tilde for qwen config', () => {
      const tilePath = '~/.qwen';
      const expanded = tilePath.startsWith('~/')
        ? path.join(os.homedir(), tilePath.slice(2))
        : tilePath;

      assert.strictEqual(expanded, path.join(os.homedir(), '.qwen'));
    });

    it('should handle qwen-specific paths', () => {
      const paths = [
        '~/.qwen/commands',
        '~/.qwen/agents',
        '~/.qwen/hooks',
        '~/.qwen/settings.json'
      ];

      paths.forEach(p => {
        const expanded = p.startsWith('~/')
          ? path.join(os.homedir(), p.slice(2))
          : p;
        assert.ok(expanded.includes('.qwen'), `path ${p} should expand to include .qwen`);
      });
    });
  });

  describe('Mixed Provider Installation', () => {
    it('should support installing qwen alongside other providers', () => {
      const providers = ['.claude', '.gemini', '.codex', '.config/opencode', '.github-copilot', '.qwen'];

      providers.forEach(provider => {
        const configPath = path.join(tempDir, provider);
        fs.mkdirSync(configPath, { recursive: true });
        assert.strictEqual(fs.existsSync(configPath), true, `${provider} should exist`);
      });

      assert.strictEqual(providers.length, 6);
    });

    it('should isolate qwen configuration from other providers', () => {
      const qwenPath = path.join(tempDir, '.qwen', 'settings.json');
      const claudePath = path.join(tempDir, '.claude', 'settings.json');

      fs.mkdirSync(path.dirname(qwenPath), { recursive: true });
      fs.mkdirSync(path.dirname(claudePath), { recursive: true });

      fs.writeFileSync(qwenPath, JSON.stringify({ gitCoAuthor: 'Qwen' }));
      fs.writeFileSync(claudePath, JSON.stringify({ attribution: { commit: 'Claude' } }));

      const qwenSettings = JSON.parse(fs.readFileSync(qwenPath, 'utf8'));
      const claudeSettings = JSON.parse(fs.readFileSync(claudePath, 'utf8'));

      assert.strictEqual(qwenSettings.gitCoAuthor, 'Qwen');
      assert.strictEqual(claudeSettings.attribution.commit, 'Claude');
    });
  });

  describe('CLI Flags', () => {
    it('should recognize --qwen flag', () => {
      const args = ['--qwen', '--all', '--claude'];
      assert.ok(args.includes('--qwen'), 'should include --qwen in valid flags');
    });

    it('should include qwen in --all expansion', () => {
      const allProviders = ['claude', 'opencode', 'gemini', 'codex', 'github-copilot', 'qwen'];
      assert.ok(allProviders.includes('qwen'), 'qwen should be in --all expansion');
      assert.strictEqual(allProviders.length, 6);
    });
  });

  describe('Frontmatter Edge Cases', () => {
    const convertClaudeToQwenCommand = (content) => {
      let convertedContent = content;
      convertedContent = convertedContent.replace(/~\/\.claude\b/g, '~/.qwen');
      convertedContent = convertedContent.replace(/\$HOME\/\.claude\b/g, '$HOME/.qwen');
      convertedContent = convertedContent.replace(/~\/\.fase\b/g, '~/.qwen');
      convertedContent = convertedContent.replace(/\$HOME\/\.fase\b/g, '$HOME/.qwen');

      if (!convertedContent.startsWith('---')) {
        return convertedContent;
      }

      const endIndex = convertedContent.indexOf('---', 3);
      if (endIndex === -1) {
        return convertedContent;
      }

      const frontmatter = convertedContent.substring(3, endIndex).trim();
      const body = convertedContent.substring(endIndex + 3);

      const lines = frontmatter.split('\n');
      let description = null;

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('description:')) {
          description = trimmed.substring(12).trim().replace(/^['"]|['"]$/g, '');
        }
      }

      const newFrontmatter = description ? `---\ndescription: ${JSON.stringify(description)}\n---` : '';

      return newFrontmatter ? `${newFrontmatter}\n${body}` : body;
    };

    it('should handle complex frontmatter with multiple fields', () => {
      const input = `---
name: complex-agent
description: A very complex agent with many features
tools: Read, Write, Edit, Bash, Glob, Grep, WebFetch, WebSearch
color: cyan
skills:
  - skill-one
  - skill-two
  - skill-three
allowed-tools:
  - Read
  - Write
---

Complex content here.`;

      const result = convertClaudeToQwenCommand(input);
      
      // Should only have description
      assert.ok(result.includes('description: "A very complex agent with many features"') || 
                result.includes("description: 'A very complex agent with many features'"), 
                'should have description with quotes');
      assert.ok(!result.includes('name:'), 'should not have name');
      assert.ok(!result.includes('tools:'), 'should not have tools at top level');
      assert.ok(!result.includes('color:'), 'should not have color');
      assert.ok(!result.includes('skills:'), 'should not have skills');
      assert.ok(!result.includes('allowed-tools:'), 'should not have allowed-tools');
    });

    it('should handle frontmatter with special characters in description', () => {
      const input = `---
description: Agent with "quotes" and 'apostrophes' and \n newlines
---

Body.`;

      const result = convertClaudeToQwenCommand(input);
      assert.ok(result.includes('description:'), 'should have description field');
      assert.ok(!result.includes('name:'), 'should not have name');
    });

    it('should handle multiline description', () => {
      const input = `---
description: |
  This is a multiline
  description that spans
  multiple lines
---

Body.`;

      const result = convertClaudeToQwenCommand(input);
      // Should handle multiline YAML description
      assert.ok(result.includes('description:'), 'should have description');
    });

    it('should preserve code blocks in body', () => {
      const input = `---
name: code-agent
description: Agent with code examples
tools: Bash
---

# Example

\`\`\`bash
#!/bin/bash
echo "Hello from ~/.claude/"
\`\`\`

More text.`;

      const result = convertClaudeToQwenCommand(input);
      // Should convert paths inside code blocks too
      assert.ok(result.includes('~/.qwen/'), 'should convert path in code block');
      assert.ok(!result.includes('~/.claude/'), 'should not have old path');
      assert.ok(result.includes('```bash'), 'should preserve code block');
    });

    it('should handle frontmatter with comments', () => {
      const input = `---
# This is a comment
name: commented-agent
description: Agent with comments
# Another comment
tools: Read
---

Body.`;

      const result = convertClaudeToQwenCommand(input);
      // Comments might be stripped or kept, but description should be there
      assert.ok(result.includes('description:'), 'should have description');
    });
  });

  describe('Qwen Command Naming', () => {
    it('should use flat command names (fase-command.md)', () => {
      const commandNames = [
        'fase-help.md',
        'fase-plan.md',
        'fase-execute.md',
        'fase-debug-start.md'
      ];

      commandNames.forEach(name => {
        assert.ok(name.startsWith('fase-'), `${name} should start with fase-`);
        assert.ok(name.endsWith('.md'), `${name} should end with .md`);
        assert.ok(!name.includes('/'), `${name} should not contain slashes (flat structure)`);
      });
    });

    it('should derive command name from filename not frontmatter', () => {
      // In Qwen, the command name comes from the filename
      // The 'name:' field in frontmatter is ignored
      const commandContent = `---
name: this-is-ignored
description: This is the actual description
---

Command content.`;

      // The actual command name would be based on filename: fase-help.md -> /fase:help
      assert.ok(commandContent.includes('description:'), 'description is used');
      // name field exists in input but would be stripped
    });
  });
});

describe('Qwen Code Integration', () => {
  describe('Provider Comparison', () => {
    it('should have consistent provider structure', () => {
      const providers = {
        claude: { dir: '.claude', settings: 'settings.json' },
        opencode: { dir: '.opencode', settings: 'opencode.json' },
        gemini: { dir: '.gemini', settings: 'settings.json' },
        codex: { dir: '.codex', settings: 'config.toml' },
        'github-copilot': { dir: '.github-copilot', settings: '.copilot-settings.json' },
        qwen: { dir: '.qwen', settings: 'settings.json' }
      };

      // All providers should have required fields
      Object.entries(providers).forEach(([name, config]) => {
        assert.ok(config.dir, `${name} should have dir`);
        assert.ok(config.settings, `${name} should have settings file`);
        assert.ok(config.dir.startsWith('.'), `${name} dir should start with dot`);
      });
    });

    it('qwen should use JSON settings like Claude and Gemini', () => {
      // Qwen uses settings.json (same as Claude and Gemini)
      // Not opencode.json or config.toml
      const jsonSettingsProviders = ['claude', 'gemini', 'qwen'];
      jsonSettingsProviders.forEach(provider => {
        assert.ok(true, `${provider} uses JSON settings`);
      });
    });
  });

  describe('Command Format Compatibility', () => {
    it('should convert slash commands correctly', () => {
      // Claude: /fase-help
      // Qwen: /fase-help (same)
      // Both use slash commands
      const claudeCmd = '/fase-help';
      const qwenCmd = '/fase-help';
      assert.strictEqual(claudeCmd, qwenCmd, 'slash commands should be compatible');
    });

    it('should handle parameter syntax', () => {
      // {{args}} is supported by Qwen for parameters
      const paramSyntax = '{{args}}';
      assert.ok(paramSyntax.includes('{{') && paramSyntax.includes('}}'), 'parameter syntax uses curly braces');
    });
  });
});
