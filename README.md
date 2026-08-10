# webrtc-core

Handles WebRTC core functionality and provides media helper functions in the browser.

## Development

1. `yarn`
2. `yarn build`
3. `yarn test`
4. `yarn watch`

Integration tests (Karma): `yarn test:integration:chrome` and sibling scripts in `package.json`.

## AI-assisted development

Contributors and coding agents should start with [`AGENTS.md`](AGENTS.md) for setup, commands, pull request conventions, and security rules. GitHub Copilot loads the same guidance through [`.github/copilot-instructions.md`](.github/copilot-instructions.md). Read the [`docs/knowledge-base/`](docs/knowledge-base/README.md) index for architecture and dependency context before a broad code search.

## Usage

This library uses [cspell](https://github.com/streetsidesoftware/cspell) to check spelling throughout the codebase. Add accepted package names, protocols, and other project terms to the `words` list in [cspell.json](./cspell.json).
