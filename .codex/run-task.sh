#!/usr/bin/env bash
# Runs one task through the Codex worker pipeline defined in docs/codex-workflow.md.
#   .codex/run-task.sh <task-id>
#   START_AT=test|gate .codex/run-task.sh <task-id>   # resume after a driver fix, reusing existing work
# Requires: codex CLI logged in, Node, the task folder .tasks/<task-id>/brief.md.
# Writes plan.md, evidence.md, review.md, summary.md and logs/ into the task folder.
# Never commits. The lead reads summary.md afterwards.
set -uo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ID="${1:?usage: run-task.sh <task-id>}"
DIR="$ROOT/.tasks/$ID"
LOGS="$DIR/logs"
WORKFLOW="docs/codex-workflow.md"

[ -f "$DIR/brief.md" ] || { echo "missing $DIR/brief.md"; exit 2; }
mkdir -p "$LOGS" "$DIR/shots"
cd "$ROOT"
export NO_COLOR=1 FORCE_COLOR=0

MODEL_LUNA="gpt-6-luna"
MODEL_TERRA="gpt-6.1-terra"
MODEL_SOL="gpt-6.1-sol"

log() { printf '\n[%s] [%s] %s\n' "$(date +%H:%M:%S)" "$ID" "$*" | tee -a "$LOGS/pipeline.log"; }

# run_codex <stage> <model> <effort> <sandbox> <prompt>
run_codex() {
  local stage="$1" model="$2" effort="$3" sandbox="$4" prompt="$5"
  log "stage=$stage model=$model effort=$effort sandbox=$sandbox"
  printf '%s\n' "$prompt" > "$LOGS/$stage.prompt.md"
  codex exec \
    -m "$model" \
    -c "model_reasoning_effort=\"$effort\"" \
    -c approval_policy=never \
    -s "$sandbox" \
    -c sandbox_workspace_write.network_access=true \
    --color never \
    -o "$LOGS/$stage.last.md" \
    - < "$LOGS/$stage.prompt.md" >> "$LOGS/$stage.log" 2>&1
  local rc=$?
  log "stage=$stage exit=$rc"
  return $rc
}

escalate() {
  case "$1" in
    low) echo medium ;; medium) echo high ;; high) echo xhigh ;; *) echo "$1" ;;
  esac
}

COMMON="You are a Codex worker in the repository at $ROOT. Read AGENTS.md and $WORKFLOW first and follow them exactly.
Task folder: .tasks/$ID/ (brief.md, plan.md, evidence.md, review.md, summary.md).
Never commit, push, stash or switch branches. Never edit .env. Never touch .claude/, .codex/ or other task folders.
Lint baseline: 'npm run lint' already exits 1 with 5 known errors in src/SpotlightReveal.jsx. Treat lint as PASS when every reported error is in that file and there are no more than 5; anything else is a FAIL.
For a diff hash use 'git diff | git hash-object --stdin' (sha1sum is not available in this sandbox).
Builds, installs and servers are run by the driver (a plain shell script started by the owner), not by you: do NOT run 'npm run build', 'npm install', 'vite build' or 'vite preview'. The driver appends their exit codes and output to evidence.md under '## Driver checks', and keeps a preview server on http://localhost:4173 running during test stages. Static checks (node -e reading files, grep, git, curl against the running preview) are yours."

# ---------------------------------------------------------------- 1. Router
if [ ! -s "$DIR/plan.md" ]; then
  run_codex router "$MODEL_SOL" low read-only "$COMMON

ROLE: Router / planner (section 5 of $WORKFLOW).
Read brief.md and inspect the repo. Write .tasks/$ID/plan.md only, using .tasks/_template/plan.md as the format.
- Line 3 must be exactly 'Risk level: S', 'Risk level: M' or 'Risk level: L' (section 2 table).
- A line 'Test tier: A only' or 'Test tier: A+B' (A+B only if a file under src/ that renders UI changes, or brief.md has [visual] checks).
- Gate line: S -> 'Gate: Luna max', M -> 'Gate: Sol high', L -> 'Gate: Sol xhigh'.
- Subtasks (max 5) with the files each may touch. Order them.
Do not write code. Keep plan.md under 40 lines. Your sandbox is read-only, so reply with the complete plan.md contents as your final message; the pipeline saves it."
  # Router runs read-only, so its final message is the plan.
  if [ ! -s "$DIR/plan.md" ] && [ -s "$LOGS/router.last.md" ]; then
    grep -v -i 'read-only\|not saved' "$LOGS/router.last.md" > "$DIR/plan.md"
    log "saved router output as plan.md"
  fi
