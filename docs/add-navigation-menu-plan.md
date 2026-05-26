# Add Navigation Menu Plan

## Goal
Implement a new Add Navigation Menu action in the right-click Add menu that inserts a reusable navigation block into the selected area and persists correctly through existing save/import flows.

## Product Requirements

### Default Behavior
- A new navigation menu should be generated from active pages in the current project.
- Active pages are section.page elements inside #mess-main.
- Each nav instance should default to Auto Navigation On.
- When pages are added or removed, every nav instance with Auto Navigation On should update automatically.

### Responsive Navigation Behavior
- At and below the tablet breakpoint (960px), switch from inline nav links to a mobile trigger button.
- The trigger button label is textual: MENU.
- On mobile mode, the navigation opens as a modal layered above the active page.
- Modal menu options are centered horizontally and vertically.
- Advanced hamburger button types/styles are deferred for a later iteration.

### Edit Behavior (When Editing a nav Element)
- Show additional controls only when the currently edited element is a nav (or a descendant inside that nav):
  1. Toggle Auto Navigation
  2. Toggle SPS (Single Page Scrolling)

- Toggle Auto Navigation:
  - On label: Auto Navigation On
  - Off label: Auto Navigation Off
  - On hint: automatically syncs to available pages
  - Off hint: user editable
  - Behavior:
    - On: links are regenerated from active pages and updated when pages change.
    - Off: links are user-managed and not auto-updated when pages change.

- Toggle SPS:
  - On label: Single Page Scrolling On
  - Off label: Single Page Scrolling Off
  - On hint: navigable pages are accessed with the menu and scrolling
  - Off hint: navigable pages are accessed only with the menu
  - Behavior:
    - On: selecting a nav item scrolls to the top of that page section and must account for header overlap.
    - Off: inactive page sections are hidden; navigation occurs by menu selection or URL/hash change only.

### Baseline URL/Hash Navigation
- Hash/manual URL navigation must switch active page sections in both SPS On and SPS Off modes.
- URL/hash changes are a baseline navigation path regardless of menu mode.

## Scope
- Rename visible menu option from Add Menu to Add Navigation Menu.
- Wire a dedicated event from menu action to builder logic.
- Insert a default navigation DOM structure.
- Persist inserted markup through existing store and IndexedDB flow.
- Add baseline styles so inserted nav is usable by default.
- Keep current behavior for all existing Add actions.

## Component Architecture Recommendation
- Yes, it makes sense to create separate components for this feature.
- Recommended new components:
  - src/components/NavigationMenu.vue
  - src/components/EditNavigation.vue

### Why This Split Helps
- Keeps navigation rendering and interaction logic out of MessMaker.vue.
- Keeps nav-specific edit controls out of EditElement.vue.
- Makes SPS and URL/hash synchronization logic easier to test in isolation.
- Allows future nav variants without destabilizing core page-builder logic.

### Responsibility Boundaries
- NavigationMenu.vue:
  - Render desktop and mobile nav UI.
  - Handle menu selection events.
  - Handle SPS On and SPS Off runtime behavior.
  - Handle hash/manual URL navigation synchronization.
  - Expose nav settings via props and emit updates.

- EditNavigation.vue:
  - Show nav-only controls when selected target is nav-related.
  - Manage toggles for Auto Navigation and SPS.
  - Emit settings updates back to parent editor.

- MessMaker.vue:
  - Insert nav placeholder/wrapper into page content.
  - Maintain project-level page list and auto-update hooks.
  - Persist state through existing update-mess flow.

- EditElement.vue:
  - Detect nav selection and delegate nav controls to EditNavigation.vue.
  - Keep generic style editing behavior unchanged for non-nav elements.

## Implementation Steps

### Phase 0. Scaffolding
Files: src/components/NavigationMenu.vue, src/components/EditNavigation.vue
- Create new components with minimal templates and prop contracts.
- Add unit tests for rendering and emitted events before feature logic.

### 1. Menu Action Wiring
File: src/components/Menu.vue
- Keep module list label as Add Navigation Menu.
- Add switch case for Add Navigation Menu in menuClick.
- Emit a new event on the existing event bus, for example add-navigation-menu.
- Close the menu after emitting.

### 2. Builder Event Listener
File: src/components/MessMaker.vue
- Add created-hook listener for add-navigation-menu.
- Route event to a new method, for example addNavigationMenu.
- Reuse existing updateMess flow after insertion.

### 3. Navigation Insertion Logic
File: src/components/MessMaker.vue
- Add a new method that builds a default structure using document.createElement:
  - nav element with utility class names and data attributes for nav settings.
  - ul list container.
  - li and a items generated from current section.page entries in #mess-main.
- Determine insertion target using current html_location.
- If target is invalid (for example img), insert into a safe parent.
- Clear pulse state before insertion, consistent with other add actions.

### 4. Auto-Update Engine for Nav Instances
File: src/components/MessMaker.vue
- Add utility methods:
  - getActivePages()
  - buildNavItemsFromPages()
  - refreshNavigationMenus()
