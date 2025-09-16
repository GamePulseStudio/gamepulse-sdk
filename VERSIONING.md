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

For local development, you can use the provided script to update all versions at once:

```bash
# Update all packages to version 2.1.0
./scripts/update-version.sh 2.1.0
```

This script updates:
- All NPM package.json files
- iOS Podspec file
- Provides next steps for committing and tagging

## Release Process

### Automated (Recommended)

1. Update your code and commit changes
2. Run the version update script:
   ```bash
   ./scripts/update-version.sh 2.1.0
   ```
3. Commit the version changes:
   ```bash
   git add .
   git commit -m "chore: bump version to 2.1.0"
   ```
4. Create and push the tag:
   ```bash
   git tag v2.1.0
   git push origin v2.1.0
   ```
5. The GitHub Actions workflow will automatically publish all packages

### Manual GitHub Actions

1. Go to the Actions tab in GitHub
2. Select "Publish SDKs" workflow
3. Click "Run workflow"
4. Enter the desired version (e.g., `2.1.0`)
5. The workflow will update all package versions and publish

## Benefits

- **No manual version updates**: Versions are automatically extracted and applied
- **Consistent versioning**: All packages use the same version from the Git tag
- **Reduced errors**: Eliminates version mismatch issues between packages
- **Simplified releases**: Tag creation triggers automatic publishing
- **Flexible**: Supports both automated tag-based and manual releases

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