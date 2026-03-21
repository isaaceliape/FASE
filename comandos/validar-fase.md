---
name: fase:validar-fase
description: Audita retroativamente e preenche gaps de validação Nyquist para uma fase completada
argument-hint: "[número da fase]"
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
  - Task
  - AskUserQuestion
---
<objective>
Auditar cobertura de validação Nyquist para uma fase completada. Três estados:
- (A) VALIDATION.md existe — audita e preenche gaps (PARALELO por cluster de gaps)
- (B) Sem VALIDATION.md, SUMMARY.md existe — reconstrói dos artefatos
- (C) Fase não executada — sai com orientação

Output: VALIDATION.md atualizado + arquivos de teste gerados.

**Paralelização:** Para fases com 3+ gaps, este comando spawna múltiplos `fase-auditor-nyquist` em paralelo, cada um processando um cluster de gaps (agrupados por tipo de teste ou subsistema). Speedup esperado: 2–4× para fases com 4–8 gaps independentes.
</objective>

<execution_context>
@~/.fase/workflows/validate-phase.md
</execution_context>

<context>
Fase: $ARGUMENTS — opcional, padrão é última fase completada.
</context>

<process>
**Fluxo Paralelo (recomendado para 3+ gaps):**
1. Carregar gaps de VALIDATION.md
2. Agrupar gaps por tipo de teste (unit, integration, smoke) ou subsistema (auth, api, ui)
3. Para cada cluster com 2+ gaps: spawn `fase-auditor-nyquist` com `<gap_cluster>` em paralelo
4. Coletar resultados estruturados (GAPS FILLED / PARTIAL / ESCALATE)
5. Agregar resultados em VALIDATION.md único
6. Commit de todos os testes gerados

**Fluxo Serial (para 1–2 gaps):**
- Execute @~/.fase/workflows/validate-phase.md normalmente (compatibilidade)

Preserve todos os gates do workflow.
</process>