fi

LEVEL="$(grep -m1 -oE '^Risk level:\s*[SML]' "$DIR/plan.md" | grep -oE '[SML]$' || true)"
[ -n "$LEVEL" ] || { log "could not read risk level from plan.md"; exit 3; }
TIER_B=0; grep -m1 -qE '^Test tier:\s*A\+B' "$DIR/plan.md" && TIER_B=1
case "$LEVEL" in
  S) IMPL_EFFORT=medium; GATE_MODEL="$MODEL_LUNA"; GATE_EFFORT=max ;;
  M) IMPL_EFFORT=high;   GATE_MODEL="$MODEL_SOL";  GATE_EFFORT=high ;;
  L) IMPL_EFFORT=high;   GATE_MODEL="$MODEL_SOL";  GATE_EFFORT=xhigh ;;
esac
log "level=$LEVEL tierB=$TIER_B impl_effort=$IMPL_EFFORT gate=$GATE_MODEL/$GATE_EFFORT"

[ -f "$DIR/evidence.md" ] || printf '# Evidence — %s\n\nAppend only.\n' "$ID" > "$DIR/evidence.md"

# ---------------------------------------------------------------- 2. Implement (+ build check, max 2 attempts)
IMPL_PROMPT="$COMMON

ROLE: Implementer (section 5 of $WORKFLOW). Effort level for this task: %s. Attempt %s of 2.
Implement every subtask in plan.md in order. Touch only the files plan.md lists; if you must touch another file, say so in evidence.md and keep the change minimal.
Follow brief.md constraints. Facts and copy come only from the sources brief.md names; invent nothing.
Do not build. After you finish, the driver runs build and lint and sends failures back to you. Run only cheap static checks (node -e, grep).
Append to .tasks/$ID/evidence.md under a heading '## Implementer — attempt %s': each command, exit code, last 20 lines of output, and the output of 'git diff | git hash-object --stdin'.
If you cannot finish after a real effort, write a line starting with 'BLOCKED:' and the reason in evidence.md and stop.
%s"


# driver_checks <label>: build + lint by the driver itself, appended to evidence.md
driver_checks() {
  local label="$1" brc lrc lerr lfiles
  npm run build > "$LOGS/driver-build-$label.log" 2>&1; brc=$?
  npm run lint > "$LOGS/driver-lint-$label.log" 2>&1; lrc=$?
  lerr="$(grep -cE '^[[:space:]]+[0-9]+:[0-9]+[[:space:]]+error' "$LOGS/driver-lint-$label.log")"
  lfiles="$(grep -E '\.(jsx?|mjs)$' "$LOGS/driver-lint-$label.log" | sed -E 's#^.*[/\](src|api|scripts)[/\]#\1/#' | sort -u | tr '\n' ' ')"
  {
    printf '\n## Driver checks (%s) %s\n' "$label" "$(date '+%F %T')"
    printf -- '- `npm run build` exit=%s\n```\n%s\n```\n' "$brc" "$(tail -15 "$LOGS/driver-build-$label.log")"
    printf -- '- `npm run lint` exit=%s errors=%s files with problems: %s\n```\n%s\n```\n' "$lrc" "$lerr" "$lfiles" "$(tail -12 "$LOGS/driver-lint-$label.log")"
    printf -- '- diff hash: %s\n- dist bytes: %s\n' "$(git diff | git hash-object --stdin)" "$(du -sb dist 2>/dev/null | cut -f1)"
  } >> "$DIR/evidence.md"
  log "driver checks ($label): build=$brc lint=$lrc errors=$lerr"
  return $brc
}

