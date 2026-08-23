# .github/rulesets/

Config-as-code for GitHub repository rulesets. **This file is the record
of the configuration — it is not itself enforced.** Nothing here protects
anything until someone with admin permission on the repo POSTs it to the
GitHub API. Committing the JSON does not apply it.

## protect-main.json

Defines a ruleset named "Protect main" that targets the repository's
default branch (via `~DEFAULT_BRANCH`, so it keeps working if the default
branch is ever renamed) and:

- Blocks deletion of the branch (`deletion`)
- Blocks force-pushes / history rewrites (`non_fast_forward`)
- Requires changes to land via pull request (`pull_request`)
- Lets anyone with the repository `admin` role bypass the ruleset at any
  time (`bypass_actors`, `RepositoryRole` id `5`, `bypass_mode: "always"`)

### Required approving reviews is currently 0

`required_approving_review_count` is set to `0` for now — this still
forces changes through a PR (no direct pushes to main) but does not
require a second person to approve it. This suits a small team while
everyone is still ramping up.

**To require 1 approval later:** change `required_approving_review_count`
to `1` in `protect-main.json`, then re-apply it with the update command
below.

## Applying this ruleset

You need admin permission on the repository. This has **not** been
applied yet — someone with admin access needs to run this.

**Create it for the first time:**

```sh
gh api --method POST \
  -H "Accept: application/vnd.github+json" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  /repos/thomasTA27/GROUP-19-NBN-SDLC/rulesets \
  --input .github/rulesets/protect-main.json
```

**Update it later** (e.g. after bumping `required_approving_review_count`
to `1`), first find its `id`:

```sh
gh api /repos/thomasTA27/GROUP-19-NBN-SDLC/rulesets \
  --jq '.[] | select(.name=="Protect main") | .id'
```

Then PUT the updated file to that ruleset:

```sh
gh api --method PUT \
  -H "Accept: application/vnd.github+json" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  /repos/thomasTA27/GROUP-19-NBN-SDLC/rulesets/<id> \
  --input .github/rulesets/protect-main.json
```

## On the `RepositoryRole` actor ID

GitHub's REST API docs don't publish a table mapping repository role
names to their numeric `actor_id`. The value `5` for the `admin` role
used here was confirmed by cross-referencing:

- A live, real-world ruleset (`Azure/azure-sdk-tools`,
  `eng/branch-rulesets/require-codeowner-approval.json`), which contains
  `{"actor_id": 5, "actor_type": "RepositoryRole", ...}` as its admin
  bypass entry
- The Terraform `integrations/terraform-provider-github` docs
  (`docs/resources/repository_ruleset.md`), which document
  `admin -> 5`, `write -> 4`, `maintain -> 2`

If GitHub ever publishes an authoritative table and it disagrees with
this, trust GitHub's docs over this note.
