/**
 * Verify Structure — Plan and phase structure validation
 *
 * Validates PLAN.md structure, phase completeness, and ROADMAP.md consistency.
 */
import fs from 'fs';
import path from 'path';
import { normalizeEtapaNome, findEtapaInternal, output, error } from '../core.js';
import { extractFrontmatter } from '../frontmatter.js';
import { requireParam, resolveVerificationPath, loadVerificationFile, } from '../verification-utils.js';
/**
 * Verify PLAN.md structure and task elements.
 * Checks frontmatter fields, task XML elements, and checkpoint/autonomous consistency.
 */
export function cmdVerifyPlanStructure(cwd, filePath, raw) {
    requireParam(filePath, 'caminho do arquivo');
    const fullPath = resolveVerificationPath(cwd, filePath);
    const content = loadVerificationFile(fullPath);
    if (!content) {
        output({ error: 'Arquivo não encontrado', path: filePath }, raw);
        return;
    }
    const fm = extractFrontmatter(content);
    const errors = [];
    const warnings = [];
    const required = [
        'etapa',
        'plan',
        'type',
        'etapa',
        'depends_on',
        'files_modified',
        'autonomous',
        'must_haves',
    ];
    for (const field of required) {
        if (fm[field] === undefined)
            errors.push(`Campo de frontmatter obrigatório ausente: ${field}`);
    }
    const taskPattern = /<task[^>]*>([\s\S]*?)<\/task>/g;
    const tasks = [];
    let taskMatch;
    while ((taskMatch = taskPattern.exec(content)) !== null) {
        const taskContent = taskMatch[1];
        const nameMatch = taskContent.match(/<name>([\s\S]*?)<\/name>/);
        const taskName = nameMatch ? nameMatch[1].trim() : 'unnamed';
        const hasFiles = /<files>/.test(taskContent);
        const hasAction = /<action>/.test(taskContent);
        const hasVerify = /<verify>/.test(taskContent);
        const hasDone = /<done>/.test(taskContent);
        if (!nameMatch)
            errors.push('Tarefa sem elemento <name>');
        if (!hasAction)
            errors.push(`Tarefa '${taskName}' sem <action>`);
        if (!hasVerify)
            warnings.push(`Tarefa '${taskName}' sem <verify>`);
        if (!hasDone)
            warnings.push(`Tarefa '${taskName}' sem <done>`);
        if (!hasFiles)
            warnings.push(`Tarefa '${taskName}' sem <files>`);
        tasks.push({ name: taskName, hasFiles, hasAction, hasVerify, hasDone });
    }
    if (tasks.length === 0)
        warnings.push('Nenhum elemento <task> encontrado');
    if (fm['etapa'] &&
        parseInt(String(fm['etapa']), 10) > 1 &&
        (!fm['depends_on'] || (Array.isArray(fm['depends_on']) && fm['depends_on'].length === 0))) {
        warnings.push('Etapa > 1 mas depends_on está vazio');
    }
    const hasCheckpoints = /<task\s+type=["']?checkpoint/.test(content);
    if (hasCheckpoints && fm['autonomous'] !== 'false' && fm['autonomous'] !== false) {
        errors.push('Tem tarefas de checkpoint mas autonomous não é false');
    }
    output({
        valid: errors.length === 0,
        errors,
        warnings,
        task_count: tasks.length,
        tasks,
        frontmatter_fields: Object.keys(fm),
    }, raw, errors.length === 0 ? 'valid' : 'invalid');
}
/**
 * Verify phase completeness by checking plan/summary pairing.
 * Ensures each PLAN.md has a corresponding SUMMARY.md.
 */
export function cmdVerifyPhaseCompleteness(cwd, phase, raw) {
    if (!phase) {
        error('fase obrigatória');
    }
    const phaseInfo = findEtapaInternal(cwd, phase);
    if (!phaseInfo || !phaseInfo.found) {
        output({ error: 'Fase não encontrada', phase }, raw);
        return;
    }
    const errors = [];
    const warnings = [];
    const phaseDir = path.join(cwd, phaseInfo.directory);
    let files;
    try {
        files = fs.readdirSync(phaseDir);
    }
    catch {
        output({ error: 'Não é possível ler diretório da fase' }, raw);
        return;
    }
    const plans = files.filter((f) => f.match(/-PLAN\.md$/i));
    const summaries = files.filter((f) => f.match(/-SUMMARY\.md$/i));
    const planIds = new Set(plans.map((p) => p.replace(/-PLAN\.md$/i, '')));
    const summaryIds = new Set(summaries.map((s) => s.replace(/-SUMMARY\.md$/i, '')));
    const incompletePlans = [...planIds].filter((id) => !summaryIds.has(id));
    if (incompletePlans.length > 0) {
        errors.push(`Planos sem resumos: ${incompletePlans.join(', ')}`);
    }
    const orphanSummaries = [...summaryIds].filter((id) => !planIds.has(id));
    if (orphanSummaries.length > 0) {
        warnings.push(`Resumos sem planos: ${orphanSummaries.join(', ')}`);
    }
    output({
        complete: errors.length === 0,
        phase: phaseInfo.phase_number,
        plan_count: plans.length,
        summary_count: summaries.length,
        incomplete_plans: incompletePlans,
        orphan_summaries: orphanSummaries,
        errors,
        warnings,
    }, raw, errors.length === 0 ? 'complete' : 'incomplete');
}
/**
 * Validate consistency between ROADMAP.md and disk directories.
 * Cross-checks phase definitions, numbering gaps, and plan/summary pairing.
 */
export function cmdValidateConsistency(cwd, raw) {
    const roadmapPath = path.join(cwd, '.fase-ai', 'ROADMAP.md');
    const etapasDir = path.join(cwd, '.fase-ai', 'etapas');
    const errors = [];
    const warnings = [];
    if (!fs.existsSync(roadmapPath)) {
        errors.push('ROADMAP.md não encontrado');
        output({ passed: false, errors, warnings }, raw, 'failed');
        return;
    }
    const roadmapContent = fs.readFileSync(roadmapPath, 'utf-8');
    const roadmapPhases = new Set();
    const phasePattern = /#{2,4}\s*Phase\s+(\d+[A-Z]?(?:\.\d+)*)\s*:/gi;
    let m;
    while ((m = phasePattern.exec(roadmapContent)) !== null) {
        roadmapPhases.add(m[1]);
    }
    const diskPhases = new Set();
    try {
        const entries = fs.readdirSync(etapasDir, { withFileTypes: true });
        const dirs = entries.filter((e) => e.isDirectory()).map((e) => e.name);
        for (const dir of dirs) {
            const dm = dir.match(/^(\d+[A-Z]?(?:\.\d+)*)/i);
            if (dm)
                diskPhases.add(dm[1]);
        }
    }
    catch { }
    for (const p of roadmapPhases) {
        if (!diskPhases.has(p) && !diskPhases.has(normalizeEtapaNome(p))) {
            warnings.push(`Fase ${p} em ROADMAP.md mas nenhum diretório no disco`);
        }
    }
    for (const p of diskPhases) {
        const unpadded = String(parseInt(p, 10));
        if (!roadmapPhases.has(p) && !roadmapPhases.has(unpadded)) {
            warnings.push(`Fase ${p} existe no disco mas não em ROADMAP.md`);
        }
    }
    const integerPhases = [...diskPhases]
        .filter((p) => !p.includes('.'))
        .map((p) => parseInt(p, 10))
        .sort((a, b) => a - b);
    for (let i = 1; i < integerPhases.length; i++) {
        if (integerPhases[i] !== integerPhases[i - 1] + 1) {
            warnings.push(`Lacuna na numeração de fases: ${integerPhases[i - 1]} → ${integerPhases[i]}`);
        }
    }
    try {
        const entries = fs.readdirSync(etapasDir, { withFileTypes: true });
        const dirs = entries
            .filter((e) => e.isDirectory())
            .map((e) => e.name)
            .sort();
        for (const dir of dirs) {
            const phaseFiles = fs.readdirSync(path.join(etapasDir, dir));
            const plans = phaseFiles.filter((f) => f.endsWith('-PLAN.md')).sort();
            const planNums = plans
                .map((p) => {
                const pm = p.match(/-(\d{2})-PLAN\.md$/);
                return pm ? parseInt(pm[1], 10) : null;
            })
                .filter((n) => n !== null);
            for (let i = 1; i < planNums.length; i++) {
                if (planNums[i] !== planNums[i - 1] + 1) {
                    warnings.push(`Lacuna na numeração de planos em ${dir}: plano ${planNums[i - 1]} → ${planNums[i]}`);
                }
            }
            const summaries = phaseFiles.filter((f) => f.endsWith('-SUMMARY.md'));
            const planIds = new Set(plans.map((p) => p.replace('-PLAN.md', '')));
            const summaryIds = new Set(summaries.map((s) => s.replace('-SUMMARY.md', '')));
            for (const sid of summaryIds) {
                if (!planIds.has(sid)) {
                    warnings.push(`Resumo ${sid}-SUMMARY.md em ${dir} não tem PLAN.md correspondente`);
                }
            }
        }
    }
    catch { }
    try {
        const entries = fs.readdirSync(etapasDir, { withFileTypes: true });
        const dirs = entries.filter((e) => e.isDirectory()).map((e) => e.name);
        for (const dir of dirs) {
            const phaseFiles = fs.readdirSync(path.join(etapasDir, dir));
            const plans = phaseFiles.filter((f) => f.endsWith('-PLAN.md'));
            for (const plan of plans) {
                const content = fs.readFileSync(path.join(etapasDir, dir, plan), 'utf-8');
                const fm = extractFrontmatter(content);
                if (!fm['etapa']) {
                    warnings.push(`${dir}/${plan}: ausência de 'etapa' em frontmatter`);
                }
            }
        }
    }
    catch { }
    const passed = errors.length === 0;
    output({ passed, errors, warnings, warning_count: warnings.length }, raw, passed ? 'passed' : 'failed');
}
//# sourceMappingURL=verify-structure.js.map