---
title: Instalação
description: Como instalar o FASE em seu ambiente
---

# Instalação do FASE

## Instalação Interativa (Recomendado)

Execute o instalador interativo para escolher seus runtimes preferidos:

```bash
npx fase-ai
```

O instalador vai te perguntar:

1. **Runtime** — Claude Code, OpenCode, Gemini, Codex, ou todos
2. **Localização** — local (projeto atual) - FASE agora exige instalação local por padrão

## Instalação com Flags (Não-Interativa)

### Claude Code

```bash
npx fase-ai --claude
```

### OpenCode

```bash
npx fase-ai --opencode
```

### Todos os Runtimes

```bash
npx fase-ai --all
```

## Verificar Instalação

Após a instalação, verifique se tudo funcionou:

- **Claude Code / Gemini:** `/fase-ajuda`
- **OpenCode:** `/fase-ajuda`
- **Codex:** `$fase-ajuda`

Se o comando de ajuda funcionar, FASE está pronto para usar!

## Via CLI Diretamente

FASE é instalado localmente no seu projeto. Para usar dentro do seu projeto:

```bash
node .claude/fase/bin/fase-tools.cjs <comando> [args]

# Exemplos:
node .claude/fase/bin/fase-tools.cjs state json
node .claude/fase/bin/fase-tools.cjs resolve-model planner
```

## Requisitos

- **Node.js:** >= 14.0.0
- **npm:** Versão recente
- **Runtime suportado:** Claude Code, OpenCode, Gemini, ou Codex

## Solução de Problemas

Se encontrar problemas durante a instalação, veja a seção [Solução de Problemas](/FASE/docs/advanced/troubleshooting/).
