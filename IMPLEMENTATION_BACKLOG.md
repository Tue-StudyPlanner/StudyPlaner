# Implementation Backlog

Tracked changes for the StudyPlaner frontend.
Each group = one branch + one commit. Branch name: `fix/<group-slug>`.

---

## Status legend

| Symbol | Meaning |
|--------|---------|
| `[ ]` | Open |
| `[~]` | In progress |
| `[x]` | Done |
| `[!]` | Blocked |

---

## Group A — Modal / overlay UX fixes

**Branch:** `fix/modal-ux`
**Files:** `RegulationProgress.tsx`, `SemesterPlanner.tsx`

- [ ] **A-1** Replace all text "Close" buttons with an icon-only `×` button
  - `RegulationAreaDetailModal` — RegulationProgress.tsx:53–59
  - `PlannerOverflowDialog` — SemesterPlanner.tsx:167–174
  - `MobilePlannerFavoritesDrawer` — SemesterPlanner.tsx:289–295
  - Use a consistent `<button>` with `aria-label="Close"` and `×` as text content

- [ ] **A-2** Backdrop click closes `RegulationAreaDetailModal`
  - Add `onClick={onClose}` to the outer `div` (RegulationProgress.tsx:34)
  - Add `onClick={e => e.stopPropagation()}` to the inner modal `div` so clicks inside don't bubble

- [ ] **A-3** Remove `CatBadge` from course rows inside `RegulationAreaDetailModal`
  - Redundant — user clicked on that regulation area, so they already know the category
  - Delete lines 78–80 in RegulationProgress.tsx

---

## Group B — Grade display in regulation area detail

**Branch:** `fix/regulation-grade`
**Files:** `backend/src/services/progress.py`, `frontend/src/features/dashboard/types.ts`, `RegulationProgress.tsx`

- [ ] **B-1** Expose `grade` in backend course detail serializer
  - `_build_completed_course_detail` (progress.py:66–82) has access to `grade` from the query (line 291) but does not include it in the return dict
  - Add `'grade': _normalize_float(completed_course.get('grade'))` to the return value

- [ ] **B-2** Add `grade` to `RegulationAreaCourse` type
  - `frontend/src/features/dashboard/types.ts:10–18`
  - Add `grade: number | null`

- [ ] **B-3** Show grade in `RegulationAreaDetailModal` course rows
  - Update `formatCourseLabel` (RegulationProgress.tsx:19–22) to append `· Note: X.X` (omit if null)
  - Example result: `INF4321 · WS 24/25 · 6 ECTS · 1.7`

---

## Group C — Planner layout restructure

**Branch:** `fix/planner-layout`
**Files:** `SemesterPlanner.tsx`, `PlannerFeedback.tsx`

- [ ] **C-1** Remove the two header badge tags
  - Delete the `mb-2 flex flex-wrap gap-2` div containing "Account-based planning" and "One plan per semester" (SemesterPlanner.tsx:668–675)

- [ ] **C-2** Move `PlannerAssignment` section below the schedule in edit mode
  - Extract the assignment block (PlannerFeedback.tsx:172–208) into a separate `PlannerAssignment` component
  - In `SemesterPlanner`, render `PlannerAssignment` after `PlannerGrid` (not inside `PlannerFeedback`)
  - `PlannerFeedback` then only renders: ECTS summary + fulfilled regulation parts
  - `PlannerAssignment` only renders when `isEditing && plannedCourses.length > 0`

- [ ] **C-3** Align `PlannerFavoritesPanel` flush with the schedule block (desktop edit)
  - Current structure: `[PlannerFeedback + PlannerGrid] | [PlannerFavoritesPanel]` — favorites aligns to PlannerFeedback top
  - Target structure: `PlannerFeedback` full-width above, then `[PlannerGrid | PlannerFavoritesPanel]` side-by-side below
  - Restructure `SemesterPlanner` grid in edit mode:
    ```
    <PlannerFeedback />                         ← full width, always
    <div grid xl:grid-cols-[1fr_20rem]>
      <div>
        <PlannerGrid />
        <PlannerAssignment />                   ← after grid, edit only
      </div>
      <PlannerFavoritesPanel />                 ← edit only, desktop only
    </div>
    ```

---

## Group D — Weekly planner scroll fix

**Branch:** `fix/planner-scroll`
**Files:** `SemesterPlanner.tsx`

- [ ] **D-1** Investigate and remove internal scroll from the weekly plan block
  - User reports the weekly plan block scrolls within itself on mobile
  - The grid wrapper has `overflow-x-auto` (SemesterPlanner.tsx:473) causing horizontal scroll
  - On mobile (`isMobilePlanner = true`) the layout already switches to `weekly-list` — verify this is actually active and not falling through to the grid
  - Fix: ensure `overflow-x-auto` only applies when the grid is actually rendered (not in list mode); remove it entirely if the grid can be made to fit through column resizing

---

## Group E — Dashboard mobile layout

**Branch:** `fix/dashboard-mobile`
**Files:** `Dashboard.tsx`, `SpecializationCircle.tsx`

- [ ] **E-1** Fix `SpecializationCircle` overflowing on mobile
  - SVG is hardcoded `420×420` with `min-w-[420px]` (SpecializationCircle.tsx:67)
  - The `overflow-x-auto` on the wrapper prevents clipping but causes horizontal scroll within the card
  - Fix: use `viewBox="0 0 420 420"` without `min-w` and let the SVG scale via `width="100%" height="auto"` — the viewBox already exists (line 67), just remove the fixed pixel classes

