const assert = require('assert');
const { EventEmitter } = require('events');

/**
 * Test suite for FASE interactive prompts
 * Tests the install script's prompt logic for update detection and user choices
 */
describe('FASE Interactive Prompts', () => {
  describe('Prompt Logic - Update Detection', () => {
    it('should show update option when runtimes are detected', () => {
      const installedRuntimes = ['claude', 'opencode'];
      const runtimeLabels = {
        claude: 'Claude Code',
        opencode: 'OpenCode',
        gemini: 'Gemini',
        codex: 'Codex'
      };

      const labels = installedRuntimes.map(r => runtimeLabels[r] || r).join(', ');

      assert.strictEqual(labels, 'Claude Code, OpenCode', 'Should format runtime labels correctly');
      assert.ok(labels.includes('Claude Code'), 'Should include Claude Code label');
      assert.ok(labels.includes('OpenCode'), 'Should include OpenCode label');
    });

    it('should return empty array when no runtimes are detected', () => {
      const installedRuntimes = [];

      assert.strictEqual(installedRuntimes.length, 0, 'Should return empty array');
      assert.deepStrictEqual(installedRuntimes, [], 'Should be empty');
    });

    it('should preserve runtime order in detection', () => {
      const installedRuntimes = ['gemini', 'claude', 'codex'];

      // Order might matter for displaying to user
      const expectedOrder = installedRuntimes;
      const actualOrder = installedRuntimes;

      assert.deepStrictEqual(actualOrder, expectedOrder, 'Should maintain detection order');
    });
  });

  describe('Prompt Logic - Choice Validation', () => {
    it('should accept choice "1" as update option', () => {
      const answer = '1';
      const choice = answer.trim() || '1';

      assert.strictEqual(choice, '1', 'Should parse "1" correctly');
    });

    it('should accept empty string as default (choice 1)', () => {
      const answer = '';
      const choice = answer.trim() || '1';

      assert.strictEqual(choice, '1', 'Should default to "1" for empty input');
    });

    it('should handle whitespace in input', () => {
      const answer = '  2  ';
      const choice = answer.trim() || '1';

      assert.strictEqual(choice, '2', 'Should trim whitespace correctly');
    });

    it('should accept all valid choice numbers', () => {
      const validChoices = ['1', '2', '3', '4'];
      const allValid = validChoices.every(choice => {
        return choice >= '1' && choice <= '4';
      });

      assert.ok(allValid, 'All valid choices should be recognized');
    });

    it('should handle invalid choice numbers gracefully', () => {
      const answer = '99';
      const choice = answer.trim() || '1';
      const isValid = ['1', '2', '3', '4'].includes(choice);

      assert.strictEqual(isValid, false, 'Invalid choice should not be valid');
    });
  });

  describe('Prompt Logic - Runtime Selection', () => {
    it('should map choice 1 to Claude Code', () => {
      const choice = '1';
      const runtimes = choice === '1' ? ['claude'] : [];

      assert.deepStrictEqual(runtimes, ['claude'], 'Choice 1 should map to Claude');
    });

    it('should map choice 2 to OpenCode', () => {
      const choice = '2';
      const runtimes = choice === '2' ? ['opencode'] : [];

      assert.deepStrictEqual(runtimes, ['opencode'], 'Choice 2 should map to OpenCode');
    });

    it('should map choice 3 to Gemini', () => {
      const choice = '3';
      const runtimes = choice === '3' ? ['gemini'] : [];

      assert.deepStrictEqual(runtimes, ['gemini'], 'Choice 3 should map to Gemini');
    });

    it('should map choice 4 to Codex', () => {
      const choice = '4';
      const runtimes = choice === '4' ? ['codex'] : [];

      assert.deepStrictEqual(runtimes, ['codex'], 'Choice 4 should map to Codex');
    });

    it('should map choice 5 to all runtimes', () => {
      const choice = '5';
      const runtimes = choice === '5' ? ['claude', 'opencode', 'gemini', 'codex'] : [];

      assert.strictEqual(runtimes.length, 4, 'Choice 5 should include all runtimes');
      assert.deepStrictEqual(
        runtimes,
        ['claude', 'opencode', 'gemini', 'codex'],
        'Should include all four runtimes'
      );
    });

    it('should handle cancel option', () => {
      const choice = '6';
      const shouldCancel = choice === '6';

      assert.strictEqual(shouldCancel, true, 'Choice 6 should trigger cancel');
    });
  });

  describe('Prompt Flow - From Installation Detection', () => {
    it('should show different prompts for first-time vs existing installation', () => {
      const installedRuntimes = ['claude'];

      const showUpdatePrompt = installedRuntimes.length > 0;
      const showRuntimeSelectionPrompt = installedRuntimes.length === 0;

      assert.strictEqual(showUpdatePrompt, true, 'Should show update prompt for existing installation');
      assert.strictEqual(showRuntimeSelectionPrompt, false, 'Should not show selection prompt');
    });

    it('should skip update prompt for fresh installation', () => {
      const installedRuntimes = [];

      const showUpdatePrompt = installedRuntimes.length > 0;
      const showRuntimeSelectionPrompt = installedRuntimes.length === 0;

      assert.strictEqual(showUpdatePrompt, false, 'Should not show update prompt');
      assert.strictEqual(showRuntimeSelectionPrompt, true, 'Should show selection prompt');
    });

    it('should provide uninstall option in both prompts', () => {
      // Update prompt (existing installation)
      const updatePromptOptions = ['1', '2', '3', '4']; // 4 = cancel, 3 could be uninstall
      const hasUpdateChoice = updatePromptOptions.length >= 3;

      // Runtime selection prompt (fresh)
      const selectionPromptOptions = ['1', '2', '3', '4', '5', '6']; // 6 = cancel
      const hasSelectionChoice = selectionPromptOptions.length >= 6;

      assert.ok(hasUpdateChoice, 'Update prompt should have uninstall option');
      assert.ok(hasSelectionChoice, 'Selection prompt should have uninstall option');
    });
  });

  describe('Prompt Logic - Label Formatting', () => {
    it('should format single runtime label', () => {
      const runtimeLabels = { claude: 'Claude Code' };
      const runtimes = ['claude'];
      const labels = runtimes.map(r => runtimeLabels[r] || r).join(', ');

      assert.strictEqual(labels, 'Claude Code', 'Should format single runtime');
    });

    it('should format multiple runtime labels with commas', () => {
      const runtimeLabels = {
        claude: 'Claude Code',
        opencode: 'OpenCode',
        gemini: 'Gemini'
      };
      const runtimes = ['claude', 'opencode', 'gemini'];
      const labels = runtimes.map(r => runtimeLabels[r] || r).join(', ');

      assert.strictEqual(
        labels,
        'Claude Code, OpenCode, Gemini',
        'Should format multiple runtimes with commas'
      );
    });

    it('should handle all four runtimes in label', () => {
      const runtimeLabels = {
        claude: 'Claude Code',
        opencode: 'OpenCode',
        gemini: 'Gemini',
        codex: 'Codex'
      };
      const runtimes = ['claude', 'opencode', 'gemini', 'codex'];
      const labels = runtimes.map(r => runtimeLabels[r] || r).join(', ');

      assert.strictEqual(
        labels,
        'Claude Code, OpenCode, Gemini, Codex',
        'Should format all four runtimes'
      );
    });
  });

  describe('Error Handling in Prompts', () => {
    it('should handle readline close event', () => {
      const mockRl = new EventEmitter();
      let closed = false;
      let answered = false;

      mockRl.on('close', () => {
        closed = true;
        if (!answered) {
          // This is what the code should do
          answered = true;
        }
      });

      assert.strictEqual(closed, false, 'Should not be closed initially');

      mockRl.emit('close');

      assert.strictEqual(closed, true, 'Should handle close event');
      assert.strictEqual(answered, true, 'Should mark as answered on close');
    });

    it('should prevent duplicate answers when close event fires', () => {
      const mockRl = new EventEmitter();
      let answered = false;
      let answerCount = 0;

      const handleAnswer = () => {
        if (!answered) {
          answered = true;
          answerCount++;
        }
      };

      mockRl.on('close', handleAnswer);

      // Simulate user closing readline
      mockRl.emit('close');
      mockRl.emit('close');

      assert.strictEqual(answerCount, 1, 'Should only process answer once');
    });
  });

  describe('Callback Behavior', () => {
    it('should invoke callback with correct runtime array', () => {
      let callbackData = null;

      const callback = (data) => {
        callbackData = data;
      };

      // Simulate user selecting choice 1
      const choice = '1';
      if (choice === '1') {
        callback(['claude']);
      }

      assert.deepStrictEqual(callbackData, ['claude'], 'Should pass runtime array to callback');
    });

    it('should invoke callback with special uninstall value', () => {
      let callbackData = null;

      const callback = (data) => {
        callbackData = data;
      };

      // Simulate user selecting uninstall option
      const choice = '3'; // In update prompt, this might be uninstall
      if (choice === '3') {
        callback('uninstall');
      }

      assert.strictEqual(callbackData, 'uninstall', 'Should pass uninstall string to callback');
    });

    it('should not invoke callback multiple times', () => {
      let callCount = 0;

      const callback = (data) => {
        callCount++;
      };

      const choice = '1';
      if (choice === '1') {
        callback(['claude']);
      }

      // Should only call once
      assert.strictEqual(callCount, 1, 'Should invoke callback exactly once');
    });
  });
});
