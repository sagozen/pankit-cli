# Pankit Config UI

Command-line tool and web dashboard for managing Pankit projects.

**Version**: 1.0.0

## Overview

Pankit Config UI (`pk`) provides both CLI and web dashboard for managing Pankit projects. Built with Bun, TypeScript, and React, enables fast, secure project setup and comprehensive configuration management.

**Key Features:**
- **CLI Commands (14)**: new, init, config, projects, setup, skills, agents, commands, migrate, doctor, versions, update, uninstall, easter-egg
- **Web Dashboard**: Interactive React UI via `pk config ui` for configuration and project management
- **Projects Registry**: Centralized registry at `~/.pankit/projects.json` with file locking
- **Skill Installation**: Install Pankit skills to other coding agents (Cursor, Codex, etc.)
- **Multi-tier Authentication**: gh CLI → env vars → keychain → prompt fallback
- **Smart Merging**: Conflict detection with user customization preservation
- **Skills Migration**: Auto-detects and migrates skills structure changes
- **Offline Installation**: From local archives or directories
- **Security**: Path traversal protection, symlink validation, UNC path protection
- **Cross-Platform**: macOS, Linux, Windows with platform-specific optimizations
- **Update Notifications**: Intelligent 7-day cache for version checks

## Documentation

Comprehensive documentation in `/docs`:

- **[Codebase Summary](./docs/codebase-summary.md)** - Overview, structure, key components
- **[Project Overview & PDR](./docs/project-overview-pdr.md)** - Requirements, features, roadmap
- **[System Architecture](./docs/system-architecture.md)** - Architecture diagrams, data flow
- **[Reconciliation Architecture](./docs/reconciliation-architecture.md)** - `pk migrate` RECONCILE → EXECUTE → REPORT design
- **[Code Standards](./docs/code-standards.md)** - Coding conventions, best practices
- **[Project Roadmap](./docs/project-roadmap.md)** - Release timeline, feature status
- **[Deployment Guide](./docs/deployment-guide.md)** - Release procedures

## Prerequisites

Before using Pankit CLI, you need to:

