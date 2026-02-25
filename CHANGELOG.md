# Changelog

## [1.0.0](https://github.com/sagozen/pankit-cli/releases/tag/v1.0.0) (2026-02-25)

### 🚀 Features

- Initial release of Pankit CLI (`pk`)
- Engineer kit: AI-powered coding with skills, hooks, and multi-agent workflows
- Marketing kit: content automation, campaigns, social, and analytics
- Interactive install wizard with guided kit selection
- Web dashboard (`pk config ui`) for visual configuration management
- Projects registry at `~/.pankit/projects.json` with file locking
- Smart merging with conflict detection and user customization preservation
- Offline installation from local archives or directories
- Cross-platform support: macOS, Linux, Windows
- Multi-tier GitHub authentication: gh CLI → env vars → keychain → prompt fallback
- `pk migrate` — idempotent 3-phase reconciliation pipeline (RECONCILE → EXECUTE → REPORT)
- `pk doctor` — health checks with actionable fix suggestions
- Skills management for Cursor, Codex, and other coding agents
- Update notifications with 7-day intelligent cache
