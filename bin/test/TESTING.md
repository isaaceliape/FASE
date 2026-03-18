# FASE Testing Guide

Complete testing suite for FASE (Framework de Automação Sem Enrolação) across all supported providers and installation methods.

## 📋 Overview

This testing suite provides comprehensive coverage for:
- **4 Providers**: Claude Code, OpenCode, Gemini, Codex
- **3 Installation Methods**: Global, Local, Custom directories
- **Multiple Environments**: Alpine, Ubuntu, macOS, Windows paths
- **Edge Cases**: Symlinks, long paths, special characters, permissions

## 🚀 Quick Start

### Run All Tests
```bash
npm test
```

### Run Specific Test Suite
```bash
npm run test:install      # Installation tests
npm run test:providers    # Provider configuration tests
npm run test:integration  # Integration tests
npm run test:docker       # Docker environment simulations
npm run test:edge-cases   # Edge cases and complex scenarios
```

### Watch Mode (Auto-reload on changes)
```bash
npm run test:watch
```

## 🐳 Docker Testing

### Prerequisites
- Docker installed and running
- Docker Compose (optional, for advanced tests)

### Run Tests in Docker
```bash
# Run all tests in Docker
npm run test:docker:all

# Run specific provider tests
cd test && bash run-docker-tests.sh --claude
cd test && bash run-docker-tests.sh --opencode
cd test && bash run-docker-tests.sh --gemini
cd test && bash run-docker-tests.sh --codex

# Test all providers
cd test && bash run-docker-tests.sh --all-providers

# Test on specific OS
cd test && bash run-docker-tests.sh --ubuntu
cd test && bash run-docker-tests.sh --alpine

# Cleanup test containers
npm run test:docker:clean
```

### Using Docker Compose
```bash
# Run specific service
docker-compose -f test/docker-compose.yml run --rm claude-test

# Run all services
docker-compose -f test/docker-compose.yml up --abort-on-container-exit

# View logs
docker-compose -f test/docker-compose.yml logs -f
```

## 📁 Test Files

### `install.test.js` (Basic Installation)
- Directory creation
- File writing and error handling
- package.json configuration
- Path construction
- Error handling and messaging

**Run:** `npm run test:install`

### `providers.test.js` (Provider Configuration)
- Directory structure per provider
- Environment variables (CLAUDE_CONFIG_DIR, OPENCODE_CONFIG_DIR, GEMINI_CONFIG_DIR, CODEX_HOME)
- Settings file formats (JSON, INI compatibility)
- Attribution settings and commit messages
- Hook file management
- Path expansion (~/.claude, ~/.config/opencode, etc.)
- Duplicate prevention
- Permission handling
- Mixed provider installations

**Run:** `npm run test:providers`

### `integration.test.js` (End-to-End)
- Global installations
- Local/project installations
- Custom config directories
- Multiple provider installations
- Version management and updates
- Configuration persistence
- Uninstallation and cleanup
- Error recovery scenarios

**Run:** `npm run test:integration`

### `docker-test.js` (Docker Simulations)
- Clean Alpine container installs
- Clean Ubuntu container installs
- macOS ARM64 environments
- Multi-stage Docker builds
- Environment variables in containers
- Volume mounting scenarios
- Installation scripts
- Cross-platform path handling
- Health checks

**Run:** `npm run test:docker`

### `edge-cases.test.js` (Complex Scenarios)
- Symlink handling
- Long path names (30+ levels deep)
- Special characters (spaces, hyphens, dots)
- Large configuration files (10KB+)
- Concurrent operations
- Migration scenarios and rollback
- Disk space edge cases
- Permission constraints
- Race conditions
- UTF-8 and emoji handling
- Backward compatibility

**Run:** `npm run test:edge-cases`

## 🏗️ Docker Files

### `Dockerfile.test`
Alpine-based test image that:
- Installs dependencies
- Runs full test suite
- Tests each provider individually
- Verifies all installations

Build and run:
```bash
docker build -f test/Dockerfile.test -t fase-test ..
docker run --rm fase-test
```

### `docker-compose.yml`
Services for testing different scenarios:
- `test`: Full test suite
- `claude-test`: Claude installation only
- `opencode-test`: OpenCode installation only
- `gemini-test`: Gemini installation only
- `codex-test`: Codex installation only
- `all-test`: All providers simultaneously
- `ubuntu-test`: Ubuntu-based tests
- `alpine-test`: Alpine-based tests

### `run-docker-tests.sh`
Smart test runner script with options:

```bash
./test/run-docker-tests.sh --help

# Examples:
./test/run-docker-tests.sh --all              # Run everything
./test/run-docker-tests.sh --claude --opencode # Specific providers
./test/run-docker-tests.sh --ubuntu           # Specific OS
./test/run-docker-tests.sh --cleanup          # Remove test data
```

## 📊 Test Structure

Each test file follows this pattern:

