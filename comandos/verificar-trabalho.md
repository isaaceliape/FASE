---
name: fase:verificar-trabalho
description: Valida features construídas através de UAT conversacional
argument-hint: "[número da fase, ex: '4']"
allowed-tools:
  - Read
  - Bash
  - Glob
  - Grep
  - Edit
  - Write
  - Task
---
<objective>
Validar features construídas através de testing conversacional com estado persistente.

Propósito: Confirmar que o que o Claude construiu realmente funciona da perspectiva do usuário. Um teste por vez, respostas em texto simples, sem interrogação. Quando issues são encontradas, automaticamente diagnosticar, planejar correções, e preparar para execução.

Output: {phase_num}-UAT.md rastreando todos os resultados de teste. Se issues encontradas: gaps diagnosticados (PARALELO para múltiplas falhas), planos de correção verificados prontos para /fase-executar-fase

**Paralelização:** Se múltiplos testes falham, o diagnóstico de cada falha é feito em paralelo por agentes independentes, cada um lendo o código relevante e produzindo um PLANO.md de correção. Speedup esperado: N× para N falhas paralelas.
</objective>

<execution_context>
@~/.fase/workflows/verify-work.md
@~/.fase/templates/UAT.md
</execution_context>

<context>
Fase: $ARGUMENTS (opcional)
- Se fornecido: Testar fase específica (ex: "4")
- Se não fornecido: Verificar por sessões ativas ou perguntar pela fase

Arquivos de contexto são resolvidos dentro do workflow (`init verify-work`) e delegados via blocos `<files_to_read>`.
</context>

<process>
**Fluxo com Paralelização de Diagnóstico:**
1. Execute o workflow verify-work até coleta de todos os resultados de teste
2. Se N testes falharem (N ≥ 2):
   - Não diagnosticar sequencialmente
   - Ao invés: agrupar falhas por area de código relacionada
   - Spawn N agentes em paralelo: cada um diagnostica uma falha
   - Coletar N PLANOs de correção simultaneamente
   - Agregar em UAT.md único
3. Se 1 teste falhar: diagnosticar inline (compatibilidade)
4. Preserve todos os gates do workflow (gerenciamento de sessão, apresentação de testes, diagnóstico paralelo, planejamento de correções, roteamento).

Caso contrário, execute o workflow verify-work de @~/.fase/workflows/verify-work.md ponta a ponta.
</process>