PREVIEW_PID=""
preview_up() {
  npx vite preview --port 4173 --strictPort > "$LOGS/preview.log" 2>&1 &
  PREVIEW_PID=$!
  for _ in $(seq 1 20); do curl -s -o /dev/null localhost:4173 && break; sleep 1; done
  log "preview up (pid $PREVIEW_PID)"
}
preview_down() {
  [ -n "$PREVIEW_PID" ] && kill "$PREVIEW_PID" 2>/dev/null
  # vite preview may leave a node child on Windows; free the port
  powershell.exe -NoProfile -Command "Get-NetTCPConnection -LocalPort 4173 -State Listen -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id \$_.OwningProcess -Force }" >/dev/null 2>&1
  PREVIEW_PID=""
}
trap preview_down EXIT

# Optional per-task hooks written by the lead: pre.sh (before implement), post-implement.sh (after each attempt)
run_hook() { [ -f "$DIR/$1" ] && { log "hook $1"; bash "$DIR/$1" >> "$LOGS/hook-$1.log" 2>&1; log "hook $1 exit=$?"; }; return 0; }

ATTEMPT=1; EFFORT="$IMPL_EFFORT"; EXTRA=""; IMPL_BLOCKED=0
START_AT="${START_AT:-implement}"
log "start_at=$START_AT"
[ "$START_AT" = implement ] && run_hook pre.sh
[ "$START_AT" = implement ] && while :; do
  # shellcheck disable=SC2059
  run_codex "implement-$ATTEMPT" "$MODEL_LUNA" "$EFFORT" workspace-write "$(printf "$IMPL_PROMPT" "$EFFORT" "$ATTEMPT" "$ATTEMPT" "$EXTRA")"
  if grep -q '^BLOCKED:' "$DIR/evidence.md"; then log "implementer reported BLOCKED — skipping tests"; IMPL_BLOCKED=1; break; fi
  run_hook post-implement.sh
  if driver_checks "implement-$ATTEMPT"; then log "build check passed"; break; fi
  if [ "$ATTEMPT" -ge 2 ]; then log "build still failing after 2 attempts"; break; fi
  EXTRA="Previous attempt left the build broken. Last 40 lines of 'npm run build':
