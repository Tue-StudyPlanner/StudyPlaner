# Implementation Backlog

This file tracks the next implementation work. Items may be split into smaller subtasks or reordered if that makes delivery safer or easier.

## Delivery rules

- Implement each larger feature on its own branch.
- Use feature-focused commits per branch.
- Closely related subtasks may be grouped into one larger commit when that keeps the change coherent.
- Mark completed items with `[x]` and optionally append the commit hash.

## Confirmed specification decisions (2026-05-25)

### 1. Dashboard regulation breakdown and progress UX

- Only top-level examination-regulation areas are clickable from the dashboard.
- The regulation-part breakdown opens in a modal.
- The grouping fix must cover all bachelor programs that already have regulation support.
- If a course could fit more than one regulation area, the modal/detail view should show it only in the single primary area to which the current progress logic assigns it.

### 2. Catalog filtering

- ECTS filtering uses exact ECTS values with multi-select.
- Topic-area filter options come from the active examination regulation.
- Multiple selected topic areas use OR logic.
- Text search combines with structured filters using AND logic.

### 3. Manual course addition and regulation matching

- Automatic match priority is: exact course ID -> exact normalized course name -> user choice from suggestions if ambiguity remains; no automatic fuzzy assignment.
- Ambiguous regulation matches must be resolved by the user from suggestions.
- If a manually added course matches a regulation-defined required course, its category stays visible but becomes read-only.
- Manually added courses outside the regulation are allowed.
- Unmatched manual courses may be assigned to non-strict regulation-compatible areas.
- Any course may count as ÜBK across all regulations, and ÜBK grades must not affect the grade average.

### 4. Planner desktop layout, semester controls, and planning summary

- The fixed-layout requirement currently applies to the weekly schedule view itself, not necessarily the full page.
- The planner semester dropdown must not allow semesters before the study start semester.
- The planner should allow semesters from the start semester through the current semester plus one future semester.
- Planner summary values should be based only on courses placed in the weekly schedule.
- The planner summary only needs to show fulfilled regulation parts.
- The right-side favorites list should only be visible in edit mode.
- The semester edit button only toggles edit mode; no separate semester settings are required.

### 5. Planner schedule interaction and overlap handling

- Overlapping courses should render side by side, up to three visible cards per timeslot.
- Additional overlapping courses beyond three should collapse behind a `+n` indicator.
- Conflict coloring should use a lightly desaturated red only, without extra warning iconography.
- Hidden overlaps behind `+n` should open in a desktop popover and a mobile bottom sheet.

### 6. Planner mobile mode and header responsiveness

- Mobile planner mode should support automatic responsive activation plus a manual override.
- The mobile-mode preference should be stored in the user account.
- The mobile planner should let us try both a compact weekly view and a simplified weekly list view before one final layout is chosen.
- The mobile header should use a combined compact strategy: smaller logo, reduced title footprint, and an overflow menu for actions.
- Mobile favorites should open in a bottom sheet or drawer.

## Open specification questions

- No critical open blockers remain at the moment.
- During implementation, the mobile planner should expose both trial layouts so the preferred variant can be chosen after hands-on testing.

## 1. Dashboard regulation breakdown and progress UX

- [x] 1.1 Audit the bachelor dashboard grouping logic and confirm where mathematics and core-informatics requirement sections are still split incorrectly, including all bachelor programs with supported regulation mappings. (commit: b27e39d)
- [x] 1.2 Normalize dashboard requirement grouping so top-level regulation parts are shown consistently across supported bachelor programs. (commit: b27e39d)
- [x] 1.3 Replace the current "complete courses" dashboard entry point with clickable top-level examination-regulation parts. (commit: b27e39d)
- [x] 1.4 Add a modal detail view that lists all courses counted toward the selected regulation part. (commit: b27e39d)
- [x] 1.5 Keep the existing overall regulation-progress window and progress behavior stable while opening the detailed breakdown. (commit: b27e39d)
- [x] 1.6 Define and implement deterministic display/counting rules for courses that could satisfy more than one regulation area, using the current primary regulation assignment. (commit: b27e39d)

## 2. Catalog filtering

