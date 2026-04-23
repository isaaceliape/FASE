---
phase: 05-eliminar-duplicacao
plan: 01
subsystem: documentation
tags: [docs, structure, duplication, src-vs-bin]
duration: 15 minutes
completed_date: 2026-04-23

must_haves:
  truths:
    - "Usuário sabe qual é o source oficial (src/)"
    - "bin/ propósito está claramente documentado"
    - "TypeScript compilation usa src/ como rootDir"
  artifacts:
    - path: "bin/README.md"
      provides: "Documentação do propósito de bin/"
      exists: true
      lines: 89
    - path: ".fase-ai/codigo/STRUCTURE.md"
      provides: "Atualização do description de bin/"
      exists: true
      contains: "DISCONTINUED"
  key_links:
    - from: "tsconfig.json"
      to: "src/"
      via: "rootDir: 'src'"
      verified: true

key_files:
  created:
    - bin/README.md (89 lines, documentation for bin/ purpose)
    - .fase-ai/codigo/STRUCTURE.md (253 lines, updated bin/ section)
  modified:
    - bin/README.md (replaced outdated npm package README with structure documentation)
    - .fase-ai/codigo/STRUCTURE.md (updated bin/ description from legacy to discontinued)

key_decisions:
  - "src/ confirmed as official source directory (tsconfig.json rootDir: 'src')"
  - "bin/src/ classified as legacy/outdated (version 3.3.1 vs current 5.0.1)"
  - "bin/README.md created to document bin/ purpose for future developers"
  - "STRUCTURE.md updated with warning to NOT use bin/src/ as source"
  - "Phase 5 Plan 02 will remove bin/src/ duplicated sources"

deviations: []
---

# Etapa 5 Plan 01: Determine Official Source - Summary

## One-Liner
Documented src/ as official source directory and clarified bin/ contains outdated legacy TypeScript sources (v3.3.1), with warnings for developers.

---

## Tasks Completed

| Tarefa | Nome | Commit | Files |
|--------|------|--------|-------|
| 1 | Criar bin/README.md documentando propósito | f04297f | bin/README.md |
| 2 | Atualizar STRUCTURE.md description de bin/ | c4368fd | .fase-ai/codigo/STRUCTURE.md |
| 3 | Verificar tsconfig.json confirma src/ como rootDir | - | tsconfig.json (verification-only) |

**Total Tasks:** 3
**Completed:** 3
**Duration:** ~15 minutes

---

## What Was Built

### bin/README.md (89 lines)
Created comprehensive documentation file explaining:
- **Purpose:** bin/ contains legacy npm package content (DISCONTINUED)
- **Official Source:** src/ is the official source directory
- **Warning:** DO NOT use bin/src/ as source
- **Version Comparison:** root package.json 5.0.1 vs bin/package.json 3.3.1
- **Files Duplicated:** Listed 12 files with different versions in src/lib/ vs bin/src/lib/
- **Cleanup Plan:** bin/src/ will be removed in Phase 5 Plan 02

### .fase-ai/codigo/STRUCTURE.md (Updated)
Updated bin/ section from "Pre-built package content" to:
- **Propósito:** Legacy npm package directory (DISCONTINUED)
- **Status:** Contains outdated TypeScript sources (version 3.3.1)
- **Warning:** ⚠️ DO NOT use bin/src/ as source — official source is src/
- **Key Evidence:** tsconfig.json rootDir, version mismatch, older code patterns
- Added warning in Special Directories section

### tsconfig.json Verification
Confirmed configuration:
- `rootDir: "src"` — Official source directory
- `outDir: "dist"` — Compiled output
- `include: ["src/**/*.ts"]` — Only src/ is compiled

---

## Verification Results

### Automated Checks
```bash
✅ grep -c "Official Source" bin/README.md → Found
✅ grep -c "DISCONTINUED" STRUCTURE.md → 2 matches
✅ grep '"rootDir": "src"' tsconfig.json → Verified
✅ grep '"outDir": "dist"' tsconfig.json → Verified
✅ npm test → 349 passing (2s)
```

### Success Criteria Met
- [x] bin/README.md criado com documentation sobre propósito
- [x] STRUCTURE.md atualizado com description correta de bin/
- [x] tsconfig.json verificado (src/ como rootDir)
- [x] npm test passing
- [x] Commits atomicos criados

---

## Key Findings

### Evidence src/ is Official Source
1. **tsconfig.json:** `rootDir: "src"` — TypeScript compiles from src/
2. **dist/ output:** Contains compiled output from src/
3. **package.json versions:** Root 5.0.1 (current) vs bin 3.3.1 (outdated)
4. **Code features:** src/lib/*.ts has newer features (PathTraversalError, .fase-ai naming)
5. **Old patterns:** bin/src/lib/*.ts uses legacy .fase-ai-local naming

### Evidence bin/ is Legacy/Outdated
1. **bin/src/ contains TypeScript source files** (not compiled output)
2. **bin/package.json version 3.3.1** — outdated by 2 years
3. **bin/src/lib/path-utils.ts orphaned** — not referenced anywhere
4. **No imports reference bin/src/** — unused directory
5. **12 files duplicated with different versions** — all shorter in bin/src/lib/

---

## Impact

### Before
- Ambiguity about which directory is official source
- bin/src/ could be mistakenly used for development
- Duplicate maintenance risk (editing wrong files)
- Version confusion (3.3.1 vs 5.0.1)

### After
- src/ clearly documented as official source
- bin/README.md provides warning to developers
- STRUCTURE.md updated with discontinued status
- Clear path for cleanup in Phase 5 Plan 02

---

## Next Steps

**Plan 02:** Remove bin/src/ duplicated sources
- Delete bin/src/lib/*.ts (12 duplicated files)
- Delete bin/src/lib/path-utils.ts (orphaned)
- Remove bin/src/ directory
- Update build process if needed
- CI sync verification

---

## Related Requirements

- **REQ-013:** Clarificar bin/ Purpose — ✅ COMPLETE
- **REQ-001:** Eliminar Duplicação src/ vs bin/src/ — Pending (Plan 02)
- **REQ-005:** Consolidar path-utils.ts — Pending (Plan 02)

---

## Self-Check

```bash
✅ bin/README.md exists (89 lines)
✅ .fase-ai/codigo/STRUCTURE.md exists (253 lines)
✅ Commit f04297f: docs(05-01): create bin/README.md
✅ Commit c4368fd: docs(05-01): update STRUCTURE.md
✅ npm test: 349 passing
```

**Status:** PASSED

---

*Completed: 2026-04-23*
*Executor: fase-executor*
*Phase: 05-eliminar-duplicacao*
*Plan: 01*