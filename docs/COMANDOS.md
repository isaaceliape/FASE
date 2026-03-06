# 🔧 Comandos do F.A.Z.

**32 comandos em português brasileiro para Claude Code.**

---

## 📋 Índice

- [Core](#core) — Comandos principais
- [Planning](#planning) — Planejamento e milestones
- [Research](#research) — Pesquisa e mapeamento
- [Verification](#verification) — Verificação e validação
- [Debug](#debug) — Debug e troubleshooting
- [Discussion](#discussion) — Discussão e conclusão
- [Utility](#utility) — Utilitários diversos

---

## Core

Comandos essenciais para começar e executar projetos.

### `/faz:ajuda`

Mostra ajuda geral e lista de comandos disponíveis.

**Aliases:** `help`, `h`

**Exemplo:**
```bash
/faz:ajuda
/faz:ajuda novo-projeto  # Ajuda específica de um comando
```

---

### `/faz:novo-projeto`

Inicia um novo projeto F.A.Z. no diretório atual.

**O que faz:**
- Cria estrutura de pastas `.planning/`
- Inicializa STATE.md, ROADMAP.md, REQUIREMENTS.md
- Configura contexto do projeto

**Exemplo:**
```bash
/faz:novo-projeto "Sistema de autenticação JWT"
```

---

### `/faz:planejar-fase`

Cria um plano detalhado para uma fase específica.

**O que faz:**
- Analisa o objetivo da fase
- Quebra em tarefas atômicas
- Define critérios de sucesso
- Estima complexidade

**Exemplo:**
```bash
/faz:planejar-fase "Implementar login com email/senha"
```

---

### `/faz:executar-fase`

Executa o plano de uma fase, tarefa por tarefa.

**O que faz:**
- Executa tarefas na ordem
- Cria commits atômicos por tarefa
- Lida com desvios automaticamente
- Pausa em checkpoints quando necessário

**Exemplo:**
```bash
/faz:executar-fase "fase-1"
```

---

### `/faz:configuracoes`

Mostra e ajusta configurações do F.A.Z.

**O que faz:**
- Lista configurações atuais
- Permite alterar preferências
- Gerencia perfis de modelo

**Exemplo:**
```bash
/faz:configuracoes
/faz:configuracoes set modelo padrao claude-sonnet
```

---

## Planning

Comandos para planejar e gerenciar milestones e fases.

### `/faz:novo-marco`

Cria um novo marco (milestone) no roadmap.

**O que faz:**
- Define objetivo do marco
- Estabelece critérios de conclusão
- Linka com requirements

**Exemplo:**
```bash
/faz:novo-marco "MVP funcional até sexta"
```

---

### `/faz:adicionar-fase`

Adiciona uma nova fase ao projeto.

**O que faz:**
- Cria fase com nome e descrição
- Define posição no roadmap
- Linka com marco relevante

**Exemplo:**
```bash
/faz:adicionar-fase "Autenticação de usuários"
```

---

### `/faz:inserir-fase`

Insere uma fase em uma posição específica (entre outras fases).

**O que faz:**
- Insere fase em posição personalizada
- Recalcula ordem das fases existentes
- Ajusta dependências

**Exemplo:**
```bash
/faz:inserir-fase "Validação de inputs" --depois "fase-2"
```

---

### `/faz:remover-fase`

Remove uma fase do projeto.

**O que faz:**
- Remove fase do roadmap
- Ajusta ordem das fases restantes
- Arquiva plano da fase removida

**Exemplo:**
```bash
/faz:remover-fase "fase-3"
```

---

### `/faz:pausar-trabalho`

Pausa o trabalho atual e salva o estado.

**O que faz:**
- Salva estado atual da execução
- Marca ponto de retomada
- Libera contexto para outras tarefas

**Exemplo:**
```bash
/faz:pausar-trabalho "Preciso sair, continuo depois"
```

---

### `/faz:retomar-trabalho`

Retoma trabalho de onde parou.

**O que faz:**
- Carrega estado salvo
- Restaura contexto da execução
- Continua da tarefa pendente

**Exemplo:**
```bash
/faz:retomar-trabalho
```

---

### `/faz:progresso`

Mostra o progresso atual do projeto.

**O que faz:**
- Exibe status das fases
- Mostra tarefas completadas vs pendentes
- Calcula porcentagem geral

**Exemplo:**
```bash
/faz:progresso
```

---

## Research

Comandos para pesquisar e mapear o projeto.

### `/faz:pesquisar-fase`

Realiza pesquisa para embasar uma fase.

**O que faz:**
- Pesquisa tecnologias relevantes
- Identifica melhores práticas
- Lista potenciais armadilhas
- Cria documento de pesquisa

**Exemplo:**
```bash
/faz:pesquisar-fase "Implementar WebSockets para chat em tempo real"
```

---

### `/faz:mapear-codigo`

Mapeia um codebase existente.

**O que faz:**
- Analisa estrutura de pastas
- Identifica padrões de arquitetura
- Mapeia dependências
- Documenta convenções do projeto

**Exemplo:**
```bash
/faz:mapear-codigo
```

**Output:**
- `CODEBASE/stack.md` — Tecnologias usadas
- `CODEBASE/architecture.md` — Padrão arquitetural
- `CODEBASE/conventions.md` — Convenções de código
- `CODEBASE/integrations.md` — Integrações externas

---

### `/faz:listar-premissas`

Lista todas as premissas de uma fase.

**O que faz:**
- Extrai premissas do plano
- Mostra suposições feitas
- Identifica riscos potenciais

**Exemplo:**
```bash
/faz:listar-premissas "fase-2"
```

---

## Verification

Comandos para verificar e validar o trabalho.

### `/faz:verificar-trabalho`

Verifica se o trabalho foi feito corretamente.

**O que faz:**
- Revisa código implementado
- Confirma critérios de sucesso
- Identifica issues pendentes
- Gera relatório de verificação

**Exemplo:**
```bash
/faz:verificar-trabalho "fase-1"
```

---

### `/faz:validar-fase`

Valida que uma fase está completa e pronta.

**O que faz:**
- Confirma todas as tarefas feitas
- Verifica testes passando
- Valida integração com outras fases
- Aprova para próximo passo

**Exemplo:**
```bash
/faz:validar-fase "fase-1"
```

---

### `/faz:auditar-marco`

Realiza auditoria de um marco.

**O que faz:**
- Revisa todos os requirements do marco
- Confirma critérios de aceitação
- Gera relatório de auditoria
- Identifica gaps restantes

**Exemplo:**
```bash
/faz:auditar-marco "MVP"
```

---

## Debug

Comandos para debug e troubleshooting.

### `/faz:debug`

Inicia sessão de debug estruturado.

**O que faz:**
- Coleta informações do erro
- Analisa stack traces
- Identifica causa raiz
- Sugere correções

**Exemplo:**
```bash
/faz:debug "Erro 500 ao fazer login"
```

---

### `/faz:checar-todos`

Lista todos os TODOs do projeto.

**O que faz:**
- Varre código por comentários TODO
- Agrupa por arquivo/fase
- Mostra status de cada um

**Exemplo:**
```bash
/faz:checar-todos
```

---

### `/faz:adicionar-todo`

Adiciona um TODO ao projeto.

**O que faz:**
- Cria entrada na lista de TODOs
- Linka com fase relevante
- Define prioridade

**Exemplo:**
```bash
/faz:adicionar-todo "Adicionar rate limiting no login" --prioridade alta
```

---

### `/faz:adicionar-testes`

Adiciona testes para uma funcionalidade.

**O que faz:**
- Identifica funcionalidade sem testes
- Gera testes unitários
- Gera testes de integração
- Adiciona ao plano de testes

**Exemplo:**
```bash
/faz:adicionar-testes "Autenticação JWT"
```

---

## Discussion

Comandos para discussão e conclusão.

### `/faz:discutir-fase`

Inicia discussão sobre uma fase.

**O que faz:**
- Lista pontos de decisão
- Mostra alternativas
- Coleta prós e contras
- Prepara para decisão humana

**Exemplo:**
```bash
/faz:discutir-fase "Autenticação: JWT vs Session"
```

---

### `/faz:completar-marco`

Marca um marco como completado.

**O que faz:**
- Verifica todos os requirements
- Arquiva fases relacionadas
- Atualiza ROADMAP.md
- Celebra conquista! 🎉

**Exemplo:**
```bash
/faz:completar-marco "MVP"
```

---

### `/faz:planejar-lacunas`

Identifica e planeja como fechar lacunas de um marco.

**O que faz:**
- Compara realizado vs planejado
- Identifica gaps
- Cria plano para fechar cada gap
- Prioriza por impacto

**Exemplo:**
```bash
/faz:planejar-lacunas "MVP"
```

---

## Utility

Comandos utilitários diversos.

### `/faz:limpar`

Limpa arquivos temporários e cache.

**O que faz:**
- Remove arquivos `.tmp`
- Limpa cache de builds
- Remove logs antigos

**Exemplo:**
```bash
/faz:limpar
```

---

### `/faz:saude`

Realiza checkup de saúde do projeto.

**O que faz:**
- Verifica dependências
- Checa testes passando
- Identifica code smells
- Sugere melhorias

**Exemplo:**
```bash
/faz:saude
```

---

### `/faz:atualizar`

Atualiza o F.A.Z. para a versão mais recente.

**O que faz:**
- Verifica versão instalada
- Baixa atualizações disponíveis
- Aplica patches
- Reinicia se necessário

**Exemplo:**
```bash
/faz:atualizar
```

---

### `/faz:rapido`

Modo rápido para tarefas simples.

**O que faz:**
- Pula cerimônias desnecessárias
- Executa direto ao ponto
- Ideal para mudanças pequenas

**Exemplo:**
```bash
/faz:rapido "Adiciona log no endpoint de login"
```

---

### `/faz:entrar-discord`

Mostra link para entrar no Discord da comunidade.

**Exemplo:**
```bash
/faz:entrar-discord
```

---

### `/faz:reaplicar-patches`

Reaplica patches que falharam anteriormente.

**O que faz:**
- Lista patches pendentes
- Tenta reaplicar cada um
- Reporta conflitos
- Sugere resoluções

**Exemplo:**
```bash
/faz:reaplicar-patches
```

---

### `/faz:definir-perfil`

Define o perfil de modelo a ser usado.

**O que faz:**
- Lista perfis disponíveis
- Define modelo padrão
- Ajusta configurações por tipo de tarefa

**Exemplo:**
```bash
/faz:definir-perfil claude-sonnet
/faz:definir-perfil lista
```

---

## 📞 Suporte

**Problemas com algum comando?**

- 📖 [Guia do Usuário](USER-GUIDE.md)
- 🐛 [Reportar bug](https://github.com/isaaceliape/FAZ/issues)
- 💬 [Discord da comunidade](https://discord.gg/gsd)

---

**"Chega de enrolação. Descreve o que quer e FAZ acontecer."** 🇧🇷🚀
