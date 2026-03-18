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
- (A) VALIDACAO.md existe — audita e preenche gaps
- (B) Sem VALIDACAO.md, SUMARIO.md existe — reconstrói dos artefatos
- (C) Fase não executada — sai com orientação

Output: VALIDACAO.md atualizado + arquivos de teste gerados.
</objective>

<execution_context>
@~/.claude/fase/workflows/validate-phase.md
</execution_context>

<context>
Fase: $ARGUMENTS — opcional, padrão é última fase completada.
</context>

<process>
Execute @~/.claude/fase/workflows/validate-phase.md.
Preserve todos os gates do workflow.
</process>
