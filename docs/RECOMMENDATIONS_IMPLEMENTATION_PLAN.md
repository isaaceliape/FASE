# 📋 Recommendations Implementation Plan

Created: 2026-03-28  
Priority: Organized by impact vs. effort

---

## 1. 🔧 Fix Failing Test (1 of 129) ✅ **DONE**

**Impact:** High (maintains 100% test confidence)  
**Effort:** Low (15-30 min)  
**Priority:** 🔴 **DO FIRST**  
**Completed:** 2026-03-28

### Root Cause
Test was creating directory with `mode: 0o755` but umask caused it to be created as `0o700`. The test didn't explicitly call `fs.chmodSync` to enforce exact permissions.

### Tasks
- [x] **1.1** Investigate failing test: `test/providers.test.js:365`
- [x] **1.2** Identify root cause - umask interference
- [x] **1.3** Implement fix - added `fs.chmodSync(configPath, 0o755)` and changed assertion to exact match
- [x] **1.4** Run full test suite - 129/129 passing ✅
- [x] **1.5** Commit: `fix: Claude config permissions test - explicit chmod for umask compatibility`

### Files to Check
- `bin/test/providers.test.js` (line 365)
- Related permission logic in installer

---

## 2. 📝 Commit Docs Website Work

**Impact:** Medium (progress tracking, backup)  
**Effort:** Low (10 min)  
**Priority:** 🟡 **DO EARLY**

### Tasks
- [ ] **2.1** Review uncommitted changes:
  ```bash
  git diff www/docs/
  ```
  
- [ ] **2.2** Stage and commit docs changes:
  ```bash
  git add www/docs/
  git commit -m "docs: WIP - Astro docs site updates"
  ```
  
- [ ] **2.3** Decide on `.astro/` folder - add to `.gitignore` if needed
  
- [ ] **2.4** Clean up screenshot files:
  - `fase-docs-colorscheme.png` - keep or move to `assets/`?
  - `fase-docs-validation.png` - keep or move to `assets/`?

### Files Involved
- `www/docs/astro.config.mjs`
- `www/docs/src/content.config.ts`
- `www/docs/src/content/docs/**/*.md`
- `www/docs/src/styles/custom.css`
- `www/index.html`

---

## 3. 🌐 Publish Docs Site to GitHub Pages

**Impact:** High (better UX, SEO, professionalism)  
**Effort:** Medium (2-4 hours)  
**Priority:** 🟡 **MEDIUM TERM**

### Phase 1: Setup & Configuration
- [ ] **3.1** Configure Astro for GitHub Pages deployment
  - Update `astro.config.mjs` with `site` and `base` config
  - Add GitHub Pages deployment action
  
- [ ] **3.2** Create GitHub Actions workflow: `.github/workflows/deploy-docs.yml`
  - Build on push to `main`
  - Deploy to `gh-pages` branch
  
- [ ] **3.3** Test local build:
  ```bash
  cd www/docs
  npm run build
  ```

### Phase 2: Content Polish
- [ ] **3.4** Add search functionality (Pagefind or Algolia DocSearch)
  
- [ ] **3.5** Add versioning support (if planning v4, v5, etc.)
  
- [ ] **3.6** Ensure all docs are complete:
  - Getting Started
  - All 32 commands documented
  - All 12 agents documented
  - Architecture reference
  - Contributing guide

### Phase 3: Deployment
- [ ] **3.7** Enable GitHub Pages: Settings → Pages → Source: `gh-pages` branch
  
- [ ] **3.8** Update README and landing page links to point to new docs URL
  
- [ ] **3.9** Add docs URL to npm package metadata

### Files to Create/Modify
- `.github/workflows/deploy-docs.yml` (new)
- `www/docs/astro.config.mjs` (update)
- `www/docs/package.json` (add deploy scripts)

---

## 4. 📚 Add Example Projects

**Impact:** High (onboarding, demonstration)  
**Effort:** Medium-High (4-8 hours)  
**Priority:** 🟡 **MEDIUM TERM**

### Phase 1: Plan Examples
- [ ] **4.1** Define 3 example projects:
  1. **Beginner**: CLI tool (e.g., "pomodoro timer")
  2. **Intermediate**: Refactor legacy script
  3. **Advanced**: Full feature implementation with tests

- [ ] **4.2** Create example structure:
  ```
  examples/
  ├── README.md (overview)
  ├── example-1-cli-tool/
  │   ├── README.md (walkthrough)
  │   ├── FASE_PHASES.md (phase breakdown)
  │   └── [source code]
  ├── example-2-refactor/
  └── example-3-full-feature/
  ```

### Phase 2: Create Example 1 (CLI Tool)
- [ ] **4.3** Document the FASE workflow for building a simple CLI:
  - Phase 1: Research & Planning
  - Phase 2: Core Implementation
  - Phase 3: Testing & Polish
  
