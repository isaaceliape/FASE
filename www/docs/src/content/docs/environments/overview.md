---
title: Visão Geral dos Ambientes
description: FASE suporta múltiplos AI coding assistants
---

# Ambientes Suportados

FASE funciona com **4 AI coding assistants**, cada um com suas características e features nativas.

## Quick Reference

| Feature | Claude Code | OpenCode | Gemini | Codex |
|---------|-------------|----------|--------|-------|
| MCP Servers | ✅ | ❌ | ❌ | ❌ |
| Hooks | ✅ | ✅ | ⚠️ | ⚠️ |
| Skills | ✅ | ✅ | ⚠️ | ✅ |
| Extended Context | 1M tokens | Variável | 2M tokens | Variável |
| Voice Mode | ✅ | ❌ | ❌ | ❌ |
| Plan Mode | ✅ | ⚠️ | ⚠️ | ⚠️ |

**Legenda:** ✅ Nativo | ⚠️ Limitado/Parcial | ❌ Não disponível

## Escolhendo Seu Ambiente

### Claude Code (Anthropic) 🎯

**Melhor para:** Desenvolvedores que querem a experiência mais completa e integrada.

**Pontos fortes:**
- MCP Servers para integrar com GitHub, Linear, Slack, Git
- Hooks nativos para automação em eventos
- 1M tokens de contexto para análise multi-fase
- Plan Mode para aprovação antes de executar
- Voice Mode para brainstorming

**Configuração:** `~/.claude/`

---

### OpenCode (OpenAI) 🔓

**Melhor para:** Desenvolvedores que preferem open source e customização.

**Pontos fortes:**
- Skills extensíveis
- Hooks via settings.json
- XDG config standard (`~/.config/opencode/`)
- Comunidade ativa
- Open source

**Configuração:** `~/.config/opencode/`

---

### Gemini (Google) 🔮

**Melhor para:** Quem já usa o ecossistema Google.

**Pontos fortes:**
- 2M tokens de contexto
- Integração com Google Workspace, GCP, GitHub
- Multi-modal (texto + imagem + código)
- Fast inference
- Free tier generoso

**Configuração:** `~/.gemini/`

---

### Codex (Microsoft) 💼

**Melhor para:** Ambientes enterprise e times.

**Pontos fortes:**
- Multi-agent orchestration
- Segurança e compliance enterprise
- Integração nativa com VS Code
- Skills adaptativas
- Ecossistema Microsoft (Azure, GitHub, Office)

**Configuração:** `~/.codex/`

---

## Instalação Multi-Ambiente

Você pode instalar FASE em **múltiplos ambientes** simultaneamente:

```bash
# Instalar para todos os runtimes
npx fase-ai --all

# Instalar para ambientes específicos
npx fase-ai --claude --opencode

# Instalar globalmente
npx fase-ai --claude --global
```

## Comandos por Ambiente

| Ambiente | Prefixo | Exemplo |
|----------|---------|---------|
| Claude Code | `/fase-` | `/fase-ajuda` |
| OpenCode | `/fase-` | `/fase-ajuda` |
| Gemini | `/fase-` | `/fase-ajuda` |
| Codex | `$fase-` | `$fase-ajuda` |

## Próximos Passos

Explore a documentação específica de cada ambiente:

- [Claude Code](/FASE/docs/environments/claude-code/)
- [OpenCode](/FASE/docs/environments/opencode/)
- [Gemini](/FASE/docs/environments/gemini/)
- [Codex](/FASE/docs/environments/codex/)
