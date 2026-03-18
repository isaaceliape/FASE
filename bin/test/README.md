# FASE Installation Tests

Comprehensive test suite for FASE installations across different providers (Claude Code, OpenCode, Gemini, and Codex).

## Test Files

### `install.test.js`
Core installation tests covering:
- Directory creation
- File writing and error handling
- package.json configuration
- Path construction
- Error messages and debugging

**Run with:**
```bash
npm run test:install
```

### `providers.test.js`
Provider-specific configuration tests covering:
- Directory structure for each provider
- Environment variable handling
- Settings file formats
- Attribution settings
- Hook files
- Path expansion
- Duplicate configuration prevention
- Permission handling
- Mixed provider installations

**Run with:**
```bash
npm run test:providers
```

### `integration.test.js`
Integration tests covering:
- Global installations
- Local (project) installations
- Custom config directories
- Multiple provider installations
- Version management
- Configuration persistence
- Uninstallation
- Error handling scenarios

**Run with:**
```bash
npm run test:integration
```

### `docker-test.js`
Docker environment simulation tests covering:
- Alpine container installations
- Ubuntu container installations
- macOS ARM64 installations
- Multi-stage Docker builds
- Environment variables in containers
- Volume mounting configurations
- Installation scripts
- Cross-platform support
- Health checks

**Run with:**
```bash
npm run test:docker
```

## Running All Tests

Run the complete test suite:
```bash
npm test
```

Watch mode (re-run on file changes):
```bash
npm run test:watch
```

Generate test coverage report:
```bash
npm run test:coverage
```

## Provider Support

### Claude Code
- Directory: `~/.claude`
- Environment Variable: `CLAUDE_CONFIG_DIR`
- Config File: `settings.json`

### OpenCode
- Directory: `~/.config/opencode` (XDG standard)
- Environment Variables: `OPENCODE_CONFIG_DIR`, `OPENCODE_CONFIG`, `XDG_CONFIG_HOME`
- Config File: `opencode.json`

### Gemini
- Directory: `~/.gemini`
- Environment Variable: `GEMINI_CONFIG_DIR`
- Config File: `settings.json`

### Codex
- Directory: `~/.codex`
- Environment Variable: `CODEX_HOME`
- Config File: `settings.json`

## Docker Testing

### Build and Test in Docker

Run tests in Alpine Linux container:
```bash
docker run --rm -v $(pwd):/app -w /app node:18-alpine npm test
```

Run tests in Ubuntu container:
```bash
docker run --rm -v $(pwd):/app -w /app node:18-ubuntu npm test
```

### Installation Testing in Docker

Test Claude installation:
```bash
docker run --rm node:18-alpine sh -c "npm install -g fase-ai && fase-ai --claude --global"
```

Test all providers:
```bash
docker run --rm node:18-alpine sh -c "npm install -g fase-ai && fase-ai --all --global"
```

## Simulating Clean Environments

The test suite simulates clean Docker environments without requiring actual Docker:

```javascript
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fase-test-'));
// Tests run in isolated temp directory
fs.rmSync(tempDir, { recursive: true });
```

This approach allows:
- ✓ Fast test execution
- ✓ No Docker installation required
- ✓ Cross-platform compatibility
- ✓ Easy CI/CD integration

## Test Coverage

Current coverage:
- **Installation Methods**: Local, Global, Custom directories
- **Providers**: Claude Code, OpenCode, Gemini, Codex
- **Scenarios**: Fresh installs, upgrades, uninstalls, multiple providers
- **Environments**: Alpine, Ubuntu, macOS, Windows paths
- **Error Cases**: Permission errors, missing directories, corrupt files

## Adding New Tests

To add tests for a new provider:

1. Add provider configuration to `providers.test.js`:
```javascript
{
  name: 'newprovider',
  dir: '.newprovider',
  env: 'NEWPROVIDER_CONFIG_DIR'
}
```

2. Add installation tests to `integration.test.js`

3. Add Docker simulation tests to `docker-test.js`

## Troubleshooting

### Tests fail with permission errors
Ensure the temp directory is writable:
```bash
ls -la /tmp | grep fase-test
```

### Tests timeout
Increase Mocha timeout:
```bash
npm test -- --timeout 10000
```

### Environment variables interfere
Tests save and restore original environment:
```javascript
beforeEach(() => {
  originalEnv = { ...process.env };
});

afterEach(() => {
  process.env = originalEnv;
});
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [16, 18, 20]
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node-version }}
      - run: cd bin && npm install
      - run: cd bin && npm test
```

## Related Documentation

- [Installation Guide](../../README.md)
- [Architecture Documentation](../../www/docs)
- [Contributing Guidelines](../../CONTRIBUTING.md)
