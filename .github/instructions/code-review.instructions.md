---
applyTo: "src/**/*.ts"
name: webrtc-core Code Review
description: Use when reviewing or preparing changes under src/ — correctness, exact pins on web-media-effects, public API, PeerConnection lifecycle, local streams, and events.
---

# Code Review Instructions — webrtc-core

When reviewing changes in `src/`:

## Priorities

1. Correctness — edge cases, error paths handled (especially getUserMedia, track lifecycle, constraint handling).
2. Exact-pin discipline — `@webex/web-media-effects` is an **exact** pin; bumps must be intentional with stated reason and downstream ripple (WCME, internal-media-core).
3. Public API — additions/removals in `src/index.ts` noted with semver impact.
4. Browser quirks — adapter, permissions API differences (Firefox/Safari), fake-device test assumptions.
5. Event contracts — no silent removal/rename of typed events on streams and `PeerConnection`.
6. Media effects integration — changes to effect processors and effect lifecycle handling must stay consistent with `@webex/web-media-effects` contracts.

## Checks

- JSDoc present on all new/modified functions, classes, methods (enforced by ESLint).
- No `any` without documented reason.
- No swallowed errors without explicit justification.
- Unit tests (`*.spec.ts`) added/updated for behavioral changes; consider Karma integration tests for real-browser capture paths when behavior is browser-specific.
- Comments explain *why*, not *what*. No ticket IDs or dates in code comments.
- No secrets, absolute paths, `.pem`, or `.env` values in the diff.
