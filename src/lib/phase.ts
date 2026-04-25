/**
 * Phase — Unified Phase/Etapa/Milestone module
 *
 * Deepening of scattered Phase concept. Previously:
 * - EtapaInfo, MilestoneInfo, RoadmapEtapaInfo in core.ts
 * - findEtapaInternal, getMilestoneInfo in core.ts
 * - Etapa operations in etapa.ts
 * - Milestone operations in milestone.ts
 * - Roadmap operations in roadmap.ts
 * - State management in state.ts
 *
 * Now: One module for Phase-related types and utilities.
 * Each file imports from this seam instead of core.ts.
 */

import fs from 'fs';
import path from 'path';
import { toPosixPath } from './path.js';

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * Phase/Etapa information from disk
 */
export interface EtapaInfo {
  found: boolean;
  directory: string;
  phase_number: string;
  phase_name: string | null;
  phase_slug: string | null;
  plans: string[];
  summaries: string[];
  incomplete_plans: string[];
  has_research: boolean;
  has_context: boolean;
  has_verification: boolean;
  archived?: string;
}

/**
 * Milestone information from ROADMAP.md
 */
export interface MilestoneInfo {
  version: string;
  name: string;
}

/**
 * Archived phase entry
 */
export interface ArchivedEtapaEntry {
  name: string;
  milestone: string;
  basePath: string;
  fullPath: string;
}

/**
 * Phase information from ROADMAP.md section
 */
export interface RoadmapEtapaInfo {
  found: boolean;
  phase_number: string;
  phase_name: string;
  goal: string | null;
  section: string;
}

/**
 * Filter function for milestone phases
 */
export type MilestoneEtapaFilter = ((dirName: string) => boolean) & { phaseCount: number };

// ─── Utility functions ─────────────────────────────────────────────────────────

/**
 * Escape a value for use in regex patterns
 */
