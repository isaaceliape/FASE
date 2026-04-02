# FASE - Framework de Automação Sem Enrolação

FASE is a Brazilian Portuguese AI coding framework designed to make AI coding assistants (Claude Code, OpenCode, Gemini, Codex) more productive through spec-driven development and context engineering.

## Core Concepts

- **Spec-driven development**: Write detailed specifications first, let AI implement
- **Context engineering**: Organize codebase context for AI assistants
- **Multi-runtime support**: Works with Claude Code, OpenCode, Gemini, and Codex
- **Automation focus**: Agents and commands that reduce manual work

## Skill routing

When the user's request matches an available skill, ALWAYS invoke it using the Skill
tool as your FIRST action. Do NOT answer directly, do NOT use other tools first.
The skill has specialized workflows that produce better results than ad-hoc answers.

Key routing rules:
- Product ideas, "is this worth building", brainstorming → invoke office-hours
- Bugs, errors, "why is this broken", 500 errors → invoke investigate
- Ship, deploy, push, create PR → invoke ship
- QA, test the site, find bugs → invoke qa
- Code review, check my diff → invoke review
- Update docs after shipping → invoke document-release
- Weekly retro → invoke retro
- Design system, brand → invoke design-consultation
- Visual audit, design polish → invoke design-review
- Architecture review → invoke plan-eng-review
- Save progress, checkpoint, resume → invoke checkpoint
- Code quality, health check → invoke health