- Trigger refreshNavigationMenus() when page sections are added or removed.
- Only update nav instances with Auto Navigation On.
- Preserve user-edited links when Auto Navigation Off.

### 5. Baseline Styling
File: src/components/MessMaker.vue
- Add minimal classes for nav layout:
  - Horizontal list.
  - Spacing and alignment.
  - Hover and focus states.
- Keep styles lightweight and compatible with existing unstyled overlay behavior.

### 5a. Responsive Mobile Menu Styling and Behavior
File: src/components/MessMaker.vue
- At max-width 960px:
  - Hide inline nav list by default.
  - Show a textual MENU button.
- Add modal overlay styles:
  - Fixed positioning over active page content.
  - High z-index.
  - Center menu items both vertically and horizontally.
  - Backdrop treatment for contrast.
- Add open/close state classes or data attributes per nav instance.
- Ensure close behavior works on selection and explicit dismiss action.

### 6. Edit Panel Enhancements for nav
Files: src/components/EditElement.vue, src/components/EditNavigation.vue
- Detect when edited target is nav-related.
- Render EditNavigation.vue for nav-only controls:
  - Toggle Auto Navigation button with labels and hints from requirements.
  - Toggle SPS button with labels and hints from requirements.
- Save nav settings to attributes/data fields on the nav instance.

### 7. SPS Navigation Mode Implementation
Files: src/components/NavigationMenu.vue, src/components/EditNavigation.vue
- On SPS On:
  - Keep sections visible.
  - Use smooth scrolling to target section top.
  - Apply header offset handling so section top is not obscured.
  - When mobile nav is present or a touch device is detected, override scroll animation duration to 0.
  - The zero-duration override avoids long presses or unintended touches interrupting animation.
- On SPS Off:
  - Show only active target section.
  - Hide other sections.
  - Support hash/manual URL navigation to switch active section.

### 7a. URL/Hash Router Synchronization Baseline
Files: src/components/NavigationMenu.vue, src/main.js
- Add a shared handler for hashchange and initial URL parsing.
- Resolve hash target to matching section.page id.
- In SPS On:
  - Activate target and perform scroll (or duration 0 when touch/mobile override applies).
- In SPS Off:
  - Activate target and hide non-target sections.
- Keep browser history and title updates aligned with current active page in both modes.

### 8. Persistence and Compatibility Checks
Files: src/components/MessMaker.vue, src/main.js
- Confirm inserted nav updates state via existing updateMess and set-mess-db path.
- Confirm no DataCloneError with persisted payload.
- Confirm import/export roundtrip retains nav markup.

### 9. QA Checklist
- Create new project, add navigation menu into main content.
- Add navigation menu into header and footer.
- Try insertion when current selection is an image.
- Confirm default nav links match current section.page elements.
- Add/remove pages and verify all Auto Navigation On nav instances sync.
- Toggle Auto Navigation Off and verify nav remains user-editable and not auto-updated.
- Toggle SPS On and verify scrolling navigation respects header offset.
- Toggle SPS Off and verify only active page is visible and URL/hash switching works.
- Verify URL/hash navigation switches sections in both SPS On and SPS Off modes.
- Verify on touch devices (or mobile nav present) SPS scroll uses duration 0.
- Verify at <=960px that inline nav becomes MENU trigger.
- Verify mobile MENU opens centered modal overlay over active page.
- Verify modal closes correctly after selection.
- Save and reload app to verify persistence.
- Export and import a .mess file and verify nav survives.
- Run npm run build and npm run start.

### 10. Test Plan Expansion
Files: tests/NavigationMenu.spec.js, tests/EditNavigation.spec.js
- Verify default links are generated from section.page data.
- Verify Auto Navigation On syncs all nav instances on page add/remove.
- Verify Auto Navigation Off preserves user-edited links.
- Verify SPS On scroll behavior with measured header offset.
- Verify SPS On uses duration 0 in touch/mobile-nav contexts.
- Verify SPS Off shows only active section.
- Verify URL/hash navigation works in both modes.
- Verify mobile modal opens centered and closes on selection.

## Open Decisions
- None currently. Decisions below are finalized for implementation.

## Finalized Decisions

### Page Labels and IDs
- Creating a page will require a page name.
- That page name will be used to derive the page element ID.
- Navigation labels will be derived from the page name.

### SPS Header Offset Source
- On every navigation event, measure current header height at runtime.
- Use the measured header height as the scroll offset so section tops are not obscured.

### History and Document Updates
- In both SPA mode and SPS mode, every navigation event updates browser history.
- In both modes, page title updates on navigation.
- In both modes, meta updates are part of the navigation event path (meta implementation is pending).

## Out of Scope for This Pass
- Advanced hamburger button variants and visual styles.
- Drag-and-drop menu item reordering.
- Dedicated form UI for custom link count/labels.
- ARIA enhancements beyond semantic nav/ul/li/a defaults.
