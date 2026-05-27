# Add Page Plan

## Goal
Add a first-class Add Page action from the top-level menu that prompts for a page name and inserts a new page using the same skeleton used for the initial home page.

## Confirmed Product Requirements
- Top ADD menu item should be Add Page.
- Selecting Add Page should prompt for page name.
- New page should use the same structural skeleton as the initial home page in a new mess.

## Current Code Reality (Source of Truth)
- Home page skeleton is defined in [src/main.js](../src/main.js) as `MainTemplate`.
- Top-level menu entries are defined in [src/components/Menu.vue](../src/components/Menu.vue) via `homeList`.
- New menu actions route through [src/components/Menu.vue](../src/components/Menu.vue) `menuClick` and event bus emits.
- Builder insertion logic belongs in [src/components/MessMaker.vue](../src/components/MessMaker.vue).

## Implementation Plan

### Phase 1: Menu Entry and Event Wiring
File targets:
- [src/components/Menu.vue](../src/components/Menu.vue)

Tasks:
- Add Add Page to the Add submenu as the first item in `moduleListPrimary`.
- Add a `menuClick` case for Add Page.
- Emit a new event bus signal, proposed name: `add-page`.
- Keep existing menu close behavior after emitting.

Acceptance:
- Right-click Add submenu shows Add Page as the first Add option.
- Clicking Add Page triggers event bus emission and closes menu.

### Phase 2: Page Template Extraction and Reuse
File targets:
- [src/main.js](../src/main.js)
- [src/components/MessMaker.vue](../src/components/MessMaker.vue)

Tasks:
- Introduce a reusable exported helper in [src/main.js](../src/main.js) to generate page skeleton markup (same row/column/content structure currently in `MainTemplate`).
- Keep existing `MainTemplate` behavior by composing it from the helper (for backward compatibility).
- Import helper in [src/components/MessMaker.vue](../src/components/MessMaker.vue) to guarantee exact skeleton parity.

Proposed helper contract:
- `buildPageTemplate(pageId, pageName)` returning `<section class="page unstyled" id="..." data-page-name="...">...</section>` with existing row/column/content skeleton.

Acceptance:
- Initial home section remains unchanged.
- Added pages use identical skeleton structure/classes.

### Phase 3: Add Page Runtime Flow
File targets:
- [src/components/MessMaker.vue](../src/components/MessMaker.vue)

Tasks:
- Subscribe to `add-page` in created hook.
- Add `addPage()` method that:
  - prompts for page name,
  - validates non-empty input,
  - derives safe unique page id (slug + dedupe),
  - inserts generated page section into `#mess-main`,
  - refreshes navigation menus,
  - updates store/db via existing `updateMess('main')` path.
- Keep current selection/pulse behavior consistent with existing add actions.

ID strategy:
- normalize to lowercase kebab-case.
- fallback to `page-n` if normalization becomes empty.
- dedupe with `-2`, `-3`, etc when id already exists.

Acceptance:
- Prompt appears when Add Page clicked.
- New page inserts into main area with expected skeleton.
- No id collisions.
- New page persists after reload.

### Phase 4: Navigation and Side Effects Integration
File targets:
- [src/components/MessMaker.vue](../src/components/MessMaker.vue)

Tasks:
- Ensure auto-navigation menus include newly added page labels immediately.
- Ensure hash/title/meta behavior works when navigating to newly added page.

Acceptance:
- Auto nav menus update instantly.
- SPS on/off continues working for new pages.
- title/meta updates resolve from new page name.

### Phase 5: Tests
File targets:
- [tests/Menu.spec.js](../tests/Menu.spec.js)
- [tests/MessMaker.spec.js](../tests/MessMaker.spec.js)

Tests to add:
- Menu: Add Page appears in home menu and emits `add-page`.
- MessMaker: `add-page` prompt accepted inserts page section with expected skeleton classes.
- MessMaker: generated id dedupes on conflict.
- MessMaker: cancel/empty prompt does not insert page.
- MessMaker: adding page refreshes nav links in auto mode.

Acceptance:
- New and existing tests pass.

## Risks and Mitigations
- Circular import risk from [src/main.js](../src/main.js):
  - Mitigation: extract template helper to a small shared module if needed (fallback plan: [src/utils/pageTemplates.js](../src/utils/pageTemplates.js)).
- Prompt UX blocking tests:
  - Mitigation: mock `window.prompt` in unit tests.

## Delivery Sequence
1. Phase 1
2. Phase 3 (with temporary local skeleton)
3. Phase 2 (extract/reuse helper)
4. Phase 4
5. Phase 5 + full suite + build
