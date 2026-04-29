/**
 * Verify Types — Interfaces for verification operations
 */
/**
 * A health issue with repair information
 */
export interface HealthIssue {
    code: string;
    message: string;
    fix: string;
    repairable: boolean;
}
/**
 * Options for health validation command
 */
export interface ValidateHealthOptions {
    repair?: boolean;
}
/**
 * An artifact item specification from frontmatter
 */
export interface ArtifactItem {
    description?: string;
    type?: string;
    path?: string;
    exists?: boolean;
    matches_description?: boolean;
    passed?: boolean;
    errors?: string[];
}
/**
 * A key link item specification from frontmatter
 */
export interface KeyLinkItem {
    description?: string;
    type?: string;
    href?: string;
    verified?: boolean;
    passed?: boolean;
    errors?: string[];
}
