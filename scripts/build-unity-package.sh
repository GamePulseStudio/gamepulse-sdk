#!/bin/bash

# GameAlytics Unity Package Builder
# This script creates a Unity package (.unitypackage) from the Unity package source

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
UNITY_PACKAGE_DIR="$ROOT_DIR/packages/unity-package"
BUILD_DIR="$ROOT_DIR/build"
VERSION="${1:-2.0.15}"
PACKAGE_NAME="GameAlytics-${VERSION}.unitypackage"

# Unity command line paths (adjust as needed for your system)
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    UNITY_PATH="/Applications/Unity/Hub/Editor/2021.3.*/Unity.app/Contents/MacOS/Unity"
    UNITY_PATH=$(ls -d $UNITY_PATH 2>/dev/null | head -1)
    if [ -z "$UNITY_PATH" ]; then
        UNITY_PATH="/Applications/Unity/Unity.app/Contents/MacOS/Unity"
    fi
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
    # Windows
    UNITY_PATH="C:\Program Files\Unity\Hub\Editor\*\Editor\Unity.exe"
else
    # Linux
    UNITY_PATH="/opt/Unity/Editor/Unity"
fi

echo -e "${GREEN}🚀 GameAlytics Unity Package Builder${NC}"
echo -e "${BLUE}Version:${NC} $VERSION"
echo -e "${BLUE}Package Name:${NC} $PACKAGE_NAME"
echo ""

# Function to check if Unity is available
check_unity() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        if [ ! -f "$UNITY_PATH" ]; then
            echo -e "${YELLOW}Warning: Unity not found at expected location${NC}"
            echo -e "${BLUE}Looking for Unity installation...${NC}"
            
            # Try to find Unity in common locations
            POSSIBLE_PATHS=(
                "/Applications/Unity/Hub/Editor/*/Unity.app/Contents/MacOS/Unity"
                "/Applications/Unity/Unity.app/Contents/MacOS/Unity"
                "/Applications/Unity*/Unity.app/Contents/MacOS/Unity"
            )
            
            for path in "${POSSIBLE_PATHS[@]}"; do
                UNITY_PATH=$(ls -d $path 2>/dev/null | head -1)
                if [ -f "$UNITY_PATH" ]; then
                    echo -e "${GREEN}Found Unity at: $UNITY_PATH${NC}"
                    break
                fi
            done
            
            if [ ! -f "$UNITY_PATH" ]; then
                echo -e "${RED}Error: Unity not found. Please install Unity or update UNITY_PATH${NC}"
                return 1
            fi
        fi
    fi
    return 0
}

# Function to create directory structure
create_build_structure() {
    echo -e "${BLUE}📁 Creating build structure...${NC}"
    
    # Create build directory
    mkdir -p "$BUILD_DIR"
    
    # Create temporary project directory
    TEMP_PROJECT="$BUILD_DIR/TempUnityProject"
    rm -rf "$TEMP_PROJECT"
    mkdir -p "$TEMP_PROJECT"
    
    # Copy Unity package to temp project
    cp -r "$UNITY_PACKAGE_DIR/Assets" "$TEMP_PROJECT/"
    
    # Create minimal project structure
    mkdir -p "$TEMP_PROJECT/ProjectSettings"
    
    # Create minimal ProjectSettings
    cat > "$TEMP_PROJECT/ProjectSettings/ProjectVersion.txt" << EOF
m_EditorVersion: 2021.3.0f1
m_EditorVersionWithRevision: 2021.3.0f1 (12f8b0834f)
EOF

    echo -e "${GREEN}✅ Build structure created${NC}"
}

