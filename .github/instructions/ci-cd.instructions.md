---
applyTo: ".github/workflows/**"
name: webrtc-core CI/CD
description: Use when analyzing or changing GitHub Actions workflows or semantic-release publish configuration.
---

# CI/CD Instructions — webrtc-core

Read the current files under `.github/workflows/` before analyzing or modifying CI configuration.

## Pipeline (GitHub Actions)

- **Pull requests:** `.github/workflows/pull-request-checks.yml` — checkout, Node (see workflow for version), `yarn install`, `yarn test:lint`, `yarn test:coverage` (Jest).
- **Main branch:** `.github/workflows/npm-publish.yml` — `yarn build`, then `npx semantic-release` with registry tokens from GitHub secrets (never log or commit tokens).

Node version in workflows should stay aligned with `.nvmrc` when you change either.

## Release

- semantic-release runs on **`main`** after merge (publish workflow).
- Next version comes from **conventional commit** types on merged commits.
- Publishes `@webex/webrtc-core` to the npm public registry.
- Release may update generated files (`CHANGELOG.md`, `package.json`, lockfile) via semantic-release plugins.

## Failure triage

- **Lint or Jest failure in a PR** — fix code or tests; do not rerun hoping for green.
- **Infra failure** (runner, registry, transient network) — rerun after infra is healthy.
- **Release failure on main** — treat as an incident; do not publish locally without coordination.

## Safety

- Never expose or log CI secrets (`CI_TOKEN`, `NPM_TOKEN`, `GITHUB_TOKEN`).
- Only rerun for infrastructure failures, not code failures.
- Do not run `yarn release` / `semantic-release` locally unless intentionally publishing with team approval.
