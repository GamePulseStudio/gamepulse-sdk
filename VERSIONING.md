# Version Management

This document describes the dynamic version management system for the GameAlytics SDK.

## Overview

The GameAlytics SDK uses a dynamic versioning system that automatically extracts version information from Git tags or manual inputs, eliminating the need to manually update version numbers in multiple files.

## How It Works

### GitHub Actions Workflows

The GitHub Actions workflows (`.github/workflows/publish.yml`) automatically extract version information using the following logic:

1. **Tag Push**: When a tag is pushed (e.g., `v2.0.4`), the version is extracted from `github.ref_name`
2. **Manual Dispatch**: When manually triggered, you can specify a version in the workflow input
3. **Fallback**: If neither is available, it uses the latest Git tag from `git describe --tags --abbrev=0`

### Dynamic Updates

During the publish workflow, the following files are automatically updated with the extracted version:

- `packages/core/package.json`
- `packages/web/package.json`  
- `packages/unity/package.json`
- `packages/ios/GameAlytics.podspec`

## Local Development

For local development, you can use the provided script to handle the complete release process:

```bash
# Complete release (updates versions, commits, tags, and pushes)
./scripts/update-version.sh 2.1.0

# Dry run to see what would happen
./scripts/update-version.sh 2.1.0 --dry-run

# Update and commit but don't push/tag
./scripts/update-version.sh 2.1.0 --no-push

# Skip all confirmation prompts
./scripts/update-version.sh 2.1.0 --auto-yes
```

The script handles everything automatically:
- Updates all NPM package.json files
- Updates iOS Podspec file
- Commits the changes
- Creates and pushes the Git tag
- Triggers the automated CI/CD pipeline

## Release Process

### One-Command Release (Recommended)

```bash
# Make your changes, then deploy everything in one command:
./scripts/update-version.sh 2.1.0
```

This single command will:
1. ✅ Validate the version format
2. ✅ Check for existing tags and clean conflicts
3. ✅ Update all package.json and podspec files
4. ✅ Show you the changes and ask for confirmation
5. ✅ Commit the changes with a proper message
6. ✅ Create and push the version tag
7. ✅ Trigger GitHub Actions to publish all packages

### Advanced Options

```bash
# Preview what would happen without making changes
./scripts/update-version.sh 2.1.0 --dry-run

# Update versions and commit, but let me handle push/tag manually
./scripts/update-version.sh 2.1.0 --no-push

# Skip confirmation prompts (for CI/automation)
./scripts/update-version.sh 2.1.0 --auto-yes
```

### Manual GitHub Actions

1. Go to the Actions tab in GitHub
2. Select "Publish SDKs" workflow
3. Click "Run workflow"
4. Enter the desired version (e.g., `2.1.0`)
5. The workflow will update all package versions and publish

## Benefits

- **One-Command Deployment**: Complete release in a single command
- **No Manual Version Updates**: Versions are automatically extracted and applied
- **Consistent Versioning**: All packages use the same version from the Git tag
- **Error Prevention**: Built-in validation and conflict resolution
- **Safe Operations**: Dry-run mode and confirmation prompts
- **Automatic Publishing**: GitHub Actions handles all package publishing
- **Flexible Options**: Multiple modes for different workflows

## File Structure

```
├── .github/workflows/
│   ├── publish.yml          # Main publish workflow with dynamic versioning
│   └── ci.yml               # CI workflow (no version dependencies)
├── packages/
│   ├── core/package.json    # Automatically updated during publish
│   ├── web/package.json     # Automatically updated during publish
│   ├── unity/package.json   # Automatically updated during publish
│   └── ios/GameAlytics.podspec # Automatically updated during publish
├── scripts/
│   └── update-version.sh    # Local version update script
└── VERSIONING.md           # This documentation
```

## Version Format

- **Git tags**: Use semantic versioning with `v` prefix (e.g., `v2.0.4`)
- **Package versions**: Semantic versioning without prefix (e.g., `2.0.4`)
- **The system automatically handles the `v` prefix conversion**

## Troubleshooting

### Workflow fails to extract version
- Ensure Git tags follow the `v*` pattern (e.g., `v2.0.4`)
- Check that the repository has at least one tag if using fallback mode

### Package version mismatch
- Run `./scripts/update-version.sh <version>` to sync all packages locally
- Verify that all package.json files have the same version after update

### Publishing fails
- Check that all package.json files have valid semver versions
- Ensure iOS Podspec version matches package versions
- Verify NPM and CocoaPods credentials are configured correctly