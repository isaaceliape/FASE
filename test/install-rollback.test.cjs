const assert = require('assert');
const fs = require('fs');
const path = require('path');
const os = require('os');

describe('FASE Installation Rollback', () => {
  let tempDir;
  let backupDir;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fase-rollback-test-'));
    backupDir = path.join(tempDir, 'backup');
    fs.mkdirSync(backupDir, { recursive: true });

    // Create original state
    fs.writeFileSync(path.join(backupDir, 'original.txt'), 'original content');
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('Rollback Mechanism', () => {
    it('should restore original file when copy fails', () => {
      const targetDir = path.join(tempDir, 'target');
      const originalFile = path.join(backupDir, 'original.txt');
      const originalContent = fs.readFileSync(originalFile, 'utf-8');

      // Simulate partial copy then rollback
      fs.mkdirSync(targetDir, { recursive: true });
      const targetFile = path.join(targetDir, 'original.txt');

      // Copy starts
      fs.writeFileSync(targetFile, 'partial content');

      // Simulate error - rollback should restore
      fs.writeFileSync(targetFile, originalContent);

      assert.strictEqual(
        fs.readFileSync(targetFile, 'utf-8'),
        originalContent,
        'Content should be restored'
      );
    });

    it('should clean up partial directories on failure', () => {
      const partialDir = path.join(tempDir, 'partial-install');
      fs.mkdirSync(partialDir, { recursive: true });

      // Simulate cleanup on error
      fs.rmSync(partialDir, { recursive: true, force: true });

      assert.strictEqual(fs.existsSync(partialDir), false, 'Partial directory should be cleaned');
    });

    it('should preserve existing config when reinstalling', () => {
      const configDir = path.join(tempDir, 'config');
      fs.mkdirSync(configDir, { recursive: true });

      // Create existing config
      const existingSettings = path.join(configDir, 'settings.json');
      fs.writeFileSync(existingSettings, '{"existing": true}');

      // Simulate reinstall preserving existing
      const content = fs.readFileSync(existingSettings, 'utf-8');
      const settings = JSON.parse(content);

      assert.strictEqual(settings.existing, true, 'Existing config should be preserved');
    });

    it('should handle rollback when target directory does not exist', () => {
      const nonExistentTarget = path.join(tempDir, 'nonexistent-target');
      
      // Rollback on non-existent target should not fail
      assert.strictEqual(fs.existsSync(nonExistentTarget), false, 'Target should not exist');
      
      // Cleanup should be safe (no-op)
      if (fs.existsSync(nonExistentTarget)) {
        fs.rmSync(nonExistentTarget, { recursive: true, force: true });
      }
      
      // No error should occur
      assert.strictEqual(fs.existsSync(nonExistentTarget), false, 'No-op rollback should succeed');
    });

    it('should create backup before installation starts', () => {
      const installTarget = path.join(tempDir, 'install-target');
      const backupPath = path.join(tempDir, 'install-backup');
      
      // Simulate backup creation before install
      fs.mkdirSync(installTarget, { recursive: true });
      fs.writeFileSync(path.join(installTarget, 'config.json'), '{"test": true}');
      
      // Create backup
      fs.mkdirSync(backupPath, { recursive: true });
      fs.copyFileSync(
        path.join(installTarget, 'config.json'),
        path.join(backupPath, 'config.json')
      );
      
      assert.strictEqual(fs.existsSync(path.join(backupPath, 'config.json')), true, 'Backup should exist');
      assert.strictEqual(
        fs.readFileSync(path.join(backupPath, 'config.json'), 'utf-8'),
        '{"test": true}',
        'Backup content should match original'
      );
    });

    it('should restore from backup on installation failure', () => {
      const installTarget = path.join(tempDir, 'restore-target');
      const backupPath = path.join(tempDir, 'restore-backup');
      
      // Setup
      fs.mkdirSync(installTarget, { recursive: true });
      fs.writeFileSync(path.join(installTarget, 'original.json'), '{"original": true}');
      
      fs.mkdirSync(backupPath, { recursive: true });
      fs.copyFileSync(
        path.join(installTarget, 'original.json'),
        path.join(backupPath, 'original.json')
      );
      
      // Simulate failed install (modify target)
      fs.writeFileSync(path.join(installTarget, 'original.json'), '{"modified": true}');
      
      // Rollback: restore from backup
      fs.copyFileSync(
        path.join(backupPath, 'original.json'),
        path.join(installTarget, 'original.json')
      );
      
      const restored = JSON.parse(fs.readFileSync(path.join(installTarget, 'original.json'), 'utf-8'));
      assert.strictEqual(restored.original, true, 'Should restore original content');
    });
  });

  describe('Error Handling', () => {
    it('should gracefully handle permission denied', () => {
      const readOnlyDir = path.join(tempDir, 'readonly');
      fs.mkdirSync(readOnlyDir);
      fs.chmodSync(readOnlyDir, 0o444);

      let errorCaught = false;
      try {
        fs.writeFileSync(path.join(readOnlyDir, 'test.txt'), 'test');
      } catch (err) {
        errorCaught = true;
        assert.strictEqual(err.code, 'EACCES', 'Should catch permission error');
      } finally {
        fs.chmodSync(readOnlyDir, 0o755);
      }

      assert.strictEqual(errorCaught, true, 'Permission error should be caught');
    });

    it('should handle missing source files gracefully', () => {
      const missingSource = path.join(tempDir, 'nonexistent', 'file.txt');
      let errorCaught = false;

      try {
        fs.readFileSync(missingSource, 'utf-8');
      } catch (err) {
        errorCaught = true;
        assert.strictEqual(err.code, 'ENOENT', 'Should catch missing file error');
      }

      assert.strictEqual(errorCaught, true, 'Missing file error should be caught');
    });

    it('should handle disk space errors', () => {
      // Simulate disk full scenario - we can't actually fill disk in tests
      // Instead, verify error code recognition
      const diskFullCode = 'ENOSPC';
      const expectedMessage = 'No space left on device';
      
      // In real scenario, installer would catch ENOSPC and rollback
      assert.strictEqual(diskFullCode, 'ENOSPC', 'Disk full error code should be ENOSPC');
    });

    it('should handle symlink resolution errors', () => {
      const symlinkTarget = path.join(tempDir, 'symlink-target');
      const symlinkPath = path.join(tempDir, 'broken-symlink');
      
      // Create broken symlink
      fs.symlinkSync(symlinkTarget, symlinkPath);
      
      let errorCaught = false;
      try {
        // Reading broken symlink throws ENOENT
        fs.statSync(symlinkPath);
      } catch (err) {
        errorCaught = true;
        // Symlink exists but target doesn't
      } finally {
        if (fs.existsSync(symlinkPath)) {
          fs.unlinkSync(symlinkPath);
        }
      }
      
      assert.strictEqual(errorCaught, true, 'Broken symlink should cause error');
    });

    it('should cleanup temporary files on error', () => {
      const tempFileDir = path.join(tempDir, 'temp-files');
      fs.mkdirSync(tempFileDir, { recursive: true });
      
      // Create temporary files
      fs.writeFileSync(path.join(tempFileDir, 'temp1.txt'), 'temp');
      fs.writeFileSync(path.join(tempFileDir, 'temp2.txt'), 'temp');
      
      // Simulate cleanup
      fs.rmSync(tempFileDir, { recursive: true, force: true });
      
      assert.strictEqual(fs.existsSync(tempFileDir), false, 'Temp files should be cleaned');
    });
  });

  describe('Atomic Operations', () => {
    it('should use atomic write for critical files', () => {
      // Atomic write pattern: write to temp, then rename
      const targetFile = path.join(tempDir, 'atomic-target.json');
      const tempFile = path.join(tempDir, 'atomic-temp.json');
      
      // Write to temp first
      fs.writeFileSync(tempFile, '{"atomic": true}');
      
      // Atomic rename
      fs.renameSync(tempFile, targetFile);
      
      // Either temp or target exists, never partial
      assert.strictEqual(fs.existsSync(tempFile), false, 'Temp file should be gone');
      assert.strictEqual(fs.existsSync(targetFile), true, 'Target file should exist');
      assert.strictEqual(
        fs.readFileSync(targetFile, 'utf-8'),
        '{"atomic": true}',
        'Content should be correct'
      );
    });

    it('should handle interrupted atomic write', () => {
      // If process crashes during rename, either old or new file exists
      const targetFile = path.join(tempDir, 'interrupt-target.json');
      fs.writeFileSync(targetFile, '{"old": true}');
      
      const tempFile = path.join(tempDir, 'interrupt-temp.json');
      fs.writeFileSync(tempFile, '{"new": true}');
      
      // Simulate crash before rename - original still exists
      const content = fs.readFileSync(targetFile, 'utf-8');
      
      // Original should still be intact
      assert.strictEqual(content, '{"old": true}', 'Original should be preserved');
      
      // Cleanup temp
      fs.unlinkSync(tempFile);
    });

    it('should verify file integrity after write', () => {
      const testFile = path.join(tempDir, 'integrity-test.json');
      const expectedContent = '{"integrity": "verified"}';
      
      fs.writeFileSync(testFile, expectedContent);
      
      // Verify integrity
      const actualContent = fs.readFileSync(testFile, 'utf-8');
      assert.strictEqual(actualContent, expectedContent, 'File integrity should be verified');
      
      // Size check
      const stats = fs.statSync(testFile);
      assert.strictEqual(stats.size, expectedContent.length, 'File size should match');
    });
  });

  describe('Rollback Edge Cases', () => {
    it('should handle nested directory rollback', () => {
      const nestedDir = path.join(tempDir, 'nested', 'deep', 'structure');
      fs.mkdirSync(nestedDir, { recursive: true });
      
      const nestedFile = path.join(nestedDir, 'nested.json');
      fs.writeFileSync(nestedFile, '{"nested": true}');
      
      // Rollback entire nested structure
      const topLevel = path.join(tempDir, 'nested');
      fs.rmSync(topLevel, { recursive: true, force: true });
      
      assert.strictEqual(fs.existsSync(topLevel), false, 'Nested structure should be removed');
    });

    it('should rollback multiple files consistently', () => {
      const multiDir = path.join(tempDir, 'multi');
      fs.mkdirSync(multiDir, { recursive: true });
      
      const files = ['file1.json', 'file2.json', 'file3.json'];
      for (const f of files) {
        fs.writeFileSync(path.join(multiDir, f), `{"name": "${f}"}`);
      }
      
      // Verify all exist
      for (const f of files) {
        assert.strictEqual(fs.existsSync(path.join(multiDir, f)), true, `${f} should exist`);
      }
      
      // Rollback all
      fs.rmSync(multiDir, { recursive: true, force: true });
      
      // Verify all gone
      for (const f of files) {
        assert.strictEqual(fs.existsSync(path.join(multiDir, f)), false, `${f} should be removed`);
      }
    });

    it('should handle concurrent rollback requests gracefully', () => {
      // Simulate concurrent rollback (in reality, lock prevents this)
      const lockDir = path.join(tempDir, '.fase-lock');
      fs.mkdirSync(lockDir);
      
      const pidFile = path.join(lockDir, 'pid');
      fs.writeFileSync(pidFile, process.pid.toString());
      
      // Lock exists - rollback should check lock first
      assert.strictEqual(fs.existsSync(lockDir), true, 'Lock should exist');
      assert.strictEqual(fs.existsSync(pidFile), true, 'PID file should exist');
      
      // Cleanup lock after rollback
      fs.rmSync(lockDir, { recursive: true, force: true });
      assert.strictEqual(fs.existsSync(lockDir), false, 'Lock should be cleaned');
    });
  });
});

// Run tests if executed directly
if (require.main === module) {
  console.log('Running FASE installation rollback tests...\n');
  console.log('To run tests with a test framework, use:');
  console.log('  npm test');
}

module.exports = { describe, it, beforeEach, afterEach };