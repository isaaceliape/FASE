/**
 * State — STATE.md operations and progression engine
 */
export interface StateMetricOptions {
    phase?: string;
    plan?: string;
    duration?: string;
    tasks?: string;
    files?: string;
}
export interface StateDecisionOptions {
    phase?: string;
    summary?: string;
    summary_file?: string;
    rationale?: string;
    rationale_file?: string;
}
export interface StateBlockerOptions {
    text?: string;
    text_file?: string;
}
export interface StateSessionOptions {
    stopped_at?: string;
    resume_file?: string;
}
export declare function stateExtractField(content: string, fieldName: string): string | null;
export declare function stateReplaceField(content: string, fieldName: string, newValue: string): string | null;
export declare function writeStateMd(statePath: string, content: string, cwd: string): void;
export declare function cmdStateLoad(cwd: string, raw: boolean): void;
export declare function cmdStateGet(cwd: string, section: string | undefined, raw: boolean): void;
export declare function cmdStatePatch(cwd: string, patches: Record<string, string>, raw: boolean): void;
export declare function cmdStateUpdate(cwd: string, field: string, value: string): void;
export declare function cmdStateAdvancePlan(cwd: string, raw: boolean): void;
export declare function cmdStateRecordMetric(cwd: string, options: StateMetricOptions, raw: boolean): void;
export declare function cmdStateUpdateProgress(cwd: string, raw: boolean): void;
export declare function cmdStateAddDecision(cwd: string, options: StateDecisionOptions, raw: boolean): void;
export declare function cmdStateAddBlocker(cwd: string, text: string | StateBlockerOptions, raw: boolean): void;
export declare function cmdStateResolveBlocker(cwd: string, text: string | undefined, raw: boolean): void;
export declare function cmdStateRecordSession(cwd: string, options: StateSessionOptions, raw: boolean): void;
export declare function cmdStateSnapshot(cwd: string, raw: boolean): void;
export declare function cmdStateJson(cwd: string, raw: boolean): void;
