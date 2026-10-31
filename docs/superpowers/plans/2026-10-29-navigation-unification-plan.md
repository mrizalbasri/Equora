# Implementation plan: unified navigation

## Scope

Unify the user-facing navigation used by the landing pages and workspace
dashboard. Keep the approved order:

`Daerah Saya → Explorer → Studio → Perbandingan → Dataset → Metodologi → Tentang`

Do not change API contracts, route behavior, authentication, simulation
algorithms, or database models.

## Implementation steps

### 1. Extract the shared navigation model

- Extend the existing navigation types in `frontend/src/lib/api/workspace.ts`
  with the fields needed by both shells.
- Store the seven primary entries in one ordered array.
- Add a route-parent matching helper for `/regions/...` and `/scenarios/...`.
- Keep admin and health routes outside the public navigation model.

### 2. Update the public shell

- Replace grouped dropdown entries in
  `frontend/src/lib/components/PublicShell.svelte` with the shared ordered
  entries.
- Keep the responsive mobile menu, active state, Escape handling, and focus
  behavior.
- Remove any duplicate “Daerah Saya” or nested menu destination.

### 3. Update the workspace shell

- Import the shared navigation model in
  `frontend/src/lib/components/WorkspaceShell.svelte`.
- Render the same ordered entries in the sidebar.
- Remove the separate `primary`/`reference` arrays, duplicate Studio shortcut,
  and duplicated navigation destinations.
- Keep the breadcrumb, workspace status, mobile drawer, and public-home link as
  context controls rather than navigation destinations.

### 4. Preserve route context

- Ensure `/regions/...` remains active under Explorer.
- Ensure `/scenarios/...` remains active under Studio.
- Ensure `/admin` remains reachable without appearing in the public seven-item
  navigation.
- Confirm landing links and dashboard links resolve to the same paths.

### 5. Add focused regression coverage

- Update or add navigation tests in `frontend/tests/navigation.spec.ts` and
  related public/workspace tests.
- Assert the seven labels and order in both shells.
- Assert no duplicate href appears in either navigation.
- Assert detail routes inherit the correct parent active state.
- Preserve mobile menu, keyboard, Escape, and focus-return coverage.

## Validation

Run from `frontend`:

```powershell
pnpm check
pnpm test
pnpm exec playwright test tests/navigation.spec.ts tests/public-access.spec.ts tests/workspace.spec.ts
pnpm build
```

Also run from repository root:

```powershell
git diff --check
python scripts/check_docs.py
```

## Commit breakdown

Use focused commits:

1. `refactor(navigation): centralize user-facing destinations`
2. `refactor(navigation): align public and workspace menus`
3. `test(navigation): cover unified menu and route context`

Do not include `.codegraph/`, `.superpowers/`, environment files, or unrelated
working-tree changes.
