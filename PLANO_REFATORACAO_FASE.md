# Plano de Refatoração: FAZ → FASE

**Objetivo:** Renomear o projeto de FAZ (Framework de Automação com Zelo) para FASE (Framework de Automação Sem Enrolação).

---

## Escopo total identificado

| Categoria | Quantidade |
|-----------|-----------|
| Agentes a renomear (`faz-*.pt.md`) | 12 arquivos |
| Diretório de comandos a renomear | `commands/faz/` → `comandos/` |
| Arquivos com padrão `/faz:` | 27 arquivos |
| Arquivos com "FAZ" (maiúsculo) | 18 arquivos, 61 ocorrências |
| Hooks com referências `/faz:` | 2 arquivos |

---

## Parte 1 — Branding principal e documentação do projeto

**Arquivos:**
- `README.md` — nome do projeto, acrônimo, descrição
- `CONTEXT.md` — visão e arquitetura
- `TRANSLATION_GUIDE.md` — guia de tradução
- `PROGRESSO.md` — rastreamento de progresso
- `PLANO_DE_TRADUCAO.md` — plano original de tradução

**O que muda:**
- "FAZ" → "FASE" em todos os títulos e referências
- "Framework de Automação com Zelo" → "Framework de Automação Sem Enrolação"
- Referências a `/faz:` → `/fase:`

---

## Parte 2 — CLI: bin/install.js

**Arquivo:** `bin/install.js`

**O que muda:**
- ASCII art: letras "FAZ" → letras "FASE"
- Linha de descrição do banner: "com Zelo" → "Sem Enrolação"
- Comando de conclusão: `/faz:novo-projeto` → `/fase:novo-projeto`
- Mensagens de desinstalação que mencionam "FAZ" → "FASE"
- Texto de statusline interativa: referências ao FAZ → FASE

---

## Parte 3 — Hooks JavaScript

**Arquivos:**
- `hooks/gsd-context-monitor.js` — `/faz:pausar-trabalho` → `/fase:pausar-trabalho`
- `hooks/gsd-statusline.js` — `/faz:atualizar` → `/fase:atualizar`
- `hooks/gsd-check-update.js` — referências ao nome do projeto

---

## Parte 4 — Diretório e conteúdo dos comandos

**O que muda:**
- Renomear diretório: `commands/faz/` → `comandos/`
- Atualizar conteúdo de todos os 31 arquivos `.pt.md`:
  - `/faz:` → `/fase:` (namespace de comandos)
  - Referências ao nome "FAZ" → "FASE"

---

## Parte 5 — Agentes

**O que muda:**
- Renomear 12 arquivos: `faz-*.pt.md` → `fase-*.pt.md`
- Atualizar conteúdo interno com `/faz:` → `/fase:` e "FAZ" → "FASE"

---

## Parte 6 — Documentação técnica (docs/)

**Arquivos:**
- `docs/USER-GUIDE.md` — ~120+ ocorrências de `/faz:` + 9 de "FAZ"
- `docs/COMANDOS.md` — ~30+ ocorrências de `/faz:` + 2 de "FAZ"
- `docs/context-monitor.md` — 2 ocorrências de `/faz:` + 1 de "FAZ"

---

## Parte 7 — Verificação final

- Grep por `/faz:` e `"FAZ"` em todo o repositório
- Corrigir quaisquer ocorrências residuais
- Commit final de verificação

---

## Ordem de execução

```
Parte 1 → Parte 2 → Parte 3 → Parte 4 → Parte 5 → Parte 6 → Parte 7
```

Cada parte terá seu próprio commit com mensagem descritiva.
