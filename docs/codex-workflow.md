# Codex Worker Workflow

Source of truth for how autonomous coding agents (Codex workers) operate in this
repository. Claude acts as lead: it writes the brief, reads the final summary, and
decides acceptance. Everything in between runs on Codex models, routed by **risk
level**, not by role, so the expensive models and tools are only used where they
pay off.

Related: [`AGENTS.md`](../AGENTS.md) (shared rules every agent must follow),
[`.tasks/_template/`](../.tasks/_template/) (handoff file templates).

---

## 1. Roles and model routing

| Role | Model | Effort | When it runs |
|---|---|---|---|
| Router / planner | GPT 6.1 Sol | low | Once per task, right after the brief lands |
| Implementer | GPT 6 Luna | S: medium · M/L: high | Per subtask; +1 step on the second attempt |
| Tester, Tier A | GPT 6.1 Terra | medium | Every task; CLI checks only, no browser |
| Tester, Tier B | GPT 6.1 Terra | high | Only when `plan.md` says the task touches UI; computer use allowed |
| Gate, level S | GPT 6 Luna | max | Checklist verification against `evidence.md` |
| Gate, level M | GPT 6.1 Sol | high | Code review; fixes small items itself |
| Gate, level L | GPT 6.1 Sol | xhigh | Review + security + schema/data review |

Rules that keep this cheap:

- **Effort follows risk.** Nobody starts at a high effort because of their role.
- **Escalate once, never de-escalate.** A retry may raise effort by one step. It never
  goes back down within the same task.
- **One gate per task.** Level S is checked by Luna only; levels M and L by Sol only.
  There is no second review layer.
- **Fail fast, cheapest first.** lint, then build, then unit, then curl, then browser.
  Stop at the first failure and send it back; do not run expensive checks on a broken build.
- **Reuse evidence.** If `git diff | git hash-object --stdin` matches the hash recorded in
  `evidence.md`, do not re-run tests. The gate reads evidence; it does not regenerate it.
- **Computer use budget.** Tier B only, max 6 screenshots per task, at 375px and 1280px.
- **Loop caps.** implement 2 attempts max, test 2 runs max, review-to-implementer 1 round
  trip max. When a cap is hit, write `BLOCKED` in `summary.md` and stop.
- **Batch level-S tasks.** Several S tasks that touch disjoint files run as one
  implementer pass and one gate pass.

---

## 2. Risk levels

The router assigns exactly one level in `plan.md`.

| Level | Condition (any match raises the level) | Examples in this repo |
|---|---|---|
| **S** | 2 files or fewer; nothing under `api/`, `supabase/`, `.env*`, `vite.config.js` | copy in `src/data/translations.js`, Tailwind class tweaks, icon swap |
| **M** | 3 to 6 files, or UI + logic together, or touches `src/chatbot/` | `src/ContactForm.jsx` + footer wiring, chatbot widget behaviour |
| **L** | touches `api/`, `supabase/`, `.env*`, `vite.config.js`, auth, rate limiting, or anything that stores personal data | migrations, `api/lead.js`, chat logging, PDPA notices |

A level-S task that edits a file also edited by an M/L task in the same batch joins
that task's gate instead of getting its own.

---

## 3. Pipeline

```
Claude (lead)
  |  writes brief.md
  v
Router  (Sol, low)             -> plan.md: level, subtasks, test tier, gate
  v
Implementer (Luna)             -> code + lint + build, appends to evidence.md
  |  attempt 1 at level effort, attempt 2 one step higher, then BLOCKED
  v
Tester Tier A (Terra, medium)  -> CLI checks, PASS/FAIL per acceptance item
  |  stop if any FAIL or if plan.md says "A only"
  v
Tester Tier B (Terra, high)    -> [visual] checks only, max 6 screenshots
  v
Gate (per level)               -> review.md, fixes of 10 lines or fewer done in place,
  |                               one round trip to implementer max
  v
summary.md                     -> Claude reads this file only
```

Claude opens the diff only when `summary.md` is `ACCEPTED_WITH_NOTES` on a level-L
task, or when any acceptance check is `NOT VERIFIED`.

---

## 4. Handoff files

Every task lives in `.tasks/<task-id>/`. Copy `.tasks/_template/` to start.
`<task-id>` is `YYYYMMDD-short-slug`, for example `20261109-lead-form`.

