# .githooks/

Local git hooks for fast feedback before anything reaches GitHub. These
run on your own machine — they are not installed automatically, and they
are not a substitute for server-side protection.

## Enable once, per clone

Git does not use this folder by default (`.git/hooks/` is the default
location, and it isn't tracked). Point Git at this folder instead:

```sh
git config core.hooksPath .githooks
```

Run that once after cloning. It's a local setting, not tracked by git, so
each person on the team needs to run it themselves.

## What's here

- **`commit-msg`** — rejects commit messages that don't follow
  [Conventional Commits](https://www.conventionalcommits.org/)
- **`pre-push`** — refuses to push while you're on `main`, and tells you
  to branch and open a PR instead

## These can be bypassed

Both hooks can be skipped with `git commit --no-verify` / `git push
--no-verify`, and anyone who hasn't run the `core.hooksPath` command
above won't have them running at all. That's why the actual enforcement
lives on GitHub's side, as a repository ruleset — see
[.github/rulesets/](../.github/rulesets/). These hooks exist purely for
fast, local feedback so you catch mistakes before you even push, not as
the thing you rely on for protection.