# Function to build Unity package using command line
build_with_unity_cli() {
    echo -e "${BLUE}🔨 Building Unity package with Unity CLI...${NC}"
    
    if ! check_unity; then
        return 1
    fi
    
    TEMP_PROJECT="$BUILD_DIR/TempUnityProject"
    OUTPUT_PATH="$BUILD_DIR/$PACKAGE_NAME"
    
    # Unity command to export package
    "$UNITY_PATH" \
        -batchmode \
        -quit \
        -projectPath "$TEMP_PROJECT" \
        -exportPackage "Assets/GameAlytics" "$OUTPUT_PATH" \
        -logFile "$BUILD_DIR/unity-build.log"
    
    if [ -f "$OUTPUT_PATH" ]; then
        echo -e "${GREEN}✅ Unity package created: $OUTPUT_PATH${NC}"
        return 0
    else
        echo -e "${RED}❌ Failed to create Unity package${NC}"
        echo -e "${YELLOW}Check Unity log: $BUILD_DIR/unity-build.log${NC}"
        return 1
    fi
}

# Function to create package manually (fallback)
create_package_manually() {
    echo -e "${BLUE}📦 Creating Unity package manually...${NC}"
    
    TEMP_PROJECT="$BUILD_DIR/TempUnityProject"
    OUTPUT_PATH="$BUILD_DIR/$PACKAGE_NAME"
    
    # Create Unity package structure
    PACKAGE_TEMP="$BUILD_DIR/package_temp"
    rm -rf "$PACKAGE_TEMP"
    mkdir -p "$PACKAGE_TEMP"
    
    # Copy assets with proper structure
    cp -r "$TEMP_PROJECT/Assets/GameAlytics" "$PACKAGE_TEMP/"
    
    # Create Unity package (simplified tar.gz with Unity structure)
    cd "$PACKAGE_TEMP"
    tar -czf "$OUTPUT_PATH" *
    cd - > /dev/null
    
    # Clean up temp
    rm -rf "$PACKAGE_TEMP"
    
    if [ -f "$OUTPUT_PATH" ]; then
        echo -e "${GREEN}✅ Unity package created manually: $OUTPUT_PATH${NC}"
        return 0
    else
        echo -e "${RED}❌ Failed to create Unity package manually${NC}"
        return 1
    fi
}

# Function to validate package structure
validate_package_structure() {
    echo -e "${BLUE}✅ Validating Unity package structure...${NC}"
    
    REQUIRED_FILES=(
        "Assets/GameAlytics/Scripts/GameAlytics.cs"
        "Assets/GameAlytics/Examples/GameAnalyticsUsageExample.cs"
        "Assets/GameAlytics/Editor/GameAnalyticsPackageExporter.cs"
        "Assets/GameAlytics/Documentation/README.md"
    )
    
    local all_found=true
    
    for file in "${REQUIRED_FILES[@]}"; do
        if [ -f "$UNITY_PACKAGE_DIR/$file" ]; then
            echo -e "${GREEN}✓${NC} $file"
        else
            echo -e "${RED}✗${NC} $file (Missing)"
            all_found=false
        fi
    done
    
    if [ "$all_found" = true ]; then
        echo -e "${GREEN}✅ Package structure validation passed${NC}"
        return 0
    else
        echo -e "${RED}❌ Package structure validation failed${NC}"
        return 1
    fi
}

# Function to update version in files
update_version() {
    echo -e "${BLUE}📝 Updating version to $VERSION...${NC}"
    
    # Update version in Editor script
    local editor_script="$UNITY_PACKAGE_DIR/Assets/GameAlytics/Editor/GameAnalyticsPackageExporter.cs"
    if [ -f "$editor_script" ]; then
        sed -i.bak "s/GameAlytics Unity SDK v[0-9.]*\\\\/GameAlytics Unity SDK v$VERSION\\\\/" "$editor_script"
        rm "$editor_script.bak" 2>/dev/null || true
        echo -e "${GREEN}✓${NC} Updated Editor script version"
    fi
    
    # Update version in README
    local readme="$UNITY_PACKAGE_DIR/Assets/GameAlytics/Documentation/README.md"
    if [ -f "$readme" ]; then
        sed -i.bak "s/### v[0-9.]*/### v$VERSION/" "$readme"
        rm "$readme.bak" 2>/dev/null || true
        echo -e "${GREEN}✓${NC} Updated README version"
    fi
    
    echo -e "${GREEN}✅ Version updated to $VERSION${NC}"
}

