/**
 * Validate Health — Project health validation with auto-repair
 *
 * Comprehensive health checks for FASE project structure with optional repair.
 */

import fs from 'fs';
import path from 'path';
import { getMilestoneInfo, output } from '../core.js';
import { writeStateMd } from '../state.js';
import { HealthIssue, ValidateHealthOptions } from './types.js';

/**
 * Validate project health and optionally repair issues.
 * Checks PROJECT.md, ROADMAP.md, STATE.md, config.json, and phase directories.
 */
export function cmdValidateHealth(cwd: string, options: ValidateHealthOptions, raw: boolean): void {
  const planejamentoDir = path.join(cwd, '.fase-ai');
  const projectPath = path.join(planejamentoDir, 'PROJECT.md');
  const roadmapPath = path.join(planejamentoDir, 'ROADMAP.md');
  const statePath = path.join(planejamentoDir, 'STATE.md');
  const configPath = path.join(planejamentoDir, 'config.json');
  const etapasDir = path.join(planejamentoDir, 'etapas');

  const errors: HealthIssue[] = [];
  const warnings: HealthIssue[] = [];
  const info: HealthIssue[] = [];
  const repairs: string[] = [];

  const addIssue = (
    severity: 'error' | 'warning' | 'info',
    code: string,
    message: string,
    fix: string,
    repairable = false
  ): void => {
    const issue: HealthIssue = { code, message, fix, repairable };
    if (severity === 'error') errors.push(issue);
    else if (severity === 'warning') warnings.push(issue);
    else info.push(issue);
  };

  if (!fs.existsSync(planejamentoDir)) {
    addIssue(
      'error',
      'E001',
      'diretório .fase-ai/ não encontrado',
      'Execute /gsd:novo-projeto para inicializar'
    );
    output({ status: 'quebrado', errors, warnings, info, repairable_count: 0 }, raw);
    return;
  }

  if (!fs.existsSync(projectPath)) {
    addIssue('error', 'E002', 'PROJECT.md não encontrado', 'Execute /gsd:novo-projeto para criar');
  } else {
    const content = fs.readFileSync(projectPath, 'utf-8');
    const requiredSections = ['## O Que É Isso', '## Valor Central', '## Requisitos'];
    for (const section of requiredSections) {
      if (!content.includes(section)) {
        addIssue(
          'warning',
          'W001',
          `PROJECT.md sem seção: ${section}`,
          'Adicione seção manualmente'
        );
      }
    }
  }

  if (!fs.existsSync(roadmapPath)) {
    addIssue(
      'error',
      'E003',
      'ROADMAP.md não encontrado',
      'Execute /gsd:novo-marco para criar roadmap'
    );
  }

  if (!fs.existsSync(statePath)) {
    addIssue(
      'error',
      'E004',
      'STATE.md não encontrado',
      'Execute /gsd:saude --repair para regenerar',
      true
    );
    repairs.push('regenerateState');
  } else {
    const stateContent = fs.readFileSync(statePath, 'utf-8');
    const phaseRefs = [...stateContent.matchAll(/[Pp]hase\s+(\d+(?:\.\d+)*)/g)].map((mm) => mm[1]);
    const diskPhases = new Set<string>();
    try {
      const entries = fs.readdirSync(etapasDir, { withFileTypes: true });
      for (const e of entries) {
        if (e.isDirectory()) {
          const mm = e.name.match(/^(\d+(?:\.\d+)*)/);
          if (mm) diskPhases.add(mm[1]);
        }
      }
    } catch {}
    for (const ref of phaseRefs) {
      const normalizedRef = String(parseInt(ref, 10)).padStart(2, '0');
      if (
        !diskPhases.has(ref) &&
        !diskPhases.has(normalizedRef) &&
        !diskPhases.has(String(parseInt(ref, 10)))
      ) {
        if (diskPhases.size > 0) {
          addIssue(
            'warning',
            'W002',
            `STATE.md referencia fase ${ref}, mas apenas fases ${[...diskPhases].sort().join(', ')} existem`,
            'Execute /gsd:saude --repair para regenerar STATE.md',
            true
          );
          if (!repairs.includes('regenerateState')) repairs.push('regenerateState');
        }
      }
    }
  }

  if (!fs.existsSync(configPath)) {
    addIssue(
      'warning',
      'W003',
      'config.json não encontrado',
      'Execute /gsd:saude --repair para criar com padrões',
      true
    );
    repairs.push('createConfig');
  } else {
    try {
      const rawContent = fs.readFileSync(configPath, 'utf-8');
      const parsed = JSON.parse(rawContent) as Record<string, unknown>;
      const validProfiles = ['quality', 'balanced', 'budget'];
      if (parsed['model_profile'] && !validProfiles.includes(parsed['model_profile'] as string)) {
        addIssue(
          'warning',
          'W004',
          `config.json: model_profile inválido "${parsed['model_profile']}"`,
          `Valores válidos: ${validProfiles.join(', ')}`
        );
      }
    } catch (err) {
      addIssue(
        'error',
        'E005',
        `config.json: erro de parse JSON - ${(err as Error).message}`,
        'Execute /gsd:saude --repair para resetar para padrões',
        true
      );
      repairs.push('resetConfig');
    }
  }

  if (fs.existsSync(configPath)) {
    try {
      const configRaw = fs.readFileSync(configPath, 'utf-8');
      const configParsed = JSON.parse(configRaw) as Record<string, Record<string, unknown>>;
      if (
        configParsed['workflow'] &&
        configParsed['workflow']['nyquist_validation'] === undefined
      ) {
        addIssue(
          'warning',
          'W008',
          'config.json: workflow.nyquist_validation ausente (padrão ativado mas agentes podem pular)',
          'Execute /gsd:saude --repair para adicionar chave',
          true
        );
        if (!repairs.includes('addNyquistKey')) repairs.push('addNyquistKey');
      }
    } catch {}
  }

  try {
    const entries = fs.readdirSync(etapasDir, { withFileTypes: true });
    for (const e of entries) {
      if (e.isDirectory() && !e.name.match(/^\d{2}(?:\.\d+)*-[\w-]+$/)) {
        addIssue(
          'warning',
          'W005',
          `Diretório de fase "${e.name}" não segue formato NN-nome`,
          'Renomeie para corresponder ao padrão (ex: 01-setup)'
        );
      }
    }
  } catch {}

  try {
    const entries = fs.readdirSync(etapasDir, { withFileTypes: true });
    for (const e of entries) {
      if (!e.isDirectory()) continue;
      const phaseFiles = fs.readdirSync(path.join(etapasDir, e.name));
      const plans = phaseFiles.filter((f: string) => f.endsWith('-PLAN.md') || f === 'PLAN.md');
      const summaries = phaseFiles.filter(
        (f: string) => f.endsWith('-SUMMARY.md') || f === 'SUMMARY.md'
      );
      const summaryBases = new Set(
        summaries.map((s: string) => s.replace('-SUMMARY.md', '').replace('SUMMARY.md', ''))
      );

      for (const plan of plans) {
        const planBase = plan.replace('-PLAN.md', '').replace('PLAN.md', '');
        if (!summaryBases.has(planBase)) {
          addIssue(
            'info',
            'I001',
            `${e.name}/${plan} não tem SUMMARY.md`,
            'Pode estar em progresso'
          );
        }
      }
    }
  } catch {}

  try {
    const phaseEntries = fs.readdirSync(etapasDir, { withFileTypes: true });
    for (const e of phaseEntries) {
      if (!e.isDirectory()) continue;
      const phaseFiles = fs.readdirSync(path.join(etapasDir, e.name));
      const hasResearch = phaseFiles.some((f: string) => f.endsWith('-RESEARCH.md'));
      const hasValidation = phaseFiles.some((f: string) => f.endsWith('-VALIDATION.md'));
      if (hasResearch && !hasValidation) {
        const researchFile = phaseFiles.find((f: string) => f.endsWith('-RESEARCH.md'));
        if (researchFile) {
          const researchContent = fs.readFileSync(
            path.join(etapasDir, e.name, researchFile),
            'utf-8'
          );
          if (researchContent.includes('## Validation Architecture')) {
            addIssue(
              'warning',
              'W009',
              `Fase ${e.name}: tem Validation Architecture em RESEARCH.md mas nenhum VALIDATION.md`,
              'Execute novamente /gsd:planejar-fase com --research para regenerar'
            );
          }
        }
      }
    }
  } catch {}

  if (fs.existsSync(roadmapPath)) {
    const roadmapContent = fs.readFileSync(roadmapPath, 'utf-8');
    const roadmapPhases = new Set<string>();
    const phasePattern = /#{2,4}\s*Phase\s+(\d+[A-Z]?(?:\.\d+)*)\s*:/gi;
    let m: RegExpExecArray | null;
    while ((m = phasePattern.exec(roadmapContent)) !== null) {
      roadmapPhases.add(m[1]);
    }

    const diskPhases = new Set<string>();
    try {
      const entries = fs.readdirSync(etapasDir, { withFileTypes: true });
      for (const e of entries) {
        if (e.isDirectory()) {
          const dm = e.name.match(/^(\d+[A-Z]?(?:\.\d+)*)/i);
          if (dm) diskPhases.add(dm[1]);
        }
      }
    } catch {}

    for (const p of roadmapPhases) {
      const padded = String(parseInt(p, 10)).padStart(2, '0');
      if (!diskPhases.has(p) && !diskPhases.has(padded)) {
        addIssue(
          'warning',
          'W006',
          `Fase ${p} em ROADMAP.md mas nenhum diretório no disco`,
          'Crie diretório de fase ou remova do roadmap'
        );
      }
    }

    for (const p of diskPhases) {
      const unpadded = String(parseInt(p, 10));
      if (!roadmapPhases.has(p) && !roadmapPhases.has(unpadded)) {
        addIssue(
          'warning',
          'W007',
          `Fase ${p} existe no disco mas não em ROADMAP.md`,
          'Adicione ao roadmap ou remova diretório'
        );
      }
    }
  }

  const repairActions: { action: string; success: boolean; path?: string; error?: string }[] = [];
  if (options.repair && repairs.length > 0) {
    for (const repair of repairs) {
      try {
        switch (repair) {
          case 'createConfig':
          case 'resetConfig': {
            const defaults = {
              model_profile: 'balanced',
              commit_docs: true,
              search_gitignored: false,
              branching_strategy: 'none',
              research: true,
              plan_checker: true,
              verifier: true,
              parallelization: true,
            };
            fs.writeFileSync(configPath, JSON.stringify(defaults, null, 2), 'utf-8');
            repairActions.push({ action: repair, success: true, path: 'config.json' });
            break;
          }
          case 'regenerateState': {
            if (fs.existsSync(statePath)) {
              const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
              const backupPath = `${statePath}.bak-${timestamp}`;
              fs.copyFileSync(statePath, backupPath);
              repairActions.push({ action: 'backupState', success: true, path: backupPath });
            }
            const milestone = getMilestoneInfo(cwd);
            let stateContent = `# Estado da Sessão\n\n`;
            stateContent += `## Referência do Projeto\n\n`;
            stateContent += `Veja: .fase-ai/PROJECT.md\n\n`;
            stateContent += `## Posição\n\n`;
            stateContent += `**Marco:** ${milestone.version} ${milestone.name}\n`;
            stateContent += `**Fase atual:** (determinando...)\n`;
            stateContent += `**Status:** Retomando\n\n`;
            stateContent += `## Log de Sessão\n\n`;
            stateContent += `- ${new Date().toISOString().split('T')[0]}: STATE.md regenerado por /gsd:saude --repair\n`;
            writeStateMd(statePath, stateContent, cwd);
            repairActions.push({ action: repair, success: true, path: 'STATE.md' });
            break;
          }
          case 'addNyquistKey': {
            if (fs.existsSync(configPath)) {
              try {
                const configRaw = fs.readFileSync(configPath, 'utf-8');
                const configParsed = JSON.parse(configRaw) as Record<
                  string,
                  Record<string, unknown>
                >;
                if (!configParsed['workflow']) configParsed['workflow'] = {};
                if (configParsed['workflow']['nyquist_validation'] === undefined) {
                  configParsed['workflow']['nyquist_validation'] = true;
                  fs.writeFileSync(configPath, JSON.stringify(configParsed, null, 2), 'utf-8');
                }
                repairActions.push({ action: repair, success: true, path: 'config.json' });
              } catch (err) {
                repairActions.push({
                  action: repair,
                  success: false,
                  error: (err as Error).message,
                });
              }
            }
            break;
          }
        }
      } catch (err) {
        repairActions.push({ action: repair, success: false, error: (err as Error).message });
      }
    }
  }

  let status: string;
  if (errors.length > 0) {
    status = 'quebrado';
  } else if (warnings.length > 0) {
    status = 'degradado';
  } else {
    status = 'saudável';
  }

  const repairableCount =
    errors.filter((e: HealthIssue) => e.repairable).length +
    warnings.filter((w: HealthIssue) => w.repairable).length;

  output(
    {
      status,
      errors,
      warnings,
      info,
      repairable_count: repairableCount,
      repairs_performed: repairActions.length > 0 ? repairActions : undefined,
    },
    raw
  );
}
