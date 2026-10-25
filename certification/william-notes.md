# Claude Code in SDLC notes - William

## My certificates

Claude Code 101: https://verify.skilljar.com/c/e8ue4ep4gjcz
Claude Code in Action: https://verify.skilljar.com/c/rkmrgzbmoi7n

Both completed through Anthropic Academy.

## CLAUDE CODE 101 CERT

- Auto accept mode, Permissions (Ask to change files or do it itself)
- Be specific when it comes to prompts
- Explore & Plan -> Code -> Commit framework
- Plan mode for more transparency on what/how/why Claude decided to do
- Define a success criteria. For Claude to be confident in its results, it needs to be clear on what "correct" looks like. Make this explicit when writing your plan.
- Add tools. Tools that help Claude complete its goals remove a lot of back and forth. For example, if you're building web UIs, install the Claude in Chrome extension so Claude Code can control a browser tab and test the UI directly. The Claude in Chrome extension page in the Chrome Web Store. Include a test suite.
- Give Claude a test suite it can continuously validate against. Claude can even write tests for you. Before handing this off, make sure the tests are a reliable source of truth to avoid false positives.
- Before you commit, run a subagent code reviewer to look at your work. A subagent gets a fresh pair of eyes on the codebase — it doesn't carry the bias the main agent might have from the session.
- Manage Context Memory is important as when it becomes full, it loses detailed responses and removes tools to free up space. You can do this by being specific, using subagents and managing MCP servers.
- Context memory is basically temporary memory for that session / project so that you don't have to keep re-explaining or getting it to analyse things again.
- With Code reviews, before pushing to a PR, use a subagent. `/commit-push-pr` handles commit, push and PR automatically.
- CLAUDE.md file is important as it acts as an onboarding script for Claude every time a new session starts so it doesn't have to dig through the whole project again. There is a project level CLAUDE.md file that gets committed to the repo and a user one for yourself and your preferences.
- You can create your own subagent with `/agents`. Subagents get the answer you were looking for, without the entire journey it took to get there cluttering your main context. However you lose that journey. You can also customise subagents further. Persistent memory lets your subagent retain memory across conversations. This is great if you're using it consistently on the same projects. Preload skills into subagents by adding the skill key and listing skills by name. Note that unlike skills in your main conversation, the entire skill is loaded into context here.
- Agent skills are usually specialised skills/knowledge/actions for specific tasks. For example your company's code/commit standards/guidelines, fonts, colors etc.
- MCP servers allow Claude to connect to external servers/datasources. Add servers to `claude mcp add`. Scope to your project with `.mcp.json` so the team can get them automatically. Watch context window usage.
- Use Hooks are deterministic control over Claude. Meaning it must execute that hook no matter what (not a suggestion, guaranteed). Use post-tool for auto formatting and logging. Use pre-tool to block dangerous operations. Configure in `/hooks` and `settings.json` and check them into the repository so the team can access them too.

## CLAUDE CODE IN ACTION

### Scope and Steer

- Iterate through a plan (keep reading and improving on it)
- Compact: summarise the conversation, lowering context window usage. However this risks ambiguity. `/compact --instruction` tells Claude how to summarize it.
- `/rewind` can allow users to perform actions at a checkpoint, for example restoring conversations or summarising from the checkpoint.
- `/goal` `/loop`: basically define a goal and Claude will loop and iterate over itself until it meets that goal. (Not that good for human in the loop.)
- Long CLAUDE.md files make it hard for Claude to follow. Use hooks to reduce content in CLAUDE.md.
- Be specific and checkable in the MD file. Name a replacement, don't just ban something. Move hard rules to hooks, organise long files with imports.
- Verification Skills allow Claude to "double" check the code it changed. It runs the test suite. Reads the diff. Checks that no test was weakened just to make things pass. Reports pass or fail, with evidence attached. The whole flow runs without you asking. The description on the skill is what triggers it, and once triggered it walks the same steps every time.

### Six modes

- Auto mode watches what Claude is trying to do and prevents anything dangerous like production deploys and migrations, force pushing, or piping downloaded code straight into a shell, sending sensitive data to external endpoints, destroying files that exist for the session — but doesn't guarantee correctness. In this case use a hook to confirm the code runs correctly.
- Manual: reads only, without prompting. Everything else asks first.
- Accept edits: runs reads, file edits, and common file system bash commands without asking. This is for iterating on code that you review after the fact.
- Plan: reads only. It researches and proposes changes without editing anything.
- Auto: accepts everything, with a separate classifier model reviewing each action before it runs.
- Don't ask: allows only pre-approved tools. Everything else is auto-denied with no prompt.
- Bypass permissions: skips all checks. This is the equivalent of the `--dangerously-skip-permissions` flag. Only run it inside an isolated container or virtual machine.

### Here's how they sit in the loop

