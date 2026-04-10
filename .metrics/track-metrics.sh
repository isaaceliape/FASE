#!/bin/bash
# FASE Adoption Metrics Tracker
# Run this weekly to track adoption metrics across npm, GitHub, and analytics

set -e

METRICS_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
REPO="isaaceliape/FASE"
PACKAGE="fase-ai"
DATE=$(date +%Y-%m-%d)

echo "📊 FASE Adoption Metrics — $DATE"
echo "================================"

# 1. npm Statistics
echo ""
echo "📦 npm Downloads"
NPM_RESPONSE=$(curl -s "https://api.npmjs.org/downloads/range/last-week/${PACKAGE}")
NPM_WEEKLY=$(echo "$NPM_RESPONSE" | jq -r '.downloads | map(.downloads) | add // 0')

NPM_RESPONSE=$(curl -s "https://api.npmjs.org/downloads/range/last-month/${PACKAGE}")
NPM_MONTHLY=$(echo "$NPM_RESPONSE" | jq -r '.downloads | map(.downloads) | add // 0')

echo "  Weekly: $NPM_WEEKLY"
echo "  Monthly: $NPM_MONTHLY"

# 2. GitHub Statistics
echo ""
echo "⭐ GitHub Metrics"
GH_RESPONSE=$(curl -s -H "Accept: application/vnd.github.v3+json" "https://api.github.com/repos/${REPO}")
STARS=$(echo "$GH_RESPONSE" | jq '.stargazers_count // 0')
FORKS=$(echo "$GH_RESPONSE" | jq '.forks_count // 0')
WATCHERS=$(echo "$GH_RESPONSE" | jq '.watchers_count // 0')
OPEN_ISSUES=$(echo "$GH_RESPONSE" | jq '.open_issues_count // 0')

echo "  Stars: $STARS"
echo "  Forks: $FORKS"
echo "  Watchers: $WATCHERS"
echo "  Open Issues: $OPEN_ISSUES"

# 3. Save to CSV for historical tracking
CSV_FILE="$METRICS_DIR/metrics.csv"
if [ ! -f "$CSV_FILE" ]; then
  echo "date,npm_weekly,npm_monthly,github_stars,github_forks,github_watchers,github_issues" > "$CSV_FILE"
fi
echo "$DATE,$NPM_WEEKLY,$NPM_MONTHLY,$STARS,$FORKS,$WATCHERS,$OPEN_ISSUES" >> "$CSV_FILE"

# 4. Calculate trends
echo ""
echo "📈 Trends (vs last week)"
if [ $(wc -l < "$CSV_FILE") -gt 2 ]; then
  LAST_ROW=$(tail -2 "$CSV_FILE" | head -1)
  LAST_STARS=$(echo "$LAST_ROW" | cut -d, -f4)
  LAST_FORKS=$(echo "$LAST_ROW" | cut -d, -f5)

  STARS_DIFF=$((STARS - LAST_STARS))
  FORKS_DIFF=$((FORKS - LAST_FORKS))

  if [ $STARS_DIFF -ge 0 ]; then
    echo "  Stars: $STARS (↑ $STARS_DIFF)"
  else
    echo "  Stars: $STARS (↓ $((STARS_DIFF * -1)))"
  fi

  if [ $FORKS_DIFF -ge 0 ]; then
    echo "  Forks: $FORKS (↑ $FORKS_DIFF)"
  else
    echo "  Forks: $FORKS (↓ $((FORKS_DIFF * -1)))"
  fi
else
  echo "  (not enough data for trend calculation)"
fi

# 5. Show latest entries
echo ""
echo "📊 Last 4 weeks of metrics:"
tail -5 "$CSV_FILE" | column -t -s,

echo ""
echo "✅ Metrics saved to: $CSV_FILE"
