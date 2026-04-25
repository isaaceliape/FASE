/**
 * Models — Model profiles and resolution
 *
 * Maps agent types to model profiles (quality/balanced/budget).
 * Used by workflow initialization to select appropriate models.
 *
 * @module lib/models
 */
/**
 * Model profile for an agent type
 */
export interface ModelProfile {
    quality: string;
    balanced: string;
    budget: string;
}
/**
 * Model profiles for each FASE agent type
 *
 * Maps agent name to recommended models for each profile tier.
 */
export declare const MODEL_PROFILES: Record<string, ModelProfile>;
/**
 * Resolve model for an agent type based on config profile
 *
 * @param configProfile - Config profile name (quality/balanced/budget)
 * @param agentType - Agent type name
 * @param modelOverrides - Optional per-agent overrides from config
 * @returns Resolved model name or 'inherit' for opus
 */
export declare function resolveModel(configProfile: string, agentType: string, modelOverrides: Record<string, string> | null): string;
