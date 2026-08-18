# AGENTS.md

## Project Overview

`@webex/webrtc-core` is an open-source TypeScript library of reusable browser WebRTC primitives. It wraps `RTCPeerConnection`, models local and remote media streams, provides device and permission helpers, and connects local streams to `@webex/web-media-effects`.

The public [Webex JS SDK](https://github.com/webex/webex-js-sdk) exposes application-facing meetings and media APIs. This repository documents only webrtc-core's browser primitives and direct dependencies, not private application implementation paths.

New contributors should use this file for setup, development, testing, and contribution guidance. For the package's place in the wider media stack, start with the [knowledge base](docs/knowledge-base/README.md).

## General Guidelines

- Be analytical, straightforward, and technical. No fluff or overly agreeable responses.
- Derive commands, versions, and conventions from this repository's checked-in files — do not guess.
- For stack and onboarding questions, read the [knowledge base](docs/knowledge-base/README.md) before wide repository searches.
- When a plan or approach is ready, present it to the user and wait for confirmation before executing large or irreversible changes.
- When guidance conflicts, this repository's configuration, scripts, and policy files win.

## Agent Rules (Interactive Sessions)

These rules apply to interactive (terminal / IDE) agent sessions only.

1. Statements backed by evidence should cite a repository path, config key, or stable public link so a human can verify.
2. Never commit secrets, credentials, `.pem` files, or decrypted `.env` values.
3. Do not copy content from private systems, private URLs, hostnames, or internal identifiers into the repository. Use a sanitized summary instead.

### Committing files (agents)

- Never use `git add .` or `git add -A`. Stage **explicit paths** only.
- Stage **only files you created or modified in this session**. Do not include pre-existing untracked or unrelated changes, such as local notes, keys, or scratch Markdown at the repository root.
- Before every commit, run `git status` and confirm no `*.pem`, `.env`, keys, or credentials are staged. Use `git restore --staged <file>` if the wrong files appear.
- Create commits **only when the user asks** (unless their tooling rules say otherwise).

### Knowledge base (`docs/knowledge-base/`)

**What it is:** Curated, repository-local notes for agents and contributors, including architecture summaries, dependency roles, and links to deeper sources. It is separate from generated API documentation.

**When to read it (before heavy searching):**

- Questions about webrtc-core’s **public scope** or **media-effects boundary**.
- **Onboarding-style** “how does this repo fit together?” or “which module handles X?”
- You need a **map of modules or dependencies**. Open [architecture/webrtc-core-overview.md](docs/knowledge-base/architecture/webrtc-core-overview.md) through the [knowledge base index](docs/knowledge-base/README.md).

**When code wins:** Implementation details, dependency pins, and scripts live in source and `package.json`. If the knowledge base and code disagree, trust the repository and correct the knowledge base.

**Optional growth:** After answering a repeatable research question, ask the user whether they want a short article under `docs/knowledge-base/architecture/`, linked from [docs/knowledge-base/README.md](docs/knowledge-base/README.md). Do not add or rewrite knowledge base files without agreement.

## Maintaining this file

Keep `AGENTS.md`, scoped instructions, and repository skills aligned with checked-in facts.

**Update in the same PR when you change:** `package.json` scripts or dependency pins, `.nvmrc`, `packageManager`, ESLint, Prettier, Jest, Karma, Rollup, release configuration, `.github/workflows/`, or the public API in `src/index.ts`.

**Also refresh when:** A release changes documented dependency relationships.

**How:** Edit these files directly in the webrtc-core repository. Do not reference external authoring workspaces inside committed files.

If this document disagrees with `package.json`, workflows, or source code, **the repository wins**. Correct this document and remove rules that no longer apply.

**Last verified:** 2026-08-10.

## Repository layout

```
webrtc-core/                 ← package root (@webex/webrtc-core)
├── src/                     ← TypeScript source + co-located tests
├── dist/                    ← build output (ESM, CJS, UMD, types)
├── docs/knowledge-base/     ← architecture pointers for agents
├── .github/workflows/       ← GitHub Actions (PR checks, publish)
├── package.json
├── tsconfig.json
├── rollup.config.js
├── jest.config.js
├── karma.conf.js
└── cspell.json
```

## Setup

```bash
nvm install           # Node version from .nvmrc
corepack enable       # enables the package manager declared by package.json
yarn install          # from repo root
```

Use Yarn for repository commands. The required package manager and version are defined by `engines` and `packageManager` in `package.json`.

## Development commands

Run from the repo root:

| Command | Purpose |
|---|---|
| `yarn build` | Production build (clean + rollup) |
| `yarn test` | Sequential build plus every `test:*` script, including all four Karma integration commands |
| `yarn test:unit` | Jest unit tests only |
| `yarn test:coverage` | Jest with coverage (matches PR CI) |
| `yarn test:lint` | ESLint on `src/` |
| `yarn test:prettier` | Prettier check on `src/**/*.ts` |
| `yarn test:spelling` | cspell for source and contributor documentation |
| `yarn test:integration:chrome` | Karma integration tests in local Chrome via Puppeteer |
| `yarn test:integration:firefox` | Firefox matrix on Sauce Labs when `SAUCE=true`; otherwise local Chrome |
| `yarn test:integration:edge` | Edge matrix on Sauce Labs when `SAUCE=true`; otherwise local Chrome |
| `yarn test:integration:safari` | Safari matrix on Sauce Labs when `SAUCE=true`; otherwise local Chrome |
| `yarn transpile:validate` | TypeScript type check (`tsc --noEmit`) |
| `yarn fix` | Auto-fix prettier + eslint |
| `yarn watch` | Rollup watch mode |

Reproduce PR CI locally: `yarn test:lint` and `yarn test:coverage` after `yarn install`.

## Coding conventions

### TypeScript

- TypeScript strict mode, `noImplicitAny`, `strictNullChecks`, and `noImplicitReturns` are enabled.
- The compilation target and module format are defined in `tsconfig.json`.

### Formatting and lint

- Prettier uses a 100-character print width, single quotes, two-space indentation, and ES5 trailing commas. See `.prettierrc`.
- ESLint combines Airbnb Base, TypeScript, Jest, JSDoc, and Prettier rules. See `.eslintrc.js`.
- Staged TypeScript files run Prettier, ESLint with zero warnings, and cspell through `lint-staged`.

### Naming

- Files: `kebab-case.ts`. Unit tests: `kebab-case.spec.ts` (co-located).
- Integration tests: `*.integration-test.ts` (Karma).
- Classes: PascalCase.

### JSDoc

JSDoc is enforced by ESLint on functions, classes, and methods:

- Full-sentence description.
- `@param name - description` (hyphen before param description).
- `@returns` for return values.

### Error handling

- Use domain errors from `errors.ts` where applicable.
- Never swallow errors silently without explicit, documented reason.

### Events

- Typed patterns via `event-emitter.ts` and `@webex/ts-events` where used.
- Preserve event names and payloads when changing public stream or connection classes.

### Imports

- No file extensions in TypeScript imports (ESLint `import/extensions`).

## Key dependencies

`@webex/web-media-effects` is an **exact pin** in `package.json`. See the [architecture overview](docs/knowledge-base/architecture/webrtc-core-overview.md) for its direct role. Any version change must be intentional, compatibility-tested, and called out in the pull request.

## Testing

- **Unit:** Jest + ts-jest, jsdom — see `package.json` and `jest.config.js`.
- **Integration:** Karma + Mocha + `karma-typescript` — see `karma.conf.js` and `*.integration-test.ts`.
- **Location:** Co-located specs under `src/`; mocks in `src/mocks/`.
- **Run:** Use `yarn test:unit` for fast feedback. `yarn test` expands `test:*`, so it runs lint, Prettier, spelling, unit tests, coverage, and every Karma integration script; it is not a non-integration-only check.
- **Non-integration validation:** Run the required build, lint, Prettier, spelling, unit, or coverage scripts explicitly. There is no single non-integration aggregate script.
- **Cross-browser:** Firefox, Edge, and Safari are selected only with `SAUCE=true` and valid Sauce Labs credentials. Without Sauce, every integration script launches local Chrome, regardless of the browser suffix.

Path-scoped detail: `.github/instructions/testing.instructions.md`.

## Code review priorities

1. **Correctness** — capture, track stop/replace, constraint and effects edge cases.
2. **Public API changes** — exports in `src/index.ts` have semver impact.
3. **Browser differences** — permissions, adapter, Safari/Firefox quirks.
4. **Event contracts** — no silent breaking changes on streams or `PeerConnection`.
5. **Media effects integration** — local stream behavior remains compatible with `@webex/web-media-effects`.

Path-scoped detail: `.github/instructions/code-review.instructions.md`.

## CI/CD

- **Pull requests:** GitHub Actions — lint + Jest coverage (see `.github/workflows/pull-request-checks.yml`).
- **Main:** semantic-release publish workflow (see `.github/workflows/npm-publish.yml`).
- **Release:** semantic-release runs on `main` and derives versions from conventional commits.
- **Registry:** npm public (`@webex/webrtc-core`).

Path-scoped detail: `.github/instructions/ci-cd.instructions.md`.

## PR conventions

- **Branches and commits:** Follow [docs/contributing/GIT_CONVENTIONS.md](docs/contributing/GIT_CONVENTIONS.md). Commitlint enforces Conventional Commits.
- **Release versioning:** semantic-release on **`main`** analyzes merged commit messages, not the PR title alone.
- **Description:** Use [.github/skills/pr-description/SKILL.md](.github/skills/pr-description/SKILL.md) to complete `.github/pull_request_template.md` from the committed diff and verified test evidence.
- **GAI disclosure:** Required checkbox in PR template.

## Security

- Never commit `.pem`, `.key`, `.env`, or credential files. Remove stray keys from the working tree before staging.
- Do not put absolute paths, tokens, customer/PII, or raw internal credentials in committed files.
- Do not log or paste internal hostnames, tokens, or meeting identifiers into agent context files.
- If a secret was committed locally: **do not push**; remove from history per team process, rotate the credential, and follow incident response.

## Comments

Comments explain *why*, not *what*:

- Delete obvious comments that restate code.
- Keep JSDoc tight: description + `@param` + `@returns`.
- Flag counterintuitive browser or WebRTC behavior with a brief reason.
- No ticket IDs, dates, or author names in code comments.
- Prefer full sentences in `//` comments. Avoid semicolons to chain clauses and avoid dashes ( `-` or `—` ) mid-sentence as a pause or aside. Use two short sentences instead.

## Writing for humans (README, docs, and code)

These apply to people and to agents editing the repo.

### README and markdown

- **Lead with the reader’s goal** in one or two plain sentences.
- **Short paragraphs and lists:** Keep one idea per bullet.
- **Physical lines:** Keep each prose sentence, blockquote paragraph, and list item on one physical line. Start a new line only for a new structural element.
- **Name the action:** Write “Run `yarn test` from the repository root” instead of passive phrasing.
- **Link instead of duplicating:** Point to `AGENTS.md`, the knowledge base, or the external source for depth.
- **Diagrams in committed Markdown:** Use [Mermaid](https://mermaid.js.org/) fenced blocks in documentation. Do not add new ASCII box diagrams.

### Code comments and JSDoc

- **Why, not what:** Explain constraints, browser quirks, and protocol assumptions.
- **Complete sentences** in JSDoc descriptions.
- **Avoid noise** — no commented-out code, no ticket IDs in comments.

### Tone

- Direct and professional; active voice preferred.
- Define acronyms once when needed, then use the short form.

Agents should follow the same rules when proposing README or comment edits.

## Knowledge sources

When researching requirements, design, or incidents:

| Source | Use |
|---|---|
| [docs/knowledge-base/](docs/knowledge-base/README.md) | Public scope, direct dependency roles, and source module map |
| **GitHub** | [webex/webrtc-core](https://github.com/webex/webrtc-core) |
