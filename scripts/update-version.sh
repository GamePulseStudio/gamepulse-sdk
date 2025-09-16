#!/bin/bash

# Script to update all package versions and deploy the GameAlytics SDK
# Usage: ./scripts/update-version.sh <version> [options]
# Example: ./scripts/update-version.sh 2.1.0
# Options:
#   --dry-run    Show what would be done without making changes
#   --no-push    Update versions and commit but don't push/tag
#   --auto-yes   Skip all confirmation prompts

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Parse command line arguments
VERSION=""
DRY_RUN=false
NO_PUSH=false
AUTO_YES=false

for arg in "$@"; do
    case $arg in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --no-push)
            NO_PUSH=true
            shift
            ;;
        --auto-yes)
            AUTO_YES=true
            shift
            ;;
        -*)
            echo -e "${RED}Unknown option: $arg${NC}"
            echo "Usage: $0 <version> [--dry-run] [--no-push] [--auto-yes]"
            exit 1
            ;;
        *)
            if [ -z "$VERSION" ]; then
                VERSION="$arg"
            fi
            ;;
    esac
done

if [ -z "$VERSION" ]; then
    echo -e "${RED}Error: Version parameter is required${NC}"
    echo "Usage: $0 <version> [--dry-run] [--no-push] [--auto-yes]"
    echo "Example: $0 2.1.0"
    echo ""
    echo "Options:"
    echo "  --dry-run    Show what would be done without making changes"
    echo "  --no-push    Update versions and commit but don't push/tag"
    echo "  --auto-yes   Skip all confirmation prompts"
    exit 1
fi

# Validate version format (basic semver check)
if ! echo "$VERSION" | grep -qE '^[0-9]+\.[0-9]+\.[0-9]+([+-][a-zA-Z0-9.-]+)*$'; then
    echo -e "${RED}Error: Version must be in semver format (e.g., 2.1.0)${NC}"
    exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
TAG_NAME="v$VERSION"

# Function to run command or show what would be run
run_cmd() {
    if [ "$DRY_RUN" = true ]; then
        echo -e "${BLUE}[DRY-RUN]${NC} Would run: $*"
    else
        echo -e "${BLUE}Running:${NC} $*"
        "$@"
    fi
}

# Function to ask for confirmation
confirm() {
    if [ "$AUTO_YES" = true ]; then
        return 0
    fi
    
    while true; do
        read -p "$1 [y/N] " yn
        case $yn in
            [Yy]* ) return 0;;
            [Nn]* ) return 1;;
            "" ) return 1;;
            * ) echo "Please answer yes or no.";;
        esac
    done
}

echo -e "${GREEN}🚀 GameAlytics SDK Release Script${NC}"
echo -e "${BLUE}Version:${NC} $VERSION"
echo -e "${BLUE}Tag:${NC} $TAG_NAME"
if [ "$DRY_RUN" = true ]; then
    echo -e "${YELLOW}Mode: DRY RUN (no changes will be made)${NC}"
fi
echo ""

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}Error: Not in a git repository${NC}"
    exit 1
fi

# Check if working directory is clean
if ! git diff-index --quiet HEAD --; then
    echo -e "${YELLOW}Warning: Working directory has uncommitted changes${NC}"
    git status --porcelain
    echo ""
    if ! confirm "Continue anyway?"; then
        echo -e "${RED}Aborted${NC}"
        exit 1
    fi
fi

# Check if tag already exists
if git rev-parse "$TAG_NAME" >/dev/null 2>&1; then
    echo -e "${YELLOW}Warning: Tag $TAG_NAME already exists${NC}"
    if ! confirm "Delete existing tag and continue?"; then
        echo -e "${RED}Aborted${NC}"
        exit 1
    fi
    run_cmd git tag -d "$TAG_NAME"
    run_cmd git push origin ":refs/tags/$TAG_NAME" 2>/dev/null || true
fi

