---
name: pr-description
description: Draft accurate webrtc-core pull request descriptions from the repository template and committed changes. Use when creating, updating, or reviewing a PR description for this repository.
---

# PR Description

Create a concise PR description that helps reviewers understand the change and verify it.

## Sources

Read these before drafting:

1. `.github/pull_request_template.md`
2. The complete committed branch diff against the PR base branch
3. Branch commits
4. Test output supplied by the author or produced in the current session
5. Linked public issues or design context when available

Repository files and observed test results are authoritative. Do not invent motivation, test evidence, issue links, screenshots, or compatibility claims.

## Workflow

1. Confirm the PR base branch. Use `main` when no other base is specified.
2. Review the complete diff, not only the latest commit.
3. Check `git status`. If uncommitted changes exist, warn the author and exclude them from the PR description until they are committed.
4. Identify the change type and whether public API, browser behavior, media lifecycle, or compatibility changes.
5. Before drafting the final description, ask what manual testing was performed. Request the tested scenario, browser when relevant, and result. If no manual testing was needed, ask the author to confirm why.
6. Ask only for other facts that cannot be derived, such as a public issue link, screenshots, or the GAI usage category.
7. Produce the completed repository template without removing headings or policy checkboxes.

## Description Rules

- Start with one to three bullets explaining what changed and why.
- Describe the behavior or developer outcome rather than listing files.
- Link a relevant public issue when available.
- Add a short `Testing` subsection under `Description` with commands and manual checks that actually ran.
- Mention breaking changes, migration steps, public API impact, dependency pin changes, or downstream version bumps only when the diff requires it.
- Include screenshots only for visible UI changes.
- Keep unchecked boxes when the answer is unknown.
- Never mark the test certification checkbox without evidence.
- Never choose a GAI disclosure category for the author.
- Do not add a dedicated risk assessment section.

## Output

Return the proposed PR description as one Markdown block that can be pasted into GitHub.

After the block, list unresolved author questions separately. Do not place placeholders such as `TBD` inside an otherwise final description.
