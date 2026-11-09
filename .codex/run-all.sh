#!/usr/bin/env bash
# Runs several tasks one after another (one writer per checkout).
#   .codex/run-all.sh <task-id> [<task-id> ...]
# Stops early if a task ends BLOCKED, so the lead can intervene.
set -uo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
for ID in "$@"; do
  "$ROOT/.codex/run-task.sh" "$ID"
  STATUS="$(grep -m1 -oE '^Status:\s*\S+' "$ROOT/.tasks/$ID/summary.md" 2>/dev/null | awk '{print $2}')"
  echo "=== $ID -> ${STATUS:-NO_SUMMARY}"
  if [ "${STATUS:-BLOCKED}" = "BLOCKED" ] || [ -z "$STATUS" ]; then
    echo "stopping: $ID did not reach ACCEPTED"; exit 1
  fi
done
echo "=== all tasks finished"
