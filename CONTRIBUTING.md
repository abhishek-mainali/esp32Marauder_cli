# Contributing to ESP32 Marauder CLI

Thanks for helping improve this project.

## License-Aware Contribution Model

This repository uses a custom **Fork and Contribute License (FCL) v1.0**.

- Forking is allowed for development and contribution.
- Improvements should be proposed back through pull requests to this repository.
- Publishing this project (or modified versions) as a separate duplicate or competing product is not allowed without explicit written permission.

Read [LICENSE](LICENSE) before contributing.

## Development Setup

```bash
npm ci
npm run dev
```

## Quality Gate (Required)

Before opening a pull request, run:

```bash
npm run check
```

This must pass locally and in CI.

## Contribution Workflow

1. Fork the repository
2. Create a branch from `main`
3. Make focused changes
4. Run `npm run check`
5. Open a pull request to `main`

## Pull Request Expectations

- Keep PRs focused and small when possible
- Follow existing coding style and patterns
- Describe what changed and why
- Call out any breaking changes clearly

## Web Serial Testing Notes

When touching serial functionality:

- Test in Chrome or Edge
- Verify connect/disconnect behavior
- Verify command send/receive behavior with a real device

## Security & Responsible Use

Use this project only on systems/networks you own or are explicitly authorized to test.