1. **Purchase a Pankit Starter Kit** from [Pankit.cc](https://pankit.cc)
2. **Get Repository Access**: After purchase, you'll receive access to the private GitHub repository containing your kit
3. **Create a GitHub Personal Access Token** (PAT) with `repo` scope to download releases

Without a purchased kit and repository access, the CLI will not be able to download any project templates.

## Installation

The Pankit CLI is published on npm at [npmjs.com/package/pankit-cli](https://www.npmjs.com/package/pankit-cli).

### Using npm (Recommended)

```bash
npm install -g pankit-cli
```

### Using Bun

```bash
bun add -g pankit-cli
```

### Using Yarn

```bash
yarn global add pankit-cli
```

### Using pnpm

```bash
pnpm add -g pankit-cli
```

After installation, verify it's working:

```bash
pk --version
```

## Usage

### Discoverability Quick Start

```bash
# Top-level command discovery
pk --help

# Open config dashboard immediately
pk config

# Command-level help (recommended)
pk config --help
pk skills --help
pk agents --help
pk commands --help
pk migrate --help
```

### Create New Project

```bash
# Interactive mode
pk new

# With options
pk new --dir my-project --kit engineer

# Show beta versions
pk new --beta

# With exclude patterns
pk new --exclude "*.log" --exclude "temp/**"

# Optional packages (OpenCode, Gemini)
pk new --opencode --gemini

# Install skills dependencies (Python, Node packages, system tools)
pk new --install-skills

# Command prefix (/pk: namespace to avoid conflicts)
pk new --prefix

# Offline installation (from local archive or directory)
pk new --archive ~/downloads/engineer-v1.16.0.zip
pk new --kit-path ~/extracted-kit/
```

**Flags:**
- `--install-skills`: Auto-install Python packages, system tools (FFmpeg, ImageMagick), Node.js packages
- `--prefix`: Move commands to /pk: namespace (/plan → /pk:plan)
- `--beta`: Show pre-release versions in selection
- `--opencode/--gemini`: Install optional packages
- `--archive <path>`: Use local archive (zip/tar.gz) instead of downloading
- `--kit-path <path>`: Use local kit directory instead of downloading

### Initialize or Update Project

**Note:** Run from project root.

```bash
# Interactive mode
pk init

# Non-interactive mode with sensible defaults
pk init --yes
pk init -y

# Combine with other flags
pk init -g --kit engineer -y

# With options
pk init --kit engineer --beta

# Global mode (platform-specific paths)
pk init --global

# Fresh installation (⚠️ DESTRUCTIVE - removes ALL customizations)
pk init --fresh

# With exclude patterns and prefix
pk init --exclude "*.local" --prefix

# Offline installation (from local archive or directory)
pk init --archive ~/downloads/engineer-v1.16.0.zip
pk init --kit-path ~/extracted-kit/
```

**Flags:**
- `--yes/-y`: Non-interactive mode with sensible defaults (skip all prompts)
- `--global/-g`: Use platform-specific config (macOS/Linux: ~/.claude, Windows: %USERPROFILE%\.claude)
- `--fresh`: Clean reinstall, removes .claude directory (requires "yes" confirmation)
- `--beta`: Show pre-release versions
- `--prefix`: Apply /pk: namespace to commands
- `--archive <path>`: Use local archive (zip/tar.gz) instead of downloading
- `--kit-path <path>`: Use local kit directory instead of downloading

**Default Behavior with `-y` Flag:**

| Prompt | Default |
|--------|---------|
| Select Pankit | engineer (first option) |
| Target directory | Current directory (`.`) |
| Version selection | Latest stable release |
| Google Gemini setup | Skip |
| Other optional features | Skip |

### Update CLI

Keep the Pankit CLI up to date:

```bash
# Check for CLI updates
pk update --check

# Update to latest version
pk update

# Update to specific version
pk update --version 1.17.0

# Update to beta / skip confirmation
pk update --beta
pk update --yes
```

The CLI notifies you when updates are available via `pk --version`.

**Skills Migration:**
- Auto-detects structure changes (flat → categorized)
- Preserves customizations (SHA-256 hashing)
- Creates backup before migration
- Rollback on failure

### List Available Versions

```bash
# Show all available versions for all kits
pk versions

# Filter by specific kit
pk versions --kit engineer
pk versions --kit marketing

# Show more versions (default: 30)
pk versions --limit 50

# Include prereleases and drafts
pk versions --all
```

### Diagnostics & Doctor

```bash
# Full health check (default)
pk doctor

# Verbose mode with execution timing and command details
pk doctor --verbose

# Generate shareable diagnostic report (prompts for gist upload)
pk doctor --report

# Auto-fix all fixable issues
pk doctor --fix

# CI mode: no prompts, exit 1 on failures
pk doctor --check-only

# Machine-readable JSON output
pk doctor --json

# Combine flags
pk doctor --verbose --check-only --json
pk doctor --verbose --fix
```

**Health Checks:**
- **System**: Node.js, npm, Python, pip, Claude CLI, git, gh CLI
- **Pankit**: Global/project installation, versions, skills
- **Auth**: GitHub CLI authentication, repository access
- **Project**: package.json, node_modules, lock files
- **Modules**: Dynamic skill dependency resolution

**Auto-Fix Capabilities:**
| Issue | Fix Action |
|-------|------------|
| Missing dependencies | Install via package manager |
| Missing gh auth | Run `gh auth login` |
| Corrupted node_modules | Reinstall dependencies |
| Missing global install | Run `pk init --global` |
| Missing skill deps | Install in skill directory |

**Exit Codes:**
- `0`: All checks pass or issues fixed
- `1`: Failures detected (only with `--check-only`)

> **Note:** `pk diagnose` is deprecated. Use `pk doctor` instead.

### Uninstall

Remove Pankit installations from your system:

```bash
pk uninstall              # Interactive mode - prompts for scope and confirmation
pk uninstall --local      # Uninstall only local installation (current project)
pk uninstall --global     # Uninstall only global installation (~/.claude/)
pk uninstall -l -y        # Local only, skip confirmation
pk uninstall -g -y        # Global only, skip confirmation
pk uninstall --yes        # Non-interactive - skip confirmation (for scripts)
```

**Scope Selection:**
- When both local and global installations exist, you'll be prompted to choose:
  - **Local only**: Remove from current project (`.claude/`)
  - **Global only**: Remove from user directory (`~/.claude/`)
  - **Both**: Remove all Pankit installations
- Use `--local` or `--global` flags to skip the prompt

**What it does:**
- Detects local `.claude` directory in current project
- Detects global `~/.claude` Pankit installation
- Shows paths before deletion
- Requires confirmation (unless `--yes` flag)
- Removes Pankit subdirectories (`commands/`, `agents/`, `skills/`, `workflows/`, `hooks/`, `metadata.json`)
- **Preserves user configs** like `settings.json`, `settings.local.json`, and `CLAUDE.md`

**Note:** Only removes valid Pankit installations (with metadata.json). Regular `.claude` directories from Claude Desktop are not affected.

### Other Commands

```bash
# Show CLI version (shows local + global kit versions)
pk --version

# Show help
pk --help
pk -h

# Command-specific help
pk new --help
pk init --help
pk config --help
pk skills --help
pk versions --help
```

### Debugging

```bash
pk new --verbose              # Enable verbose logging
pk new --verbose --log-file debug.log  # Save to file
PANKIT_VERBOSE=1 pk new   # Via environment variable
```

### Cache Configuration

Release data is cached locally to improve performance. You can configure the cache TTL:

```bash
# Set custom cache TTL (in seconds, default: 3600 = 1 hour)
PK_CACHE_TTL=7200 pk versions    # Cache for 2 hours
PK_CACHE_TTL=0 pk versions       # Disable caching (always fetch fresh)

# Permanent configuration (add to ~/.bashrc or ~/.zshrc)
export PK_CACHE_TTL=1800         # 30 minutes
```

**Cache Location:** `~/.pankit/cache/releases/`

### Update Notifications

The `pk --version` command checks for newer versions of your installed Pankit and displays a notification if an update is available. The check is cached for 7 days to minimize API calls.

**Disable Update Notifications:**
```bash
# Set environment variable to disable
NO_UPDATE_NOTIFIER=1 pk --version

# Windows (permanent)
[System.Environment]::SetEnvironmentVariable("NO_UPDATE_NOTIFIER", "1", [System.EnvironmentVariableTarget]::User)

# macOS/Linux (add to ~/.bashrc or ~/.zshrc)
export NO_UPDATE_NOTIFIER=1
```

**Cache Location:** `~/.pankit/cache/version-check.json` (Windows: `%USERPROFILE%\.pankit\cache\`)

## Authentication

The CLI requires GitHub authentication to download releases from private repositories.

### Authentication Flow

```
┌─────────────────────────────────────────────────┐
│          Multi-Tier Authentication               │
│                                                  │
│  1. GitHub CLI (gh auth token)                  │
│       ↓ (if not available)                       │
│  2. Environment Variables (GITHUB_TOKEN)        │
│       ↓ (if not set)                             │
│  3. Config File (~/.pankit/config.json)      │
│       ↓ (if not found)                           │
│  4. OS Keychain (secure storage)                │
│       ↓ (if not stored)                          │
│  5. User Prompt (with save option)              │
└─────────────────────────────────────────────────┘
```

### Quick Setup

**Step 1: Install GitHub CLI**
```bash
# Windows
winget install GitHub.cli

# macOS
brew install gh

# Linux
sudo apt install gh
```

**Step 2: Authenticate with GitHub CLI**
```bash
gh auth login
```

When prompted, follow these steps:
1. Select **GitHub.com**
2. Select **HTTPS** (or SSH if preferred)
3. Authenticate Git? → **Yes**
4. Select **Login with a web browser** (⚠️ recommended)
5. Copy the one-time code shown
6. Press Enter to open browser and paste the code
7. Authorize GitHub CLI

> **⚠️ Important**: Select "Login with a web browser" - do NOT use "Paste an authentication token" as PAT authentication is no longer supported for accessing private repositories.

## Troubleshooting

Run the doctor command to diagnose issues:

```bash
# Interactive diagnostics
pk doctor

# Generate report for support
pk doctor --report

# CI/automation
pk doctor --check-only --json

# Verbose logging
pk new --verbose
pk init --verbose
```

**Common Issues:**
- **"Access denied"**: Run `pk doctor` to check auth, use `--fix` to auto-repair
- **"Authentication failed"**: Run `pk doctor --fix` to re-authenticate, or manually run `gh auth login` (select 'Login with a web browser')
- **"GitHub CLI not authenticated"**: Run `gh auth login` and select 'Login with a web browser' (NOT 'Paste token')
- **Module errors**: Run `pk doctor --fix` to reinstall skill dependencies
- **Need help**: Run `pk doctor --report` and share the gist URL

## Available Kits

Pankit offers premium starter kits available for purchase at [Pankit.cc](https://pankit.cc):

- **engineer**: Pankit Engineer - Engineering toolkit for building with Claude (v1.0.0+)
- **marketing**: Pankit Marketing - Content automation toolkit (v1.0.0 available)

Each kit provides a comprehensive project template with best practices, tooling, and workflows optimized for Claude Code development.

## Configuration

Configuration is stored in `~/.pankit/config.json`:

```json
{
  "github": {
    "token": "stored_in_keychain"
  },
  "defaults": {
    "kit": "engineer",
    "dir": "."
  }
}
```

## Protected Files

The following file patterns are protected and will not be overwritten during updates:

- `.env`, `.env.local`, `.env.*.local`
- `*.key`, `*.pem`, `*.p12`
- `node_modules/**`, `.git/**`
- `dist/**`, `build/**`

## Excluding Files

Use `--exclude` flag with glob patterns to skip files:

```bash
pk new --exclude "*.log" --exclude "temp/**"
pk update --exclude "node_modules/**" --exclude "dist/**"
```

**Patterns:** `*` (any chars), `**` (recursive), `?` (single char), `[abc]`, `{a,b}`
**Restrictions:** No absolute paths, no path traversal (..), 1-500 chars
**Note:** User patterns are ADDED to default protected patterns

### Custom .claude Files & Skills Migration

**Custom File Preservation:**
The CLI automatically preserves your custom `.claude/` files during updates:

- Custom slash commands
- Personal workflows
- Project-specific configurations
- Any other custom files in `.claude/` directory

**Skills Directory Migration:**
Automatic migration when structure changes (flat → categorized):

- **Detection**: Manifest-based + heuristic fallback
- **Customizations**: SHA-256 hash comparison detects modifications
- **Safety**: Backup before migration, rollback on failure
- **Preservation**: All customizations preserved during migration
- **Interactive**: Prompts for confirmation (can skip in CI/CD)

**Example Migration:**
```
Before (flat):
  .claude/skills/
    ├── gemini-vision/
    ├── postgresql-psql/
    └── cloudflare-dns/

After (categorized):
  .claude/skills/
    ├── ai-multimodal/
    │   └── gemini-vision/
    ├── databases/
    │   └── postgresql-psql/
    └── devops/
        └── cloudflare-dns/
```

Customizations in any skill are detected and preserved automatically.

## Development

See [Development Guide](./docs/codebase-summary.md) for:
- Project structure (modular domain-driven architecture)
- Build & compilation (`bun run build`, `bun run compile`)
- Testing & type checking
- Code standards & linting

**Architecture Highlights:**
- **Modular design**: 122 focused modules (target: <100 lines each)
- **Facade pattern**: Each domain exposes public API via facade
- **Phase handlers**: Complex commands use orchestrator + phase handlers
- **Self-documenting names**: kebab-case file names describe purpose

**Quick Start:**
```bash
bun install
bun run dev new --kit engineer
bun test
# Optional: run expensive CLI integration tests explicitly
bun run test:integration
```

## FAQ

**Q: Do I need GitHub CLI?**
A: Yes, GitHub CLI is required. Pankit uses it exclusively for authentication with private repositories.

**Q: How do I authenticate?**
A: Run `gh auth login`, select 'Login with a web browser', complete OAuth in browser. Do NOT use 'Paste an authentication token'.

**Q: "Access denied" error?**
A: Accept GitHub repo invitation, re-run `gh auth login` with web browser login, wait 2-5min for permissions.

**Q: "GitHub CLI not authenticated" error?**
A: Run `gh auth login` and select 'Login with a web browser' (NOT 'Paste token'). PAT authentication is no longer supported.

**Q: Is my token secure?**
A: Yes. GitHub CLI manages tokens securely via OAuth, stored encrypted in OS keychain.

## License

MIT
