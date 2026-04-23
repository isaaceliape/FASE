/**
 * FASE Tests - State Locking Mechanism
 * 
 * Tests for acquireStateLock and releaseStateLock functionality
 * in src/lib/state.ts (lines 227-330).
 * 
 * Since lock functions are internal (not exported), we test via CLI
 * commands that trigger state operations (writeStateMd uses locks).
 */

const { test, describe, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { runGsdTools, createTempProject, cleanup } = require('./helpers.cjs');

describe('state.ts locking mechanism', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = createTempProject();
  });

  afterEach(() => {
    cleanup(tmpDir);
  });

  // Tests will be added in subsequent tasks
});