- [ ] **E-2** Fix `grid-cols-2` dashboard layout breaking on small screens
  - `Dashboard.tsx:111` — `grid grid-cols-2 gap-4.5` puts RegulationProgress and SpecializationCircle side by side on all screen sizes
  - On mobile both columns are too narrow; SpecializationCircle is invisible
  - Fix: change to `grid-cols-1 lg:grid-cols-2`

- [ ] **E-3** Fix stats row `grid-cols-3` breaking on small screens
  - `Dashboard.tsx:103` — `grid grid-cols-3 gap-6` hardcodes 3 columns
  - On narrow screens the stat items are squeezed
  - Fix: change to `grid-cols-3` with reduced gaps and font scaling, or stack as `grid-cols-1 sm:grid-cols-3`

---

## Group F — General mobile audit (all tabs)

**Branch:** `fix/mobile-audit`
**Files:** TBD per finding

- [ ] **F-1** Audit all tab views on mobile and fix layout issues
  - Tabs to check: Dashboard, Catalog, Planner, Transcript, Account, CourseDetail
  - Known issues already tracked in Groups D + E
  - Document remaining findings here during implementation and add sub-tasks as needed

---

## Group G — Mobile TopBar: Account in Dropdown

**Branch:** `fix/mobile-topbar-account`
**Files:** `TopBar.tsx`

- [ ] **G-1** Remove standalone gear/settings icon from mobile topbar
  - Currently there's a separate `<Link to={ROUTES.account}>` gear icon next to the hamburger button (TopBar.tsx:31–41)
  - Delete it — account access moves to the dropdown

- [ ] **G-2** Add "Account" NavLink inside the mobile drawer menu
  - In the drawer nav list (TopBar.tsx:114–133), append an "Account" item after the regular nav links
  - Use a user/person icon or the existing `GearIcon`, label "Account"
  - Closes the drawer on click (`onClick={() => setIsMenuOpen(false)}`)

---

---

## Group H — Catalog filter: flexible areas only + abbreviations

**Branch:** `fix/catalog-filter`
**Files:** `frontend/src/features/courses/components/Overview.tsx`, `frontend/src/shared/utils/regulation.ts`

- [x] **H-1** Compact/simplify `Overview.tsx` without behavior change
  - Remove any state duplication or redundant wrappers
  - Consolidate `toggleNumberSelection` / `toggleStringSelection` if possible
  - Keep it lean before adding feature changes

- [x] **H-2** Replace `topicAreaOptions` with `buildFlexibleRegulationAreaOptions`
  - Current: `(regulationVersion?.ruleGroups ?? []).map(rg => ({ code: rg.code, label: rg.name }))` — includes THESIS and all non-elective areas
  - Fix: import and call `buildFlexibleRegulationAreaOptions(regulationVersion.ruleGroups)` — already filters THESIS and non-flexible groups
  - Unauthenticated / no-PO users: no change — empty state ("Select a study program...") stays as-is since `regulationVersion` is null

- [x] **H-3** Use `option.code` as chip label for topic area chips
  - `buildFlexibleRegulationAreaOptions` already returns `{ code, label }` where `code` is e.g. `INFO-INFO`, `ML-CS`, `MEDI-APPL`
  - Change chip `label` prop to `topicAreaOption.code` instead of `topicAreaOption.label`
  - Gives user-requested abbreviations (INFO-INFO, INFO-THEO, MEDI-APPL, ML-CS etc.)

---

## Group I — Transcript mobile layout

**Branch:** `fix/transcript-mobile`
**Files:** `frontend/src/features/transcript/components/Transcript.tsx`

- [x] **I-1** Fix `AuthenticatedTranscript` two-column layout on mobile
  - Current: `grid-cols-5` always — left (col-span-2) + right (col-span-3) crammed on mobile
  - Fix: `grid-cols-1 lg:grid-cols-[2fr_3fr]` — stack on mobile, side-by-side on desktop

- [x] **I-2** Fix stats row inside `AuthenticatedTranscript`
  - Current: `grid-cols-3 gap-3.5` always — stat cells too narrow on mobile
  - Fix: keep `grid-cols-3` but reduce padding and use `sm:px-6` pattern; or `text-xl sm:text-2xl` on the value

---

## Group J — Mobile overflow: no horizontal scroll

**Branch:** `fix/mobile-overflow`
**Files:** `Dashboard.tsx`, `RegulationProgress.tsx`, global layout shell

- [x] **J-1** Fix Dashboard stat row overflow on mobile
  - `grid-cols-3` + `px-4` on narrow screens → `text-2xl` value + sub text inline overflow their cells
  - Fix: make sub text wrap below value (`flex-col` instead of `flex items-baseline`) on the `StatItem` component; or reduce value font to `text-xl sm:text-2xl`

- [x] **J-2** Fix RegulationProgress items going beyond white border
  - Regulation area buttons have `flex items-center justify-between gap-3` with code + name + "Fulfilled" badge + ECTS fraction
  - On mobile the combined width can exceed the card; the card has no `overflow-hidden`
  - Fix: add `overflow-hidden` to the outer card div; ensure the inner row always has `min-w-0` on the left flex container so `truncate` works on the name

- [x] **J-3** Enforce no global horizontal scroll on mobile
  - Add `overflow-x-hidden` to the main content container (or `body`) so that any uncaught overflow is clipped rather than creating a scrollbar
  - Check that the layout shell wrapper handles this correctly without breaking any intentionally scrollable containers (e.g. planner grid inside its own `overflow-x-auto` box)

---

## Backlog (unplanned)

<!-- Raw ideas / future work that has not been scoped yet -->
