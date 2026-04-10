# 📋 FASE v3.3.0 — Post-Launch Checklist

After completing the TypeScript migration and implementing the roadmap features, here are the remaining tasks to fully launch v3.3.0.

---

## 1. 🌐 Enable GitHub Pages Deployment

**Status:** Workflow configured ✅ | Pages enabled ❌

### Steps

1. Go to [GitHub Repo Settings](https://github.com/isaaceliape/FASE/settings)
2. Navigate to **Pages** (sidebar → "Code and automation" section)
3. Under **Source**:
   - Select: **GitHub Actions**
   - (Do NOT select a branch — GitHub Actions deployment is configured)
4. Save settings
5. Go back to **Settings → Pages** and you should see:
   ```
   ✓ Your site is live at https://isaaceliape.github.io/FASE/docs/
   ```

### Verify

- Push a commit to `www/docs/` (or trigger workflow manually)
- Check **Actions** tab for green build
- Visit `https://isaaceliape.github.io/FASE/docs/` in browser
- You should see the Starlight docs site with navigation

### Troubleshooting

**"Pages source is set to GitHub Actions but no build found"**
- Go to **Actions** tab and manually trigger the workflow
- The deploy-pages.yml workflow should appear

**"Site is deployed but shows 404"**
- Check `astro.config.mjs` has `site: 'https://isaaceliape.github.io/FASE/'` and `base: '/docs/'`
- Check `.github/workflows/deploy-pages.yml` uploads `www/docs/dist` (not `www/dist`)

---

## 2. 🎬 Record Terminal Demo Videos

**Status:** Instructions added ✅ | Recordings ❌

### Record Installation Flow

```bash
# Terminal 1: Start recording
asciinema rec assets/demo-install.cast

# Terminal 2: Run installer
npx fase-ai

# Choose: Claude Code → Local
# Opt-in to analytics when prompted
# ^C to exit asciinema when done
```

**Upload to asciinema.org (optional but recommended):**
```bash
asciinema upload assets/demo-install.cast
# Returns: https://asciinema.org/a/XXXXXX
```

### Record Full Workflow Demo

```bash
# Create a test project
mkdir test-project && cd test-project

# Start recording
asciinema rec ../assets/demo-workflow.cast

# In the project:
# 1. /fase-novo-projeto
# 2. Answer the questions
# 3. /fase-progresso (to show roadmap)
# 4. /fase-planejar-fase 1
# 5. Exit with /fase-ajuda
# ^C to stop recording
```

### Embed in README

Once you have recordings, add to `README.md`:

```markdown
## 🎬 In Action

**Installation Demo:**
[![asciicast](https://asciinema.org/a/XXXXXX.svg)](https://asciinema.org/a/XXXXXX)

**Full Workflow Demo:**
[![asciicast](https://asciinema.org/a/YYYYYY.svg)](https://asciinema.org/a/YYYYYY)
```

Or use SVG from termtosvg:

```markdown
![Demo](assets/demo-workflow.svg)
```

---

## 3. 📝 Write Articles & Blog Posts

### Dev.to Article Draft

**Title:** "Translating 'Get Shit Done' to Portuguese: Building FASE for AI Coding"

**Sections:**
1. Why translate GSD?
   - Portuguese-speaking devs need AI tools in their language
   - GSD is powerful but English-only

2. The FASE difference
   - 12 agents + 32 commands in Brazilian Portuguese
   - Full localization (UI + docs + commands)
   - Supports Claude Code, OpenCode, Gemini, Codex

3. What's new in v3.3.0
   - TypeScript migration (type safety)
   - Example projects (learn by doing)
   - Analytics (understand usage patterns)

4. Getting started
   - `npx fase-ai`
   - Link to docs

5. Show example
   - Use one of the example projects
   - Show actual FASE workflow

### Publishing

1. Go to [dev.to/new](https://dev.to/new)
2. Paste article
3. Tags: `portugese`, `ai`, `claude`, `automation`, `typescript`
4. Publish and share

---

## 4. 🚀 Community Sharing

### Share on Reddit

**Subreddit:** r/brasilprogramming or r/brasil_dev

```
Title: "FASE v3.3.0 — TypeScript, Examples, and Analytics"

Content:
- Link to GitHub
- Link to docs site
- What's new in v3.3.0
- Quick start command: npx fase-ai
```

### Share on LinkedIn

```
Post about the v3.3.0 release:
- Mention TypeScript migration (quality improvement)
- Highlight example projects (learning resource)
- Add automation angle (FASE helps ship faster)
- Call to action: Try it, share feedback
```

### Share on Twitter/X

```
🇧🇷 FASE v3.3.0 is live! 

✨ TypeScript for type safety
📚 3 example projects (beginner → advanced)
📊 Opt-in usage analytics

Learn to build with AI:
👉 https://isaaceliape.github.io/FASE/docs/

Code: https://github.com/isaaceliape/FASE

#python #ai #claude #automation #brasildev
```

---

## 5. 🔧 Analytics Backend Setup (Optional)

**Status:** Infrastructure complete ✅ | Backend ❌

### Overview

Users opt-in to analytics during install. Data is stored locally and flushed every 7 days.

### Simple Backend Option: Google Sheets

1. Create a Google Sheet: `FASE Analytics`
2. Columns: `timestamp`, `installId`, `command`, `runtime`
3. Create Google Service Account with Sheets API access
4. Update `bin/src/lib/analytics.ts` flushToBackend():

```typescript
import { google } from 'googleapis';

async function flushToBackend(installId: string): Promise<void> {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_JSON,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const events = loadEventsFromDisk();

    // Append to sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.FASE_ANALYTICS_SHEET_ID,
      range: 'Sheet1!A:D',
      valueInputOption: 'RAW',
      requestBody: {
        values: events.map(e => [
          new Date(e.ts).toISOString(),
          installId,
          e.cmd,
          e.runtime,
        ]),
      },
    });
  } catch {
    // Fail silently
  }
}
```

### Cloudflare Workers Option

1. Create Worker at `analytics.fase-ai.dev`
2. Store data in Cloudflare KV or R2
3. Update flushToBackend():

```typescript
async function flushToBackend(installId: string): Promise<void> {
  try {
    const events = loadEventsFromDisk();

    const response = await fetch('https://analytics.fase-ai.dev/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ installId, events }),
    });

    if (response.ok) {
      fs.writeFileSync(ANALYTICS_LOG_FILE, '');
    }
  } catch {
    // Fail silently
  }
}
```

### PostHog Option (Recommended for Analytics)

PostHog is a free, privacy-first analytics platform.

1. Sign up at [posthog.com](https://posthog.com)
2. Create project for FASE
3. Install SDK: `npm install posthog`
4. In analytics.ts:

```typescript
import posthog from 'posthog-js';

posthog.init('your_posthog_key', { host: 'https://app.posthog.com' });

export function trackEvent(cmd: string, runtime: string): void {
  const config = loadConfig();
  if (!config.analytics) return;

  posthog.capture('command_executed', {
    command: cmd,
    runtime: runtime,
    installId: config.installId,
  });
}
```

---

## 6. 📊 Dashboard & Insights

Once analytics data is flowing, create a simple dashboard:

### Questions to Answer

- What are the top 10 commands users run?
- Which runtime is most popular? (Claude Code vs OpenCode vs Gemini vs Codex)
- How many active installs? (unique installIds)
- When do users typically use FASE? (time of day patterns)

### Tools

- **Google Sheets:** Simple pivot tables + charts
- **PostHog:** Built-in dashboards and insights
- **Cloudflare Analytics Engine:** SQL queries on KV data

---

## 7. 📖 Documentation Improvements

### Add to Docs Site

1. **Getting Started → Installation** — Include screenshot of opt-in prompt
2. **Reference → Analytics** — Explain what's tracked and why
3. **Advanced → Privacy Policy** — Full details about data handling

### Update CONTRIBUTING.md

Add section about running FASE in CI/CD (no interactive prompts).

---

## Tracking Progress

| Task | Status | Owner | Due |
|------|--------|-------|-----|
| Enable GitHub Pages | ⏳ Manual | You | ASAP |
| Record demo videos | ⏳ Manual | You | This week |
| Write Dev.to article | ⏳ Manual | You | This week |
| Share on social media | ⏳ Manual | You | This week |
| Setup analytics backend | ⏳ Manual | You | Next week |
| Create analytics dashboard | ⏳ Manual | You | Next week |

---

## 🎯 Success Metrics

| Goal | Target | Current |
|------|--------|---------|
| Docs site live | ✅ | Pending Pages enable |
| npm downloads/month | +50% | TBD (after marketing) |
| GitHub stars | +100 | TBD |
| Example projects | 3 complete | ✅ 3/3 |
| Analytics opt-in | >40% | TBD (pending launch) |

---

## 🚀 Launch Sequence

1. **Today:** Enable GitHub Pages
2. **This week:** Record demos + write article + share on social
3. **Next week:** Setup analytics backend + create dashboard
4. **Month 2:** Monitor adoption metrics + iterate based on feedback

---

*Updated: April 10, 2026 • Version 3.3.0*
