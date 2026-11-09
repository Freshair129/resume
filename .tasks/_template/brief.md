# <task-id> — <title>

Written by: lead (Claude)
Date: YYYY-MM-DD

## Goal
One paragraph. What the owner gets when this is done.

## Scope
- In: ...
- Out: ...

## Files allowed
List every file or folder the implementer may create or edit. Anything else is off limits.
- src/...
- api/...

## Acceptance checks
Each line must be verifiable by a command or a browser observation.
Prefix browser-only checks with `[visual]`.
- [ ] `npm run build` exits 0
- [ ] `npm run lint` adds no new errors (known errors in src/SpotlightReveal.jsx are ignored)
- [ ] ...
- [ ] [visual] ...

## Constraints
- No new UI libraries. No TypeScript.
- No `VITE_` prefixed secrets. Do not edit `.env`.
- Do not change copy in `src/data/profile.js`.

## Owner prerequisites
Env vars, accounts or data the owner must provide before the task can be verified.
- ...
