---
applyTo: "src/**/*.ts"
name: webrtc-core Code Review
description: Use when reviewing or preparing changes under src/ — correctness, public API, PeerConnection lifecycle, local streams, events, and media-effects integration.
---

# Code Review Instructions — webrtc-core

When reviewing changes in `src/`:

## Priorities

1. Correctness — edge cases, error paths handled (especially getUserMedia, track lifecycle, constraint handling).
2. Public API — additions/removals in `src/index.ts` noted with semver impact.
3. Browser quirks — adapter, permissions API differences (Firefox/Safari), fake-device test assumptions.
4. Event contracts — no silent removal/rename of typed events on streams and `PeerConnection`.
5. Media effects integration — changes to effect processors and effect lifecycle handling must stay consistent with `@webex/web-media-effects` contracts.

## Checks

- JSDoc present on all new/modified functions, classes, methods (enforced by ESLint).
- No `any` without documented reason.
- No swallowed errors without explicit justification.
- Unit tests (`*.spec.ts`) added/updated for behavioral changes; consider Karma integration tests for real-browser capture paths when behavior is browser-specific.
- Comments explain *why*, not *what*. No ticket IDs or dates in code comments.
- No secrets, absolute paths, `.pem`, or `.env` values in the diff.
