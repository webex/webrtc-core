# Branch and Commit Conventions

Use these rules for branch names and commit messages. PR description guidance lives in [the PR description skill](../../.github/skills/pr-description/SKILL.md).

## Branch Names

- Start new work from the current `main` branch.
- Use `<username>/<short-description>` for a branch in this repository.
- A branch in a contributor fork may use `<short-description>`.
- Keep names lowercase, short, and separated with hyphens.

Examples:

- `developer/pr-description-guidance`
- `fix-missing-track-stop`

## Commit Messages

Commit messages must follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) because commitlint validates them and semantic-release analyzes commits merged into `main`.

Use this format:

```text
<type>(<optional-scope>): <description>
```

Common types:

- `feat`: new behavior that normally produces a minor release
- `fix`: corrected behavior that normally produces a patch release
- `docs`: documentation-only change
- `refactor`: internal restructuring without a behavior change
- `test`: test-only change
- `chore`, `ci`, or `build`: maintenance and delivery work

Keep the subject direct, lowercase, and under 100 characters. Use the body when the reason or trade-off is not clear from the subject.

Mark an intentional breaking change with `!` after the type or scope, or add a `BREAKING CHANGE:` footer. Breaking changes can produce a major release.

Semantic-release reads the commits that land on `main`. Do not assume the PR title alone controls the published version.