# Function to create package info
create_package_info() {
    echo -e "${BLUE}📋 Creating package info...${NC}"
    
    cat > "$BUILD_DIR/GameAlytics-${VERSION}.json" << EOF
{
  "name": "GameAlytics Unity SDK",
  "version": "$VERSION",
  "package_file": "$PACKAGE_NAME",
  "created_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "size_bytes": $(stat -f%z "$BUILD_DIR/$PACKAGE_NAME" 2>/dev/null || stat -c%s "$BUILD_DIR/$PACKAGE_NAME" 2>/dev/null || echo "0"),
  "description": "Official GameAlytics Unity SDK for comprehensive game analytics",
  "installation": {
    "method": "unity_package",
    "steps": [
      "Download GameAlytics.unitypackage",
      "In Unity: Assets > Import Package > Custom Package",
      "Select the downloaded .unitypackage file",
      "Click Import to add GameAlytics to your project"
    ]
  },
  "features": [
    "Cross-platform support",
    "Fluent API design",
    "Event batching and queuing",
    "Real-time analytics",
    "Comprehensive event categories"
  ],
  "supported_unity_versions": "2020.3+",
  "platforms": [
    "iOS", "Android", "Windows", "macOS", "Linux", "WebGL", "Console"
  ]
}
EOF

    echo -e "${GREEN}✅ Package info created${NC}"
}

# Main execution
main() {
    echo -e "${BLUE}🔍 Validating package structure...${NC}"
    if ! validate_package_structure; then
        exit 1
    fi
    
    echo -e "${BLUE}📝 Updating version information...${NC}"
    update_version
    
    echo -e "${BLUE}📁 Creating build structure...${NC}"
    create_build_structure
    
    echo -e "${BLUE}🔨 Building Unity package...${NC}"
    
    # Try Unity CLI first, fall back to manual if needed
    if ! build_with_unity_cli; then
        echo -e "${YELLOW}Unity CLI failed, trying manual approach...${NC}"
        if ! create_package_manually; then
            echo -e "${RED}❌ Both Unity CLI and manual package creation failed${NC}"
            exit 1
        fi
    fi
    
    echo -e "${BLUE}📋 Creating package info...${NC}"
    create_package_info
    
    # Show final results
    echo ""
    echo -e "${GREEN}🎉 BUILD COMPLETE!${NC}"
    echo -e "${BLUE}Package Location:${NC} $BUILD_DIR/$PACKAGE_NAME"
    echo -e "${BLUE}Package Info:${NC} $BUILD_DIR/GameAlytics-${VERSION}.json"
    echo -e "${BLUE}Package Size:${NC} $(du -h "$BUILD_DIR/$PACKAGE_NAME" | cut -f1)"
    echo ""
    echo -e "${BLUE}📦 Ready for Firebase Storage upload!${NC}"
    echo ""
    
    # Cleanup
    rm -rf "$BUILD_DIR/TempUnityProject"
    rm -f "$BUILD_DIR/unity-build.log"
    
    return 0
}

# Help function
show_help() {
    echo "GameAlytics Unity Package Builder"
    echo ""
    echo "Usage: $0 [VERSION] [OPTIONS]"
    echo ""
    echo "Arguments:"
echo "  VERSION    Package version (default: 2.0.15)"
    echo ""
    echo "Examples:"
    echo "  $0                    # Build with default version"
    echo "  $0 2.1.0             # Build with specific version"
    echo ""
    echo "Output:"
    echo "  build/GameAlytics-VERSION.unitypackage"
    echo "  build/GameAlytics-VERSION.json"
}

# Parse command line arguments
case "$1" in
    -h|--help)
        show_help
        exit 0
        ;;
    *)
        main "$@"
        ;;
esac