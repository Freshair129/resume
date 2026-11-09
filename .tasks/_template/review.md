# Review — <task-id>

Gate: Luna max | Sol high | Sol xhigh
Diff hash reviewed: <hash> (matches evidence.md: yes | no -> tests re-run)

## Findings
| # | file:line | Severity | Finding | Fix |
|---|---|---|---|---|
| 1 | api/lead.js:42 | blocker | email regex accepts empty string | require non-empty before test |
| 2 | src/ContactForm.jsx:88 | nit | unused import | remove |

Severity: blocker (must fix before accept) / should-fix (fix now if 10 lines or fewer, else note) / nit.

## Fixed in place by the gate
- #2 removed unused import (1 line)

## Sent back to implementer (one round trip max)
- #1 with the fix above

## Level L checklist (fill only for level L)
- [ ] No secret reaches client code (grep for SUPABASE_, GEMINI_ under src/)
- [ ] RLS enabled on every new table, no anon policies
- [ ] Every api/ handler validates body shape, lengths and types
- [ ] PDPA wording present where personal data is collected (TH and EN)
- [ ] Rate limit or honeypot on every public write endpoint
