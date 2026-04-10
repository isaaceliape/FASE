---
title: Gemini
description: Features nativas e integração com Gemini CLI do Google
---

# FASE no Gemini

**Gemini CLI** é o AI coding assistant do Google, com integração nativa ao ecossistema Google.

## Features Nativas Disponíveis

### 1. Extended Context (2M Tokens) 🟢

**Status:** ✅ Disponível

Gemini oferece **2M tokens** de contexto, o maior entre os ambientes suportados.

#### Benefícios
- Análise completa de codebases grandes
- Multi-fase analysis em único agent
- Carregar documentação extensa junto com código

#### Exemplo de Uso
```markdown
<files_to_read>
@src/**/*.ts
@docs/**/*.md
@.planejamento/phases/**/*.md
</files_to_read>

Analyze the entire codebase and identify patterns...
```

---

### 2. Google Integration 🟡

**Status:** ⚠️ Parcialmente suportado

Gemini integra naturalmente com serviços Google:

#### Google Workspace
- Google Drive para armazenar fases
- Google Docs para documentação
- Google Sheets para tracking

#### Google Cloud Platform
- Deploy automático via gcloud
- BigQuery para análise de dados
- Cloud Functions para automação

#### GitHub (via OAuth Google)
- Linkar fases com PRs
- Issues tracking

---

### 3. Multi-Modal 🟢

**Status:** ✅ Nativo

Gemini aceita texto + imagem + código:

#### Screenshots de UI
```
[Anexar screenshot da UI]

Implement this layout with React + Tailwind.
```

#### Diagramas Arquiteturais
```
[Anexar diagrama de arquitetura]

Generate code structure based on this diagram.
```

---

### 4. Fast Inference 🟢

**Status:** ✅ Nativo

Gemini tem inference mais rápida que Claude para tasks similares.

**Benefícios:**
- Iteração mais rápida
- Menor latência em commands
- Ideal para workflows de alta frequência

---

### 5. Hooks 🟡

**Status:** ⚠️ Suporte limitado

Gemini CLI tem suporte básico a hooks. Verifique documentação oficial para detalhes atualizados.

---

## Instalação

```bash
# Instalar apenas para Gemini
npx fase-ai --gemini

# Instalar globalmente
npx fase-ai --gemini --global

# Instalar localmente
npx fase-ai --gemini --local

# Com diretório customizado
npx fase-ai --gemini --config-dir /custom/path
```

## Configuração Recomendada

Arquivo: `~/.gemini/settings.json`

```json
{
  "context": {
    "maxTokens": 2000000
  },
  "integrations": {
    "googleDrive": true,
    "github": true
  }
}
```

## Estrutura de Diretórios

```
~/.gemini/
├── settings.json
├── fase/
│   ├── commands/
│   └── agents/
└── projects/
    └── [projeto-atual]/
```

## Comandos

No Gemini, use o prefixo `/fase-`:

```bash
/fase-ajuda
/fase-novo-projeto
/fase-planejar-fase
/fase-executar-fase
/fase-verificar-trabalho
```

## Vantagens do Gemini

- ✅ **2M Tokens:** Maior context window
- ✅ **Google Ecosystem:** Integração nativa
- ✅ **Multi-Modal:** Texto + imagem + código
- ✅ **Fast:** Inference rápida
- ✅ **Free Tier:** Generoso para devs

## Limitações

- ⚠️ MCP Servers não suportados
- ⚠️ Hooks com suporte limitado
- ⚠️ Menor adoção que Claude Code

---

## Próximos Passos

- [Instalação](/FASE/docs/getting-started/installation/)
- [Quick Start](/FASE/docs/getting-started/quick-start/)
- [Visão Geral de Ambientes](/FASE/docs/environments/overview/)