$(tail -40 "$LOGS/driver-build-implement-$ATTEMPT.log")
$( [ -f "$LOGS/hook-post-implement.sh.log" ] && printf 'Last 30 lines of the post-implement hook log:
%s' "$(tail -30 "$LOGS/hook-post-implement.sh.log")" )"
  ATTEMPT=2; EFFORT="$(escalate "$EFFORT")"
done

# ---------------------------------------------------------------- 3. Test Tier A (+ one fix loop), then Tier B
TEST_A_PROMPT="$COMMON

ROLE: Tester, Tier A (section 5 of $WORKFLOW). No browser, no screenshots.
Run every acceptance check in brief.md that can be verified with lint, build, unit tests, node scripts or curl. Checks prefixed [visual] are NOT yours; list them as 'deferred to Tier B'.
Build and lint results are already in evidence.md under the latest '## Driver checks'; they were produced on the current tree immediately before you started. Cite them, do not rerun, and do not fail a check because your own diff hash differs from the driver's (shells differ in line endings). The production build is being served at http://localhost:4173 for you to curl.
Append to .tasks/$ID/evidence.md under '## Tester — Tier A (run %s)': a table of check / PASS or FAIL / command, the raw output, and 'git diff | git hash-object --stdin'.
Do not fix code. Your final message must end with a line 'TIER_A_RESULT: PASS' or 'TIER_A_RESULT: FAIL'."

TIER_A=SKIPPED
if [ "$START_AT" != gate ] && [ "$IMPL_BLOCKED" = 0 ]; then
TEST_RUN=1
[ "$START_AT" = test ] && driver_checks "pre-test"
preview_up
# shellcheck disable=SC2059
run_codex "test-a-$TEST_RUN" "$MODEL_TERRA" medium workspace-write "$(printf "$TEST_A_PROMPT" "$TEST_RUN")"
TIER_A="$(grep -oE 'TIER_A_RESULT: (PASS|FAIL)' "$LOGS/test-a-$TEST_RUN.last.md" | tail -1 | awk '{print $2}')"
log "tier A result: ${TIER_A:-unknown}"

if [ "$TIER_A" != "PASS" ] && [ "$ATTEMPT" -lt 2 ] && ! grep -q '^BLOCKED:' "$DIR/evidence.md"; then
  ATTEMPT=2; EFFORT="$(escalate "$IMPL_EFFORT")"
  EXTRA="Tier A testing failed. Read the '## Tester — Tier A (run 1)' section of evidence.md and fix every FAIL."
  # shellcheck disable=SC2059
  preview_down
  run_codex "implement-$ATTEMPT" "$MODEL_LUNA" "$EFFORT" workspace-write "$(printf "$IMPL_PROMPT" "$EFFORT" "$ATTEMPT" "$ATTEMPT" "$EXTRA")"
  run_hook post-implement.sh
  driver_checks "implement-$ATTEMPT" || log "build failing after fix attempt"
  preview_up
  TEST_RUN=2
  # shellcheck disable=SC2059
  run_codex "test-a-$TEST_RUN" "$MODEL_TERRA" medium workspace-write "$(printf "$TEST_A_PROMPT" "$TEST_RUN")"
  TIER_A="$(grep -oE 'TIER_A_RESULT: (PASS|FAIL)' "$LOGS/test-a-$TEST_RUN.last.md" | tail -1 | awk '{print $2}')"
  log "tier A result after fix: ${TIER_A:-unknown}"
fi
fi

if [ "$TIER_B" = 1 ] && [ "$TIER_A" = "PASS" ]; then
  run_codex test-b "$MODEL_TERRA" high workspace-write "$COMMON

ROLE: Tester, Tier B (section 5 of $WORKFLOW). Computer use / browser allowed.
The production build is already served at http://localhost:4173 by the driver; open it in the browser.
Verify only the acceptance checks in brief.md prefixed [visual]. Max 6 screenshots total, at 375px and 1280px widths, saved as PNG under .tasks/$ID/shots/ with descriptive names.
Append to .tasks/$ID/evidence.md under '## Tester — Tier B': a table of check / PASS or FAIL / screenshot path, plus anything visibly broken even if not listed.
Do not fix code. End with 'TIER_B_RESULT: PASS' or 'TIER_B_RESULT: FAIL'."
fi

preview_down

# ---------------------------------------------------------------- 4. Gate
run_codex gate "$GATE_MODEL" "$GATE_EFFORT" workspace-write "$COMMON

ROLE: Gate for risk level $LEVEL (section 5 of $WORKFLOW). You are the only reviewer; nobody checks after you.
Read brief.md, plan.md, evidence.md and 'git diff' (plus 'git status --short' for new files).
Write .tasks/$ID/review.md using .tasks/_template/review.md:
- Findings as file:line, severity blocker / should-fix / nit, one-line fix.
- Verify every fact or number in new user-facing copy against the sources brief.md names; unsourced claims are blockers.
- Level L only: secrets in client code, RLS on new tables, validation on api/ handlers, PDPA wording.
- Fix anything of 10 lines or fewer yourself and list it under 'Fixed in place'. Larger blockers: fix them yourself too if under 40 lines total, otherwise list under 'Sent back' (the lead will handle it; there is no further implementer loop).
- Do not build. If you edit any file, list it under 'Fixed in place'; the driver rebuilds afterwards and appends '## Driver checks (post-gate)'. If that build fails, the lead reverts your edit.
- Mark each acceptance check ACCEPTED only if evidence.md shows the command or screenshot and it passed. Otherwise NOT VERIFIED with the reason.
Then write .tasks/$ID/summary.md in the exact format of .tasks/_template/summary.md, with 'git diff --stat' and 'git status --short' output verbatim under Files changed.
Status rules: ACCEPTED when all checks have evidence and no blockers remain; ACCEPTED_WITH_NOTES when checks pass but you fixed things, made decisions, or the owner must act; BLOCKED when blockers remain or evidence.md contains 'BLOCKED:'.
Your final message must be the first 5 lines of summary.md."

driver_checks post-gate || log "post-gate build FAILED — lead must check gate edits"
log "done. status: $(grep -m1 -E '^Status:' "$DIR/summary.md" 2>/dev/null || echo 'no summary.md')"
git -C "$ROOT" status --short > "$DIR/git-status-after.txt"
