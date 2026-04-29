/**
 * Verify — Verification suite, consistency, and health validation
 *
 * This module provides verification functions for FASE project validation.
 * Core utilities are in submodules:
 *   - verify/types.ts: Health and verification interfaces
 *   - verify/verify-files.ts: Artifact and key link verification
 *   - verify/verify-structure.ts: Plan structure and consistency validation
 *   - verify/validate-health.ts: Project health validation with repair
 *   - verification-utils.ts: Shared helper functions
 */
import fs from 'fs';
import path from 'path';
import { output, error } from './core.js';
import { execGit } from './git.js';
import { requireParam, resolveVerificationPath, loadVerificationFile, outputVerificationResult, isValidCommitHash, fileExists, extractAtReferences, extractBacktickReferences, } from './verification-utils.js';
export { cmdVerifyArtifacts, cmdVerifyKeyLinks } from './verify/verify-files.js';
export { cmdVerifyPlanStructure, cmdVerifyPhaseCompleteness, cmdValidateConsistency } from './verify/verify-structure.js';
export { cmdValidateHealth } from './verify/validate-health.js';
// ─── Summary Verification ───────────────────────────────────────────────────
/**
 * Verify SUMMARY.md file references and commit hashes.
 * Checks file creation references, git commit validity, and self-check section.
 */
export function cmdVerifySummary(cwd, summaryPath, checkFileCount, raw) {
    if (!summaryPath) {
        error('caminho-do-resumo obrigatório');
    }
    const fullPath = path.join(cwd, summaryPath);
    const checkCount = checkFileCount || 2;
    if (!fs.existsSync(fullPath)) {
        output({
            passed: false,
            checks: {
                summary_exists: false,
                files_created: { checked: 0, found: 0, missing: [] },
                commits_exist: false,
                self_check: 'not_found',
            },
            errors: ['SUMMARY.md não encontrado'],
        }, raw, 'failed');
        return;
    }
    const content = fs.readFileSync(fullPath, 'utf-8');
    const errors = [];
    const mentionedFiles = new Set();
    const patterns = [
        /`([^`]+\.[a-zA-Z]+)`/g,
        /(?:Created|Modified|Added|Updated|Edited):\s*`?([^\s`]+\.[a-zA-Z]+)`?/gi,
    ];
    for (const pattern of patterns) {
        let m;
        while ((m = pattern.exec(content)) !== null) {
            const filePath = m[1];
            if (filePath && !filePath.startsWith('http') && filePath.includes('/')) {
                mentionedFiles.add(filePath);
            }
        }
    }
    const filesToCheck = Array.from(mentionedFiles).slice(0, checkCount);
    const missing = [];
    for (const file of filesToCheck) {
        if (!fs.existsSync(path.join(cwd, file))) {
            missing.push(file);
        }
    }
    const commitHashPattern = /\b[0-9a-f]{7,40}\b/g;
    const hashes = content.match(commitHashPattern) || [];
    let commitsExist = false;
    if (hashes.length > 0) {
        for (const hash of hashes.slice(0, 3)) {
            const result = execGit(cwd, ['cat-file', '-t', hash]);
            if (result.exitCode === 0 && result.stdout === 'commit') {
                commitsExist = true;
                break;
            }
        }
    }
    let selfCheck = 'not_found';
    const selfCheckPattern = /##\s*(?:Self[- ]?Check|Verification|Quality Check)/i;
    if (selfCheckPattern.test(content)) {
        const passPattern = /(?:all\s+)?(?:pass|✓|✅|complete|succeeded)/i;
        const failPattern = /(?:fail|✗|❌|incomplete|blocked)/i;
        const checkSection = content.slice(content.search(selfCheckPattern));
        if (failPattern.test(checkSection)) {
            selfCheck = 'failed';
        }
        else if (passPattern.test(checkSection)) {
            selfCheck = 'passed';
        }
    }
    if (missing.length > 0)
        errors.push('Arquivos ausentes: ' + missing.join(', '));
    if (!commitsExist && hashes.length > 0)
        errors.push('Hashes de commit referenciados não encontrados no histórico git');
    if (selfCheck === 'failed')
        errors.push('Seção de auto-verificação indica falha');
    const checks = {
        summary_exists: true,
        files_created: {
            checked: filesToCheck.length,
            found: filesToCheck.length - missing.length,
            missing,
        },
        commits_exist: commitsExist,
        self_check: selfCheck,
    };
    const passed = missing.length === 0 && selfCheck !== 'failed';
    output({ passed, checks, errors }, raw, passed ? 'passed' : 'failed');
}
// ─── Reference Verification ─────────────────────────────────────────────────
/**
 * Verify @ and backtick file references in content.
 * Checks that all referenced files exist on disk.
 */
export function cmdVerifyReferences(cwd, filePath, raw) {
    requireParam(filePath, 'caminho do arquivo');
    const fullPath = resolveVerificationPath(cwd, filePath);
    const content = loadVerificationFile(fullPath);
    if (!content) {
        output({ error: 'Arquivo não encontrado', path: filePath }, raw);
        return;
    }
    const found = [];
    const missing = [];
    // Check @ references
    const atRefs = extractAtReferences(content);
    for (const ref of atRefs) {
        const resolved = ref.startsWith('~/')
            ? path.join(process.env['HOME'] || '', ref.slice(2))
            : path.join(cwd, ref);
        if (fileExists(resolved)) {
            found.push(ref);
        }
        else {
            missing.push(ref);
        }
    }
    // Check backtick file references
    const backtickRefs = extractBacktickReferences(content);
    for (const ref of backtickRefs) {
        if (found.includes(ref) || missing.includes(ref))
            continue;
        const resolved = path.join(cwd, ref);
        if (fileExists(resolved)) {
            found.push(ref);
        }
        else {
            missing.push(ref);
        }
    }
    outputVerificationResult({
        valid: missing.length === 0,
        found: found.length,
        missing,
        total: found.length + missing.length,
        errors: [],
    }, raw);
}
// ─── Commit Verification ───────────────────────────────────────────────────
/**
 * Verify git commit hashes exist in history.
 * Checks each hash is a valid commit object.
 */
export function cmdVerifyCommits(cwd, hashes, raw) {
    if (!hashes || hashes.length === 0) {
        error('Pelo menos um hash de commit obrigatório');
    }
    const valid = [];
    const invalid = [];
    for (const hash of hashes) {
        if (isValidCommitHash(cwd, hash)) {
            valid.push(hash);
        }
        else {
            invalid.push(hash);
        }
    }
    outputVerificationResult({
        all_valid: invalid.length === 0,
        valid_hashes: valid,
        invalid_hashes: invalid,
        total: hashes.length,
        errors: [],
    }, raw);
}
//# sourceMappingURL=verify.js.map