# Testing and QA, Part B: run context

**Recorded:** 2026-10-04 (session start, before any measurement). Written by Claude Code (claude-sonnet-5-5) for Sajad Ali Akbari.
**Status:** setup and scoping only. No mutation run has happened. Nothing below is a result of the module.

## 1. What this run is

Part B of the Testing and QA white-paper module, run on the Task CRUD suite built in Implementation Part B. The primary deliverable is evidence about whether the module's method works. The mutation score is a secondary measurement of the existing suite.

**Rules for this run (from the brief):** change no source, test, spec, ADR, white-paper module or existing evidence. Do not install dependencies, commit, deploy, create a PR or touch live Firebase. Never read or print `.env` values. Stop after scoping for review.

### Independence and what has been seen

| Item | Status |
|---|---|
| Part A application (`mock-project part-A(Do)`) | Not read. |
| Part A mutation report, Part A Stryker config | Not read. `git diff --name-status` listed the Part A path `.../frontend/stryker.config.mjs` as a changed file name. Only the name was seen. |
| Part A written QA evidence (`white-paper/evidence/testing-and-qa.md`) and Part A's Stryker configuration | **Read during prompt preparation, before this Claude Code session started (per the brief of 2026-10-04, second prompt). This Claude Code session did not read either.** The person directing this run therefore knew Part A's approach and configuration choices. Recorded as a limitation; it cannot be undone. |
| `research/modules/testing-and-qa.md` | Not read. |
| **The module text itself carries Part A's headline results** | Read, because the brief requires it. See the list below. |
| `white-paper/evidence/implementation.md` | Only lines 127 to 255 (Part B: B1 to B3) read. Part A (lines 1 to 126) and Part C (256 onward) not read. Their headings were listed to find the boundary. |
| `.claude/rules/tasks.md` | Not read (not in the input list). Referenced by the plan and ADR-0001. |
| `testing-and-qa/prompts.md` (untracked, pre-existing) | Not read (not in the input list). Hash recorded in section 6. |

**Part A numbers that the module text puts in front of the tester** (all in `module-under-test.md`): 124 tests in 8 files; Stryker mutation score 83.4%; 83 survivors split 40 real gaps, 29 equivalent, 9 styling only, 5 tool artefacts; the Stryker worker-thread time zone failure; the "tests only ask easy questions" pattern; a delete test that removes the first item; an empty collection name surviving; about 27 minutes, two prompts, $1.90. These can prime the classification (for example, expecting about half the survivors to be real gaps, or looking for a time zone problem). Classification in Step 3 should therefore be judged from the code and the spec, and any match with Part A's pattern should be reported as a match, not assumed.

## 2. Git state

