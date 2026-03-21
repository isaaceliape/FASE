---
name: fase:atualizar
description: Atualizar FASE para versão mais recente com exibição de changelog
allowed-tools:
  - Bash
  - AskUserQuestion
---

<objective>
Verificar atualizações do FASE, instalar se disponível e exibir o que mudou.

Direciona para o workflow update que lida com:
- Detecção de versão (instalação local vs global)
- Checagem de versão npm
- Busca e exibição de changelog com notas de compatibilidade
- Confirmação do usuário com aviso de clean install
- Execução de atualização com path standardization
- Sincronização entre comandos source e distributed
- Limpeza de cache e configurações obsoletas
- Lembrete de restart e verificação de instalação
</objective>

<execution_context>
@~/.fase/workflows/update.md
</execution_context>

<process>
**Seguir workflow update** em `@~/.fase/workflows/update.md`.

O workflow lida com toda lógica incluindo:

**Fase 1: Detecção e Verificação**
1. Detectar versão instalada (local em `./.claude/` ou global em `~/.fase/`)
2. Checar versão mais recente via npm registry
3. Comparar versões e determinar se atualização é necessária
4. Buscar changelog entre versões

**Fase 2: Compatibilidade**
5. Validar compatibilidade com runtime (Claude Code, OpenCode, Gemini, Codex)
6. Verificar se paths estão padronizados (@~/.fase/ pattern)
7. Confirmar que não há referências globais obsoletas (~/.claude/, ~/.config/, etc.)

**Fase 3: Execução**
8. Exibir aviso de clean install e mudanças relevantes
9. Solicitar confirmação do usuário
10. Executar atualização via npm
11. Sincronizar comandos source (comandos/) com distributed (bin/comandos/)
12. Sincronizar agentes source (agentes/) com distributed (bin/agentes/)
13. Limpeza de cache e configurações obsoletas

**Fase 4: Validação**
14. Executar verificação-instalacao para validar integridade
15. Exibir relatório de sucesso com novas funcionalidades
16. Lembrar usuário de restart do runtime
</process>
