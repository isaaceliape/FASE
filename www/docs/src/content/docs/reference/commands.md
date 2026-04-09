---
title: Referência de Comandos (34 Comandos)
description: Todos os comandos disponíveis no FASE
---

# Referência de Comandos

FASE possui **34 comandos** para todas as fases do seu projeto.

Veja a [documentação completa](/FASE/docs/COMANDOS.html).

## Fluxo Principal

| Comando | Propósito |
|---------|----------|
| `/fase-novo-projeto` | Inicialização completa: perguntas, pesquisa, requisitos, roadmap |
| `/fase-discutir-fase [N]` | Capturar decisões de implementação antes do planejamento |
| `/fase-planejar-fase [N]` | Pesquisa + plano + verificação |
| `/fase-executar-fase <N>` | Executar planos em ondas paralelas |
| `/fase-verificar-trabalho [N]` | Teste de aceitação com diagnóstico automático |
| `/fase-auditar-marco` | Verificar se o marco atingiu sua definição de pronto |
| `/fase-completar-marco` | Arquivar marco e criar tag de lançamento |

## Arquitetura e Contexto

| Comando | Propósito |
|---------|----------|
| `/fase-arquitetar [tema]` | Registrar ADRs e decisões arquiteturais |
| `/fase-contexto` | Ver/limpar/resumir contexto da sessão atual |

## Navegação

| Comando | Propósito |
|---------|----------|
| `/fase-progresso` | Status atual e próximos passos |
| `/fase-retomar-trabalho` | Restaurar contexto da última sessão |
| `/fase-pausar-trabalho` | Salvar estado e liberar contexto |
| `/fase-ajuda` | Listar todos os comandos |

## Gerenciamento de Fases

| Comando | Propósito |
|---------|----------|
| `/fase-adicionar-fase` | Adicionar nova fase ao roadmap |
| `/fase-inserir-fase [N]` | Inserir fase urgente (numeração decimal) |
| `/fase-remover-fase [N]` | Remover fase e renumerar |
| `/fase-planejar-lacunas` | Criar fases para gaps da auditoria |
| `/fase-pesquisar-fase [N]` | Pesquisa profunda do domínio |

## Verificação e Debug

| Comando | Propósito |
|---------|----------|
| `/fase-validar-fase` | Validar fase contra critérios Nyquist |
| `/fase-mapear-codigo` | Analisar base de código existente |
| `/fase-debug [desc]` | Depuração sistemática com estado persistente |
| `/fase-rapido` | Tarefa avulsa com garantias do FASE |

## Utilitários

| Comando | Propósito |
|---------|----------|
| `/fase-configuracoes` | Configurar fluxo de trabalho e modelo |
| `/fase-definir-perfil <perfil>` | Troca rápida de perfil de modelo |
| `/fase-atualizar` | Atualizar FASE para a versão mais recente |
| `/fase-reaplicar-patches` | Restaurar modificações locais após atualização |