| File | Written by | Purpose |
|---|---|---|
| `brief.md` | Claude | Scope, acceptance checks, files allowed, what done looks like |
| `plan.md` | Router | Risk level, subtasks with file lists, test tier, gate choice. 40 lines max |
| `evidence.md` | Implementer + Tester | Every command run, exit code, trimmed output, diff hash, screenshot paths |
| `review.md` | Gate | Findings as `file:line`, severity, fix; what was fixed in place; what went back |
| `summary.md` | Gate | The only file Claude reads. Fixed format, see template |

Acceptance checks in `brief.md` are the contract. A check with no line reference into
`evidence.md` is **not passed**, whatever the prose says. Phrases like "should work" or
"expected to pass" are not evidence.

A `[visual]` prefix on an acceptance check marks it as Tier B (browser) work.

---

## 5. Role prompts

Paste the matching block as the role instruction. `<id>` is the task folder name.

### Router / planner (Sol, effort low)

```
Read .tasks/<id>/brief.md and inspect the repo. Write plan.md only.
- Assign risk level S, M or L using the table in docs/codex-workflow.md section 2.
- List subtasks (max 5). Each names the files it may touch.
- Test tier: "A only", or "A+B" if any file under src/ renders UI.
- Gate: S -> Luna max checklist; M -> Sol high; L -> Sol xhigh.
Do not write code. Keep plan.md under 40 lines.
```

### Implementer (Luna, effort per plan.md)

```
Implement exactly the subtask assigned to you in plan.md. Touch only its listed files.
Before finishing run `npm run lint` and `npm run build` and fix your own errors.
Append to evidence.md: each command, its exit code, the last 20 lines of output,
and the output of `git diff | git hash-object --stdin`.
Never commit. Never edit .env*, supabase/, api/ or vite.config.js unless plan.md
lists them for your subtask.
If still failing after 2 attempts, write BLOCKED and the reason in evidence.md and stop.
```

### Tester (Terra)

```
Tier A (effort medium, no browser): run every acceptance check in brief.md that can be
verified with lint, build, unit tests or curl. Record each as PASS or FAIL with the
command and output in evidence.md. Record `git diff | git hash-object --stdin`.
Stop here if plan.md says "A only" or if any Tier A check FAILs.

Tier B (effort high, computer use): run only the checks marked [visual] in brief.md.
Max 6 screenshots, at 375px and 1280px widths, saved under .tasks/<id>/shots/.
Reference each screenshot path from evidence.md.
Do not fix code. Report only.
```

### Gate (Sol high or xhigh; Luna max for level S)

```
Read brief.md, plan.md, evidence.md and `git diff`. Write review.md:
- Findings as file:line, severity (blocker / should-fix / nit), one-line fix.
- Level L only: also check for secrets in client code, RLS on new tables, input
  validation on every api/ handler, and PDPA wording.
- Fix anything of 10 lines or fewer yourself and record it. Send larger items back to
  the implementer once at most.
- Mark each acceptance check ACCEPTED only if evidence.md shows the command ran and passed.
Do not re-run tests Terra already ran unless `git diff | git hash-object --stdin` differs from the
hash in evidence.md.
Then write summary.md in the exact format of .tasks/_template/summary.md.
```

---

## 6. Status vocabulary

| Status | Meaning | Lead action |
|---|---|---|
| `ACCEPTED` | All checks have evidence, no blockers | Read summary only |
| `ACCEPTED_WITH_NOTES` | All checks pass, but decisions were made without asking or owner action is needed | Read summary; open diff if level L |
| `BLOCKED` | A loop cap was hit or a prerequisite is missing | Read summary and evidence; rewrite brief or unblock |

---

## 7. What workers must know about this repo

- Vite + React 19 SPA deployed on Vercel. Vercel Functions live in `api/` and use the
  Web-standard `export async function POST(request)` signature. `api/_lib/` is shared
  code, not deployed as functions.
- `vite dev` serves `/api/*` through middleware in `vite.config.js`; server-side env
  vars are whitelisted there by prefix (`GEMINI_`, `SUPABASE_`).
- Secrets are server-side only. Never add a `VITE_` prefixed secret. `.env` is
  git-ignored; `.env.example` documents every variable.
- Database is Supabase. Migrations are plain SQL under `supabase/migrations/`, RLS on
  with no anon policies. The service-role key is used only inside `api/`.
- TH/EN UI strings live in `src/data/translations.js`. Positioning copy lives in
  `src/data/profile.js` and is not changed by workers unless the brief says so.
- `npm run lint` has known pre-existing errors in `src/SpotlightReveal.jsx`. Those are
  out of scope; new errors are not.
- Commits are made by the lead or the owner. Workers never commit, push, or switch branches.
