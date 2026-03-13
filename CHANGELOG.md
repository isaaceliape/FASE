# CHANGELOG

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
