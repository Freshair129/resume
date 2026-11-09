# Evidence — <task-id>

Append only. Newest entries at the bottom. Never delete earlier entries.

## Implementer — attempt 1 (Luna, effort <x>)
Diff hash: `git diff | sha1sum` -> <hash>

```
$ npm run lint
exit 0
<last 20 lines>
```

```
$ npm run build
exit 0
<last 20 lines>
```

## Tester — Tier A (Terra, effort medium)
Diff hash: <hash>

| # | Acceptance check | Result | Command |
|---|---|---|---|
| 1 | npm run build exits 0 | PASS | see below |
| 2 | POST /api/lead returns 201 | FAIL | see below |

```
$ curl -s -o /dev/null -w "%{http_code}" -X POST localhost:5173/api/lead ...
201
```

## Tester — Tier B (Terra, effort high, computer use)
Diff hash: <hash>
Screenshots: shots/01-mobile-375-form.png, shots/02-desktop-1280-form.png (max 6)

| # | [visual] check | Result | Screenshot |
|---|---|---|---|
| 5 | Lead form stacks at 375px, no horizontal scroll | PASS | shots/01-mobile-375-form.png |
