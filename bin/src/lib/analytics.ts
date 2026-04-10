/**
 * Analytics — Opt-in anonymous usage tracking for FASE
 *
 * Default: OFF. Users explicitly opt-in at install time.
 * No code or project content is tracked — only command names and runtime type.
 */

import fs from 'fs';
import path from 'path';
import os from 'os';

export interface AnalyticsEvent {
  ts: number;
  cmd: string;
  runtime: string;
}

const ANALYTICS_CONFIG_FILE = path.join(os.homedir(), '.fase-ai', 'config.json');
const ANALYTICS_LOG_FILE = path.join(os.homedir(), '.fase-ai', 'analytics.jsonl');

/**
 * Load config with analytics setting
 */
function loadConfig(): { analytics: boolean; installId: string } {
  try {
    if (fs.existsSync(ANALYTICS_CONFIG_FILE)) {
      const content = fs.readFileSync(ANALYTICS_CONFIG_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch {
    // Ignore errors, return default
  }
  return { analytics: false, installId: '' };
}

/**
 * Track a command execution if analytics is enabled
 */
export function trackEvent(cmd: string, runtime: string): void {
  try {
    const config = loadConfig();
    if (!config.analytics) return; // Analytics disabled

    // Ensure analytics directory exists
    const analyticsDir = path.dirname(ANALYTICS_LOG_FILE);
    if (!fs.existsSync(analyticsDir)) {
      fs.mkdirSync(analyticsDir, { recursive: true, mode: 0o700 });
    }

    const event: AnalyticsEvent = {
      ts: Date.now(),
      cmd,
      runtime,
    };

    // Append to JSONL file (one JSON object per line)
    fs.appendFileSync(ANALYTICS_LOG_FILE, JSON.stringify(event) + '\n');

    // Check if we should flush
    maybeFlush();
  } catch {
    // Silently fail — analytics should never break the app
  }
}

/**
 * Check if we should upload analytics, and do so if interval passed
 */
export function maybeFlush(): void {
  try {
    const config = loadConfig();
    if (!config.analytics) return;

    const lastFlushFile = path.join(path.dirname(ANALYTICS_LOG_FILE), '.last-flush');
    const now = Date.now();
    const FLUSH_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

    let lastFlush = 0;
    try {
      const data = fs.readFileSync(lastFlushFile, 'utf-8');
      lastFlush = parseInt(data, 10);
    } catch {
      // No last flush recorded
    }

    if (now - lastFlush > FLUSH_INTERVAL_MS) {
      // Time to flush
      flushToBackend(config.installId);

      // Update last flush timestamp
      fs.mkdirSync(path.dirname(lastFlushFile), { recursive: true, mode: 0o700 });
      fs.writeFileSync(lastFlushFile, now.toString());

      // Clear the analytics log
      fs.writeFileSync(ANALYTICS_LOG_FILE, '');
    }
  } catch {
    // Silently fail
  }
}

/**
 * Upload analytics to backend endpoint
 */
function flushToBackend(installId: string): void {
  try {
    if (!fs.existsSync(ANALYTICS_LOG_FILE)) return;

    const logContent = fs.readFileSync(ANALYTICS_LOG_FILE, 'utf-8').trim();
    if (!logContent) return;

    // Parse JSONL into array for upload
    const events = logContent.split('\n').filter(Boolean).map(line => JSON.parse(line));

    // Build request payload
    const payload = {
      installId,
      version: '3.3.0',
      events,
    };

    // In production, you'd POST to an endpoint here:
    // fetch('https://analytics.fase-ai.dev/events', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(payload),
    // }).catch(() => { /* ignore errors */ });

    // For now, just acknowledge the flush silently
  } catch {
    // Silently fail
  }
}

/**
 * Write analytics config after user opts in
 */
export function saveAnalyticsConfig(enabled: boolean, installId: string): void {
  try {
    const dir = path.dirname(ANALYTICS_CONFIG_FILE);
    fs.mkdirSync(dir, { recursive: true, mode: 0o700 });

    const config = {
      analytics: enabled,
      installId,
      optedInAt: new Date().toISOString(),
    };

    fs.writeFileSync(ANALYTICS_CONFIG_FILE, JSON.stringify(config, null, 2), 'utf-8');
  } catch {
    // Fail silently
  }
}