export function escapeRegex(value: unknown): string {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Normalize an etapa number to canonical form
 * Examples: 1 → 01, 3A → 03A, 2.1 → 02.1
 */
export function normalizeEtapaNome(etapa: unknown): string {
  const match = String(etapa).match(/^(\d+)([A-Z])?((?:\.\d+)*)/i);
  if (!match) return String(etapa);
  const padded = match[1].padStart(2, '0');
  const letter = match[2] ? match[2].toUpperCase() : '';
  const decimal = match[3] ?? '';
  return padded + letter + decimal;
}

/**
 * Compare two etapa numbers for sorting
 */
export function compareEtapaNum(a: string, b: string): number {
  const pa = String(a).match(/^(\d+)([A-Z])?((?:\.\d+)*)/i);
  const pb = String(b).match(/^(\d+)([A-Z])?((?:\.\d+)*)/i);
  if (!pa || !pb) return String(a).localeCompare(String(b));

  const intDiff = parseInt(pa[1], 10) - parseInt(pb[1], 10);
  if (intDiff !== 0) return intDiff;

  const la = (pa[2] ?? '').toUpperCase();
  const lb = (pb[2] ?? '').toUpperCase();
  if (la !== lb) {
    if (!la) return -1;
    if (!lb) return 1;
    return la < lb ? -1 : 1;
  }

  const aDecParts = pa[3]
    ? pa[3]
        .slice(1)
        .split('.')
        .map((p) => parseInt(p, 10))
    : [];
  const bDecParts = pb[3]
    ? pb[3]
        .slice(1)
        .split('.')
        .map((p) => parseInt(p, 10))
    : [];
  const maxLen = Math.max(aDecParts.length, bDecParts.length);

  if (aDecParts.length === 0 && bDecParts.length > 0) return -1;
  if (bDecParts.length === 0 && aDecParts.length > 0) return 1;

  for (let i = 0; i < maxLen; i++) {
    const av = Number.isFinite(aDecParts[i]) ? aDecParts[i] : 0;
    const bv = Number.isFinite(bDecParts[i]) ? bDecParts[i] : 0;
    if (av !== bv) return av - bv;
  }
  return 0;
}

/**
 * Search for an etapa directory in a base directory
 */
export function searchEtapaInDir(
  baseDir: string,
  relBase: string,
  normalized: string
): EtapaInfo | null {
  try {
    const entries = fs.readdirSync(baseDir, { withFileTypes: true });
    const dirs = entries
      .filter((e) => e.isDirectory())
      .map((e) => e.name)
      .sort((a, b) => compareEtapaNum(a, b));

    const match = dirs.find((d) => d.startsWith(normalized));
    if (!match) return null;

    const dirMatch = match.match(/^(\d+[A-Z]?(?:\.\d+)*)-?(.*)/i);
    const etapaNumber = dirMatch ? dirMatch[1] : normalized;
    const etapaNome = dirMatch?.[2] ?? null;
    const phaseDir = path.join(baseDir, match);
    const phaseFiles = fs.readdirSync(phaseDir);

    const plans = phaseFiles
      .filter((f: string) => f.endsWith('-PLAN.md') || f === 'PLAN.md')
      .sort();
    const summaries = phaseFiles
      .filter((f: string) => f.endsWith('-SUMMARY.md') || f === 'SUMMARY.md')
      .sort();
    const hasResearch = phaseFiles.some(
      (f: string) => f.endsWith('-RESEARCH.md') || f === 'RESEARCH.md'
    );
    const hasContext = phaseFiles.some(
      (f: string) => f.endsWith('-CONTEXT.md') || f === 'CONTEXT.md'
    );
    const hasVerification = phaseFiles.some(
      (f: string) => f.endsWith('-VERIFICATION.md') || f === 'VERIFICATION.md'
    );

    const completedPlanIds = new Set(
      summaries.map((s: string) => s.replace('-SUMMARY.md', '').replace('SUMMARY.md', ''))
    );
    const incompletePlans = plans.filter((p: string) => {
      const planId = p.replace('-PLAN.md', '').replace('PLAN.md', '');
      return !completedPlanIds.has(planId);
    });

    return {
      found: true,
      directory: toPosixPath(path.join(relBase, match)),
      phase_number: etapaNumber,
      phase_name: etapaNome,
      phase_slug: etapaNome
        ? etapaNome
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
        : null,
      plans,
      summaries,
      incomplete_plans: incompletePlans,
      has_research: hasResearch,
      has_context: hasContext,
      has_verification: hasVerification,
    };
  } catch (err) {
    process.stderr.write(
      `[phase:searchEtapaInDir] Failed to search etapa directory: ${(err as Error).message}\n`
    );
    return null;
  }
}

/**
 * Find an etapa directory by number (current or archived)
 */
export function findEtapaInternal(cwd: string, etapa: string): EtapaInfo | null {
  if (!etapa) return null;

  const etapasDir = path.join(cwd, '.fase-ai', 'etapas');
  const normalized = normalizeEtapaNome(etapa);

  const current = searchEtapaInDir(etapasDir, '.fase-ai/phases', normalized);
  if (current) return current;

  const milestonesDir = path.join(cwd, '.fase-ai', 'milestones');
  if (!fs.existsSync(milestonesDir)) return null;

  try {
    const milestoneEntries = fs.readdirSync(milestonesDir, { withFileTypes: true });
    const archiveDirs = milestoneEntries
      .filter((e) => e.isDirectory() && /^v[\d.]+-phases$/.test(e.name))
      .map((e) => e.name)
      .sort()
      .reverse();

    for (const archiveName of archiveDirs) {
      const versionMatch = archiveName.match(/^(v[\d.]+)-phases$/);
      const version = versionMatch?.[1] ?? archiveName;
      const archivePath = path.join(milestonesDir, archiveName);
      const relBase = '.fase-ai/milestones/' + archiveName;
      const result = searchEtapaInDir(archivePath, relBase, normalized);
      if (result) {
        result.archived = version;
        return result;
      }
    }
  } catch (err) {
    process.stderr.write(
      `[phase:findEtapaInternal] Failed to search archived etapas: ${(err as Error).message}\n`
    );
  }

  return null;
}

/**
 * Get all archived etapa directories
 */
export function getArchivedEtapasDirs(cwd: string): ArchivedEtapaEntry[] {
  const milestonesDir = path.join(cwd, '.fase-ai', 'milestones');
  const results: ArchivedEtapaEntry[] = [];

  if (!fs.existsSync(milestonesDir)) return results;

  try {
    const milestoneEntries = fs.readdirSync(milestonesDir, { withFileTypes: true });
    const etapasDirs = milestoneEntries
      .filter((e) => e.isDirectory() && /^v[\d.]+-phases$/.test(e.name))
      .map((e) => e.name)
      .sort()
      .reverse();

    for (const archiveName of etapasDirs) {
      const versionMatch = archiveName.match(/^(v[\d.]+)-phases$/);
      const version = versionMatch?.[1] ?? archiveName;
      const archivePath = path.join(milestonesDir, archiveName);
      const entries = fs.readdirSync(archivePath, { withFileTypes: true });
      const dirs = entries
        .filter((e) => e.isDirectory())
        .map((e) => e.name)
        .sort((a, b) => compareEtapaNum(a, b));

      for (const dir of dirs) {
        results.push({
          name: dir,
          milestone: version,
          basePath: path.join('.fase-ai', 'milestones', archiveName),
          fullPath: path.join(archivePath, dir),
        });
      }
    }
  } catch (err) {
    process.stderr.write(
      `[phase:getArchivedEtapasDirs] Failed to read archived etapas: ${(err as Error).message}\n`
    );
  }

  return results;
}

/**
 * Get phase information from ROADMAP.md section
 */
export function getRoadmapEtapaInternal(
  cwd: string,
  etapaNum: string | number
): RoadmapEtapaInfo | null {
  if (!etapaNum) return null;
  const roadmapPath = path.join(cwd, '.fase-ai', 'ROADMAP.md');
  if (!fs.existsSync(roadmapPath)) return null;

  try {
    const content = fs.readFileSync(roadmapPath, 'utf-8');
    const escapedEtapa = escapeRegex(etapaNum.toString());
    const phasePattern = new RegExp(
      `#{2,4}\\s*(?:Phase|Etapa)\\s+${escapedEtapa}:\\s*([^\\n]+)`,
      'i'
    );
    const headerMatch = content.match(phasePattern);
    if (!headerMatch) return null;

    const etapaNome = headerMatch[1].trim();
    const headerIndex = headerMatch.index ?? 0;
    const restOfContent = content.slice(headerIndex);
    const nextHeaderMatch = restOfContent.match(/\n#{2,4}\s+(?:Phase|Etapa)\s+\d/i);
    const sectionEnd = nextHeaderMatch
      ? headerIndex + (nextHeaderMatch.index ?? 0)
      : content.length;
    const section = content.slice(headerIndex, sectionEnd).trim();

    const goalMatch = section.match(/\*\*Goal:\*\*\s*([^\n]+)/i);
    const goal = goalMatch ? goalMatch[1].trim() : null;

    return {
      found: true,
      phase_number: etapaNum.toString(),
      phase_name: etapaNome,
      goal,
      section,
    };
  } catch (err) {
    process.stderr.write(
      `[phase:getRoadmapEtapaInternal] Failed to read roadmap: ${(err as Error).message}\n`
    );
    return null;
  }
}

/**
 * Get current milestone information from ROADMAP.md
 */
export function getMilestoneInfo(cwd: string): MilestoneInfo {
  try {
    const roadmap = fs.readFileSync(path.join(cwd, '.fase-ai', 'ROADMAP.md'), 'utf-8');

    const inProgressMatch = roadmap.match(/🚧\s*\*\*v(\d+\.\d+)\s+([^*]+)\*\*/);
    if (inProgressMatch) {
      return {
        version: 'v' + inProgressMatch[1],
        name: inProgressMatch[2].trim(),
      };
    }

    const cleaned = roadmap.replace(/<details>[\s\S]*?<\/details>/gi, '');
    const headingMatch = cleaned.match(/## .*v(\d+\.\d+)[:\s]+([^\n(]+)/);
    if (headingMatch) {
      return {
        version: 'v' + headingMatch[1],
        name: headingMatch[2].trim(),
      };
    }

    const versionMatch = cleaned.match(/v(\d+\.\d+)/);
    return {
      version: versionMatch ? versionMatch[0] : 'v1.0',
      name: 'milestone',
    };
  } catch (err) {
    process.stderr.write(
      `[phase:getMilestoneInfo] Failed to read roadmap: ${(err as Error).message}\n`
    );
    return { version: 'v1.0', name: 'milestone' };
  }
}

/**
 * Get a filter function for milestone phases
 */
export function getMilestoneEtapaFilter(cwd: string): MilestoneEtapaFilter {
  const milestonePhaseNums = new Set<string>();
  try {
    const roadmap = fs.readFileSync(path.join(cwd, '.fase-ai', 'ROADMAP.md'), 'utf-8');
    const phasePattern = /#{2,4}\s*Phase\s+(\d+[A-Z]?(?:\.\d+)*)\s*:/gi;
    let m: RegExpExecArray | null;
    while ((m = phasePattern.exec(roadmap)) !== null) {
      milestonePhaseNums.add(m[1]);
    }
  } catch (err) {
    process.stderr.write(
      `[phase:getMilestoneEtapaFilter] Failed to read roadmap: ${(err as Error).message}\n`
    );
  }

  if (milestonePhaseNums.size === 0) {
    const passAll = (() => true) as unknown as MilestoneEtapaFilter;
    passAll.phaseCount = 0;
    return passAll;
  }

  const normalized = new Set(
    [...milestonePhaseNums].map((n) => (n.replace(/^0+/, '') || '0').toLowerCase())
  );

  function isDirInMilestone(dirName: string): boolean {
    const m = dirName.match(/^0*(\d+[A-Za-z]?(?:\.\d+)*)/);
    if (!m) return false;
    return normalized.has(m[1].toLowerCase());
  }
  (isDirInMilestone as MilestoneEtapaFilter).phaseCount = milestonePhaseNums.size;
  return isDirInMilestone as MilestoneEtapaFilter;
}
