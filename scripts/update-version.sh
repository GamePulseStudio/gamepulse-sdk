#!/bin/bash

# Script to update all package versions in the GameAlytics SDK
# Usage: ./scripts/update-version.sh <version>
# Example: ./scripts/update-version.sh 2.1.0

set -e

if [ -z "$1" ]; then
    echo "Error: Version parameter is required"
    echo "Usage: $0 <version>"
    echo "Example: $0 2.1.0"
    exit 1
fi

VERSION="$1"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

echo "🔄 Updating all packages to version: $VERSION"

# Update NPM packages
echo "📦 Updating NPM packages..."
cd "$ROOT_DIR/packages/core"
npm version "$VERSION" --no-git-tag-version
echo "✅ Core package updated to $VERSION"

cd "$ROOT_DIR/packages/web"
npm version "$VERSION" --no-git-tag-version
echo "✅ Web package updated to $VERSION"

cd "$ROOT_DIR/packages/unity"
npm version "$VERSION" --no-git-tag-version
echo "✅ Unity package updated to $VERSION"

# Update iOS Podspec
echo "🍎 Updating iOS Podspec..."
cd "$ROOT_DIR/packages/ios"
sed -i '' "s/spec.version.*=.*\".*\"/spec.version = \"$VERSION\"/g" GameAlytics.podspec
echo "✅ iOS Podspec updated to $VERSION"

echo ""
echo "🎉 All packages updated to version $VERSION!"
echo ""
echo "Next steps:"
echo "1. Review the changes: git diff"
echo "2. Commit the changes: git add . && git commit -m 'chore: bump version to $VERSION'"
echo "3. Create and push tag: git tag v$VERSION && git push origin v$VERSION"