- [x] 2.1 Add structured filters to the catalog in addition to the existing text search. (commit: ee95aef)
- [x] 2.2 Add exact-value ECTS filtering with multi-select support. (commit: ee95aef)
- [x] 2.3 Build topic-area filters from the active examination regulation. (commit: ee95aef)
- [x] 2.4 Combine multiple selected topic areas using OR logic. (commit: ee95aef)
- [x] 2.5 Combine structured filters with text search using AND logic. (commit: ee95aef)

## 3. Manual course addition and regulation matching

- [x] 3.1 Detect whether a manually added course matches a required course in the selected examination regulation. (commit: 7df7616)
- [x] 3.2 Implement the automatic match priority: exact course ID, then exact normalized course name, then user suggestions if ambiguity remains, without fuzzy auto-assignment. (commit: 7df7616)
- [x] 3.3 If a course matches a regulation-defined required course, show its category as visible but read-only. (commit: 7df7616)
- [x] 3.4 If matching remains ambiguous, require the user to choose from suggested matches. (commit: 7df7616)
- [x] 3.5 Allow manually added courses outside the regulation, but restrict manual assignment to non-strict regulation-compatible areas. (commit: 7df7616)
- [x] 3.6 Allow any unmatched manual course to count as ÜBK across all regulations and exclude ÜBK grades from GPA calculation. (commit: 7df7616)
- [x] 3.7 Ensure manually assigned tags remain compatible with the active examination regulation. (commit: 7df7616)

## 4. Planner desktop layout, semester controls, and planning summary

- [x] 4.1 Keep the weekly schedule view fixed in the desktop layout and reduce unnecessary scrolling around it.
- [x] 4.2 Remove the redundant "saved view" planner label/state.
- [x] 4.3 Replace the current weekly-schedule header slot with the semester dropdown and the edit-mode toggle for the active semester.
- [x] 4.4 Prevent semester selection before the user's study start semester and cap future choices at current semester +1.
- [x] 4.5 Add a planner summary above the schedule based only on currently planned courses, with planned ECTS and fulfilled regulation parts.
- [x] 4.6 Remove or downgrade the old block-coverage-only feedback in favor of the regulation-coverage summary.
- [x] 4.7 Show favorite courses in a scrollable right-side panel only in edit mode.

## 5. Planner schedule interaction and overlap handling

- [x] 5.1 When multiple planned courses share the same timeslot, render up to three of them next to each other instead of hiding them behind one another.
- [x] 5.2 Collapse additional overlaps beyond three behind a `+n` overflow indicator.
- [x] 5.3 Mark conflicting overlapping schedule items with a lightly desaturated red.
- [x] 5.4 Open hidden overlapping courses from the `+n` overflow state via a desktop popover and a mobile bottom sheet.
- [x] 5.5 Verify that overlap rendering still stays readable alongside the new right-side favorites panel and summary area.

## 6. Planner mobile mode and header responsiveness

- [x] 6.1 Add a mobile planner mode with automatic responsive activation plus a manual override.
- [x] 6.2 Persist the mobile-mode preference in the user account.
- [x] 6.3 Fix the current mobile planner loading/rendering issue where the right side becomes blank or appears only half loaded.
- [x] 6.4 Rework the planner into two mobile weekly layouts for evaluation after the desktop planner changes are stable: a compact weekly view and a simplified weekly list view, with a way to switch between them.
- [x] 6.5 Move mobile favorites into a bottom sheet or drawer.
- [x] 6.6 Revisit the mobile top bar because logo, title, and action icons currently compete for the same space.
- [x] 6.7 Implement the compact mobile header strategy using a smaller logo, reduced title footprint, and an overflow menu for actions.

## Suggested implementation order

1. Dashboard regulation breakdown and progress UX
2. Manual course addition and regulation matching
3. Catalog filtering
4. Planner desktop layout, semester controls, and planning summary
5. Planner schedule interaction and overlap handling
6. Planner mobile mode and header responsiveness

## Dependencies

- Section 1 should land before any deeper dashboard refinements that depend on the new regulation-part drill-down.
- Section 3 depends on the existing examination-regulation mappings being reliable enough for matching.
- Section 5 depends on section 4.
- Section 6 depends on sections 4 and 5.
