/**
 * Etapa — Etapa CRUD, query, and lifecycle operations
 */
interface EtapasListOptions {
    type?: string;
    phase?: string;
    includeArchived?: boolean;
}
export declare function cmdEtapasList(cwd: string, options: EtapasListOptions, raw: boolean): void;
export declare function cmdEtapaNextDecimal(cwd: string, basePhase: string, raw: boolean): void;
export declare function cmdFindEtapa(cwd: string, etapa: string, raw: boolean): void;
export declare function cmdEtapaPlanIndex(cwd: string, phase: string, raw: boolean): void;
export declare function cmdEtapaAdd(cwd: string, description: string, raw: boolean): void;
export declare function cmdEtapaInsert(cwd: string, afterPhase: string, description: string, raw: boolean): void;
interface EtapaRemoveOptions {
    force?: boolean;
}
export declare function cmdEtapaRemove(cwd: string, targetPhase: string, options: EtapaRemoveOptions, raw: boolean): void;
export declare function cmdEtapaComplete(cwd: string, etapaNum: string, raw: boolean): void;
export {};
