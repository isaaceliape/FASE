---
name: fase:novo-marco
description: Inicia um novo ciclo de milestone — atualiza PROJETO.md e roteia para requisitos
argument-hint: "[nome do milestone, ex: 'v1.1 Notifications']"
allowed-tools:
  - Read
  - Write
  - Bash
  - Task
  - AskUserQuestion
---
<objective>
Iniciar um novo milestone: questionamento → pesquisa (opcional) → requisitos → roteiro.

Equivalente brownfield de new-project. Projeto existe, PROJETO.md tem histórico. Coleta "o que vem depois", atualiza PROJETO.md, então executa ciclo requisitos → roteiro.

**Cria/Atualiza:**
- `.planejamento/PROJETO.md` — atualizado com novos objetivos do milestone
- `.planejamento/pesquisa/` — pesquisa de domínio (opcional, apenas features NOVAS)
- `.planejamento/REQUISITOS.md` — requisitos definidos para este milestone
- `.planejamento/ROTEIRO.md` — estrutura de fases (continua numeração)
- `.planejamento/ESTADO.md` — resetado para novo milestone

**Depois:** `/fase-planejar-fase [N]` para iniciar execução.
</objective>


<context>
Nome do milestone: $ARGUMENTS (opcional - vai perguntar se não fornecido)

Arquivos de contexto de projeto e milestone são resolvidos dentro do workflow (`init new-milestone`) e delegados via blocos `<files_to_read>` onde subagents são usados.
</context>

<process>
Execute o workflow new-milestone ponta a ponta.
Preserve todos os gates do workflow (validação, questionamento, pesquisa, requisitos, aprovação de roteiro, commits).
</process>