A session starts, prompts come in, tools get called, and the turn eventually ends. Each of those moments has a hook you can hang code on. The ones worth knowing:

- PreToolUse fires before a tool call. This is your enforcement primitive. It's the one that can stop something before it happens.
- PostToolUse fires after a successful tool call. This is usually where auto-formatting or an auto-lint goes.
- Stop fires when Claude wants to end its turn. You can refuse and say "no, you're not done yet" if some condition isn't met. There's a matching SubagentStop for when a subagent finishes.
- PreCompact and PostCompact fire before and after compaction.
- InstructionsLoaded fires when a CLAUDE.md or rule file loads. Handy for auditing what actually made it into context.
- SessionStart fires at the start and primes the environment. Use the startup source if you only want it on fresh starts.
- One thing that trips people up: to re-inject context after compaction, don't use PostCompact. Use SessionStart with the compact matcher. That's the one that actually gets its output back into the conversation.

### Automation

- Routines are the default for repeat work. They run on Anthropic's infrastructure with nothing for you to host.
- Headless mode with `-p` is for when the job needs your pipeline and you want to pipe data through a script.
- `--bare` is for when CI needs the same results every single run.
- The Agent SDK is for when the work belongs inside your own product.
- Start with routines. Drop down the spectrum only when the job actually needs the extra control.

### Manage PRs — Code Review

- The simplest option is Code Review. It's an Anthropic-hosted service that reviews your pull requests through the Claude GitHub app. There's nothing for you to build or host.
- From there the admin installs the Claude GitHub app, picks which repos it watches, and decides when it runs. You have a few choices for timing: once when a PR opens, on every push to the PR, only when someone comments `@claude review`. Once it's on, everything runs on Anthropic's infrastructure. A set of review agents analyzes the diff against your full codebase, not just the changed lines in isolation. Then it posts findings as inline comments on the specific lines, tagged by severity, with a summary table in the check run.
- For PR reviews, take the managed path. Enable Code Review, let the GitHub app post inline findings, and apply fixes locally with `/code-review --fix`.
- **What Code Review will and won't do.** A couple of things to keep in mind about the boundaries here: it never approves or blocks the PR. The judgment call stays with a human. (Would be good for human in the loop.) Claude flags things; you decide. There's no managed autofix. The service posts findings only. It's a research preview right now, available on team and enterprise plans, so expect the behavior to keep moving. Since there's no autofix in the service, applying a finding is a local move. From your own terminal, the `/code-review` command reviews a diff, and its `--fix` flag applies the findings to your working tree. So the flow is: Claude finds it in the PR, you pull it down and fix it locally.
- Reach for the action when the job is more than review. Use `/install-github-app` for setup, one workflow for `@claude` mentions, one for cron, and all the tuning lives in `claude_args`. This is for custom CI: implementing changes from a comment, running scheduled reports, anything you'd normally write a workflow for. It runs the agent on PR comments, scheduled jobs, and any GitHub event.

### Supervising unsupervised runs

- The real gate on an unsupervised run is whether the tests passed, and whether Claude actually ran them or only claimed that it did. Don't leave that to trust. Wire it as a hook so Claude can't skip it. A couple of hooks do the job: a stop hook that runs your tests and refuses to end the turn on a failure. A post-tool-use hook that lints and type checks after every edit. The key detail is the exit code. A hook that exits with `exit 2` feeds the failure straight back to Claude. Claude reads that failure and fixes it without you asking. Best of all, the check fires on every run, whether or not you remember to ask for it.
- Run `/code-review` to walk the changes and flag issues.
- Run `git diff` will show what Claude actually touched. The summary won't do that. So read what changed. Read the files that were part of the plan first, then look for anything outside it. A clean write-up is not proof of clean code.
- Get a cold second opinion on anything that matters by using subagents.

### Plugins

- A plugin is one installable unit. It bundles everything you'd otherwise share by hand: skills, subagents, hooks, and MCP server configs, plus the longer tail of stuff like language server protocol servers, background monitors, themes, and a slice of `settings.json`. One version, one install.
- Here's the part that matters most. A plugin runs code on your machine, with your privileges. Its hooks fire on every matching tool call. So if you install a plugin for its skills, you also get its PreToolUse and Stop hooks whether you read them or not. Think about what that means. A community plugin could ship a Stop hook that calls out to a network endpoint every time, and nothing in your configuration would warn you about it. That's not a reason to avoid plugins. It's a reason to look first. Before you install, check the plugin's details. Claude Code shows you what it will install and estimates the context cost, along with a plain warning that Anthropic doesn't control what's inside third-party plugins.
- Two things worth knowing about where plugins come from: the in-app submission form posts to the community marketplace after Anthropic's automated review. The official marketplace is curated on its own separate track. But reviewed isn't the same as trusted. Automated review catches some things, not everything. So the rule stands: install plugins and add marketplaces only from sources you truly trust, and check what a plugin actually does before turning it on.
