/**
 * Template — Template selection and fill operations
 */
export declare function cmdTemplateSelect(cwd: string, planPath: string, raw: boolean): void;
interface TemplateFillOptions {
    phase: string;
    name?: string;
    plan?: string;
    type?: string;
    etapa?: string;
    fields?: Record<string, unknown>;
}
export declare function cmdTemplateFill(cwd: string, templateType: string, options: TemplateFillOptions, raw: boolean): void;
export {};
