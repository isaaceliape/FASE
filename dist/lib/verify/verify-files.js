/**
 * Verify Files — Artifact and key link verification
 *
 * Validates must_haves.artifacts and must_haves.key_links specifications
 * from PLAN.md frontmatter.
 */
import fs from 'fs';
import path from 'path';
import { output } from '../core.js';
import { safeReadFile } from '../config.js';
import { parseMustHavesBlock } from '../frontmatter.js';
import { requireParam, resolveVerificationPath, loadVerificationFile, } from '../verification-utils.js';
/**
 * Verify artifacts from must_haves.artifacts in PLAN.md frontmatter.
 * Checks file existence, minimum lines, contains patterns, and exports.
 */
export function cmdVerifyArtifacts(cwd, planFilePath, raw) {
    requireParam(planFilePath, 'caminho do arquivo de plano');
    const fullPath = resolveVerificationPath(cwd, planFilePath);
    const content = loadVerificationFile(fullPath);
    if (!content) {
        output({ error: 'Arquivo não encontrado', path: planFilePath }, raw);
        return;
    }
    const artifacts = parseMustHavesBlock(content, 'artifacts');
    if (artifacts.length === 0) {
        output({ error: 'Nenhum must_haves.artifacts encontrado em frontmatter', path: planFilePath }, raw);
        return;
    }
    const results = [];
    for (const artifactRaw of artifacts) {
        if (typeof artifactRaw === 'string')
            continue;
        const artifact = artifactRaw;
        const artPath = artifact.path;
        if (!artPath)
            continue;
        const artFullPath = path.join(cwd, artPath);
        const exists = fs.existsSync(artFullPath);
        const check = { path: artPath, exists, issues: [], passed: false };
        if (exists) {
            const fileContent = safeReadFile(artFullPath) || '';
            const lineCount = fileContent.split('\n').length;
            if (artifact.min_lines && lineCount < artifact.min_lines) {
                check.issues.push(`Apenas ${lineCount} linhas, precisa de ${artifact.min_lines}`);
            }
            if (artifact.contains && !fileContent.includes(artifact.contains)) {
                check.issues.push(`Padrão ausente: ${artifact.contains}`);
            }
            if (artifact.exports) {
                const exportList = Array.isArray(artifact.exports) ? artifact.exports : [artifact.exports];
                for (const exp of exportList) {
                    if (!fileContent.includes(exp))
                        check.issues.push(`Export ausente: ${exp}`);
                }
            }
            check.passed = check.issues.length === 0;
        }
        else {
            check.issues.push('Arquivo não encontrado');
        }
        results.push(check);
    }
    const passed = results.filter((r) => r.passed).length;
    output({
        all_passed: passed === results.length,
        passed,
        total: results.length,
        artifacts: results,
    }, raw, passed === results.length ? 'valid' : 'invalid');
}
/**
 * Verify key links from must_haves.key_links in PLAN.md frontmatter.
 * Checks that source files reference destination files or match patterns.
 */
export function cmdVerifyKeyLinks(cwd, planFilePath, raw) {
    requireParam(planFilePath, 'caminho do arquivo de plano');
    const fullPath = resolveVerificationPath(cwd, planFilePath);
    const content = loadVerificationFile(fullPath);
    if (!content) {
        output({ error: 'Arquivo não encontrado', path: planFilePath }, raw);
        return;
    }
    const keyLinks = parseMustHavesBlock(content, 'key_links');
    if (keyLinks.length === 0) {
        output({ error: 'Nenhum must_haves.key_links encontrado em frontmatter', path: planFilePath }, raw);
        return;
    }
    const results = [];
    for (const linkRaw of keyLinks) {
        if (typeof linkRaw === 'string')
            continue;
        const link = linkRaw;
        const check = {
            from: link.from,
            to: link.to,
            via: link.via || '',
            verified: false,
            detail: '',
        };
        const sourceContent = safeReadFile(path.join(cwd, link.from || ''));
        if (!sourceContent) {
            check.detail = 'Arquivo de origem não encontrado';
        }
        else if (link.pattern) {
            try {
                const regex = new RegExp(link.pattern);
                if (regex.test(sourceContent)) {
                    check.verified = true;
                    check.detail = 'Padrão encontrado na origem';
                }
                else {
                    const targetContent = safeReadFile(path.join(cwd, link.to || ''));
                    if (targetContent && regex.test(targetContent)) {
                        check.verified = true;
                        check.detail = 'Padrão encontrado no destino';
                    }
                    else {
                        check.detail = `Padrão "${link.pattern}" não encontrado na origem ou destino`;
                    }
                }
            }
            catch {
                check.detail = `Padrão regex inválido: ${link.pattern}`;
            }
        }
        else {
            if (sourceContent.includes(link.to || '')) {
                check.verified = true;
                check.detail = 'Destino referenciado na origem';
            }
            else {
                check.detail = 'Destino não referenciado na origem';
            }
        }
        results.push(check);
    }
    const verified = results.filter((r) => r.verified).length;
    output({
        all_verified: verified === results.length,
        verified,
        total: results.length,
        links: results,
    }, raw, verified === results.length ? 'valid' : 'invalid');
}
//# sourceMappingURL=verify-files.js.map