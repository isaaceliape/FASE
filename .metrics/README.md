# 📊 FASE Adoption Metrics

This directory tracks adoption metrics for the FASE framework across npm, GitHub, and analytics platforms.

## Quick Start

### Run metrics collection manually

```bash
bash .metrics/track-metrics.sh
```

**Output:**
```
📊 FASE Adoption Metrics — 2026-04-10
================================

📦 npm Downloads
  Weekly: 136
  Monthly: 2298

⭐ GitHub Metrics
  Stars: 45
  Forks: 8
  Watchers: 12
  Open Issues: 3

📈 Trends (vs last week)
  Stars: 45 (↑ 3)
  Forks: 8 (↑ 1)

📊 Last 4 weeks of metrics:
date        npm_weekly  npm_monthly  github_stars  github_forks
2026-04-03  120         2100         42            7
2026-04-10  136         2298         45            8
```

### Automated Weekly Tracking

The GitHub Actions workflow (`.github/workflows/track-adoption.yml`) automatically:
- Runs every Monday at 9 AM UTC
- Collects npm downloads
- Checks GitHub metrics
- Updates `metrics.csv` with new data
- Commits and pushes results

**View results:** Check `metrics.csv` for historical data

---

## What Gets Tracked

| Metric | Source | What It Means |
|--------|--------|---------------|
| npm weekly downloads | npm API | How many installs this week |
| npm monthly downloads | npm API | 30-day install trend |
| GitHub stars | GitHub API | Overall interest/popularity |
| GitHub forks | GitHub API | How many clone for development |
| GitHub watchers | GitHub API | Active followers |
| GitHub issues | GitHub API | User feedback + bugs |

---

## Files

- **`track-metrics.sh`** — Main script to collect metrics
- **`metrics.csv`** — Historical metrics data (auto-updated weekly)
- **`README.md`** — This file

---

## View Metrics Programmatically

### Latest metrics

```bash
tail -1 .metrics/metrics.csv
```

### All metrics

```bash
cat .metrics/metrics.csv
```

### Plot trends (requires gnuplot)

```bash
gnuplot << EOF
set datafile separator ','
set term dumb
plot '.metrics/metrics.csv' using 1:4 with lines title 'GitHub Stars'
EOF
```

### Parse with jq/Python

```bash
# Convert CSV to JSON
python3 -c "
import csv, json
with open('.metrics/metrics.csv') as f:
    data = list(csv.DictReader(f))
    print(json.dumps(data, indent=2))
"
```

---

## Integration with External Dashboards

### Google Sheets

Import metrics into Google Sheets for visualization:

1. Create a new Google Sheet
2. In a cell, paste:
   ```
   =IMPORTDATA("https://raw.githubusercontent.com/isaaceliape/FASE/main/.metrics/metrics.csv")
   ```
3. Add charts and formulas

### Grafana

1. Add GitHub as data source
2. Create dashboards with queries:
   ```
   SELECT stargazers_count FROM github_repos WHERE name = 'FASE'
   ```

### Custom Webhook

Get notifications when metrics change:

```bash
# Add to track-metrics.sh after metrics collection
curl -X POST https://your-webhook-url.com \
  -H "Content-Type: application/json" \
  -d "{'stars': $STARS, 'forks': $FORKS, 'weekly_downloads': $NPM_WEEKLY}"
```

---

## Key Metrics Targets

| Metric | Current | 30-day Target | 90-day Target |
|--------|---------|---------------|---------------|
| npm weekly downloads | 136 | 200+ | 500+ |
| GitHub stars | 45 | 75+ | 150+ |
| GitHub forks | 8 | 15+ | 30+ |

---

## Troubleshooting

### Script fails: "command not found: jq"

Install jq:
```bash
# macOS
brew install jq

# Ubuntu/Debian
sudo apt-get install jq

# or use Python
pip install jq
```

### GitHub API rate limited

GitHub allows 60 requests/hour for unauthenticated requests. To increase to 5,000/hour, pass a token:

```bash
curl -s -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/repos/isaaceliape/FASE
```

### CSV file not updating

Check the GitHub Actions workflow:
1. Go to repository **Actions** tab
2. Look for "Track Adoption Metrics" workflow
3. Check if it ran successfully (green check)
4. If failed, click on the run to see error logs

---

## Manual Monitoring

If you prefer not to use automation, you can manually check metrics:

**Weekly:**
```bash
# npm downloads
open "https://www.npmjs.com/package/fase-ai"

# GitHub stats  
open "https://github.com/isaaceliape/FASE"

# Community mentions
open "https://www.reddit.com/r/brasilprogramming/?f=search&q=FASE"
```

---

## See Also

- [MONITORING_ADOPTION.md](../MONITORING_ADOPTION.md) — Comprehensive adoption monitoring guide
- [POST_LAUNCH_CHECKLIST.md](../POST_LAUNCH_CHECKLIST.md) — Full launch checklist

---

*Last updated: April 10, 2026*
