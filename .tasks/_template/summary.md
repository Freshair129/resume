# <task-id> — <title>

Status: ACCEPTED | ACCEPTED_WITH_NOTES | BLOCKED
Risk level: S | M | L
Gate used: <model / effort>
Loops: implement=<n> test=<n> review=<n>

## Acceptance checks (from brief.md)
Every passed check must point to a line in evidence.md. No reference means not passed.
- [x] `npm run build` exits 0 -> evidence.md#L12
- [x] POST /api/lead returns 201 -> evidence.md#L30
- [ ] 429 after 6th request within 10 min -> NOT VERIFIED (reason)

## Files changed
Paste `git diff --stat` verbatim.

```
<git diff --stat>
```

## Decisions made without asking
- ...

## Open risks / owner action needed
- Env var X must be set in Vercel before deploy.
- ...

## Blocked on (only when Status is BLOCKED)
- What was tried, which loop cap was hit, what would unblock it.
