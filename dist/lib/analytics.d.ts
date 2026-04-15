/**
 * Analytics — DISABLED
 *
 * Analytics has been disabled to keep FASE project-local only.
 * No tracking occurs.
 */
export interface AnalyticsEvent {
    ts: number;
    cmd: string;
    runtime: string;
}
/**
 * No-op: Track a command execution (disabled)
 */
export declare function trackEvent(cmd: string, runtime: string): void;
/**
 * No-op: Check if we should upload analytics (disabled)
 */
export declare function maybeFlush(): void;
/**
 * No-op: Write analytics config (disabled)
 */
export declare function saveAnalyticsConfig(enabled: boolean, installId: string): void;
