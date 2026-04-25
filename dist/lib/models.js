/**
 * Models — Model profiles and resolution
 *
 * Maps agent types to model profiles (quality/balanced/budget).
 * Used by workflow initialization to select appropriate models.
 *
 * @module lib/models
 */
/**
 * Model profiles for each FASE agent type
 *
 * Maps agent name to recommended models for each profile tier.
 */
export const MODEL_PROFILES = {
    'gsd-planner': { quality: 'opus', balanced: 'opus', budget: 'sonnet' },
    'gsd-roadmapper': { quality: 'opus', balanced: 'sonnet', budget: 'sonnet' },
    'gsd-executor': { quality: 'opus', balanced: 'sonnet', budget: 'sonnet' },
    'gsd-phase-researcher': { quality: 'opus', balanced: 'sonnet', budget: 'haiku' },
    'gsd-project-researcher': { quality: 'opus', balanced: 'sonnet', budget: 'haiku' },
    'gsd-research-synthesizer': { quality: 'sonnet', balanced: 'sonnet', budget: 'haiku' },
    'gsd-debugger': { quality: 'opus', balanced: 'sonnet', budget: 'sonnet' },
    'gsd-codebase-mapper': { quality: 'sonnet', balanced: 'haiku', budget: 'haiku' },
    'gsd-verifier': { quality: 'sonnet', balanced: 'sonnet', budget: 'haiku' },
    'gsd-plan-checker': { quality: 'sonnet', balanced: 'sonnet', budget: 'haiku' },
    'gsd-integration-checker': { quality: 'sonnet', balanced: 'sonnet', budget: 'haiku' },
    'gsd-nyquist-auditor': { quality: 'sonnet', balanced: 'sonnet', budget: 'haiku' },
};
/**
 * Resolve model for an agent type based on config profile
 *
 * @param configProfile - Config profile name (quality/balanced/budget)
 * @param agentType - Agent type name
 * @param modelOverrides - Optional per-agent overrides from config
 * @returns Resolved model name or 'inherit' for opus
 */
export function resolveModel(configProfile, agentType, modelOverrides) {
    const override = modelOverrides?.[agentType];
    if (override) {
        return override === 'opus' ? 'inherit' : override;
    }
    const profile = configProfile || 'balanced';
    const agentModels = MODEL_PROFILES[agentType];
    if (!agentModels)
        return 'sonnet';
    const resolved = agentModels[profile] || agentModels['balanced'] || 'sonnet';
    return resolved === 'opus' ? 'inherit' : resolved;
}
//# sourceMappingURL=models.js.map