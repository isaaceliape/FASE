/**
 * Version Check — Check for updates and prompt user to update
 */
export interface VersionInfo {
    current: string;
    latest: string | null;
    updateAvailable: boolean;
}
/**
 * Check the latest version from npm
 */
export declare function getLatestVersion(): string | null;
/**
 * Compare two semantic versions
 * Returns: -1 if v1 < v2, 0 if equal, 1 if v1 > v2
 */
export declare function compareVersions(v1: string, v2: string): number;
/**
 * Check if an update is available
 */
export declare function checkForUpdate(currentVersion: string): VersionInfo;
/**
 * Prompt user to update
 */
export declare function promptForUpdate(versionInfo: VersionInfo): Promise<boolean>;
/**
 * Run the update process
 */
export declare function runUpdate(): void;
/**
 * Check cache for update info (from the background hook)
 * NOTE: This is READ-ONLY. The cache file is written by external hooks, not by FASE.
 * FASE never writes to ~/.claude/ — all FASE state is kept in ~/.fase-ai/
 */
export declare function getCachedUpdateInfo(): VersionInfo | null;
/**
 * Main entry point: check for updates and optionally prompt user
 */
export declare function checkAndPromptForUpdate(currentVersion: string, forceCheck?: boolean): Promise<void>;