| Item | Value |
|---|---|
| Repository root | `D:/Clients/Capstone/GROUP-19-NBN-SDLC` (the mock project is a subfolder, `mock-project part-B(Test)`) |
| Branch | `main` |
| HEAD | `d181508522fe68fd946e7b53057f6970b00d71e1` (merge of PR #46, committed 2026-10-04 00:06 +1000) |
| HEAD parents | `157da3c` (merge of PR #45) and `235324a` (last commit of the Implementation branch) |
| `main` vs `origin/main` | 0 ahead, 0 behind |
| Working-tree changes at start | One untracked path: `mock-project part-B(Test)/testing-and-qa/prompts.md`. No modified or staged tracked files. |
| Ignored files present (names only, contents never read) | `.env`, `backend/.env`, `frontend/.env.local`, `frontend/.next/`, `frontend/next-env.d.ts`, both `tsconfig.tsbuildinfo` files, `node_modules/` |
| Stashes | `stash@{0}` "On feat/task-crud-implementation-part-b: Files saved for later". `git stash show --stat` printed nothing. It was not inspected further. |
| Last commit touching the part B app folders (`frontend/src`, `frontend/tests`, `backend`, `firebase`) | `c74099b` |
| Part B project folder, `c74099b..HEAD` | **No difference.** The application code at HEAD is the code the Implementation evidence describes. |
| Module file last changed | `e0d6b71` (2026-10-03 18:26 +1000, "add testing and QA evidence and rewrite module"), merged by PR #45 |

### Tool versions

| Tool | Version |
|---|---|
| Node | v22.23.2 |
| pnpm | 11.20.0 |
| Vitest | 3.2.7 (resolved from `^3.1.1`) |
| git | 2.55.0.windows.3 |
| gh | 2.97.0 |
| Stryker | **not installed** (no `@stryker-mutator` folder in the root or `frontend` `node_modules`, and `pnpm-lock.yaml` has no `stryker` entry) |
| OS | Windows 11 Home 10.0.26300, Git Bash and PowerShell |

## 3. Inputs

All paths are relative to `mock-project part-B(Test)` unless they start with `../`. SHA-256 is of the working-tree bytes (CRLF on this machine, per the repo's `* text=auto`). Full hashes are in section 6.

| Input | Read | Notes |
|---|---|---|
| `../white-paper/modules/testing-and-qa.md` | Fully | Snapshot in `testing-and-qa/module-under-test.md`, byte-identical (checked with `cmp`) |
| `../white-paper/evidence/TEMPLATE.md` | Fully | |
| `CLAUDE.md`, `.claude/rules/development-workflow.md` | Fully (loaded as session instructions) | |
| `frontend/CLAUDE.md`, `frontend/AGENTS.md` | Fully | |
| `package.json`, `frontend/package.json`, `frontend/vitest.config.ts` | Fully | |
| `docs/TESTING.md` | Fully | |
| `task-crud-spec.md` | Fully | Gate 1, amended by SCR-1 to SCR-19 |
| `docs/adr/0001` to `0006` | Fully | All Status: Proposed |
| `implementation/plan.md` | Fully | |
| `../white-paper/evidence/implementation.md` | Part B only (lines 127 to 255) | See section 1 |

## 4. Historical handoff text that differs from current Git state

The handoff is the Implementation Part B evidence (B1 to B3) and `implementation/plan.md`. Items marked **Matters** change how this stage should be run.

| # | Handoff says | Current state | Matters? |
|---|---|---|---|
| 1 | Work is on branch `feat/task-crud-implementation-part-b`; HEAD `c74099b`. | Session is on `main` at `d181508`. The feature branch tip is `235324a` (one docs commit after `c74099b`). App code at `d181508` equals `c74099b`. | Yes. Anything that refers to a branch or HEAD must use `main`/`d181508`. |
| 2 | B1 and B1a: "no PR is open yet" / "Not opened yet. It waits for the final diff review and sign-off." | **PR #46 is MERGED** (2026-10-03T14:06:01Z, merged by `W1ll1am18`, base `main`). It has no recorded reviews and an empty review decision. | **Yes.** See section 5, entry conditions. |
| 3 | B3: "I did not do Part A" is ticked; the line "Result: **Pass with changes**" has an empty checkbox (`[]`); signed "Sajad Ali Akbari, 3 Oct 2026". | The file at HEAD is unchanged in that respect. The result box is still not ticked. | Yes. Whether Implementation was formally approved is not evidenced. |
| 4 | `Signed-off-by:` "is not on any commit yet: I will add it myself ... in one rebase before pushing." | The branch was merged with 19 commits. The rebase is not evidenced. Not checked. | Minor. Not needed for this stage. |
| 5 | B2 row 2: at HEAD `c74099b`, `test:component` is "14 files and 767 tests", `test` is "2 files and 5 tests". | Run today: **14 files, 778 tests** (frontend), 2 files, 5 tests (backend). App code is identical to `c74099b`. | **Yes.** The 11-test difference is unexplained. The plan's WP12c row says "12 tests added and 1 removed", which would give exactly +11, so the 767 may predate WP12c. That is an inference. Use 778 as the baseline. |
| 6 | B1 and B2: "18 commits, 47 files". | The PR carries 19 commits (the 18, plus the `235324a` evidence commit). Not counted further. | No. |
| 7 | B1a: "Mid-run `pnpm` was upgraded from 11.20.0 to 12.8.1 ... its new shim broke the nested root scripts". | `pnpm -v` now prints 11.20.0. `pnpm run test:component` and `pnpm run test` both ran. | Yes. The tool version differs from the run it describes. Record 11.20.0. |
| 8 | Plan header: "Status: approved, not started", every work package box unchecked, "No commit or PR until asked." | All work packages are merged. | No. The plan is a historical document. |
| 9 | Plan, WP6: the ADR-0004 paragraph is dated "(2026-10-02)". WP11c: ADR-0001 note dated "(2026-10-02)". | The ADRs carry "2026-10-03". | No. |
| 10 | Plan, "Deploy steps for later": rules deploy automatically on push to `main`; the tasks index is deployed by hand; `CRON_SECRET` set in Vercel. | The merge to `main` has happened. `gh run list` returns no workflow runs, and `../.github/workflows` does not exist at the repo root, so no automatic rules deploy is evidenced from GitHub. Whether the rules, index or secret exist on the test project is **not known** and is not checked (no live Firebase access). | Yes. See live-integration list in section 7. |
| 11 | B1a "CI results": CI "cannot run for this layout". | Confirmed. The PR's status checks are Vercel only (a deployment status, and Vercel Preview Comments). There is no test CI. | Yes. The green-test claim rests only on local runs. |
| 12 | Plan: "Skills in `.claude/skills/` don't load", MCP servers did not load. | Not checked this session. Skills and MCP servers are not needed for the measurement. | No. |
| 13 | Evidence says `pnpm audit` fails with 30 vulnerabilities. | Not rerun. Out of scope for this stage (Security gate). | No. |

## 5. Entry conditions

The module says: "Entered from Implementation when tests are green and a PR is open. Exits through the Security gate." Its Governance section adds that Implementation "already requires a named approver; this stage inherits that." Step 1 adds: "A failing suite does not reach this stage."

| Condition | Met? | Evidence |
|---|---|---|
| Implementation finished | **Yes, by the author's account.** | Implementation evidence B1 to B3. Result checkbox is not ticked (row 3 above). |
| Tests are green | **Yes, verified today** at `d181508`. | `pnpm run test:component`: 14 files passed, **778 tests passed**, 34.8 s. `pnpm run test`: 2 files, **5 tests passed**. Run once, no test or source changed. `lint`, `typecheck` and `validate` were **not** rerun. |
| A PR is open | **Not met as written.** | PR #46 is merged, not open. No open PR exists for this work. This run did not create one. |
| A named approver exists for Implementation | **Not evidenced.** | PR #46 has no reviews and an empty review decision. It was merged by `W1ll1am18`. The only sign-off is the author's own, with the Result box unticked. PR #45 (`APPROVED`) is a different PR (module and Part A evidence). No approval is assumed here. |
| Independent CI result | **Not available.** | No workflow runs; Vercel status only. |

**Verdict: the entry conditions are partly met.** The suite is green, so Step 1 can proceed. The module's own "PR is open" is false, because the PR was merged before this stage began. The module's own governance rule for the decision record ("goes on the pull request alongside the mutation report") then has no open PR to receive it. This is a finding about the module, not something to fix in this run. A decision on where the Step 4 record goes is needed from you (see section 8).

### Deviations from the module's entry conditions (practical trial)

Recorded as deviations, not as blockers. Measurement proceeds because this run tests whether the workflow is usable, not whether a change may be released.

| Module says | What is true | Handling |
|---|---|---|
| "a PR is open" | No PR is open. PR #46 was merged before this stage began. | Deviation. No PR was created. The Step 4 record location is undecided. |
| Governance: an approver other than the author, inherited from Implementation | No independent approval is evidenced for Implementation. The only sign-off is the author's, and the Result checkbox is unticked. | Deviation. No sign-off was invented or implied by this run. Step 4 stays "pending, named person: ____". |

## 6. Hash manifests

**Correction (second session):** the manifests were captured **after** the entry-check suite run (section 5), not before it. They establish integrity from that point on, for the work that follows. They are not proof that the entry-check run itself left the files unchanged. (The earlier `git status`, taken before the run, showed no tracked changes, and the tracked tree matched `HEAD`, which is the only evidence for that run.)

Taken after one read-only suite run (the entry check) and before any setup or measurement. Re-run the same commands at the end and compare. `git ls-files` selected the files. The blob id is the first 12 characters of the Git index id, which does not depend on CRLF.

To verify later (from `mock-project part-B(Test)`): extract the first and third columns of a manifest block into `sha256sum -c` format, or re-hash each listed path and diff.

Manifest A is every tracked file under `frontend/src`, `frontend/tests`, `backend/src` and `backend/tests`: **79 files**. Manifest B is the tracked configuration, rules, scripts, docs and spec files that the measurement must also leave untouched: **60 files**. Manifest C is the input documents.

Manifest A digest (SHA-256 of the manifest text): `ea7fc0fc193468e7651a37db92285bc3cba8801309f0a49a5999f1a0eb67f8e9`
Manifest B digest: `09243648e8a04661ccc81d47375be6b4a949f7c96db964a0af059375f4328764`

### Manifest A: application source and test files (sha256, git blob id, path)

```text
791b1b9578481b023970233a128251abb9cb9562232a99657f09d79615144c16  8f91ba11bcae  backend/src/app.ts
0c59f68f7d86d789747d8aab891430e31ce7e1f4db8cdabdac99755d003258f5  610fc03d92c8  backend/src/index.ts
f7bd9b8c68c41c3e7ccd1b197f8553f4c36d5bbf50c3929e80b8b344941a93d9  4deec145222e  backend/src/lib/errors.ts
3a7afd1a7c338daf04d441d81f559e479bd697d3f94b7365433e1152e4efd29a  93d4de5a6671  backend/src/lib/firebase.ts
0db8b5cb2b0e708a887dac3a6aaeef81864a2230927f6318a89dae5c49b49a31  ca1cf04d0bb2  backend/src/lib/zodConverter.ts
0928cc8dca6afbcb6c1bc341a32ba9550f85fe59b4d51edcdd80302cd7512b81  0ee11839f08c  backend/src/middleware/auth.ts
37a7bb9d67f8349c70d81284449cf860669bc14ccc9487528c443645c45d459d  1f0d87969015  backend/src/middleware/errorHandler.ts
93dac835da5277c62974bc59eb237810923ba4f0837367ba97ed3a364f09dc7b  aec6bb17a699  backend/src/routes/health.ts
3767e9db2b04c953819d68c2943ad4dedeee0d1d8dfb82e9ed67b61de06c3861  e679b134afa1  backend/src/routes/index.ts
b1da6ba74965bd963be3cd720f67bae963d4fefd1ac4123792e5163117f125a9  0c2d39253f07  backend/tests/setup.ts
db65f843db84ee538d78e6a266c79d09a3bed2fbd2a55c625984a73b51481bf8  7c42ccbfc176  backend/tests/unit/conventions.test.ts
22a07018f36f5ec4cfc147e70c78c40afc2edaf3e1244f3d87660d6c77121027  0b314d514c6e  backend/tests/unit/routes/health.test.ts
69858ae65a439ba1b46d10014c0ba8754e5adeda528bae528a4caa41394b4d62  abaee7c5fe65  frontend/src/actions/auth.actions.ts
613c320bc7f8e694802bda196a10c342ff0ca96f8fb38532a2c1d4e329964b5c  7f93acaffbac  frontend/src/app/(auth)/auth/signin/page.tsx
b34a26949d0ea7d491f63943e344a5499754e08ee2721fc3fd100316d669b4ab  511c6f8f0bf2  frontend/src/app/(auth)/auth/signup/page.tsx
ab45713b5fd43bfb13a4e3c300dce0408eb401a3258060216e6cabdfc2c6c947  a2c68a21afa1  frontend/src/app/(auth)/layout.tsx
5a79f7a380dc0f69e759ada0f77c0503d7f2af490b87146060bf4e69f852570d  7653f77c4f3f  frontend/src/app/(dashboard)/dashboard/page.tsx
bc3e58146d36312f3be81dfe3b02a36a708b66097ea489bad77848b74b89743f  378f63bbfdf8  frontend/src/app/(dashboard)/layout.tsx
9c5e41f5c8d7df4aea4e5548dac57493eddf7a2c678999b5bd821e528ddb4076  3884334a1952  frontend/src/app/(dashboard)/notes/page.tsx
4623ae5b14b31c57997e89f9ff3f87f7be0289020ea41ae7e3184a8ead7dfe03  10e947284092  frontend/src/app/(dashboard)/profile/page.tsx
7791e41cda8d263642b8fe965241233138c22f84bb7881f23cd378e36a9dba22  17f46991f78e  frontend/src/app/(dashboard)/settings/page.tsx
2d962279e8d169e61417cd0bc14b8e6483878ffa2f1eb8c0a56b1446361c2fc2  9923323b5555  frontend/src/app/(dashboard)/tasks/page.tsx
827f0d33e78f06b3430f20943595e3608edf96d301e6d0423946a2e7c7978a08  36f12dfbe1c4  frontend/src/app/api/auth/session/route.ts
927ee2ce76bffd9c90747bee7bc9bee9e2c11eb264166b21e83588bfdf90586c  f31a829bba09  frontend/src/app/api/cron/erase-deleted-tasks/route.ts
2b8ad2d33455a8f736fc3a8ebf8f0bdea8848ad4c0db48a2833bd0f9cd775932  718d6fea4835  frontend/src/app/favicon.ico
94d307fb925a3264dd331975b5e17170b1d887f361669cf839bdf37cc7a40db8  a2dc41ecee5e  frontend/src/app/globals.css
6c000d03c179b3942910036a2b8288811c4a68946b2c6d34d68a4e53b9f8eee8  9fd206fae62b  frontend/src/app/layout.tsx
36ba56c5209bebf59da787406bfb1e01e5eb52866fa2d623c3e9f6de4ac7d8c8  72bae611f95f  frontend/src/app/not-found.tsx
6f5c120939f1f97a194df491714f40c9500e75030c994186820e9e42e82d4d5a  11625fa03578  frontend/src/app/page.tsx
56c9bc6c1ff9ae293bc2125cfd3f0f4815aa223b48ffc9177cf3e7b8c7f07226  5d7471475357  frontend/src/components/layout/DashboardShell.tsx
2b06763f76c6c0dc60377981b4efa90cea528cee6b4adecc0a7da7d90ed113d5  70f62105a47f  frontend/src/components/layout/Navbar.tsx
2acd852d62f7e994cd442f5fa8dd0938e8656088d4d2af88bf3a6422d7ec78c6  3ee62847f6cc  frontend/src/components/layout/PageHeader.tsx
55458d00edf0f4c424838a53448470e0d890491dc8c353c21d29661933a043bf  a187faa137af  frontend/src/components/layout/Sidebar.tsx
1fc3186dc68578e3a5c8ed829789af794a00ac97a587257fa4d52012de3d9783  882eb84880bb  frontend/src/components/shared/EmptyState.tsx
b3ab2adce03cd6ed90e77ef00cd6174c86235ef3de27178a3e1113f16e34c6eb  47271922a92d  frontend/src/components/shared/ErrorBoundary.tsx
0b610708e2ee7ec4b83e7a9214319e85fe2a338d1818d95ce16f01049c18dfe7  cf04ae22828c  frontend/src/components/shared/LoadingSpinner.tsx
9e48897fac39e0a03f0bd04ba870cb2ed2f0386138fc18d6c353f187a8c71921  62eea65a3e7e  frontend/src/features/example-feature/types.ts
358809cc2fc0557195c4fdd5fd7d978e63bcec5105cadfd8feae2defd73fa36c  e026dcb22537  frontend/src/features/notes/actions/notes.actions.ts
7c0fc6bb9879cef3d4c7bb501a147f2494c5cd07b08ac39b538d1684244accc1  55cc4ed7008f  frontend/src/features/notes/components/CreateNoteForm.tsx
d90d291a9a50cc4844fb1ad6c577d9b1db8582f1b09d0cc7e8924b193bb62f85  1553d513b45b  frontend/src/features/notes/components/NotesList.tsx
d0f0fe642e56a2c4bc8e0da1a27ccef4359745f2de2618f195d29e9a05009e42  cd5a7c1eff4e  frontend/src/features/tasks/actions/tasks.actions.ts
287c00d83b0a1a56c785413b284552784d3ac4b04eae486205e2de0ae7df03f0  924d761a2414  frontend/src/features/tasks/components/CreateTaskForm.tsx
ea629e98d68566b51720e137f1fe75869d6dd3784fb0a6c76b35d6fb83223be2  acb2deee8c9f  frontend/src/features/tasks/components/EditTaskForm.tsx
9a8b5a4e18764ca988bf97e690d01a5a8a0227c49a62117ffb265046cdc633de  09a92760f81f  frontend/src/features/tasks/components/TaskItem.tsx
51f2c34ec3a72b09edd1f1d36223dad054c8af7cb178db85ea915f740523b63d  0f4cbb9aec3e  frontend/src/features/tasks/components/TaskList.tsx
3975888e1fb15f07927f33b2f76a6ed6d254bb4158a1dc3dcffc631fa42a9725  8a52a2e9d53a  frontend/src/features/tasks/hooks/useTasks.ts
f8d2abd089caa79797c05f02b7e04814411a3c6e23ee066a850586e830fce423  616aaa871f6c  frontend/src/features/tasks/lib/due-date.ts
6ce3629377d4e7409a86d2d4a0331915412b40fd5f1b6e4ce36c6e5fc42ae915  c617e7fec8a0  frontend/src/features/tasks/schemas.ts
cbdd5ac2c5f7f81c564dfc6d8108079b177898ba8a0525f4f85d7a711907f596  507f95a2770e  frontend/src/features/tasks/types.ts
ba2bc9579747c72043107e9bc51c59c785e3aaff811af1a979860611a153703e  7ac0a392839d  frontend/src/hooks/useAuth.ts
f42e23ddaa3484bb56e437f022223e1211608a971f0a8f1729fc3bd064f410cb  081bde31811c  frontend/src/hooks/useFirestore.ts
590d30ec2eaa64d0e956b825023353d974bf57427be93d4585f65ebe35146552  bfd26627d76b  frontend/src/lib/firebase/admin.ts
c38e61ff0507088682a073cf159c83f25fdc21e9dd96fd952f1e464598e3b6af  21ef1670c17a  frontend/src/lib/firebase/auth.ts
cc1613f4158f859f14d94ffa50bdf14b8de6e5c072d2549b8bff0305e79409bc  30b620a9f23b  frontend/src/lib/firebase/client.ts
9576252d7c9d963abe15a90ba8b407470131779f22154827e3924e49017c4648  7d1693858288  frontend/src/lib/firebase/firestore.ts
3cfeb400c46dec31af4c645849f2301753cfa189156e247a29c1d45faa8eff98  6bf79139841f  frontend/src/lib/utils.ts
73b01368f4c08c327799c330011393a6130c4f1a03a20f4631c87f2a5f512d18  d953d016dd3a  frontend/src/lib/validations/auth.ts
c66387bacfb9bd909c38772acfd235ccd672b3806ae83ed2e4482768e3673746  f0989b1b7d3e  frontend/src/lib/validations/common.ts
86871181491882ba1f48669bfaa72b1753d4133931c4e26d8daa74abb091c94f  34d5392870ac  frontend/src/providers/AuthProvider.tsx
e62df0fa496e1a31ef504b7c015bd319028906a72183c97636a82fb8add80d3c  96f97b13e16b  frontend/src/providers/index.tsx
75e0b9684e1f9205e8db8d3d26ce6edb021871d994079c1c10cb71fd4215b10d  56ff279c671c  frontend/src/proxy.ts
86e982b3209c19330ebd1bcd6ed8b38f6b024c233ac4454f24886a6c94277f0b  12b21ab312a7  frontend/src/types/auth.ts
383e3efc1c36b0e8643fe9ba5e696387c59096e2e8fa020f672b3720ea7a0c6d  a6ae58089019  frontend/src/types/firestore.ts
c29e4f72b260576afe8a3397d118f4723bf791e9a07023c5295460044ccee813  81868ab97665  frontend/src/types/index.ts
e18dc8d1c6b60a4d00a5927abec82d7e05c8a49cc8706b9dcf9a7811d041d285  08e174d9769d  frontend/tests/setup.ts
6f08aee54dc3a6b7408ed8a781dede6ecfc02d004c0df628f5b52aa3672d97c0  2565ba4447e1  frontend/tests/unit/app/api/cron/erase-deleted-tasks/route.test.ts
69195200c7522fad7e02fc8e4c3310628bbbc51824e1dd378bb1a97c207e1027  603d7fb13dc4  frontend/tests/unit/components/layout/Sidebar.test.tsx
902137a9f38549767c9ed552177d4c754bba5e49aba02dcf7be2748f077876f5  de592a520c22  frontend/tests/unit/features/tasks/actions/tasks.actions.test.ts
e0c48bc58511f63ac0967c922eb2cbea76fc36129de2426b5a41feae0d44b9f6  eb5ea6018d2e  frontend/tests/unit/features/tasks/components/CreateTaskForm.test.tsx
73c29f4756b1e87c6bdbbda82d81f33866709d0c41defa0412cb3b64085ee1f3  8377a1252df2  frontend/tests/unit/features/tasks/components/EditTaskForm.test.tsx
ff8c31837ea0912120b1a297a3e22ad25ec75a7361b8187f74390b3475743171  eb38ea3f8d7f  frontend/tests/unit/features/tasks/components/TaskItem.test.tsx
01bb1b40eaff7e476c68a301ba3b8c5ba44208b80f61d4a828350bd5dbb96452  0c7848c38350  frontend/tests/unit/features/tasks/components/TaskList.test.tsx
e7664f9f422584f9fba179d5a20698d2cf882bb58f169ae232edee90512e621f  4d3c1bcfd0b2  frontend/tests/unit/features/tasks/hooks/useTasks.test.ts
cfbc4e4874ed8018a433d6b2aaf249f1149fbd6bae94664e10771c91a6887001  d715b1a510a7  frontend/tests/unit/features/tasks/lib/due-date.test.ts
b55e6ddbfe305aa73f9188743b90ce19d3a8ad883e0329439a81adbf3a4c857d  6b71d0dbd74b  frontend/tests/unit/features/tasks/schemas.test.ts
f79a2bb3fb100b782edaf57743ffac21f6cd58cd1fc9ee69b433c2528b1cf75e  15a8b147ce36  frontend/tests/unit/firebase/tasks-rules.test.ts
ea05a3dddea7b41106b71b16cc1dfe2c7871d5e8dc9dc99c156f54e3304f3f5d  e987666f7138  frontend/tests/unit/hooks/useFirestore.real-queryequal.test.ts
721c291b40a8e7b7111a1b2be833325226d0dfa9fd63a480c4c1947f27d1704d  9a72df6cc23e  frontend/tests/unit/hooks/useFirestore.test.ts
1b7c424519066e10c305d8dda7222960208470f5eb01aaf75efd575caac12420  6590ec2f48bf  frontend/tests/unit/lib/utils.test.ts
```

### Manifest B: configuration, rules, scripts, docs and spec

```text
c66c490c0858e8594f35d110b8eb5bcb38d839b2535aebda5ea5fe024a8501ef  dd88bfb2ccf4  CLAUDE.md
d2b6b16f889575e06bfc8b7d39db870c12be9087fd24ce25266ee6049a8ae4fb  238d4d9364cd  backend/.prettierrc
c3b9293e6fe1ce6a09739858cea764957ab0de109de146cff938ec45b317d21f  37361da6fc0f  backend/CLAUDE.md
565b2340d3f30f3244ad2726ea0ef4105f193cc0ee13b3895ea94f8a4be84831  e0c587fb24b1  backend/eslint.config.mjs
424e6f4c4ce1e59ee9370fc127e1cc26d964af798785f381bb8d644f71d5c4d5  dda4255ac667  backend/package.json
f8152a2cf7a7a6bd7b22f4889dc374b1548465e4981fc2fa6d803b4949e0902a  1b2f785ff3ec  backend/tsconfig.json
93751837177688a0e4bbeb15cb18b43a2e38c9f721f71637e702fc1261f3e7ac  49cc8ccec215  backend/vitest.config.ts
64dee053c0329a16fefd5470438c2c449dbf8040d8558b4acded09ffc71fd0df  30c5cdfd6de4  docs/ARCHITECTURE.md
7db5786f072a2bf67e1ec8e07a8d5ccee57b81fe8d176139dbb0d970c4a6fef5  cb64f872f3e2  docs/BACKEND.md
22edc9bb2b1fbfdabea865a34db774a5307192187669fc644269d912eaf7a2c7  155f90054c11  docs/CI-CD.md
49ba6eceb47cdae173b6dc4123275a5d82cd0ee195cb9641ec207575b99e41f9  8b1a370ec7e0  docs/COPY-PASTE-FEATURE.md
bbb51895b80611c1a3f5bd708d10b977a7a62221def25eb37a13b727e079196e  e2b181b2ddbe  docs/COPY-PASTE-SETUP.md
c70d920e17040f2412fb2d6d25f5ab78cf4d2c1902d8d3925fc9019b5398fc79  72542d42637f  docs/DESIGN.md
92a93725ae27883fc7cc07721542c5773dd77a38483e8307dad2f6b1ef175463  967443e56fd0  docs/ENV-VARS.md
105578e17511613eaebc493776a4518bc345b0df8c4250e5b80a5af085904ede  844d83d15fe6  docs/FIRESTORE-SCHEMA.md
9eef84692a3fe0aab54f9435bc312aeef630950e55d7ef62cbfbc094c687a18c  83e2420873d0  docs/FRONTEND.md
b9ca6719f82142e4e7c617b65e48ef8d1061c132cd31af33c9854ca0de736da3  c414b4eddffa  docs/GIT-WORKFLOW.md
9a1cfd5f663587f3cc7b7b3fd333e85ab840f613c47bec3d9c61daa0f74d9bfb  6db0586e3099  docs/GUIDE.md
ba6b7ea3345fb1c4e431a588b38ef4a26571321f142b8893e8c51e38fd1b4fb8  f0474b1d7348  docs/SECURITY.md
ede98ce3eafd35281b663403e513dc51d6c7c619f5c95109f38c79e2b51b4197  6e249baf1f7e  docs/TESTING.md
29a739e68793050ec5a3db7b1ef84370ff47bdfb9a0e95e20e47ba4a4fb40e3d  0df7a9172021  docs/TUTORIAL-WALKTHROUGH.md
21007d5a6e6ebe1213e87f95c57ad9a962812b5de3c04355c5949fdbe1cf2721  ad2827d09033  docs/adr/0001-task-erasure-job.md
b1f9479ce534924ed05de15af9dcff3d93f1e8dba7b9594e5f5d7b0272469879  bc5d94088f19  docs/adr/0002-task-data-routes.md
ac124d030f387dd4c16951a64298a1e7c0df19cc5e46a78943d4b45b96336e5b  bd724ab2d400  docs/adr/0003-due-date-storage.md
9933f2db55f301d38f6c59891d7b358248dd6881d3aaa7bdea7d121d8b97d079  4de08e3c606f  docs/adr/0004-task-list-query.md
f58d4bde5f13f508002795dfa73260678550aa1c7678062b452617dd2a5553fb  61e9ed428491  docs/adr/0005-task-writes.md
9f0ba3a5100d83359daffe1850847dc072520940ff2aa9909a0008c336728a91  0446f845658f  docs/adr/0006-task-errors.md
a48f422a618447583b9b9a9a5ab9ea98df7f876d52d5664115c3833c6f5a2db4  5cc9eccb01c4  docs/garage-boilerplate-guide.pptx
faa1985c908b791812e48b105e5996d7b43aecebf0fd55f93da7aa2472511ded  be27b4f4b732  docs/notes-feature-tutorial.pptx
171550cf11787feccee002b3fe286b22c3c0ec6efc1d4615577470a88f4d40e0  9df424fb9dd2  firebase.json
c58d18d8039fb96783a54ef2b46a3868996761531129a81e2396263abbefd795  f21d843bfb58  firebase/firestore.indexes.json
cc1728ed35e4d5eaef36c5929e18b29fe308743154ef36e74fcc3d3b6ad3ff87  563ce5c49cfc  firebase/firestore.rules
cfdbd5a321f3ba279e434c025fc9a44bf2d3bd3a1af5affb8429d79bd18af054  5ef6a5207802  frontend/.gitignore
174e1ce886006300ffbb34f9a7d6c0424c784c4b8ea852fb88929e5d682a667f  a9727bfcfb7e  frontend/.prettierignore
a8de69429f832377a1f09c468187242da951bd2402e6cbe9a1c3d7ab503208a7  e999e95bc054  frontend/.prettierrc
ceaa13d29db2c2ce408ba5d00fb6c5cccc0eadeb336cf076cfea699f985b9fd8  8bd0e39085d5  frontend/AGENTS.md
4ca1035f31f1e41950481c53c3ab31ea14b90fe32d211ba5351709833730a8d1  bf880763c699  frontend/CLAUDE.md
3b3ed71ebf50e973209bc634f6849e8ecf235a6c0686c285e1f36af5caa1c2cc  e215bc4ccf13  frontend/README.md
275a07c13fc7c83a652efcfa9fb6a207c451a2f5088e6793415ce44281285720  05e726d1b420  frontend/eslint.config.mjs
bfd01aa5f959584da363c8ef2a184b2153eaabffb4dc09db3db9996f0de0826a  02711c10bb54  frontend/next.config.ts
49a687c3237a3aaa5acb85c43e4c6f9e833f0cf21a11530d80c3d56755b7892f  408a89f491e0  frontend/package.json
7b299d3d3b16699ddda397c0b2373b3af4f25f8fc9ccc9b3d9e64ef083bc1c21  61e36849cf7c  frontend/postcss.config.mjs
2b67812c325c199a02536cdbeea0c593a72f707d323b72ee3e08dbab06753bd4  004145cddf3f  frontend/public/file.svg
b614b9bf183925957661ac851498fe1d8029fd43a62fbfed86f9e2624a57e7cf  567f17b0d7c7  frontend/public/globe.svg
55995dfad6ecb4945a1e856ddca03c5e16aa5bf13fd21b4df6a74ae79357bcfc  5174b28c565c  frontend/public/next.svg
f081337b2fee635b455b63275406a3e7f39d6a014e25ad90dab5a67e62a12ac4  77053960334e  frontend/public/vercel.svg
644768c4aaeb4767bce293344eeb0c125fb804a94d801440424072202d85e3a1  b2b2a44f6ebc  frontend/public/window.svg
e4610bb0e74d94d66eb3b903750f36f50bee5871c7c9ad83cbf1b8465403b741  bc50e89a8981  frontend/scripts/run-next.cjs
758e8b943c103d5d91944c49ffc270596a7e272bc0b96939dc904ae1b386f59c  77744cd148c6  frontend/tsconfig.json
01ebfbee4e3a8c6cdbe823fee0d2c97e8d44c0e4d75f6fa49c9fe7fcfb5d1963  6534e2563722  frontend/vercel.json
3e44710257dea09edf3e65761fb98f007255b00adc44e5d08d562ec6ec5f5af3  9ec179b0d874  frontend/vitest.config.ts
c2aba01f30c5bb0510b5f06c7e46deb5aa073a93a2230a662422d0cc668b9c70  21c0617d8380  lefthook.yml
d0e8f6a14ca6f287360530f89bca13985b114b9b37c645b4ab87d68a792e2b77  e714461fc287  package.json
5b135d130f00b1202c090092e3dc77a320d6d40dddcab57f704769d4f9ce9745  fb34043b2aef  pnpm-lock.yaml
4d8b942284137d1c000e70759b27e7a9dca666998eb87f43434d2fc9c54adc1a  b9f4cfb37b34  pnpm-workspace.yaml
e764473dbf19ca366be2c3191d76533ed3ced30148769f7e7944c72f2ce2c48f  3d7a02e3d45b  scripts/bootstrap.js
428550dc3f611bb05890fbc4ce8bf2f2acf81900ff61cd937b9b4d5574632d62  701b15bd5067  scripts/check-commit-msg.js
b8e97f06eb34ebc425e6d3c524d892c922a8b2d821155159c767308c3c8371e4  dcd708ca844f  scripts/sync-env.js
ff2b8d79dd93f12bd688863081c532f31b0b4a907d80ec16d38b263400d79937  18cf69763741  scripts/validate-placeholders.js
63a5eef1386d2cb2f99db9ee358c95dc6959dfd940223b83b877db50f257c490  3ca1cfaaf0ad  task-crud-spec.md
```

### Manifest C: input documents

```text
190be26ebcc3851528b9adcfd3ef68b257093186012592222c1fdc267ec2c6af  ../white-paper/modules/testing-and-qa.md
c6ab6e6e987a4dd2b0e5d41018a4bf9600148f8444d4b1b5aa590140aeec7573  ../white-paper/evidence/TEMPLATE.md
ef918c2412f7f69479485ef1c89d9594f0c6f02cb73c02134bb9983b258e9ee5  ../white-paper/evidence/implementation.md
c66c490c0858e8594f35d110b8eb5bcb38d839b2535aebda5ea5fe024a8501ef  CLAUDE.md
4ca1035f31f1e41950481c53c3ab31ea14b90fe32d211ba5351709833730a8d1  frontend/CLAUDE.md
ceaa13d29db2c2ce408ba5d00fb6c5cccc0eadeb336cf076cfea699f985b9fd8  frontend/AGENTS.md
d0e8f6a14ca6f287360530f89bca13985b114b9b37c645b4ab87d68a792e2b77  package.json
49a687c3237a3aaa5acb85c43e4c6f9e833f0cf21a11530d80c3d56755b7892f  frontend/package.json
3e44710257dea09edf3e65761fb98f007255b00adc44e5d08d562ec6ec5f5af3  frontend/vitest.config.ts
ede98ce3eafd35281b663403e513dc51d6c7c619f5c95109f38c79e2b51b4197  docs/TESTING.md
63a5eef1386d2cb2f99db9ee358c95dc6959dfd940223b83b877db50f257c490  task-crud-spec.md
21007d5a6e6ebe1213e87f95c57ad9a962812b5de3c04355c5949fdbe1cf2721  docs/adr/0001-task-erasure-job.md
b1f9479ce534924ed05de15af9dcff3d93f1e8dba7b9594e5f5d7b0272469879  docs/adr/0002-task-data-routes.md
ac124d030f387dd4c16951a64298a1e7c0df19cc5e46a78943d4b45b96336e5b  docs/adr/0003-due-date-storage.md
9933f2db55f301d38f6c59891d7b358248dd6881d3aaa7bdea7d121d8b97d079  docs/adr/0004-task-list-query.md
f58d4bde5f13f508002795dfa73260678550aa1c7678062b452617dd2a5553fb  docs/adr/0005-task-writes.md
9f0ba3a5100d83359daffe1850847dc072520940ff2aa9909a0008c336728a91  docs/adr/0006-task-errors.md
827b3775ed62036d41033d0c85bdfc58ae7456ffb462f7fd6a8b7333ceedfada  implementation/plan.md
988fa1f26d6bb870bd289281b25041135ce3000a83a6f11052eb58af104d8d58  testing-and-qa/prompts.md
```

`module-under-test.md` SHA-256: `190be26ebcc3851528b9adcfd3ef68b257093186012592222c1fdc267ec2c6af` (same as the source module).

## 7. Mapping the module to artifacts

### Steps

| Module step | Who | Artifact this run will produce | Notes |
|---|---|---|---|
| 1. Run the full suite | AI | `testing-and-qa/step1-suite-run.md`: commands, exit codes, file and test counts, durations, manifest comparison before and after | The entry run above is a preview, not Step 1. Step 1 will be repeated and recorded. |
| 2. Run mutation testing across the changed feature | AI | `testing-and-qa/mutation-report.md` (score, per-file table, survivor list) plus the raw tool report (JSON and HTML) in `testing-and-qa/reports/`, and the tool config in `testing-and-qa/` | **Blocked on installing Stryker (section 8).** |
| 3. Classify every surviving mutant | AI drafts, developer checks | `testing-and-qa/survivors.md`: file, line, change, the test that should have caught it, classification (real gap, equivalent, styling only, tool artefact), and the acceptance criterion touched | Developer spot-check recorded in the same file. |
| 4. Decide | Named person | `testing-and-qa/decision.md`: left as "pending, named person: ____" until you supply a name and decision | This run records no approval it was not given. |

### Verification checks ("What to verify before accepting output")

| Check | Artifact | Method |
|---|---|---|
| 1. Are the "real gaps" really gaps? | Section in `survivors.md` | A named sample of survivors is re-derived from the source and the test, not from the tool's text. State sample size and method. |
| 2. Are the survivors tool artefacts? | Section in `survivors.md` | For files with clusters of survivors, replay the mutation in Node outside Stryker to confirm it loads and fails when expected, as the module describes. |
| 3. Do the real gaps touch an acceptance criterion? | Column in `survivors.md` | Map each real gap to AC and D IDs in `task-crud-spec.md`. |
| 4. Was anything changed to improve the score? | `step1-suite-run.md` end section | Re-hash Manifests A and B at the end and compare. Zero differences required. |

### The module's metrics table

| Metric | Where recorded |
|---|---|
| Mutation score | `mutation-report.md` |
| Real gaps after classification | `survivors.md` |
| Gaps touching an acceptance criterion | `survivors.md` |
| Tests changed during this stage | `step1-suite-run.md` (hash comparison) |

The module says not to measure coverage or test count. Test counts are recorded here only to identify the suite under test and to detect change.

### Methodology evidence (the primary deliverable)

To be added later to Part B of the evidence file (not touched in this run): the AI log with prompts, what was checked and what was accepted, modified or rejected; time and cost; every place the module as written could not be followed (so far: the "PR is open" condition, no CI, Stryker not installed, the named approver); and whether the module's claims held on a different codebase.

## 8. Scope proposal

### 8.1 Runtime files that implement Task CRUD

Line counts are from the working tree.

**In `frontend/src/features/tasks/`**

| File | Lines | Kind | Role |
|---|---|---|---|
| `schemas.ts` | 264 | Executable logic | Field rules, strict request schemas, fixed messages |
| `lib/due-date.ts` | 149 | Executable logic | Past, 10-year and ISO conversion helpers |
| `actions/tasks.actions.ts` | 159 | Executable logic | `createTask`, `updateTask`, `setTaskStatus`, `deleteTask` (Server Actions, transactions) |
| `hooks/useTasks.ts` | 63 | Executable logic | Paged live query for the list |
| `components/TaskList.tsx` | 96 | Executable logic (UI) | Reads `?page=`, loading, error, empty and paging states |
| `components/TaskItem.tsx` | 226 | Executable logic (UI) | Display, toggle, inline delete, opens the edit form |
| `components/CreateTaskForm.tsx` | 158 | Executable logic (UI) | Create form |
| `components/EditTaskForm.tsx` | 214 | Executable logic (UI) | Inline edit form |
| `types.ts` | 16 | **Type-only** | `TaskField`, `TaskActionResult`, `TaskWithId` |

**Outside `src/features/tasks/` (dependencies of Task CRUD)**

| File | Lines | Kind | Role |
|---|---|---|---|
| `frontend/src/hooks/useFirestore.ts` | 70 | Executable logic | Shared collection and query handling: `useCollection`, restarts only when `queryEqual` says the query changed (changed in WP3 for this feature) |
| `frontend/src/lib/firebase/firestore.ts` | 39 | Executable (one function in scope) | `getTasksCollection()` is lines 37 to 39. The rest is Users and Notes. |
| `frontend/src/app/api/cron/erase-deleted-tasks/route.ts` | 129 | Executable logic | Scheduled hard-erasure route, `CRON_SECRET` guard |
| `frontend/src/types/firestore.ts` | 47 | **Type-only** | `Task` interface and the other collection types |
| `frontend/src/app/(dashboard)/tasks/page.tsx` | 25 | Executable but thin | Server Component: `requireAuth()`, header, form and list |
| `frontend/src/components/layout/Sidebar.tsx` | 32 | Executable but thin | "Tasks" nav link (shared layout) |
| `frontend/vercel.json` | 8 | **Configuration** | Daily cron at 16:00 UTC |
| `firebase/firestore.rules` (the `match /tasks/{taskId}` block) | n/a | **Static rules** | Owner-only read of non-deleted tasks, all writes false |
| `firebase/firestore.indexes.json` | 16 | **Static config** | Composite index for the list query |
| `.env.example`, `scripts/sync-env.js` | n/a | Configuration | `CRON_SECRET` plumbing (not read this run) |

Shared building blocks that Task CRUD calls but did not change: `lib/firebase/admin.ts`, `actions/auth.actions.ts` (`requireAuth`), `hooks/useAuth.ts`, `lib/utils.ts` (`formatDatetime`), `lib/validations/common.ts` (`paginationSchema`), `components/shared/EmptyState`, `LoadingSpinner`, `layout/PageHeader`.

### 8.2 Proposed mutation scope (include)

About 1,530 lines of executable logic.

| Include | Mutate range | Why |
|---|---|---|
| `features/tasks/schemas.ts` | whole file | Every field rule in AC-2.x and D2a lives here |
| `features/tasks/lib/due-date.ts` | whole file | AC-2.6a to 2.6d, 2.5 |
| `features/tasks/actions/tasks.actions.ts` | whole file | Ownership, deleted-task and write-shape rules (AC-1.x, 5.x, 6.x, 7.x) |
| `features/tasks/hooks/useTasks.ts` | whole file | Query constraints, paging (AC-4.4, 4.7, 4.10) |
| `features/tasks/components/*.tsx` (four files) | whole files | UI states and messages (AC-4.9, 4.10, 6.5, 7.5, 8.1, 8.2). The module's "easy scenario" pattern is about component tests. |
| `src/hooks/useFirestore.ts` | whole file | Shared query handling the list depends on |
| `src/lib/firebase/firestore.ts` | **lines 37 to 39 only** (`getTasksCollection`) | The collection name is the case the module calls serious. Stryker's `mutate` option accepts a line range, so Users and Notes are left out without editing the file. |
| `src/app/api/cron/erase-deleted-tasks/route.ts` | whole file | The only hard delete. AC-7.7, 7.8, 8.5, D5. |

### 8.3 Proposed exclusions, each with a reason

| Excluded | Kind | Reason |
|---|---|---|
| `features/tasks/types.ts` | Type-only | Compiles away. Stryker has nothing to mutate. Checked by `tsc`, not by tests. |
| `src/types/firestore.ts` | Type-only | Same. The `Task` shape is checked by `typecheck`, and indirectly by the tests. |
| `src/app/(dashboard)/tasks/page.tsx` | Thin composition | Convention excludes `src/app/` pages from unit tests (`frontend/CLAUDE.md`, `vitest.config.ts` coverage excludes). Survivors would measure the convention, not the suite. Its redirect (AC-1.1) is a live check. |
| `src/components/layout/Sidebar.tsx` | Shared layout, one link | A pre-existing file with its own small test. The Tasks link is not task logic. |
| `src/lib/utils.ts` | Shared utility | `formatDatetime` is used for display but is pre-existing, with its own test, and mutating it would measure a boilerplate test. Can be added if you want display formatting (AC-2.5) inside the score. |
| `src/lib/validations/common.ts`, `src/lib/firebase/admin.ts`, `src/actions/auth.actions.ts`, `src/hooks/useAuth.ts`, shared `EmptyState`, `LoadingSpinner`, `PageHeader` | Pre-existing boilerplate | Not changed or authored for Task CRUD. Their behaviour is mocked in the task tests, so survivors would mostly say "mocked". |
| Users and Notes parts of `firestore.ts`; all Notes feature files | Other features | Not Task CRUD. |
| `frontend/vercel.json`, `firebase/firestore.rules`, `firebase/firestore.indexes.json`, `.env.example`, `scripts/sync-env.js` | Configuration and static rules | Stryker mutates JavaScript and TypeScript. The tasks rules have a static test (`tasks-rules.test.ts`). Weakening them by hand (rule variants) is a possible manual extra, not part of the Stryker score. `vercel.json` is checked by the route test. |
| All files in `tests/` and `tests/setup.ts` | Tests | The measurement subject, never mutated. |
| `backend/` | Not used by Task CRUD | Cloud Functions are not deployed (free plan). The backend suite is run in Step 1 as part of "the full suite" but has no task code. |
| `.next/`, generated files | Generated | Not source. |

### 8.4 Behaviour that unit tests with mocked Firebase cannot show (live integration)

These will not appear in the mutation score as survivors and should not be reported as passing. They need a test project and the prerequisites P1 to P8, which this run does not have.

- Deployed security rules actually refusing reads and writes (AC-1.2, 1.3, 1.5, 7.3, 7.6), and the admin role and claim cases.
- The composite index and Firestore's real text and time ordering (AC-4.4); how a range filter treats `null` (the erasure route re-checks in code, but the live behaviour is unverified).
- The real Admin SDK write against deployed rules; transaction retry behaviour.
- Real authentication: session expiry, revocation, redirect (AC-1.1, 1.6a, 1.6b).
- Timestamps and clock skew on Vercel (AC-7.2, 8.7a, 8.7b), the Vercel cron (GET, preview deployments, the secret header, time limit) and AC-7.7 and 7.8 end to end.
- Real browser behaviour: device time zone (AC-2.5), daylight saving, focus, keyboard-only use, screen width (AC-8.3, 8.4), the real toast, two-tab live updates (AC-4.11, 5.5), 1,000-task paging (AC-4.7c).
- `next build` with real environment values.

### 8.5 Blockers and open decisions for you

1. **Stryker is not installed, and installing is forbidden by this brief.** Step 2 cannot run until you decide how to proceed. Options: (a) you approve `pnpm add -D` in `frontend` (modifies `package.json` and `pnpm-lock.yaml`, which would break the "nothing changed" hash proof unless those files are excluded and the change is reverted afterward); (b) an install into a throwaway copy outside the repo; (c) a one-off `pnpm dlx` run. Whichever is chosen, `pnpm install` previously caused the `prepare` script to run `lefthook install` and write files at the capstone root (Implementation evidence B1a), so the install should be run with scripts disabled (`--ignore-scripts`).
2. **The module's entry condition "a PR is open" is false.** PR #46 is merged. Where should the Step 4 decision be recorded? Options: a comment or description on a new PR for the Testing evidence (you would create it), or only in `testing-and-qa/decision.md`.
3. **A named approver for Implementation is not evidenced** (section 5). Step 4 needs a named person who is not only the author. Please name who decides.
4. **The 767 against 778 test count** difference (handoff row 5) is unexplained. I propose treating 778 as the baseline and noting the difference in the evidence.
5. **Time zone.** The module reports that Stryker's worker threads cannot change time zone and that a test passed under Vitest but failed under Stryker. The Implementation evidence says the date tests were run in five time zones. `vitest.config.ts` sets no time zone. Setting `TZ` before Stryker starts, not editing a test, is what the module did. Whether that applies here is unknown until the first run. I will treat it as a possible tool artefact and not change any test.
6. **Vitest version.** `^3.1.1` resolves to 3.2.7. A Stryker Vitest runner must support it. Not checked.

## 9. What this session changed

Created in `testing-and-qa/`: `run-context.md` (this file) and `module-under-test.md`. Nothing else was written inside the repository. Temporary hash files were written to the session scratchpad outside the repository.

Commands run: read-only `git` queries, `gh pr list/view` and `gh run list` (GitHub reads, no writes), `pnpm run test:component` and `pnpm run test` once each (Vitest may write a cache under `node_modules/.vite`, which is ignored and is not source). No install, commit, push, PR, deploy or Firebase access. No `.env` file was opened.
