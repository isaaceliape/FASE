/**
 * Verify Files — Artifact and key link verification
 *
 * Validates must_haves.artifacts and must_haves.key_links specifications
 * from PLAN.md frontmatter.
 */
/**
 * Verify artifacts from must_haves.artifacts in PLAN.md frontmatter.
 * Checks file existence, minimum lines, contains patterns, and exports.
 */
export declare function cmdVerifyArtifacts(cwd: string, planFilePath: string, raw: boolean): void;
/**
 * Verify key links from must_haves.key_links in PLAN.md frontmatter.
 * Checks that source files reference destination files or match patterns.
 */
export declare function cmdVerifyKeyLinks(cwd: string, planFilePath: string, raw: boolean): void;
