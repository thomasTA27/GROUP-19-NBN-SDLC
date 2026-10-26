# Usability Test Session: Bao Nguyen Le

| Field | Details |
|---|---|
| **Date** | 15/10/26 |
| **Time start** | 3:41 pm |
| **Time end** | 4:39 pm |
| **Duration** | 58 min |
| **Tester** | Bao Nguyen Le |
| **Status** | Student, Junior Developer |

## Specifications

| Item | Details |
|---|---|
| **Tool** | Claude Code (subscription plan) |
| **Model** | Claude Sonnet 5.5 (Low effort) |
| **Session usage (5hr window)** | 28% used, resets 15 Oct, 5:50 pm (AEDT) |
| **Weekly usage (all models)** | 5% used, resets 22 Oct, 9:00 am (AEDT) |
| **Requests (last 24h)** | 32 requests, 1 session |
| **Usage at >150k context (last 24h)** | 43% |

> Note: Usage figures come from `/usage` at the end of the session. The 5hr window began at 12:50 pm, so the 28% may include usage from before the test started at 3:41 pm.

---

## Stage: Setup

| Category | Notes |
|---|---|
| **What happened?** | Sajad explained how the session would work and what to expect. He guided the tester through the codebase. |
| **What did he do (in order)?** | Seemed to understand. |
| **Issues encountered** | None |
| **Comments he made** | None |

## Step 1

| Category | Notes |
|---|---|
| **What happened?** | The project should not work locally because there's no initial setup. Used Claude Sonnet 5.5 (Low). |
| **What did he do (in order)?** | Pasted the Step 1 prompt and received output. |
| **Issues encountered** | None |
| **Comments he made** | "What model do I use?"<br>"The ticket is deleting the notes, right?" *(needs clarification on task/ticket; can ignore)* |

## Step 2

| Category | Notes |
|---|---|
| **What happened?** | None |
| **What did he do (in order)?** | Pasted the Step 2 prompt and received output. |
| **Issues encountered** | None |
| **Comments he made** | "What is this [Needs Clarification: the question] section in the prompt?" *(can ignore)* |

## Step 3

| Category | Notes |
|---|---|
| **What happened?** | None |
| **What did he do (in order)?** | Worked through Step 3 by reading the output from Step 2. |
| **Issues encountered** | Seemed stuck and unsure what to do. |
| **Comments he made** | "What does the rule source mean?" *(found it after rereading the output)*<br>"Quite unsure how I can check for these things." (rule source)<br>"What does a rule source mean?" |

## Step 4

| Category | Notes |
|---|---|
| **What happened?** | Sajad gave clarification. |
| **What did he do (in order)?** | 1. Pasted the first Step 4 prompt without filling in [list]<br>2. Pasted the second Step 4 prompt<br>3. *Sajad clarified*<br>4. Pasted the first Step 4 prompt with 9, 10, 21, 25 (random numbers) and read the output |
| **Issues encountered** | It was unclear what the list was meant to contain when it appeared in the prompt. |
| **Comments he made** | "I assume the numbers are the markers?" |

## Step 5

| Category | Notes |
|---|---|
| **What happened?** | None |
| **What did he do (in order)?** | 1. Pasted the first Step 5 prompt and read the output<br>2. Scrolled through previous outputs to read the list<br>3. Pasted the second Step 5 prompt and read the output. The AI fixed some contradictions and backpedalled on some statements, likely because of a mediocre model.<br>4. Carefully reviewed the AI's output |
| **Issues encountered** | Seemed unsure. |
| **Comments he made** | None |

## Step 6

| Category | Notes |
|---|---|
| **What happened?** | None |
| **What did he do (in order)?** | 1. Pasted the Step 6 prompt without answers<br>2. Asked for clarification<br>3. Pasted the Step 6 prompt with answers [9 and 10] (the answers are decisions on unclear ACs)<br>4. AI returned that 9C needs clarification<br>5. Tester wrote back his answer for that AC and read the output |
| **Issues encountered** | None |
| **Comments he made** | "What are [answers] in the prompt?" |

## Step 7

| Category | Notes |
|---|---|
| **What happened?** | None |
| **What did he do (in order)?** | 1. Pasted the Step 7 prompt<br>2. Entered: *"Cut the criterion that fails 'verifiable' and list every number or feature in the spec that nobody asked for"* |
| **Issues encountered** | Seemed overwhelmed by the large output and skimmed through it. |
| **Comments he made** | None |

## Step 8

| Category | Notes |
|---|---|
| **What happened?** | AI said: *"The project does not define what a requirements stage produces, so this list is my own."* |
| **What did he do (in order)?** | Pasted the Step 8 prompt. |
| **Issues encountered** | None |
| **Comments he made** | "Do I open the plan-approved gate now?" |

## Stage: Final Steps and Metrics

| Category | Notes |
|---|---|
| **What happened?** | Recorded the cost of the session. |
| **What did he do (in order)?** | 1. Sajad gave the tester a prompt to save<br>2. Ran `/usage` to check credits<br>3. Asked Claude to commit |
| **Issues encountered** | None |
| **Comments he made** | None |

---

## Feedback

| # | Feedback |
|---|---|
| 1 | Hard to understand what is going on, wording-wise. *(Likely about the module, not the AI output.)* |
| 2 | Instructions are extremely vague. |

## Overall Conclusion

| # | Finding |
|---|---|
| 1 | The AI mixed up *what* and *how*. *How* should be answered in the design phase. |
| 2 | The module should **not** include statistics based on our mock project evidence, because it confuses the reader. |
| 3 | There are no prompts for saving decisions. |
| 4 | The tester didn't talk much and only spoke up when unsure. |
| 5 | We may not have probed enough. |