echo -e "${GREEN}📝 Updating package versions...${NC}"

# Update NPM packages
echo -e "${BLUE}📦 Updating NPM packages...${NC}"
run_cmd cd "$ROOT_DIR/packages/core"
run_cmd npm version "$VERSION" --no-git-tag-version
echo -e "${GREEN}✅ Core package updated to $VERSION${NC}"

run_cmd cd "$ROOT_DIR/packages/web"
run_cmd npm version "$VERSION" --no-git-tag-version
echo -e "${GREEN}✅ Web package updated to $VERSION${NC}"

run_cmd cd "$ROOT_DIR/packages/unity"
run_cmd npm version "$VERSION" --no-git-tag-version
echo -e "${GREEN}✅ Unity package updated to $VERSION${NC}"

# Update iOS Podspec
echo -e "${BLUE}🍎 Updating iOS Podspec...${NC}"
run_cmd cd "$ROOT_DIR/packages/ios"
if [ "$DRY_RUN" = false ]; then
    sed -i '' "s/spec.version.*=.*\".*\"/spec.version = \"$VERSION\"/g" GameAlytics.podspec
fi
echo -e "${GREEN}✅ iOS Podspec updated to $VERSION${NC}"

run_cmd cd "$ROOT_DIR"

if [ "$DRY_RUN" = true ]; then
    echo ""
    echo -e "${YELLOW}🏁 DRY RUN COMPLETE${NC}"
    echo "No changes were made. Run without --dry-run to execute."
    exit 0
fi

# Show diff of changes
echo ""
echo -e "${BLUE}📋 Changes to be committed:${NC}"
git diff --name-only
echo ""

if ! confirm "Commit these changes?"; then
    echo -e "${RED}Aborted${NC}"
    exit 1
fi

# Commit changes
echo -e "${BLUE}💾 Committing changes...${NC}"
run_cmd git add .
run_cmd git commit -m "chore: bump version to $VERSION"
echo -e "${GREEN}✅ Changes committed${NC}"

if [ "$NO_PUSH" = true ]; then
    echo ""
    echo -e "${YELLOW}🏁 VERSION UPDATE COMPLETE${NC}"
    echo -e "${BLUE}Version updated and committed but not pushed (--no-push flag used)${NC}"
    echo ""
    echo "To complete the release manually:"
    echo "1. git tag $TAG_NAME"
    echo "2. git push origin main"
    echo "3. git push origin $TAG_NAME"
    exit 0
fi

# Create and push tag
echo -e "${BLUE}🏷️  Creating tag $TAG_NAME...${NC}"
run_cmd git tag "$TAG_NAME"
echo -e "${GREEN}✅ Tag $TAG_NAME created${NC}"

echo -e "${BLUE}🚀 Pushing to remote...${NC}"
run_cmd git push origin main
echo -e "${GREEN}✅ Main branch pushed${NC}"

run_cmd git push origin "$TAG_NAME"
echo -e "${GREEN}✅ Tag $TAG_NAME pushed${NC}"

echo ""
echo -e "${GREEN}🎉 RELEASE COMPLETE!${NC}"
echo -e "${BLUE}Version $VERSION has been released and tagged as $TAG_NAME${NC}"
echo ""
echo -e "${BLUE}🔗 Monitor the release progress:${NC}"
echo "• GitHub Actions: https://github.com/gamealytics/gamealytics-sdk/actions"
echo "• Releases: https://github.com/gamealytics/gamealytics-sdk/releases"
echo ""
echo -e "${BLUE}📦 Packages will be published to:${NC}"
echo "• NPM: @gamealytics/core, @gamealytics/web-sdk, @gamealytics/unity-sdk"
echo "• CocoaPods: GameAlytics"
echo "• JitPack: Android SDK (automatic)"
echo "• GitHub Releases: Unity package ZIP"
echo ""
echo -e "${GREEN}The GitHub Actions workflow will handle all package publishing automatically!${NC}"
