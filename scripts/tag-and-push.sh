#!/bin/bash

# GameAlytics SDK - Automatic Tagging Script
# This script creates and pushes a git tag after every push to main branch

set -e

# Get the current version from package.json (using core package as reference)
VERSION=$(node -p "require('./packages/core/package.json').version")

# Check if we're on main branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "Not on main branch. Skipping tag creation."
    exit 0
fi

# Check if tag already exists
TAG_NAME="v$VERSION"
if git tag -l | grep -q "^$TAG_NAME$"; then
    echo "Tag $TAG_NAME already exists. Skipping tag creation."
    exit 0
fi

# Create and push the tag
echo "Creating and pushing tag: $TAG_NAME"
git tag "$TAG_NAME"
git push origin "$TAG_NAME"

echo "Successfully created and pushed tag: $TAG_NAME"