```javascript
describe('Feature Group', () => {
  beforeEach(() => {
    // Setup (create temp directory, etc.)
  });

  afterEach(() => {
    // Cleanup (remove temp files, restore env)
  });

  describe('Specific Test Suite', () => {
    it('should do something specific', () => {
      // Arrange
      const expectedResult = 'value';

      // Act
      const actualResult = someFunction();

      // Assert
      assert.strictEqual(actualResult, expectedResult);
    });
  });
});
```

## 🔍 Provider Details

### Claude Code
```
Config Dir:     ~/.claude
Env Var:        CLAUDE_CONFIG_DIR
Config File:    settings.json
Default Path:   /Users/<user>/.claude
Hook Example:   /Users/<user>/.claude/hooks/my-hook.js
```

### OpenCode
```
Config Dir:     ~/.config/opencode (XDG standard)
Env Vars:       OPENCODE_CONFIG_DIR, OPENCODE_CONFIG, XDG_CONFIG_HOME
Config File:    opencode.json
Default Path:   /Users/<user>/.config/opencode
Hook Example:   /Users/<user>/.config/opencode/hooks/my-hook.js
```

### Gemini
```
Config Dir:     ~/.gemini
Env Var:        GEMINI_CONFIG_DIR
Config File:    settings.json
Default Path:   /Users/<user>/.gemini
Hook Example:   /Users/<user>/.gemini/hooks/my-hook.js
```

### Codex
```
Config Dir:     ~/.codex
Env Var:        CODEX_HOME
Config File:    settings.json
Default Path:   /Users/<user>/.codex
Hook Example:   /Users/<user>/.codex/hooks/my-hook.js
```

## 🛠️ Common Commands

### Clean Installation
```bash
npm test                    # Run all tests
npm run test:providers      # Verify provider setup
npm run test:integration    # Test full workflow
```

### CI/CD Pipeline
```bash
npm test                           # Unit tests
npm run test:docker:all           # Docker tests
npm run test:coverage             # Generate report
```

### Development
```bash
npm run test:watch                # Watch mode
npm run test:providers            # Quick provider check
npm run test:edge-cases           # Edge case validation
```

### Debugging
```bash
# Run single test
npx mocha test/install.test.js --grep "Directory Creation"

# Verbose output
npm test -- --reporter spec

# Show slow tests
npm test -- --reporter spec --slow 100
```

## 📈 Coverage Goals

Current coverage:
- ✅ Installation methods: Local, Global, Custom
- ✅ Providers: Claude, OpenCode, Gemini, Codex
- ✅ Environments: Alpine, Ubuntu, macOS
- ✅ Error scenarios: Permissions, missing dirs, corrupt files
- ✅ Edge cases: Symlinks, long paths, special chars
- ✅ Concurrency: Multiple installs, rapid cycles

Target: >90% code coverage

Generate coverage report:
```bash
npm run test:coverage
```

## 🐛 Troubleshooting

### Tests fail with permission errors
```bash
# Check temp directory permissions
ls -la /tmp | grep fase-test

# Clear stale test directories
rm -rf /tmp/fase-*
```

### Docker tests fail
```bash
# Check Docker is running
docker ps

# Pull fresh images
docker-compose pull

# Rebuild images
docker-compose build --no-cache
```

### Environment variable conflicts
Tests automatically save and restore `process.env`:
```javascript
originalEnv = { ...process.env };
// ... tests run ...
process.env = originalEnv;
```

### Timeout issues
Increase Mocha timeout (default 2000ms):
```bash
npx mocha test/*.test.js --timeout 10000
```

## 📝 Adding New Tests

1. **Create test file** in `test/` directory
2. **Follow naming**: `feature.test.js`
3. **Use standard pattern**:
   ```javascript
   const assert = require('assert');
   describe('Feature', () => {
     it('should do X', () => {
       assert.strictEqual(actual, expected);
     });
   });
   ```
4. **Add to package.json scripts**:
   ```json
   "test:feature": "mocha test/feature.test.js"
   ```
5. **Update this file** with test documentation

## 🔗 Integration with CI/CD

### GitHub Actions
```yaml
- name: Run Tests
  run: cd bin && npm test

- name: Docker Tests
  run: cd bin/test && bash run-docker-tests.sh --all
```

### GitLab CI
```yaml
test:
  image: node:18-alpine
  script:
    - cd bin
    - npm install
    - npm test
```

## 📚 Related Documentation

- [Installation Guide](../../README.md)
- [Contributing Guidelines](../../CONTRIBUTING.md)
- [Provider Documentation](../../www/docs)

## 📞 Support

For test issues or improvements:
- Check [Troubleshooting](#-troubleshooting) section
- Review test output for specific error messages
- Open an issue on GitHub with test logs

---

**Last Updated:** 2026-03-18
**Test Suite Version:** 1.0.0
**Supported Providers:** Claude Code, OpenCode, Gemini, Codex
