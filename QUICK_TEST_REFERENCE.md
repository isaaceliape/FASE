# Quick Test Reference

## ⚡ Essential Commands

```bash
# Run all 112 tests
npm test

# Run specific test suite
npm run test:install        # 12 tests
npm run test:providers      # 47 tests
npm run test:integration    # 33 tests
npm run test:docker         # 31 tests
npm run test:edge-cases     # 24 tests

# Watch mode (auto-reload)
npm run test:watch

# Docker tests
npm run test:docker:all     # Full Docker test suite
npm run test:docker:clean   # Clean up Docker artifacts
```

## 📦 What's Tested

| Provider  | Install Methods | Env Vars | Config | Tests |
|-----------|-----------------|----------|--------|-------|
| Claude    | Global, Local, Custom | ✓ | JSON | 25 |
| OpenCode  | Global, Local, Custom | ✓ | JSON | 25 |
| Gemini    | Global, Local, Custom | ✓ | JSON | 25 |
| Codex     | Global, Local, Custom | ✓ | JSON | 25 |
| **Total** | **All methods** | **All** | **All** | **112** |

## 🐳 Docker Testing

```bash
# Run in Docker
docker-compose -f bin/test/docker-compose.yml run --rm test

# Test specific provider in Docker
docker-compose -f bin/test/docker-compose.yml run --rm claude-test

# Use helper script
cd bin/test && bash run-docker-tests.sh --all
cd bin/test && bash run-docker-tests.sh --claude
cd bin/test && bash run-docker-tests.sh --ubuntu
```

## 📂 Test Files Location

```
bin/test/
├── install.test.js          # Basic installation
├── providers.test.js        # Provider-specific config
├── integration.test.js      # End-to-end workflows
├── docker-test.js           # Docker environments
├── edge-cases.test.js       # Complex scenarios
├── README.md                # Quick start guide
├── TESTING.md               # Full documentation
├── Dockerfile.test          # Test container image
├── docker-compose.yml       # Multi-service setup
└── run-docker-tests.sh      # Docker test runner
```

## ✅ Test Results

```
✓ 112 passing
✓ 0 failing
✓ ~400ms total runtime
✓ No external dependencies required
✓ Cross-platform compatible
```

## 🎯 Test Coverage

- ✅ Installation (global, local, custom)
- ✅ Providers (Claude, OpenCode, Gemini, Codex)
- ✅ Configuration files and persistence
- ✅ Environment variables
- ✅ Permissions and error handling
- ✅ Docker environments (Alpine, Ubuntu)
- ✅ Edge cases (symlinks, long paths, special chars)
- ✅ Concurrent operations
- ✅ Migration and rollback
- ✅ Uninstallation and cleanup

## 🔗 Quick Links

- 📖 **Guide**: `bin/test/TESTING.md` (comprehensive)
- 🚀 **Quick Start**: `bin/test/README.md`
- 📊 **Summary**: `TEST_SETUP_SUMMARY.md`

## 💡 Common Tasks

### Debug Single Test
```bash
npx mocha test/install.test.js --grep "Directory Creation"
```

### Increase Timeout
```bash
npm test -- --timeout 10000
```

### Generate Report
```bash
npm run test:coverage
```

### Run in Watch Mode
```bash
npm run test:watch
```

---

**All tests located in:** `bin/test/`
**Run from:** `bin/` directory
**Status:** ✅ 112/112 passing
