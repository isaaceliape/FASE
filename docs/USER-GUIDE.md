# Guia do Usuário — FAZ

Referência detalhada de workflows, resolução de problemas e configuração. Para configuração rápida, veja o [README](../README.md).

---

## Índice

- [Diagramas de Workflow](#diagramas-de-workflow)
- [Referência de Comandos](#referência-de-comandos)
- [Referência de Configuração](#referência-de-configuração)
- [Exemplos de Uso](#exemplos-de-uso)
- [Resolução de Problemas](#resolução-de-problemas)
- [Referência Rápida de Recuperação](#referência-rápida-de-recuperação)

---

## Diagramas de Workflow

### Ciclo de Vida Completo do Projeto

```
  ┌──────────────────────────────────────────────────┐
  │                  NOVO PROJETO                    │
  │  /faz:novo-projeto                               │
  │  Perguntas -> Pesquisa -> Requisitos -> Roadmap  │
  └─────────────────────────┬────────────────────────┘
                            │
             ┌──────────────▼─────────────┐
             │      PARA CADA FASE:       │
             │                            │
             │  ┌──────────────────────┐  │
             │  │ /faz:discutir-fase   │  │  <- Definir preferências
             │  └──────────┬───────────┘  │
             │             │              │
             │  ┌──────────▼──────────┐   │
             │  │ /faz:planejar-fase  │   │  <- Pesquisa + Plano + Verificação
             │  └──────────┬──────────┘   │
             │             │              │
             │  ┌──────────▼──────────┐   │
             │  │ /faz:executar-fase  │   │  <- Execução paralela
             │  └──────────┬──────────┘   │
             │             │              │
             │  ┌──────────▼────────────┐ │
             │  │ /faz:verificar-trabalho│ │  <- UAT manual
             │  └──────────┬────────────┘ │
             │             │              │
             │     Próxima fase?──────────┘
             │             │ Não
             └─────────────┼──────────────┘
                            │
            ┌───────────────▼──────────────┐
            │  /faz:auditar-marco          │
            │  /faz:completar-marco        │
            └───────────────┬──────────────┘
                            │
                   Outro marco?
                       │          │
                      Sim        Não -> Pronto!
                       │
               ┌───────▼──────────────┐
               │  /faz:novo-marco     │
               └──────────────────────┘
```

### Coordenação do Agente de Planejamento

```
  /faz:planejar-fase N
         │
         ├── Pesquisador de Fase (x4 em paralelo)
         │     ├── Pesquisador de stack
         │     ├── Pesquisador de funcionalidades
         │     ├── Pesquisador de arquitetura
         │     └── Pesquisador de armadilhas
         │           │
         │     ┌──────▼──────┐
         │     │ RESEARCH.md │
         │     └──────┬──────┘
         │            │
         │     ┌──────▼──────┐
         │     │  Planejador │  <- Lê PROJECT.md, REQUIREMENTS.md,
         │     │             │     CONTEXT.md, RESEARCH.md
         │     └──────┬──────┘
         │            │
         │     ┌──────▼───────────┐     ┌────────┐
         │     │ Verificador de   │────>│ PASSA? │
         │     │ Plano            │     └───┬────┘
         │     └──────────────────┘         │
         │                             Sim  │  Não
         │                              │   │   │
         │                              │   └───┘  (loop, até 3x)
         │                              │
         │                        ┌─────▼──────┐
         │                        │ Arquivos   │
         │                        │ de PLANO   │
         │                        └────────────┘
         └── Concluído
```

### Arquitetura de Validação (Camada Nyquist)

Durante a pesquisa do planejar-fase, o FAZ mapeia a cobertura de testes automatizados para cada requisito da fase antes de qualquer código ser escrito. Isso garante que, quando o executor do Claude fizer commit de uma tarefa, já exista um mecanismo de feedback para verificá-la em segundos.

O pesquisador detecta sua infraestrutura de testes existente, mapeia cada requisito a um comando de teste específico, e identifica qualquer scaffolding de testes que deve ser criado antes do início da implementação (tarefas da Wave 0).

O verificador de plano aplica isso como uma 8ª dimensão de verificação: planos onde as tarefas não possuem comandos de verificação automatizados não serão aprovados.

**Saída:** `{fase}-VALIDATION.md` — o contrato de feedback para a fase.

**Desabilitar:** Defina `workflow.nyquist_validation: false` em `/faz:configuracoes` para fases de prototipagem rápida onde a infraestrutura de testes não é o foco.

### Validação Retroativa (`/faz:validar-fase`)

Para fases executadas antes da validação Nyquist existir, ou para bases de código existentes com apenas suítes de testes tradicionais, audite retroativamente e preencha lacunas de cobertura:

```
  /faz:validar-fase N
         |
         +-- Detectar estado (VALIDATION.md existe? SUMMARY.md existe?)
         |
         +-- Descobrir: escanear implementação, mapear requisitos para testes
         |
         +-- Analisar lacunas: quais requisitos não têm verificação automatizada?
         |
         +-- Apresentar plano de lacunas para aprovação
         |
         +-- Spawnar auditor: gerar testes, executar, depurar (máx. 3 tentativas)
         |
         +-- Atualizar VALIDATION.md
               |
               +-- CONFORME -> todos os requisitos têm verificações automatizadas
               +-- PARCIAL -> algumas lacunas escaladas para manual apenas
```

O auditor nunca modifica o código de implementação — apenas arquivos de teste e VALIDATION.md. Se um teste revelar um bug de implementação, ele é sinalizado como uma escalação para você resolver.

**Quando usar:** Após executar fases que foram planejadas antes do Nyquist estar habilitado, ou após `/faz:auditar-marco` detectar lacunas de conformidade Nyquist.

### Coordenação de Waves de Execução

```
  /faz:executar-fase N
         │
         ├── Analisar dependências do plano
         │
         ├── Wave 1 (planos independentes):
         │     ├── Executor A (contexto fresco de 200K) -> commit
         │     └── Executor B (contexto fresco de 200K) -> commit
         │
         ├── Wave 2 (depende da Wave 1):
         │     └── Executor C (contexto fresco de 200K) -> commit
         │
         └── Verificador
               └── Verificar base de código contra objetivos da fase
                     │
                     ├── PASSA -> VERIFICATION.md (sucesso)
                     └── FALHA -> Problemas registrados para /faz:verificar-trabalho
```

### Workflow Brownfield (Base de Código Existente)

```
  /faz:mapear-codigo
         │
         ├── Mapeador de Stack     -> codebase/STACK.md
         ├── Mapeador de Arq.      -> codebase/ARCHITECTURE.md
         ├── Mapeador de Convenções -> codebase/CONVENTIONS.md
         └── Mapeador de Preocupações -> codebase/CONCERNS.md
                │
        ┌───────▼──────────────┐
        │ /faz:novo-projeto    │  <- Perguntas focam no que você está ADICIONANDO
        └──────────────────────┘
```

---

## Referência de Comandos

### Workflow Principal

| Comando | Propósito | Quando Usar |
|---------|----------|-------------|
| `/faz:novo-projeto` | Inicialização completa: perguntas, pesquisa, requisitos, roadmap | Início de um novo projeto |
| `/faz:novo-projeto --auto @ideia.md` | Inicialização automatizada a partir de documento | Quando você tem um PRD ou documento de ideia pronto |
| `/faz:discutir-fase [N]` | Capturar decisões de implementação | Antes do planejamento, para definir como será construído |
| `/faz:planejar-fase [N]` | Pesquisa + plano + verificação | Antes de executar uma fase |
| `/faz:executar-fase <N>` | Executar todos os planos em waves paralelas | Após o planejamento estar completo |
| `/faz:verificar-trabalho [N]` | UAT manual com diagnóstico automático | Após a execução ser concluída |
| `/faz:auditar-marco` | Verificar se o marco atingiu sua definição de pronto | Antes de completar o marco |
| `/faz:completar-marco` | Arquivar marco, criar tag de release | Após todas as fases serem verificadas |
| `/faz:novo-marco [nome]` | Iniciar próximo ciclo de versão | Após completar um marco |

### Navegação

| Comando | Propósito | Quando Usar |
|---------|----------|-------------|
| `/faz:progresso` | Mostrar status e próximos passos | A qualquer momento — "onde estou?" |
| `/faz:retomar-trabalho` | Restaurar contexto completo da última sessão | Ao iniciar uma nova sessão |
| `/faz:pausar-trabalho` | Salvar handoff de contexto | Ao parar no meio de uma fase |
| `/faz:ajuda` | Mostrar todos os comandos | Referência rápida |
| `/faz:atualizar` | Atualizar FAZ com prévia do changelog | Verificar novas versões |
| `/faz:entrar-discord` | Abrir convite da comunidade Discord | Dúvidas ou comunidade |

### Gerenciamento de Fases

| Comando | Propósito | Quando Usar |
|---------|----------|-------------|
| `/faz:adicionar-fase` | Adicionar nova fase ao roadmap | Escopo cresce após planejamento inicial |
| `/faz:inserir-fase [N]` | Inserir trabalho urgente (numeração decimal) | Correção urgente no meio do marco |
| `/faz:remover-fase [N]` | Remover fase futura e renumerar | Reduzir escopo de uma funcionalidade |
| `/faz:listar-premissas [N]` | Prévia da abordagem pretendida pelo Claude | Antes do planejamento, para validar direção |
| `/faz:planejar-lacunas` | Criar fases para lacunas da auditoria | Após auditoria encontrar itens faltando |
| `/faz:pesquisar-fase [N]` | Pesquisa profunda do ecossistema apenas | Domínio complexo ou desconhecido |

### Brownfield e Utilitários

| Comando | Propósito | Quando Usar |
|---------|----------|-------------|
| `/faz:mapear-codigo` | Analisar base de código existente | Antes de `/faz:novo-projeto` em código existente |
| `/faz:rapido` | Tarefa avulsa com garantias do FAZ | Correções de bugs, pequenas funcionalidades, mudanças de config |
| `/faz:debug [desc]` | Depuração sistemática com estado persistente | Quando algo quebra |
| `/faz:adicionar-todo [desc]` | Capturar uma ideia para depois | Pensar em algo durante uma sessão |
| `/faz:checar-todos` | Listar todos pendentes | Revisar ideias capturadas |
| `/faz:configuracoes` | Configurar toggles de workflow e perfil de modelo | Mudar modelo, alternar agentes |
| `/faz:definir-perfil <perfil>` | Troca rápida de perfil | Mudar custo/qualidade |
| `/faz:reaplicar-patches` | Restaurar modificações locais após atualização | Após `/faz:atualizar` se você tinha edições locais |

---

## Referência de Configuração

O FAZ armazena configurações do projeto em `.planning/config.json`. Configure durante `/faz:novo-projeto` ou atualize depois com `/faz:configuracoes`.

### Schema Completo do config.json

```json
{
  "mode": "interactive",
  "granularity": "standard",
  "model_profile": "balanced",
  "planning": {
    "commit_docs": true,
    "search_gitignored": false
  },
  "workflow": {
    "research": true,
    "plan_check": true,
    "verifier": true,
    "nyquist_validation": true
  },
  "git": {
    "branching_strategy": "none",
    "phase_branch_template": "faz/fase-{phase}-{slug}",
    "milestone_branch_template": "faz/{milestone}-{slug}"
  }
}
```

### Configurações Principais

| Configuração | Opções | Padrão | O que Controla |
|-------------|--------|--------|----------------|
| `mode` | `interactive`, `yolo` | `interactive` | `yolo` aprova decisões automaticamente; `interactive` confirma em cada etapa |
| `granularity` | `coarse`, `standard`, `fine` | `standard` | Granularidade das fases: como o escopo é dividido (3-5, 5-8 ou 8-12 fases) |
| `model_profile` | `quality`, `balanced`, `budget` | `balanced` | Nível de modelo para cada agente (veja tabela abaixo) |

### Configurações de Planejamento

| Configuração | Opções | Padrão | O que Controla |
|-------------|--------|--------|----------------|
| `planning.commit_docs` | `true`, `false` | `true` | Se os arquivos de `.planning/` são commitados no git |
| `planning.search_gitignored` | `true`, `false` | `false` | Adiciona `--no-ignore` a buscas amplas para incluir `.planning/` |

> **Nota:** Se `.planning/` está no `.gitignore`, `commit_docs` é automaticamente `false` independente do valor da configuração.

### Toggles de Workflow

| Configuração | Opções | Padrão | O que Controla |
|-------------|--------|--------|----------------|
| `workflow.research` | `true`, `false` | `true` | Investigação de domínio antes do planejamento |
| `workflow.plan_check` | `true`, `false` | `true` | Loop de verificação do plano (até 3 iterações) |
| `workflow.verifier` | `true`, `false` | `true` | Verificação pós-execução contra objetivos da fase |
| `workflow.nyquist_validation` | `true`, `false` | `true` | Pesquisa de arquitetura de validação durante o planejar-fase; 8ª dimensão do verificador de plano |

Desabilite esses toggles para acelerar fases em domínios familiares ou para economizar tokens.

### Branching Git

| Configuração | Opções | Padrão | O que Controla |
|-------------|--------|--------|----------------|
| `git.branching_strategy` | `none`, `phase`, `milestone` | `none` | Quando e como as branches são criadas |
| `git.phase_branch_template` | String template | `faz/fase-{phase}-{slug}` | Nome da branch para estratégia por fase |
| `git.milestone_branch_template` | String template | `faz/{milestone}-{slug}` | Nome da branch para estratégia por marco |

**Estratégias de branching explicadas:**

| Estratégia | Cria Branch | Escopo | Melhor Para |
|------------|------------|--------|-------------|
| `none` | Nunca | N/A | Desenvolvimento solo, projetos simples |
| `phase` | Em cada `executar-fase` | Uma fase por branch | Code review por fase, rollback granular |
| `milestone` | No primeiro `executar-fase` | Todas as fases compartilham uma branch | Branches de release, PR por versão |

**Variáveis de template:** `{phase}` = número com zero à esquerda (ex.: "03"), `{slug}` = nome em minúsculas com hífens, `{milestone}` = versão (ex.: "v1.0").

### Perfis de Modelo (Por Agente)

| Agente | `quality` | `balanced` | `budget` |
|--------|-----------|------------|----------|
| faz-planner | Opus | Opus | Sonnet |
| faz-roadmapper | Opus | Sonnet | Sonnet |
| faz-executor | Opus | Sonnet | Sonnet |
| faz-phase-researcher | Opus | Sonnet | Haiku |
| faz-project-researcher | Opus | Sonnet | Haiku |
| faz-research-synthesizer | Sonnet | Sonnet | Haiku |
| faz-debugger | Opus | Sonnet | Sonnet |
| faz-codebase-mapper | Sonnet | Haiku | Haiku |
| faz-verifier | Sonnet | Sonnet | Haiku |
| faz-plan-checker | Sonnet | Sonnet | Haiku |
| faz-integration-checker | Sonnet | Sonnet | Haiku |

**Filosofia dos perfis:**
- **quality** — Opus para todos os agentes de tomada de decisão, Sonnet para verificação somente-leitura. Use quando há cota disponível e o trabalho é crítico.
- **balanced** — Opus apenas para planejamento (onde as decisões de arquitetura acontecem), Sonnet para todo o resto. O padrão por boas razões.
- **budget** — Sonnet para tudo que escreve código, Haiku para pesquisa e verificação. Use para trabalho de alto volume ou fases menos críticas.

---

## Exemplos de Uso

### Novo Projeto (Ciclo Completo)

```bash
claude --dangerously-skip-permissions
/faz:novo-projeto            # Responda perguntas, configure, aprove o roadmap
/clear
/faz:discutir-fase 1        # Defina suas preferências
/faz:planejar-fase 1        # Pesquisa + plano + verificação
/faz:executar-fase 1        # Execução paralela
/faz:verificar-trabalho 1   # UAT manual
/clear
/faz:discutir-fase 2        # Repita para cada fase
...
/faz:auditar-marco          # Verifique tudo que foi entregue
/faz:completar-marco        # Arquive, crie tag, pronto
```

### Novo Projeto a Partir de Documento Existente

```bash
/faz:novo-projeto --auto @prd.md   # Executa automaticamente pesquisa/requisitos/roadmap do seu doc
/clear
/faz:discutir-fase 1               # Fluxo normal a partir daqui
```

### Base de Código Existente

```bash
/faz:mapear-codigo          # Analisar o que existe (agentes em paralelo)
/faz:novo-projeto           # Perguntas focam no que você está ADICIONANDO
# (fluxo de fases normal a partir daqui)
```

### Correção Rápida de Bug

```bash
/faz:rapido
> "Corrigir o botão de login que não responde no Safari mobile"
```

### Retomando Após uma Pausa

```bash
/faz:progresso              # Veja onde você parou e o que vem a seguir
# ou
/faz:retomar-trabalho       # Restauração completa do contexto da última sessão
```

### Preparando para Release

```bash
/faz:auditar-marco          # Verificar cobertura de requisitos, detectar stubs
/faz:planejar-lacunas       # Se a auditoria encontrou lacunas, criar fases para fechá-las
/faz:completar-marco        # Arquive, crie tag, pronto
```

### Presets de Velocidade vs Qualidade

| Cenário | Modo | Granularidade | Perfil | Pesquisa | Verificar Plano | Verificador |
|---------|------|--------------|--------|---------|----------------|-------------|
| Prototipagem | `yolo` | `coarse` | `budget` | deslig. | deslig. | deslig. |
| Dev normal | `interactive` | `standard` | `balanced` | lig. | lig. | lig. |
| Produção | `interactive` | `fine` | `quality` | lig. | lig. | lig. |

### Mudanças de Escopo no Meio do Marco

```bash
/faz:adicionar-fase         # Adicionar nova fase ao roadmap
# ou
/faz:inserir-fase 3         # Inserir trabalho urgente entre fases 3 e 4
# ou
/faz:remover-fase 7         # Remover escopo da fase 7 e renumerar
```

---

## Resolução de Problemas

### "Projeto já inicializado"

Você executou `/faz:novo-projeto` mas `.planning/PROJECT.md` já existe. Esse é um mecanismo de segurança. Se quiser recomeçar, delete o diretório `.planning/` primeiro.

### Degradação de Contexto em Sessões Longas

Limpe sua janela de contexto entre comandos principais: `/clear` no Claude Code. O FAZ é projetado em torno de contextos frescos — cada subagente recebe uma janela limpa de 200K. Se a qualidade estiver caindo na sessão principal, limpe e use `/faz:retomar-trabalho` ou `/faz:progresso` para restaurar o estado.

### Planos Parecem Errados ou Desalinhados

Execute `/faz:discutir-fase [N]` antes do planejamento. A maioria dos problemas de qualidade do plano vem do Claude fazendo suposições que o `CONTEXT.md` teria prevenido. Você também pode executar `/faz:listar-premissas [N]` para ver o que o Claude pretende fazer antes de se comprometer com um plano.

### Execução Falha ou Produz Stubs

Verifique se o plano não foi muito ambicioso. Os planos devem ter no máximo 2-3 tarefas. Se as tarefas forem muito grandes, elas excedem o que uma única janela de contexto consegue produzir de forma confiável. Replaneje com escopo menor.

### Perdeu o Fio da Meada

Execute `/faz:progresso`. Ele lê todos os arquivos de estado e diz exatamente onde você está e o que fazer a seguir.

### Precisa Mudar Algo Após a Execução

Não reexecute `/faz:executar-fase`. Use `/faz:rapido` para correções pontuais, ou `/faz:verificar-trabalho` para identificar e corrigir problemas sistematicamente via UAT.

### Custos de Modelo Muito Altos

Mude para o perfil budget: `/faz:definir-perfil budget`. Desabilite os agentes de pesquisa e verificação de plano via `/faz:configuracoes` se o domínio for familiar para você (ou para o Claude).

### Trabalhando em Projeto Sensível/Privado

Defina `commit_docs: false` durante `/faz:novo-projeto` ou via `/faz:configuracoes`. Adicione `.planning/` ao seu `.gitignore`. Os artefatos de planejamento ficam locais e nunca tocam o git.

### Atualização do FAZ Sobrescreveu Minhas Mudanças Locais

Desde a v1.17, o instalador faz backup de arquivos modificados localmente em `faz-local-patches/`. Execute `/faz:reaplicar-patches` para mesclar suas mudanças de volta.

### Subagente Parece Ter Falhado Mas o Trabalho Foi Feito

Existe uma solução conhecida para um bug de classificação do Claude Code. Os orquestradores do FAZ (executar-fase, rapido) verificam a saída real antes de reportar falha. Se você vir uma mensagem de falha mas commits foram feitos, verifique `git log` — o trabalho pode ter sido bem-sucedido.

---

## Referência Rápida de Recuperação

| Problema | Solução |
|---------|---------|
| Contexto perdido / nova sessão | `/faz:retomar-trabalho` ou `/faz:progresso` |
| Fase deu errado | `git revert` nos commits da fase, depois replaneje |
| Precisa mudar escopo | `/faz:adicionar-fase`, `/faz:inserir-fase` ou `/faz:remover-fase` |
| Auditoria de marco encontrou lacunas | `/faz:planejar-lacunas` |
| Algo quebrou | `/faz:debug "descrição"` |
| Correção pontual rápida | `/faz:rapido` |
| Plano não corresponde à sua visão | `/faz:discutir-fase [N]` e replaneje |
| Custos altos | `/faz:definir-perfil budget` e `/faz:configuracoes` para desligar agentes |
| Atualização quebrou mudanças locais | `/faz:reaplicar-patches` |

---

## Estrutura de Arquivos do Projeto

Para referência, aqui está o que o FAZ cria no seu projeto:

```
.planning/
  PROJECT.md              # Visão e contexto do projeto (sempre carregado)
  REQUIREMENTS.md         # Requisitos v1/v2 com escopo e IDs
  ROADMAP.md              # Divisão de fases com rastreamento de status
  STATE.md                # Decisões, bloqueadores, memória de sessão
  config.json             # Configuração de workflow
  MILESTONES.md           # Arquivo de marcos concluídos
  research/               # Pesquisa de domínio do /faz:novo-projeto
  todos/
    pending/              # Ideias capturadas aguardando trabalho
    done/                 # Todos concluídos
  debug/                  # Sessões de debug ativas
    resolved/             # Sessões de debug arquivadas
  codebase/               # Mapeamento brownfield da base de código (de /faz:mapear-codigo)
  phases/
    XX-nome-da-fase/
      XX-YY-PLAN.md       # Planos de execução atômicos
      XX-YY-SUMMARY.md    # Resultados de execução e decisões
      CONTEXT.md          # Suas preferências de implementação
      RESEARCH.md         # Descobertas da pesquisa do ecossistema
      VERIFICATION.md     # Resultados de verificação pós-execução
```
