#!/bin/bash

# Validate package configurations for GitHub Packages

echo "🔍 Validating package configurations for GitHub Packages..."

# Check if .npmrc exists
if [ -f ".npmrc" ]; then
    echo "✅ Root .npmrc exists"
else
    echo "❌ Root .npmrc missing"
    exit 1
fi

# Validate package.json files
packages=("core" "web" "unity")

for package in "${packages[@]}"; do
    echo ""
    echo "📦 Checking packages/${package}..."
    
    if [ -f "packages/${package}/package.json" ]; then
        echo "✅ package.json exists"
        
        # Check if publishConfig exists and points to GitHub Packages
        if grep -q "npm.pkg.github.com" "packages/${package}/package.json"; then
            echo "✅ GitHub Packages registry configured"
        else
            echo "❌ GitHub Packages registry not configured"
        fi
        
        # Check package name format
        if grep -q "@gamepulse" "packages/${package}/package.json"; then
            echo "✅ Package name follows @gamepulse scope"
        else
            echo "❌ Package name doesn't follow @gamepulse scope"
        fi
    else
        echo "❌ package.json missing"
    fi
done

# Test npm configuration
echo ""
echo "🔧 Testing npm configuration..."
if npm config get @gamepulse:registry | grep -q "npm.pkg.github.com"; then
    echo "✅ npm registry configured for @gamepulse scope"
else
    echo "ℹ️ npm registry not configured (will use .npmrc)"
fi

echo ""
echo "✨ Package validation complete!"