- [ ] **4.4** Include actual FASE commands used at each step
  
- [ ] **4.5** Show before/after: spec → final code

### Phase 3: Create Examples 2 & 3
- [ ] **4.6** Repeat for refactor example
  
- [ ] **4.7** Repeat for full feature example

### Phase 4: Integration
- [ ] **4.8** Link examples from README.md
  
- [ ] **4.9** Add to docs site navigation
  
- [ ] **4.10** Create video/GIF walkthroughs (optional but powerful)

---

## 5. 📊 Add Usage Analytics (Opt-in)

**Impact:** Medium (data-driven decisions)  
**Effort:** Medium (3-5 hours)  
**Priority:** 🟢 **LOWER PRIORITY**

### Phase 1: Design
- [ ] **5.1** Define what to track:
  - Command usage (which commands run most)
  - Runtime preference (Claude Code vs OpenCode vs Gemini vs Codex)
  - Agent usage
  - Session duration (optional)
  
- [ ] **5.2** Privacy design:
  - **Opt-in only** (default: OFF)
  - No code/project content tracked
  - Anonymous UUID per installation
  - Clear documentation on what's tracked

### Phase 2: Implementation
- [ ] **5.3** Add analytics toggle to config:
  ```bash
  /fase-configuracoes
  # → "Enable anonymous usage analytics: [Y/n]"
  ```
  
- [ ] **5.4** Implement tracking in installer/hooks:
  - Generate anonymous ID on opt-in
  - Log command invocations locally
  
- [ ] **5.5** Add periodic upload (weekly?) to analytics endpoint
  
- [ ] **5.6** Choose analytics backend:
  - Simple: Google Sheets via API
  - Better: Plausible, Fathom (privacy-focused)
  - Custom: Self-hosted Countly/Matomo

### Phase 3: Dashboard
- [ ] **5.7** Create simple dashboard to view aggregated data
  
- [ ] **5.8** Document insights in MAINTAINERS.md

### Files to Create/Modify
- `bin/analytics.js` (new - tracking logic)
- `comandos/fase-configuracoes.md` (update - add analytics toggle)
- `docs/ANALYTICS.md` (new - privacy policy & what's tracked)

---

## 6. 📣 Community Growth Initiative

**Impact:** High (adoption, contributors)  
**Effort:** Ongoing (1-2 hours/week)  
**Priority:** 🟡 **MEDIUM TERM**

### Phase 1: Content Creation
- [ ] **6.1** Record 5-10 min YouTube tutorial (Portuguese):
  - "FASE: Como construir projetos com IA sem enrolação"
  - Show full workflow: install → plan → execute → verify
  - Post on personal channel + FASE repo README
  
- [ ] **6.2** Write Dev.to article (Portuguese):
  - "Como traduzi o Get Shit Done para português e criei o FASE"
  - Technical deep-dive + philosophy
  
- [ ] **6.3** Create demo GIFs for README:
  - Show FASE in action (terminal recording)
  - Use `termtosvg` or `asciinema`

### Phase 2: Community Outreach
- [ ] **6.4** Share in Brazilian communities:
  - r/brasilprogramming (Reddit)
  - Dev.to BR
  - LinkedIn (Brazilian dev groups)
  - Twitter/X with #brdev #IA
  
- [ ] **6.5** Reach out to potential contributors:
  - People who starred the repo
  - Brazilian devs who tweet about AI coding
  
- [ ] **6.6** Consider other languages:
  - Spanish localization (large market)
  - French localization

### Phase 3: Sustainability
- [ ] **6.7** Add "Community" section to README
  
- [ ] **6.8** Set up Discord/Telegram for FASE users (optional)
  
- [ ] **6.9** Create "Showcase" section for projects built with FASE

---

## 📅 Suggested Timeline

### Week 1 (Immediate)
- ✅ Fix failing test (#1)
- ✅ Commit docs work (#2)

### Week 2-3
- 📦 Publish docs site (#3)
- 📚 Start Example 1 (#4)

### Week 4-6
- 📚 Complete examples (#4)
- 📣 Create tutorial content (#6)

### Month 2+
- 📊 Analytics (#5) - if still valuable
- 📣 Ongoing community growth (#6)

---

## 🎯 Success Metrics

| Goal | Metric | Target |
|------|--------|--------|
| Code Quality | Test pass rate | 100% (129/129) |
| Documentation | Docs site deployed | ✅ Live |
| Onboarding | Example projects | 3 complete |
| Adoption | npm downloads/month | +50% |
| Community | GitHub stars | +100 |
| Contributors | Active contributors | 2-3 external |

---

## 🔄 Next Steps

1. **Pick one** recommendation to start with
2. **Break it down** into tasks (already done above)
3. **Execute** using FASE itself! 🐾

---

*Generated by Clawd • 2026-03-28*
