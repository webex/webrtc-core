# webrtc-core

Handles WebRTC core functionality and provides media helper functions in the browser.

## Development

1. `yarn`
2. `yarn build`
3. `yarn test`
4. `yarn watch`

`yarn test` runs the build and every `test:*` script, including the Karma integration tests. Make sure local Chrome can run before using this command.

Run Karma integration tests locally with `yarn test:integration:chrome`. The Firefox, Edge, and Safari scripts select their named browser matrices only when `SAUCE=true` and valid Sauce Labs credentials are provided; without Sauce, they also launch local Chrome.

## AI-assisted development

Contributors and coding agents should start with [`AGENTS.md`](AGENTS.md) for setup, commands, pull request conventions, and security rules. GitHub Copilot loads the same guidance through [`.github/copilot-instructions.md`](.github/copilot-instructions.md). Read the [`docs/knowledge-base/`](docs/knowledge-base/README.md) index for architecture and dependency context before a broad code search.

## Contributing

Use the [PR description skill](.github/skills/pr-description/SKILL.md) to draft the [PR template](.github/pull_request_template.md) from committed changes and verified test evidence.

Follow the [branch and commit conventions](docs/contributing/GIT_CONVENTIONS.md). Semantic-release determines the next npm version from the commits merged into `main`, not from the PR title alone.

## Usage

This library uses [cspell](https://github.com/streetsidesoftware/cspell) to check spelling throughout the codebase. Add accepted package names, protocols, and other project terms to the `words` list in [cspell.json](./cspell.json).
