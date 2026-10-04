// Builds testing-and-qa/classified-survivors.md from the original inventory plus the classification data below.
// The data is the analyst's judgement; the inventory (IDs, locations, code, statuses) comes from the Stryker report.
// Run from the mock project folder:  node testing-and-qa/diagnostics/generate-classified.mjs
// It refuses to write unless all 70 inventory IDs are classified exactly once.
import { readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = join(here, '..', '..')
const inv = JSON.parse(readFileSync(join(root, 'testing-and-qa/reports/survivors-inventory.json'), 'utf8')).mutants

// cls: GAP = real test gap, EQ = equivalent, STY = styling only, ART = tool artefact, UNR = unresolved
// sev (for GAP): High, Medium, Low.  conf: High, Medium, Low.
const C = {}
const add = (id, cls, sev, beh, req, existing, ev, conf) => { C[id] = { cls, sev, beh, req, existing, ev, conf } }

// ---- erasure route ----
add(6, 'EQ', '-', 'With no Authorization header the comparison hashes "Stryker was here!" instead of "".', 'AC-7.8, ADR-0001 (secret guard)',
  'route.test.ts "401 with no header" passes either way.',
  'Neither string can equal `Bearer <secret>` for any allowed secret (A-Z a-z 0-9 _ . ~ -, 16+ chars), so the comparison is false either way. Diagnostic: 401/200 results identical in all 9 secret/header cases; ordinary suite does not catch.', 'High')
add(20, 'EQ', '-', 'Drops the `secret !== undefined` check, so `SECRET_PATTERN.test(undefined)` runs.', 'AC-7.8, ADR-0001 (fails closed with no secret)',
  'route.test.ts "refuses when CRON_SECRET is unset" passes either way.',
  '`RegExp.test(undefined)` tests the text "undefined" (9 characters), shorter than the 16-character minimum, so it is false. Diagnostic: unset secret with header `Bearer undefined` is 401 in both. Equivalent only while the minimum length is above 9, so it is fragile.', 'High')

// ---- actions ----
add(90, 'GAP', 'High', 'The shared update/toggle/delete helper reads and writes collection "" instead of "tasks".', 'AC-1.3, 5.1, 6.1, 6.2, 7.1 to 7.4 (writes act on the tasks record); ADR-0002, ADR-0005',
  'None. `expect(collection).toHaveBeenCalledWith("tasks")` exists only for createTask (tasks.actions.test.ts lines 99 and 337). The mock `collection()` accepts any name.',
  'Diagnostic assertion that updateTask, setTaskStatus and deleteTask use the "tasks" collection fails on the mutant (3 of 3) and passes on the original. If the real Admin SDK rejects an empty path (not checked), every edit, toggle and delete would return the save-failed text. Same shape as the module\'s "collection name" gap.', 'High')
add(97, 'EQ', '-', '`!snap.exists || !stored` becomes `&&`.', 'AC-7.4 (missing task refused)',
  'tasks.actions.test.ts "taskGone" cases pass either way.',
  'Official Firestore typings: `data()` returns undefined exactly when the document does not exist, so `exists` and `stored` always agree for a real snapshot. The test double (`stored()` helper) is coherent too. Diagnostic: the two coherent snapshots behave identically; only an impossible snapshot (exists false with data present) differs.', 'High')
add(183, 'GAP', 'Low', 'The log label for a failed status change is "" instead of "Task status change failed:".', 'ADR-0006 / rule 5 (raw error only logged); no AC fixes the wording',
  'tasks.actions.test.ts lines 406-426 check that console.error ran once and its error argument, not the label. updateTask\'s label is checked (line 574).',
  'Diagnostic assertion on the label fails on the mutant. Diagnostic wording only; no user-visible effect.', 'High')
add(196, 'GAP', 'Low', 'The log label for a failed delete is "" instead of "Task delete failed:".', 'ADR-0006 / rule 5; no AC fixes the wording',
  'Same shared tests as 183 check the count and error argument only.', 'Diagnostic assertion fails on the mutant.', 'High')

// ---- CreateTaskForm ----
add(203, 'GAP', 'Medium', 'The default due-date value (third `\'\'` on the DEFAULT_VALUES line, column 79) becomes "Stryker was here!".', 'AC-2.1b (due date required), AC-2.8 / A36 (message states the rule broken)',
  'CreateTaskForm.test.tsx fills every field with `fill()` and checks required-field refusals, but no test submits an untouched form and reads the due-date message.',
  'Diagnostic trace: untouched submit shows "Due date must be a valid date and time" instead of "Due date is required"; the same after a successful save and reset. In jsdom the input itself still looks empty (it discards the invalid value); a real browser was not checked. Static mutant: its 0 covering tests is a static-mutant property, not NoCoverage.', 'High')
add(204, 'STY', '-', 'The shared input class string is emptied (border, placeholder, `focus:ring-2`, `focus:outline-none`, `aria-invalid:border-red-500`, dark colours).', 'AC-8.4c (visible keyboard focus), AC-2.8 (error cue)',
  'No test reads the input\'s classes. jsdom does not load Tailwind, so computed style cannot be tested.',
  'Not harmless: it carries the focus ring and the invalid-field border. No behaviour changes in any traced sequence. Needs the browser check for AC-8.4c, which the mutation run cannot provide. No responsive (sm/md/lg) classes in it.', 'High')
add(223, 'EQ', '-', 'The error `type` for the "invalid due date" fallback is "" instead of "validate".', 'AC-2.8',
  'CreateTaskForm.test.tsx forces `localInputToIso` to null with its override hook and checks the message.',
  'Nothing reads an error\'s `type` (grep of src/features/tasks: no `.type`); the message, `aria-invalid` and focus are the same. Diagnostic trace of the fallback is identical to the original.', 'High')
add(235, 'EQ', '-', 'The error `type` for a server-named field error is "" instead of "server".', 'AC-2.8, ADR-0006',
  'CreateTaskForm.test.tsx checks the message appears beside the field.',
  'Same as 223. Diagnostic trace of a server field error, then retyping, is identical.', 'High')
add(239, 'GAP', 'Low', 'The log label for a thrown create is "" instead of "Task create failed:".', 'ADR-0006 / rule 5; no AC fixes the wording',
  'CreateTaskForm.test.tsx checks the fixed toast, not the logged label.', 'Diagnostic assertion fails on the mutant.', 'High')

// ---- EditTaskForm ----
add(270, 'STY', '-', 'The input class string is emptied (same classes as 204).', 'AC-8.4c, AC-2.8', 'None; classes are not asserted.',
  'As 204. Carries `focus:ring-2` and `aria-invalid:border-red-500`. No traced behaviour changes.', 'High')
add(271, 'STY', '-', 'BUTTON_BASE_CLASS is emptied (inline-flex, padding, `focus-visible:outline`, `disabled:` styles). Primary and secondary buttons both interpolate it.', 'AC-8.4c, AC-8.3', 'None.',
  'Not harmless: removes the keyboard focus outline and the disabled look from Save and Cancel. No traced behaviour changes. No breakpoint classes.', 'High')
add(272, 'STY', '-', 'PRIMARY_BUTTON_CLASS (Save) is emptied.', 'AC-8.4c', 'None.',
  'Carries `focus-visible:outline-zinc-900` and the black-on-white colours (contrast). No traced behaviour changes.', 'High')
add(273, 'STY', '-', 'SECONDARY_BUTTON_CLASS (Cancel) is emptied.', 'AC-8.4c', 'None.',
  'Carries `focus-visible:outline-zinc-500`. No traced behaviour changes.', 'High')
add(290, 'EQ', '-', 'The effect that focuses Title on open has `[]` instead of `[setFocus]` as dependencies.', 'AC-8.4a (focus goes to Title on open)',
  'EditTaskForm.test.tsx checks Title is focused on open.',
  'react-hook-form\'s `setFocus` is a stable function, so the effect runs once either way. Diagnostic trace (focus stays on Description while typing) is identical. The `react-hooks/exhaustive-deps` lint rule would normally flag this change; I did not run lint on the mutant.', 'Medium')
add(308, 'EQ', '-', 'The error `type` for the edit form\'s "invalid due date" fallback is "" instead of "validate".', 'AC-2.8', 'EditTaskForm.test.tsx forces the null path and checks the message.',
  'As 223. Diagnostic trace identical.', 'High')
add(327, 'EQ', '-', 'The error `type` for a server-named field error is "" instead of "server".', 'AC-2.8, ADR-0006', 'EditTaskForm.test.tsx checks the message beside the field.',
  'As 235. Diagnostic trace identical.', 'High')
add(331, 'GAP', 'Low', 'The log label for a thrown edit is "" instead of "Task update failed:".', 'ADR-0006 / rule 5', 'EditTaskForm.test.tsx checks the toast, not the label.', 'Diagnostic assertion fails on the mutant.', 'High')

// ---- TaskItem ----
add(380, 'STY', '-', 'BUTTON_BASE_CLASS is emptied (Edit, Delete, Cancel and Delete task buttons).', 'AC-8.4c, AC-8.3', 'None.',
  'Not harmless: removes the `focus-visible` outline and disabled styling. No traced behaviour changes.', 'High')
add(382, 'STY', '-', 'DESTRUCTIVE_BUTTON_CLASS ("Delete task") is emptied.', 'AC-8.4c', 'None. (A test asserts classes only on the Edit button, TaskItem.test.tsx line 810.)',
  'Carries the red background, white text (contrast) and `focus-visible:outline-red-600`. No traced behaviour changes.', 'High')
add(384, 'EQ', '-', 'The checkbox `id` becomes "" instead of "task-<id>-status".', 'AC-8.4b (accessible name)',
  'TaskItem.test.tsx finds the checkbox by role and aria-label.',
  'The id is used once (line 145) and nothing refers to it; the name comes from `aria-label`. Diagnostic trace differs only in the id attribute itself. An empty id is invalid HTML but inert. Equivalent in function, not in markup.', 'Medium')
add(388, 'GAP', 'Medium', 'The "restore focus to Delete" flag starts true, so every item focuses its Delete button when it first renders.', 'AC-8.4a (keyboard use); focus management in docs/DESIGN.md "Accessibility"',
  'TaskItem.test.tsx checks focus moves on open and close, never that nothing is focused after the first render.',
  'Diagnostic assertion that focus stays on the document body after render fails on the mutant (focus lands on the Delete button) and passes on the original. In the live list this would pull focus away from wherever the user is typing each time a task appears.', 'High')
add(389, 'GAP', 'Medium', 'The "restore focus to Edit" flag starts true: each item focuses its Edit button on first render.', 'AC-8.4a', 'As 388.',
  'Diagnostic assertion fails (focus lands on the Edit button).', 'High')
add(395, 'EQ', '-', '`cancelButtonRef.current?.focus` loses its `?.`.', 'AC-8.4a',
  'TaskItem.test.tsx checks Cancel receives focus.',
  'The effect only reaches this line when `confirming` is true, and then the Cancel button is rendered, so the ref is set. No TypeError in any traced sequence (open, cancel, escape, edit, failed delete, reopen).', 'Medium')
add(396, 'GAP', 'Medium', '`else if (restoreFocus.current)` becomes `else if (true)`: on first render the item focuses its Delete button.', 'AC-8.4a', 'As 388.',
  'Same diagnostic failure as 388 (focus on Delete after first render).', 'High')
add(399, 'EQ', '-', 'After restoring focus the flag is set to true instead of false.', 'AC-8.4a',
  'TaskItem.test.tsx checks focus returns to Delete after Cancel.',
  'The effect only runs when `confirming` changes, and the only way it becomes false is `closeConfirmation()`, which sets the flag true first. Diagnostic trace over open, cancel, escape and failed-delete sequences is identical.', 'Medium')
add(400, 'EQ', '-', '`deleteButtonRef.current?.focus` loses its `?.`.', 'AC-8.4a', 'As 395.',
  'The Delete button is rendered whenever confirmation and edit are both closed, which is when the line runs. Traced sequences identical.', 'Medium')
add(404, 'GAP', 'Medium', '`!editing && restoreEditFocus.current` becomes `true`: on first render the item focuses its Edit button.', 'AC-8.4a', 'As 388.', 'Diagnostic assertion fails (focus lands on Edit).', 'High')
add(406, 'GAP', 'Medium', '`&&` becomes `||`: the same focus-on-first-render fault.', 'AC-8.4a', 'As 388.', 'Diagnostic assertion fails.', 'High')
add(409, 'EQ', '-', 'After restoring focus to Edit the flag is set to true instead of false.', 'AC-8.4a', 'As 399.',
  'Same reasoning as 399 for the edit form: the flag is set true by `closeEdit()` before every close. Diagnostic trace identical.', 'Medium')
add(410, 'EQ', '-', '`editButtonRef.current?.focus` loses its `?.`.', 'AC-8.4a', 'As 395.',
  'The Edit button is rendered whenever confirmation and edit are both closed. Traced sequences identical.', 'Medium')
add(423, 'GAP', 'Low', 'When another call is in flight, `run()` returns "" instead of "skipped".', 'AC-8.1a (no error shown when nothing failed), AC-7.5',
  'TaskItem.test.tsx "a double click on Delete task starts one delete" checks the call count and one success toast, not that no error toast or state reset follows.',
  'Diagnostic assertion for the delete path fails on the mutant (a spurious error toast, and the confirmation closes while the delete is still running). Reached only by two activations in one tick; a real second click lands on a disabled button, so reachability is low.', 'Medium')
add(431, 'GAP', 'Low', 'The log label for a thrown toggle/delete is "" instead of "Task change failed:".', 'ADR-0006 / rule 5', 'TaskItem.test.tsx checks the toast.', 'Diagnostic assertion fails on the mutant.', 'High')
add(446, 'EQ', '-', 'In the toggle handler `outcome === "skipped"` becomes `false`.', 'AC-8.1a',
  'TaskItem.test.tsx "a double click on the checkbox starts one toggle" (its comment says it passes without the guard).',
  'A second change event on a controlled checkbox in the same tick is dropped by React, so this branch is never reached for the toggle: the diagnostic double-click test passes on the original and on this mutant, with one call and no error toast.', 'Medium')
add(448, 'EQ', '-', 'In the toggle handler the compared literal "skipped" becomes "".', 'AC-8.1a', 'As 446.', 'As 446.', 'Medium')
add(459, 'GAP', 'Low', 'In the delete handler `outcome === "skipped"` becomes `false`.', 'AC-8.1a, AC-7.5', 'As 423.',
  'Diagnostic delete double-activation assertion fails on the mutant (error toast shown, confirmation closed).', 'Medium')
add(461, 'GAP', 'Low', 'In the delete handler the compared literal "skipped" becomes "".', 'AC-8.1a, AC-7.5', 'As 423.', 'Same diagnostic failure as 459.', 'Medium')
add(479, 'GAP', 'Low', '`event.stopPropagation()` is removed from the confirmation\'s Escape handler.', 'AC-8.4a (Escape closes the confirmation)',
  'TaskItem.test.tsx "Escape closes the confirmation" does not put a listener above the item.',
  'Diagnostic assertion with an ancestor key listener fails on the mutant (the Escape reaches the ancestor). No ancestor Escape handler exists in src today (grep), so there is no effect in the current application; latent only.', 'High')
add(485, 'GAP', 'Low', '`deleting` is always true.', 'AC-8.4c (accessible state)',
  'TaskItem.test.tsx checks `aria-busy` while a delete runs, not that it is absent when idle.',
  'Diagnostic assertion fails: the confirmation group is `aria-busy="true"` while idle, which tells assistive technology the region is still loading.', 'High')
add(507, 'GAP', 'Low', '`aria-busy={deleting || undefined}` becomes `true`.', 'AC-8.4c', 'As 485.', 'Same diagnostic failure as 485.', 'High')

// ---- TaskList ----
add(522, 'STY', '-', 'PAGE_LINK_CLASS (Previous/Next links) is emptied.', 'AC-8.4c, AC-4.7b', 'None.',
  'Not harmless: carries `focus-visible:outline` and the link colours. No traced behaviour changes. No breakpoint classes.', 'High')

// ---- useTasks ----
add(577, 'EQ', '-', '`page >= 1` becomes `page > 1` in the page clamp.', 'AC-4.7a',
  'useTasks.test.ts "a page that is not a positive integer is page 1" passes either way.',
  'The clamp falls back to 1, so page 1 gives 1 either way and every other value is unchanged. Diagnostic: slices, hasNext and constraint count identical for pages 1, 0, -1, 1.5, NaN and 2.', 'High')
add(593, 'GAP', 'Low', 'The load-error log runs on every render instead of only when there is an error.', 'ADR-0006 / rule 5; AC-4.10b',
  'useTasks.test.ts checks the fixed error text, not that nothing is logged when there is no error.',
  'Diagnostic assertion "no console.error without an error" fails on the mutant.', 'High')
add(596, 'GAP', 'Low', 'The load-error log label is "" instead of "Failed to load tasks".', 'ADR-0006 / rule 5', 'useTasks.test.ts does not check the label.', 'Diagnostic assertion fails on the mutant.', 'High')
add(597, 'GAP', 'Low', 'The log effect depends on `[]` instead of `[error]`, so an error arriving after the first render is not logged.', 'ADR-0006 / rule 5; AC-4.10b',
  'useTasks.test.ts feeds the error at the first render only.', 'Diagnostic assertion with a late error fails on the mutant.', 'High')

// ---- due-date.ts ----
add(633, 'GAP', 'Medium', 'The ISO due-date pattern loses its `$` end anchor.', 'AC-2.9 (field rules on direct requests), ADR-0003 (format)',
  'due-date.test.ts and schemas.test.ts try many malformed strings but none with text after a valid date.',
  'Diagnostic assertions fail on the mutant: "2027-03-05T10:00:00Zjunk" and "…+08:00 extra" are accepted. Static mutant (0 covering tests is a static property).', 'High')
add(663, 'EQ', '-', '`match[6] ?? "0"` becomes `""` for the seconds.', 'AC-2.4', 'Seconds tests pass either way.',
  '`Number("")` is 0, the same as `Number("0")`. Diagnostic: 40,000 generated inputs give an identical result digest.', 'High')
add(665, 'EQ', '-', 'The missing-fraction default `""` becomes "Stryker was here!".', 'AC-2.4 (whole minute)', 'Fraction tests pass either way.',
  'The value is only tested for digits 1-9 and the replacement has none. Same 40,000-input digest.', 'High')
add(672, 'EQ', '-', '`match[9] ?? "0"` becomes `""` for offset hours.', 'AC-2.5', 'Z-offset tests pass either way.', '`Number("")` is 0. Same digest.', 'High')
add(674, 'EQ', '-', '`match[10] ?? "0"` becomes `""` for offset minutes.', 'AC-2.5', 'As 672.', 'As 672.', 'High')
add(690, 'GAP', 'Medium', '`minutes > 59` becomes `false` when reading a sent due date.', 'AC-2.9, AC-2.4',
  'due-date.test.ts checks hours 24 and seconds 60 but not minutes 60 to 99.',
  'Diagnostic assertion fails: "…T10:60Z" is accepted and silently rolls into the next hour. 111 tests run this line and none sends such a value.', 'High')
add(693, 'GAP', 'Low', '`seconds > 59` becomes `false`.', 'AC-2.9, AC-2.8 (message names the rule)',
  'No test sends seconds 60 to 99.', 'Diagnostic assertion fails: the value is still refused, but with the "not a whole minute" reason instead of the format reason.', 'High')
add(696, 'GAP', 'Medium', '`offsetHours > 23` becomes `false`.', 'AC-2.9, AC-2.5',
  'No test sends an offset of 24 hours or more.', 'Diagnostic assertion fails: "+24:00" is accepted and shifts the moment by a day.', 'High')
add(699, 'GAP', 'Medium', '`offsetMinutes > 59` becomes `false`.', 'AC-2.9, AC-2.5', 'No test sends offset minutes above 59.', 'Diagnostic assertion fails: "+05:60" is accepted.', 'High')
add(727, 'GAP', 'Medium', 'The `datetime-local` pattern loses its `^` start anchor.', 'AC-2.4, AC-2.8 (a bad date is refused beside the field)',
  'due-date.test.ts tests bad separators and lengths but no value with text before a valid date.',
  'Diagnostic assertions fail: "12027-03-05T10:00" (a 5-digit year, which the HTML `datetime-local` format allows; not checked in a browser) is read as 2027-03-05, and leading text is accepted. Static mutant. Uncaught in four time zones (Sydney, Perth, UTC, Los Angeles).', 'High')
add(753, 'GAP', 'Low', 'The browser-side `minutes > 59` check is removed.', 'AC-2.8',
  'No test sends minute 60+ to `localInputToIso`.', 'Diagnostic assertion fails: "…T10:75" gives a time instead of null. A real `datetime-local` input cannot produce it, so unreachable from the UI.', 'High')
add(780, 'GAP', 'Low', 'The 400-year leap rule `year % 400 === 0` becomes `false`.', 'AC-2.9, A6 (29 February)',
  'The 29 February tests use 2028 and 2100 but no year divisible by 400.',
  'Diagnostic assertions fail: 29 February 2000 and 2400 are refused as a bad format (they would be refused anyway, as past or too far ahead, so no accept/refuse decision changes in the 2026-2037 window; only the reason does).', 'High')
add(782, 'GAP', 'Low', '`year % 400` becomes `year * 400`.', 'AC-2.9, A6', 'As 780.', 'Same diagnostic failure as 780.', 'High')
add(787, 'GAP', 'Medium', 'The 30-day month list `[4, 6, 9, 11]` becomes `[]`.', 'AC-2.9',
  'Date tests cover 30 February and leap years, not 31 April, June, September or November.',
  'Diagnostic assertion fails: "2027-04-31" is accepted and rolls into 1 May.', 'High')
add(796, 'GAP', 'Medium', '`month >= 1` becomes `true`: month 00 passes the calendar check.', 'AC-2.9', 'No test sends month 00.', 'Diagnostic assertion fails: "2027-00-15" is accepted as December of the previous year.', 'High')
add(802, 'GAP', 'Medium', '`day >= 1` becomes `true`: day 00 passes.', 'AC-2.9', 'No test sends day 00.', 'Diagnostic assertion fails: "2027-03-00" is accepted as 28 February.', 'High')

// ---- schemas.ts ----
add(864, 'GAP', 'Low', 'The reserved-ID pattern loses `^`: any ID ending in `__` is refused.', 'AC-2.9 (task ID rule), ADR-0005',
  'schemas.test.ts refuses `__x__` and `.`/`..` but never accepts an ID that merely ends in `__`.',
  'Diagnostic assertion fails: "a__b__" (a legal Firestore ID) is refused. App-generated IDs never look like this, so no live task is affected.', 'High')
add(865, 'GAP', 'Low', 'The reserved-ID pattern loses `$`: any ID starting `__` and containing another `__` is refused.', 'AC-2.9', 'As 864.', 'Diagnostic assertion fails: "__a__b" is refused.', 'High')
add(888, 'ART', '-', 'The body of `requestObject()` is emptied, so every request schema is `undefined` and the module fails to load.', 'AC-2.9, AC-2.10 (every request schema)',
  'Every schemas.test.ts and action test would fail at import.',
  'Ordinary Vitest: the suite fails to load (a suite-level failure). Stryker run on this mutant alone reproduces Survived with `testsCompleted: 0`: no test result was produced, which the runner counted as survival. The only one of the 70 with 0 completed tests. Static mutant.', 'High')

// ---- useFirestore.ts ----
add(960, 'EQ', '-', '`queryConstraints.length > 0 ? query(ref, ...c) : query(ref)` always takes the first branch.', 'AC-4.11a (live list)',
  'useFirestore.test.ts mocks `query`; useFirestore.real-queryequal.test.ts uses the real SDK but is not run by Stryker.',
  'With no constraints `query(ref, ...[])` is the same query: diagnostic run on the real SDK, `queryEqual(query(ref), query(ref, ...[]))` is true.', 'High')
add(962, 'EQ', '-', '`length > 0` becomes `length >= 0`.', 'AC-4.11a', 'As 960.', 'As 960.', 'High')

// ---- firestore.ts (NoCoverage) ----
add(986, 'GAP', 'High', '`typedCollection()` body is emptied (returns undefined).', 'AC-4.1, AC-1.2 (the list reads the tasks collection)',
  'None executes it. useTasks.test.ts replaces `getTasksCollection` with its own `collection(db, "tasks")`; tasks.actions.test.ts uses the Admin SDK, not this file.',
  'Diagnostic assertion (real file, SDK `collection()` faked) fails on the mutant. NoCoverage here means no test runs this file at all, which is a real gap, not a tool artefact: the ordinary suite does not run it either.', 'High')
add(987, 'GAP', 'High', '`getTasksCollection()` body is emptied.', 'AC-4.1, AC-1.2', 'As 986.', 'Same diagnostic failure as 986.', 'High')
add(988, 'GAP', 'High', 'The collection name "tasks" becomes "".', 'AC-4.1, AC-1.2', 'As 986.',
  'Same diagnostic failure as 986. The module calls this the serious case: the code can point at the wrong place while every test passes.', 'High')

// What the existing tests do cover, checked against due-date.test.ts and schemas.test.ts (corrects the first drafts above).
const EXISTING = {
  633: 'schemas.test.ts "refuses the malformed value" (lines 240-252) lists bad strings (month 13, hour 24, no offset, spaces) but none with text after a valid date.',
  690: 'schemas.test.ts refuses month 13, hour 24 and 29 February in a non-leap year (lines 245-247). No test sends minutes 60 to 99.',
  693: 'No test sends seconds 60 to 99 (due-date.test.ts tests seconds 01 and milliseconds .001 only).',
  696: 'No test sends an offset of 24 hours or more (offsets tested: Z, +08:00, -10:30, -00:00, +08).',
  699: 'No test sends offset minutes above 59.',
  727: 'due-date.test.ts "returns null for the local value" (lines 170-180) lists "", date only, a trailing Z, seconds 15, 30 February, hour 24 and text; nothing with characters before a valid date and no 5-digit year.',
  753: 'The same list has hour 24 but no minute 60 or above.',
  780: 'due-date.test.ts tests 29 February in 2028 (leap) and 2027 (not). schemas.test.ts and due-date.test.ts never use a year divisible by 400 (2000, 2400) or 100 (2100).',
  782: 'As 780.',
  787: 'Date tests cover 30 February, 29 February and month 13 only; no 31st of a 30-day month.',
  796: 'Month 13 is tested (schemas.test.ts line 245); month 00 is not.',
  802: 'No test sends day 00.',
  596: 'useTasks.test.ts line 113 checks console.error was called with `expect.any(String)` and the raw error, so an empty label still passes.',
  864: 'schemas.test.ts (lines 462-482) accepts "__a" and "a__" and refuses "__name__", "__a__" and "____", but has no usable ID containing a second "__" such as "a__b__".',
  865: 'As 864: "__a" is accepted but no ID that starts with "__" and has another "__" later without ending in it, such as "__a__b".',
}
for (const [id, text] of Object.entries(EXISTING)) C[id].existing = text

// ---------------------------------------------------------------------------------------------
const ids = inv.map((m) => String(m.id)).sort()
const classified = Object.keys(C).sort()
const missing = ids.filter((i) => !(i in C))
const extra = classified.filter((i) => !ids.includes(i))
if (missing.length || extra.length || ids.length !== 70) {
  console.error('Mismatch. missing:', missing, 'extra:', extra, 'inventory:', ids.length)
  process.exit(1)
}

const NAME = { GAP: 'Real test gap', EQ: 'Equivalent', STY: 'Styling only', ART: 'Tool artefact', UNR: 'Unresolved' }
const esc = (s) => String(s).replace(/\|/g, '\\|').replace(/\n/g, ' ')
const code = (s, n = 60) => '`' + esc(s.length > n ? s.slice(0, n - 1) + '…' : s).replace(/`/g, "'") + '`'

const counts = {}
const sevs = {}
for (const m of inv) {
  const c = C[String(m.id)]
  counts[c.cls] = (counts[c.cls] ?? 0) + 1
  if (c.cls === 'GAP') sevs[c.sev] = (sevs[c.sev] ?? 0) + 1
}
const byFile = new Map()
for (const m of [...inv].sort((a, b) => a.file.localeCompare(b.file) || a.location.start.line - b.location.start.line || a.location.start.column - b.location.start.column)) {
  if (!byFile.has(m.file)) byFile.set(m.file, [])
  byFile.get(m.file).push(m)
}

const out = []
out.push('<!-- Generated by testing-and-qa/diagnostics/generate-classified.mjs. The text of each row is the analyst\'s; IDs, locations, code and statuses come from the original Stryker report. -->')
out.push(...(readFileSync(join(here, 'classified-header.md'), 'utf8').replace(/\r\n/g, '\n').split('\n')))
out.push('')
out.push('## Counts')
out.push('')
out.push('| Class | Count | IDs |')
out.push('|---|---|---|')
for (const k of ['GAP', 'EQ', 'STY', 'ART', 'UNR']) {
  const list = inv.filter((m) => C[String(m.id)].cls === k).map((m) => Number(m.id)).sort((a, b) => a - b)
  out.push(`| ${NAME[k]} | ${list.length} | ${list.join(', ') || '-'} |`)
}
out.push(`| **Total** | **${inv.length}** | 67 Survived + 3 NoCoverage |`)
out.push('')
out.push(`Real test gaps by severity (my judgement of consequence, not a tool value): High ${sevs.High ?? 0}, Medium ${sevs.Medium ?? 0}, Low ${sevs.Low ?? 0}.`)
out.push('')
out.push('## Per-mutant classification')
out.push('')
out.push('**Every behaviour described below is the behaviour of a deliberately planted fault (the mutant), seen only in a disposable copy. None was observed in the application.** Columns: **Status** is Stryker\'s, unchanged. **Mutation** is the original code and the replacement. **Existing test** is what should have caught it, or that none does. **Evidence** names the probes: *ordinary suite* = the full 778-test suite under ordinary Vitest with the mutant applied (all 70 were not caught except 888); *diagnostic* = a separate test written only for this verification, in `testing-and-qa/diagnostics/`.')
for (const [file, list] of byFile) {
  out.push('')
  out.push(`### ${file.replace('frontend/src/', '')}`)
  out.push('')
  out.push('| ID | Status | Location | Mutation | Behaviour of the mutant | Requirement | Existing test | Class | Evidence and verification | Conf. |')
  out.push('|---|---|---|---|---|---|---|---|---|---|')
  for (const m of list) {
    const c = C[String(m.id)]
    const l = m.location
    const cls = c.cls === 'GAP' ? `${NAME.GAP} (${c.sev})` : NAME[c.cls]
    const st = m.static ? ' (static)' : ''
    out.push(`| ${m.id} | ${m.status}${st} | ${l.start.line}:${l.start.column}-${l.end.line}:${l.end.column} | ${code(m.original, 50)} → ${code(m.replacement ?? '', 50)} | ${esc(c.beh)} | ${esc(c.req)} | ${esc(c.existing)} | **${cls}** | ${esc(c.ev)}${c.cls === 'EQ' ? ' Basis: the code reasoning and valid domain stated here, plus the sampled inputs or sequences; equal traces support this but do not prove it.' : ''} | ${c.conf} |`)
  }
}
out.push('')
out.push(...readFileSync(join(here, 'classified-footer.md'), 'utf8').split(/\r?\n/))
out.push('')
writeFileSync(join(root, 'testing-and-qa/classified-survivors.md'), out.join('\n'))
console.log(JSON.stringify({ written: true, counts, sevs }))
