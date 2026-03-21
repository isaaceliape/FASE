# CHANGELOG

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.2.0] - 2026-03-21

### Added
- Path standardization documentation across all test files
- TEST_UPDATES_SUMMARY.md with comprehensive change tracking
- Path standardization sections in bin/test/README.md and bin/test/TESTING.md
- Extended TEST_SETUP_SUMMARY.md with installer path conversion details

### Changed
- **Internal**: Standardized all command path references to use `@~/.fase/` pattern
- **Internal**: Standardized all agent path references to use `@~/.fase/` pattern
- Updated installer (bin/install.js) path replacement logic for all 4 runtimes
- Renamed all command files from `.pt.md` to `.md` for consistency
- Updated test files to reflect new standardized path conventions
- Enhanced documentation for path standardization mechanism

### Fixed
- Fixed test data in testes/phase.test.cjs to use standardized paths
- Updated test assertions in testes/agent-frontmatter.test.cjs
- Corrected path references in agent files (fase-roadmapper.md, fase-sintetizador-pesquisa.md)

### Technical Details
- Path standardization ensures commands work identically across Claude Code, OpenCode, Gemini, and Codex
- Installer transparently converts `@~/.fase/` to runtime-specific paths during installation
- All 129 unit tests passing with new path conventions
- No breaking changes - transparent to end users

## [3.1.0] - 2026-03-20

### Fixed
- Fixed agent reference in planejar-fase command

## [3.0.0] - 2026-03-20

### Changed
- **Breaking**: Removed global installation support - FASE now only installs locally
- **Breaking**: Removed `--global` flag (now ignored)
- **Breaking**: Removed `--local` flag (redundant, installation is always local)

### Added
- Agentes "fase" renamed to "fase" in all documentation
- Commands with "phase" in names updated to "fase"

## [2.5.0] - 2026-03-13

### Added
- Pre-commit hooks com husky para validar integridade do pacote npm
- GitHub Actions workflow para publicação automática no npm
- Templates de issues do GitHub (bug reports, feature requests, traduções)
- CONTRIBUTING.md com guia completo para contribuidores
- SECURITY.md com política de segurança
- scripts/verificar-release.sh para checklist pre-release
- scripts/testar-local.sh para testes locais
- .npmignore para otimizar pacote publicado
- docs/README.md como índice centralizado de documentação

### Changed
- Reorganized npm package structure for better distribution
- Updated pre-commit validation to check for essential files

## [2.4.0] - 2026-03-13

### Changed
- Reorganized npm package file structure for better distribution
- Updated bin/package.json to correctly include `agentes/` and `comandos/` directories in npm package
- Fixed bin entry points to use correct relative paths (removed `./` prefix from install.js references)

### Fixed
- Fixed installer to use correct file structure for agents and commands during installation
- Ensured all 12 agent definitions are included in published npm package
- Ensured all 32 command definitions are included in published npm package

## [2.3.0] - Earlier versions

See Git history for complete changelog of earlier versions.
