---
applyTo: "src/**/*.spec.ts"
name: webrtc-core Unit Tests
description: Use when writing or reviewing Jest unit tests co-located with source under src/.
---

# Testing Instructions — webrtc-core (Jest)

When writing or reviewing **unit** tests in `src/**/*.spec.ts`:

## Framework

- Jest + ts-jest use the jsdom environment. Authoritative versions and options live in `package.json` and `jest.config.js`; check those files instead of assuming versions here.
- Co-located `*.spec.ts` files alongside source.
- Mocks: `src/mocks/` (RTCPeerConnection, MediaStream, navigator, etc.).

## Integration tests (Karma + Mocha)

- Browser integration tests use **`*.integration-test.ts`** and Karma (`karma.conf.js`).
- `yarn test` uses the `test:*` pattern and includes all four Karma integration scripts. Run individual test scripts when you do not want to run browser integration tests.
- Run local integration tests with `yarn test:integration:chrome`; the local Karma configuration always launches Chrome through Puppeteer.
- The Firefox, Edge, and Safari scripts select their named browser matrices only when `SAUCE=true` and valid Sauce Labs credentials are provided. Without Sauce, those scripts also launch local Chrome and must not be treated as validation in the named browser.
- The checked-in pull request workflow runs Jest coverage, not Karma. Run relevant Karma tests locally when changing browser capture, permissions, or media behavior.

## Patterns

- `describe` blocks named after the module/class under test.
- `it` blocks with descriptive scenario + expected outcome.
- `expect.assertions(n)` for async tests when the repo already uses it in that file.
- Mock at boundaries (`jest.mock` for factories and stubs under `src/mocks/`).
- `clearMocks: true` in `jest.config.js` — mocks auto-reset between tests.

## Naming

- Files: **`kebab-case.spec.ts`** next to `kebab-case.ts`.
- Prefer **`should …`** phrasing for new tests unless extending a file with an established style.
- Integration files: **`*.integration-test.ts`** (see `src/media.integration-test.ts`).

## Rules

- GitHub Actions / team CI results are authoritative over local-only runs when they disagree.
- Bug fixes should include or extend a regression test when behavior changed.
- Tests must be independent — no shared mutable state between tests.
- Allowed hooks: `beforeAll`, `beforeEach`, `afterAll`, `afterEach` (ESLint `jest/no-hooks`).
