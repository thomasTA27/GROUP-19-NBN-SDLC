# ADR-0003: Store due dates as Timestamps; convert and format them in the browser

```
Status: Proposed
Decided-by: Sajad Ali Akbari (developer), decisions drafted by an AI assistant acting for him
Drafted-with: Claude Code:claude-opus-5-5
Security review: not required
```

## Context

**Sources:**
- Step 2 decision ADR-C, in `design-and-context-engineering/design-notes.md` and `step2-options.md`
- `task-crud-spec.md`, as amended by SCR-1 to SCR-18

**How claims are marked:** as in `step2-options.md`.

**What the spec requires:**
- **Precision:** A due date is a date and time, to the minute (R3, A5, AC-2.4).
- **Display:** It is shown in the viewer's device timezone (AC-2.5).
- **Past dates:** A due date is in the past if it is before the start of the current minute, by the server's clock (A26, AC-2.6a–c).
- **Latest allowed date:** The save moment plus 10 calendar years, to the minute, counted in UTC. If that date doesn't exist (29 February), the last day of the month is used (A6 and AC-2.6d, amended by SCR-3).

**Facts that apply to every option:**
- **The input has no timezone.** A `datetime-local` input gives a date and time with no timezone (unverified).
- **JavaScript reads such a string as local time.** `new Date("2027-03-05T17:00")` is read as local time (checked in local Node 22.23.2).
- **Plain JavaScript gets 29 February wrong for this rule.** Adding 10 years to 29 February 2028 with `setUTCFullYear` gives 1 March 2038 (checked in local Node 22.23.2), not the 28 February that SCR-3 requires.
- **The date helper formats wherever it runs.** `formatDatetime` sets no timezone and always uses the `en-AU` format (verified: `utils.ts:16-24`).
  - `useCollection()` loads data only in the browser (verified: `useFirestore.ts:29-49`).
  - Anything rendered on the server uses the server's timezone. What Vercel's server timezone is has not been checked (unverified).
- **No timezone support is installed.** Node 22 has no built-in `Temporal` (checked in local Node 22.23.2), and no timezone library is installed (verified: `frontend/package.json`).

## Decision

Option C1:
- **Conversion:** The browser turns the entered date and time into a moment using the device's timezone, and sends it as an ISO string with a timezone offset.
- **Checks:** The server checks the past-date and 10-year rules with its own clock and SCR-3's rules, including the 28 February handling.
- **Storage:** The server stores the due date as a Firestore `Timestamp`.
- **Seconds:** A direct request with seconds or milliseconds that aren't zero is refused.
- **Early checks:** The browser also checks both rules early, for quick feedback. The server's answer wins.
- **Display:** Dates are formatted in the browser with `formatDatetime`. The `en-AU` format is accepted for every viewer.
- **Edit view:** It is drawn in the browser.

## Rationale

**Why C1** (`design-notes.md`): "It matches the other time fields, sorts correctly for ADR-D, and needs no new date library."

### Rejected options

**C2: store an ISO 8601 UTC string in one fixed format**

*The option, stated fairly:*
- The conversion is the same as C1.
- Testers can read the value as-is in the Firebase console (P3).
- `formatDatetime` accepts a string (verified).
- It sorts in time order as long as validation enforces exactly one format.

*Reason in `design-notes.md`:* C1 "matches the other time fields" (`createdAt` and `updatedAt` are `Timestamp`s; verified: `docs/FIRESTORE-SCHEMA.md`) and "sorts correctly for ADR-D".

**C3: store a Timestamp; the server converts from the time as typed plus the viewer's named timezone**

*The option, stated fairly:*
- Conversion happens in one place.
- Times that don't exist, or occur twice, when clocks change are handled explicitly in server code.
- The server sees the time exactly as the user typed it.

*Reason in `design-notes.md`:* "C3's server-side conversion would need a new dependency for a gain the spec doesn't ask for."

**Alternatives to refusing seconds in a direct request: cut them to the minute, or store the value as sent**

`design-notes.md` records no reason for choosing to refuse over these.

**No early check in the browser**

The server alone would decide, so the browser and server could never disagree.

*Reason in `design-notes.md`:* the browser checks early "for quick feedback; the server's answer wins".

## Consequences

**Timezone correctness:**
- The stored moment is correct only if the device's timezone is right when the date is entered.
- On the day clocks go forward, some local times don't exist. The browser's parsing rules decide what those become (unverified).

**The 10-year check:** It needs its own end-of-month handling, because plain `setUTCFullYear` gives 1 March, not 28 February (checked in local Node 22.23.2).

**Browser and server can disagree:** Near a minute or 10-year boundary, the browser's early check and the server's check can give different answers. The server wins, and the refusal has to show beside the due-date field (ADR-0006).

**Seconds in direct requests:** Refusing them is behaviour the spec doesn't state. AC-2.4 says "to the minute" but not what happens to seconds, so no criterion tests this rule.

**Where dates are drawn:**
- The edit view has to be drawn in the browser. Anything rendered on the server would show the server's timezone (unverified for Vercel).
- Every viewer sees the `en-AU` date format (verified: `formatDatetime`), whatever their locale.

**Sorting:** ADR-0004's list order relies on Firestore sorting `Timestamp` values in time order (unverified).

**Dependencies:** No new dependency is added.
