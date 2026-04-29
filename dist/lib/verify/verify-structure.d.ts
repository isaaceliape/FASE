/**
 * Verify Structure — Plan and phase structure validation
 *
 * Validates PLAN.md structure, phase completeness, and ROADMAP.md consistency.
 */
/**
 * Verify PLAN.md structure and task elements.
 * Checks frontmatter fields, task XML elements, and checkpoint/autonomous consistency.
 */
export declare function cmdVerifyPlanStructure(cwd: string, filePath: string, raw: boolean): void;
/**
 * Verify phase completeness by checking plan/summary pairing.
 * Ensures each PLAN.md has a corresponding SUMMARY.md.
 */
export declare function cmdVerifyPhaseCompleteness(cwd: string, phase: string, raw: boolean): void;
/**
 * Validate consistency between ROADMAP.md and disk directories.
 * Cross-checks phase definitions, numbering gaps, and plan/summary pairing.
 */
export declare function cmdValidateConsistency(cwd: string, raw: boolean): void;
