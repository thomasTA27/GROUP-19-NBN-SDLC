# Survived and NoCoverage mutants (inventory, not classified)

Generated from `testing-and-qa/reports/mutation.json` by `testing-and-qa/reports/generate-inventory.mjs`. Status counts in the report: NoCoverage 3, Killed 879, Survived 67, Timeout 4. Listed here: 70.

Location is `line:column` start to end (1-based, end exclusive). "Covering tests" is the number of tests that executed the mutated code (0 for NoCoverage). The full test names are in `survivors-inventory.json`.

| ID | Status | File | Location | Mutator | Original | Replacement | Covering tests |
|---|---|---|---|---|---|---|---|
| 6 | Survived | app/api/cron/erase-deleted-tasks/route.ts | 38:43-38:45 | StringLiteral | `''` | `"Stryker was here!"` | 6 |
| 20 | Survived | app/api/cron/erase-deleted-tasks/route.ts | 56:10-56:30 | ConditionalExpression | `secret !== undefined` | `true` | 147 |
| 90 | Survived | features/tasks/actions/tasks.actions.ts | 35:55-35:62 | StringLiteral | `'tasks'` | `""` | 54 |
| 97 | Survived | features/tasks/actions/tasks.actions.ts | 38:9-38:32 | LogicalOperator | `!snap.exists \|\| !stored` | `!snap.exists && !stored` | 51 |
| 183 | Survived | features/tasks/actions/tasks.actions.ts | 134:19-134:47 | StringLiteral | `'Task status change failed:'` | `""` | 2 |
| 196 | Survived | features/tasks/actions/tasks.actions.ts | 156:19-156:40 | StringLiteral | `'Task delete failed:'` | `""` | 2 |
| 203 | Survived | features/tasks/components/CreateTaskForm.tsx | 14:79-14:81 | StringLiteral | `''` | `"Stryker was here!"` | 0 |
| 204 | Survived | features/tasks/components/CreateTaskForm.tsx | 20:3-20:226 | StringLiteral | `'w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm placeholde…` | `""` | 0 |
| 223 | Survived | features/tasks/components/CreateTaskForm.tsx | 57:37-57:47 | StringLiteral | `'validate'` | `""` | 1 |
| 235 | Survived | features/tasks/components/CreateTaskForm.tsx | 73:56-73:64 | StringLiteral | `'server'` | `""` | 6 |
| 239 | Survived | features/tasks/components/CreateTaskForm.tsx | 77:21-77:42 | StringLiteral | `'Task create failed:'` | `""` | 1 |
| 270 | Survived | features/tasks/components/EditTaskForm.tsx | 24:3-24:226 | StringLiteral | `'w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm shadow-sm placeholde…` | `""` | 0 |
| 271 | Survived | features/tasks/components/EditTaskForm.tsx | 26:3-26:201 | StringLiteral | `'inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium focus-visible:ou…` | `""` | 0 |
| 272 | Survived | features/tasks/components/EditTaskForm.tsx | 27:30-27:192 | StringLiteral | `'${BUTTON_BASE_CLASS} bg-black text-white transition-colors hover:bg-zinc-800 focus-visib…` | `''` | 0 |
| 273 | Survived | features/tasks/components/EditTaskForm.tsx | 28:32-28:228 | StringLiteral | `'${BUTTON_BASE_CLASS} border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 focu…` | `''` | 0 |
| 290 | Survived | features/tasks/components/EditTaskForm.tsx | 82:6-82:16 | ArrayDeclaration | `[setFocus]` | `[]` | 117 |
| 308 | Survived | features/tasks/components/EditTaskForm.tsx | 94:37-94:47 | StringLiteral | `'validate'` | `""` | 1 |
| 327 | Survived | features/tasks/components/EditTaskForm.tsx | 113:56-113:64 | StringLiteral | `'server'` | `""` | 6 |
| 331 | Survived | features/tasks/components/EditTaskForm.tsx | 117:21-117:42 | StringLiteral | `'Task update failed:'` | `""` | 2 |
| 380 | Survived | features/tasks/components/TaskItem.tsx | 19:3-19:201 | StringLiteral | `'inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium focus-visible:ou…` | `""` | 0 |
| 382 | Survived | features/tasks/components/TaskItem.tsx | 23:34-23:125 | StringLiteral | `'${BUTTON_BASE_CLASS} bg-red-600 text-white hover:bg-red-500 focus-visible:outline-red-60…` | `''` | 0 |
| 384 | Survived | features/tasks/components/TaskItem.tsx | 47:22-47:46 | StringLiteral | `'task-${task.id}-status'` | `''` | 87 |
| 388 | Survived | features/tasks/components/TaskItem.tsx | 57:31-57:36 | BooleanLiteral | `false` | `true` | 87 |
| 389 | Survived | features/tasks/components/TaskItem.tsx | 59:35-59:40 | BooleanLiteral | `false` | `true` | 87 |
| 395 | Survived | features/tasks/components/TaskItem.tsx | 63:7-63:37 | OptionalChaining | `cancelButtonRef.current?.focus` | `cancelButtonRef.current.focus` | 30 |
| 396 | Survived | features/tasks/components/TaskItem.tsx | 64:16-64:36 | ConditionalExpression | `restoreFocus.current` | `true` | 87 |
| 399 | Survived | features/tasks/components/TaskItem.tsx | 65:30-65:35 | BooleanLiteral | `false` | `true` | 11 |
| 400 | Survived | features/tasks/components/TaskItem.tsx | 66:7-66:37 | OptionalChaining | `deleteButtonRef.current?.focus` | `deleteButtonRef.current.focus` | 11 |
| 404 | Survived | features/tasks/components/TaskItem.tsx | 71:9-71:45 | ConditionalExpression | `!editing && restoreEditFocus.current` | `true` | 87 |
| 406 | Survived | features/tasks/components/TaskItem.tsx | 71:9-71:45 | LogicalOperator | `!editing && restoreEditFocus.current` | `!editing \|\| restoreEditFocus.current` | 87 |
| 409 | Survived | features/tasks/components/TaskItem.tsx | 72:34-72:39 | BooleanLiteral | `false` | `true` | 11 |
| 410 | Survived | features/tasks/components/TaskItem.tsx | 73:7-73:35 | OptionalChaining | `editButtonRef.current?.focus` | `editButtonRef.current.focus` | 11 |
| 423 | Survived | features/tasks/components/TaskItem.tsx | 93:34-93:43 | StringLiteral | `'skipped'` | `""` | 1 |
| 431 | Survived | features/tasks/components/TaskItem.tsx | 101:21-101:42 | StringLiteral | `'Task change failed:'` | `""` | 3 |
| 446 | Survived | features/tasks/components/TaskItem.tsx | 112:9-112:30 | ConditionalExpression | `outcome === 'skipped'` | `false` | 23 |
| 448 | Survived | features/tasks/components/TaskItem.tsx | 112:21-112:30 | StringLiteral | `'skipped'` | `""` | 23 |
| 459 | Survived | features/tasks/components/TaskItem.tsx | 120:9-120:30 | ConditionalExpression | `outcome === 'skipped'` | `false` | 17 |
| 461 | Survived | features/tasks/components/TaskItem.tsx | 120:21-120:30 | StringLiteral | `'skipped'` | `""` | 17 |
| 479 | Survived | features/tasks/components/TaskItem.tsx | 135:5-135:28 | CallExpression | `event.stopPropagation()` | `;` | 3 |
| 485 | Survived | features/tasks/components/TaskItem.tsx | 140:20-140:39 | ConditionalExpression | `saving === 'delete'` | `true` | 87 |
| 507 | Survived | features/tasks/components/TaskItem.tsx | 176:30-176:51 | ConditionalExpression | `deleting \|\| undefined` | `true` | 30 |
| 522 | Survived | features/tasks/components/TaskList.tsx | 13:3-13:321 | StringLiteral | `'inline-flex items-center rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm fo…` | `""` | 0 |
| 577 | Survived | features/tasks/hooks/useTasks.ts | 33:48-33:57 | EqualityOperator | `page >= 1` | `page > 1` | 19 |
| 593 | Survived | features/tasks/hooks/useTasks.ts | 46:9-46:14 | ConditionalExpression | `error` | `true` | 21 |
| 596 | Survived | features/tasks/hooks/useTasks.ts | 46:30-46:52 | StringLiteral | `'Failed to load tasks'` | `""` | 1 |
| 597 | Survived | features/tasks/hooks/useTasks.ts | 47:6-47:13 | ArrayDeclaration | `[error]` | `[]` | 21 |
| 633 | Survived | features/tasks/lib/due-date.ts | 55:3-55:102 | Regex | `/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,9}))?)?(?:Z\|([+-])(\d{2}):…` | `/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,9}))?)?(?:Z\|([+-])(\d{2}):…` | 0 |
| 663 | Survived | features/tasks/lib/due-date.ts | 71:38-71:41 | StringLiteral | `'0'` | `""` | 10 |
| 665 | Survived | features/tasks/lib/due-date.ts | 72:32-72:34 | StringLiteral | `''` | `"Stryker was here!"` | 17 |
| 672 | Survived | features/tasks/lib/due-date.ts | 74:42-74:45 | StringLiteral | `'0'` | `""` | 107 |
| 674 | Survived | features/tasks/lib/due-date.ts | 75:45-75:48 | StringLiteral | `'0'` | `""` | 107 |
| 690 | Survived | features/tasks/lib/due-date.ts | 80:5-80:17 | ConditionalExpression | `minutes > 59` | `false` | 111 |
| 693 | Survived | features/tasks/lib/due-date.ts | 81:5-81:17 | ConditionalExpression | `seconds > 59` | `false` | 111 |
| 696 | Survived | features/tasks/lib/due-date.ts | 82:5-82:21 | ConditionalExpression | `offsetHours > 23` | `false` | 111 |
| 699 | Survived | features/tasks/lib/due-date.ts | 83:5-83:23 | ConditionalExpression | `offsetMinutes > 59` | `false` | 111 |
| 727 | Survived | features/tasks/lib/due-date.ts | 98:21-98:72 | Regex | `/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::00)?$/` | `/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::00)?$/` | 0 |
| 753 | Survived | features/tasks/lib/due-date.ts | 114:58-114:70 | ConditionalExpression | `minutes > 59` | `false` | 136 |
| 780 | Survived | features/tasks/lib/due-date.ts | 138:50-138:66 | ConditionalExpression | `year % 400 === 0` | `false` | 10 |
| 782 | Survived | features/tasks/lib/due-date.ts | 138:50-138:60 | ArithmeticOperator | `year % 400` | `year * 400` | 10 |
| 787 | Survived | features/tasks/lib/due-date.ts | 144:10-144:23 | ArrayDeclaration | `[4, 6, 9, 11]` | `[]` | 247 |
| 796 | Survived | features/tasks/lib/due-date.ts | 148:10-148:20 | ConditionalExpression | `month >= 1` | `true` | 248 |
| 802 | Survived | features/tasks/lib/due-date.ts | 148:39-148:47 | ConditionalExpression | `day >= 1` | `true` | 247 |
| 864 | Survived | features/tasks/schemas.ts | 119:6-119:21 | Regex | `/^__[\s\S]*__$/` | `/__[\s\S]*__$/` | 141 |
| 865 | Survived | features/tasks/schemas.ts | 119:6-119:21 | Regex | `/^__[\s\S]*__$/` | `/^__[\s\S]*__/` | 141 |
| 888 | Survived | features/tasks/schemas.ts | 147:82-149:2 | BlockStatement | `{\n  return z.object(shape, { errorMap: invalidRequest }).strict(fieldsMessage)\n}` | `{}` | 0 |
| 960 | Survived | hooks/useFirestore.ts | 39:5-39:32 | ConditionalExpression | `queryConstraints.length > 0` | `true` | 8 |
| 962 | Survived | hooks/useFirestore.ts | 39:5-39:32 | EqualityOperator | `queryConstraints.length > 0` | `queryConstraints.length >= 0` | 8 |
| 986 | NoCoverage | lib/firebase/firestore.ts | 9:88-11:2 | BlockStatement | `{\n  return collection(getClientDb(), path) as CollectionReference<T>\n}` | `{}` | 0 |
| 987 | NoCoverage | lib/firebase/firestore.ts | 37:38-39:2 | BlockStatement | `{\n  return typedCollection<Task>('tasks')\n}` | `{}` | 0 |
| 988 | NoCoverage | lib/firebase/firestore.ts | 38:32-38:39 | StringLiteral | `'tasks'` | `""` | 0 |
