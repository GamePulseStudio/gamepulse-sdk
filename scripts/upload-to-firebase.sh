#!/bin/bash

# GameAlytics Firebase Storage Upload Script
# This script uploads Unity packages to Firebase Storage with proper versioning

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
BUILD_DIR="$ROOT_DIR/build"
VERSION="${1:-2.0.9}"
PACKAGE_NAME="GameAlytics-${VERSION}.unitypackage"
INFO_NAME="GameAlytics-${VERSION}.json"

# Firebase configuration (these should be set as environment variables)
FIREBASE_PROJECT_ID="${FIREBASE_PROJECT_ID:-}"
FIREBASE_STORAGE_BUCKET="${FIREBASE_STORAGE_BUCKET:-}"
FIREBASE_SERVICE_ACCOUNT_KEY="${FIREBASE_SERVICE_ACCOUNT_KEY:-}"

echo -e "${GREEN}🚀 GameAlytics Firebase Storage Upload${NC}"
echo -e "${BLUE}Version:${NC} $VERSION"
echo -e "${BLUE}Package:${NC} $PACKAGE_NAME"
echo ""

# Function to check prerequisites
check_prerequisites() {
    echo -e "${BLUE}🔍 Checking prerequisites...${NC}"
    
    # Check if files exist
    if [ ! -f "$BUILD_DIR/$PACKAGE_NAME" ]; then
        echo -e "${RED}❌ Unity package not found: $BUILD_DIR/$PACKAGE_NAME${NC}"
        echo -e "${YELLOW}Run ./scripts/build-unity-package.sh first${NC}"
        return 1
    fi
    
    if [ ! -f "$BUILD_DIR/$INFO_NAME" ]; then
        echo -e "${RED}❌ Package info not found: $BUILD_DIR/$INFO_NAME${NC}"
        echo -e "${YELLOW}Run ./scripts/build-unity-package.sh first${NC}"
        return 1
    fi
    
    # Check Firebase CLI
    if ! command -v firebase &> /dev/null; then
        echo -e "${RED}❌ Firebase CLI not found${NC}"
        echo -e "${YELLOW}Install with: npm install -g firebase-tools${NC}"
        return 1
    fi
    
    # Check gcloud CLI (alternative)
    if ! command -v gsutil &> /dev/null && ! command -v firebase &> /dev/null; then
        echo -e "${RED}❌ Neither Firebase CLI nor gcloud CLI found${NC}"
        echo -e "${YELLOW}Install Firebase CLI: npm install -g firebase-tools${NC}"
        echo -e "${YELLOW}Or install gcloud: https://cloud.google.com/sdk/docs/install${NC}"
        return 1
    fi
    
    echo -e "${GREEN}✅ Prerequisites check passed${NC}"
    return 0
}

# Function to authenticate Firebase
authenticate_firebase() {
    echo -e "${BLUE}🔐 Authenticating with Firebase...${NC}"
    
    if [ -n "$FIREBASE_SERVICE_ACCOUNT_KEY" ]; then
        # Use service account key if provided
        echo "$FIREBASE_SERVICE_ACCOUNT_KEY" > /tmp/firebase-key.json
        export GOOGLE_APPLICATION_CREDENTIALS=/tmp/firebase-key.json
        echo -e "${GREEN}✅ Using service account authentication${NC}"
    else
        # Use Firebase CLI login
        echo -e "${YELLOW}No service account key provided${NC}"
        echo -e "${BLUE}Please run 'firebase login' if not already authenticated${NC}"
        
        # Check if already logged in
        if firebase projects:list &> /dev/null; then
            echo -e "${GREEN}✅ Firebase CLI already authenticated${NC}"
        else
            echo -e "${RED}❌ Firebase authentication required${NC}"
            echo -e "${YELLOW}Run: firebase login${NC}"
            return 1
        fi
    fi
    
    return 0
}

# Function to upload using Firebase CLI
upload_with_firebase_cli() {
    echo -e "${BLUE}☁️ Uploading to Firebase Storage...${NC}"
    
    local bucket="${FIREBASE_STORAGE_BUCKET:-${FIREBASE_PROJECT_ID}.appspot.com}"
    local storage_path="unity-sdk/${VERSION}"
    
    # Upload Unity package
    echo -e "${BLUE}📦 Uploading Unity package...${NC}"
    firebase storage:upload "$BUILD_DIR/$PACKAGE_NAME" "$storage_path/$PACKAGE_NAME" --project "$FIREBASE_PROJECT_ID"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Unity package uploaded successfully${NC}"
    else
        echo -e "${RED}❌ Failed to upload Unity package${NC}"
        return 1
    fi
    
    # Upload package info
    echo -e "${BLUE}📋 Uploading package info...${NC}"
    firebase storage:upload "$BUILD_DIR/$INFO_NAME" "$storage_path/$INFO_NAME" --project "$FIREBASE_PROJECT_ID"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Package info uploaded successfully${NC}"
    else
        echo -e "${RED}❌ Failed to upload package info${NC}"
        return 1
    fi
    
    # Create latest version symlink
    echo -e "${BLUE}🔗 Creating latest version reference...${NC}"
    
    # Create a latest.json file
    cat > "/tmp/latest.json" << EOF
{
  "latest_version": "$VERSION",
  "download_url": "https://firebasestorage.googleapis.com/v0/b/$bucket/o/unity-sdk%2F$VERSION%2F$PACKAGE_NAME?alt=media",
  "info_url": "https://firebasestorage.googleapis.com/v0/b/$bucket/o/unity-sdk%2F$VERSION%2F$INFO_NAME?alt=media",
  "updated_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF
    
    firebase storage:upload "/tmp/latest.json" "unity-sdk/latest.json" --project "$FIREBASE_PROJECT_ID"
    rm "/tmp/latest.json"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Latest version reference created${NC}"
    else
        echo -e "${YELLOW}⚠️ Failed to create latest version reference${NC}"
    fi
    
    return 0
}

# Function to upload using gsutil (alternative)
upload_with_gsutil() {
    echo -e "${BLUE}☁️ Uploading to Firebase Storage with gsutil...${NC}"
    
    local bucket="${FIREBASE_STORAGE_BUCKET:-${FIREBASE_PROJECT_ID}.appspot.com}"
    local storage_path="unity-sdk/${VERSION}"
    
    # Upload Unity package
    echo -e "${BLUE}📦 Uploading Unity package...${NC}"
    gsutil cp "$BUILD_DIR/$PACKAGE_NAME" "gs://$bucket/$storage_path/"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Unity package uploaded successfully${NC}"
    else
        echo -e "${RED}❌ Failed to upload Unity package${NC}"
        return 1
    fi
    
    # Upload package info
    echo -e "${BLUE}📋 Uploading package info...${NC}"
    gsutil cp "$BUILD_DIR/$INFO_NAME" "gs://$bucket/$storage_path/"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Package info uploaded successfully${NC}"
    else
        echo -e "${RED}❌ Failed to upload package info${NC}"
        return 1
    fi
    
    # Set public read permissions
    echo -e "${BLUE}🔓 Setting public read permissions...${NC}"
    gsutil acl ch -u AllUsers:R "gs://$bucket/$storage_path/$PACKAGE_NAME"
    gsutil acl ch -u AllUsers:R "gs://$bucket/$storage_path/$INFO_NAME"
    
    # Create latest version reference
    cat > "/tmp/latest.json" << EOF
{
  "latest_version": "$VERSION",
  "download_url": "https://firebasestorage.googleapis.com/v0/b/$bucket/o/unity-sdk%2F$VERSION%2F$PACKAGE_NAME?alt=media",
  "info_url": "https://firebasestorage.googleapis.com/v0/b/$bucket/o/unity-sdk%2F$VERSION%2F$INFO_NAME?alt=media",
  "updated_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF
    
    gsutil cp "/tmp/latest.json" "gs://$bucket/unity-sdk/"
    gsutil acl ch -u AllUsers:R "gs://$bucket/unity-sdk/latest.json"
    rm "/tmp/latest.json"
    
    return 0
}

# Function to generate download URLs
generate_download_urls() {
    echo -e "${BLUE}🔗 Generating download URLs...${NC}"
    
    local bucket="${FIREBASE_STORAGE_BUCKET:-${FIREBASE_PROJECT_ID}.appspot.com}"
    local storage_path="unity-sdk/${VERSION}"
    
    # Create download info
    cat > "$BUILD_DIR/download-info-${VERSION}.json" << EOF
{
  "version": "$VERSION",
  "download_urls": {
    "unity_package": "https://firebasestorage.googleapis.com/v0/b/$bucket/o/unity-sdk%2F$VERSION%2F$PACKAGE_NAME?alt=media",
    "package_info": "https://firebasestorage.googleapis.com/v0/b/$bucket/o/unity-sdk%2F$VERSION%2F$INFO_NAME?alt=media",
    "latest": "https://firebasestorage.googleapis.com/v0/b/$bucket/o/unity-sdk%2Flatest.json?alt=media"
  },
  "installation": {
    "method": "direct_download",
    "steps": [
      "Download the .unitypackage file using the URL above",
      "In Unity: Assets > Import Package > Custom Package",
      "Select the downloaded GameAlytics.unitypackage file",
      "Click Import to add GameAlytics to your project"
    ]
  }
}
EOF
    
    echo -e "${GREEN}✅ Download URLs generated${NC}"
    echo -e "${BLUE}Download info saved to: $BUILD_DIR/download-info-${VERSION}.json${NC}"
}

# Function to validate upload
validate_upload() {
    echo -e "${BLUE}✅ Validating upload...${NC}"
    
    local bucket="${FIREBASE_STORAGE_BUCKET:-${FIREBASE_PROJECT_ID}.appspot.com}"
    local package_url="https://firebasestorage.googleapis.com/v0/b/$bucket/o/unity-sdk%2F$VERSION%2F$PACKAGE_NAME?alt=media"
    local info_url="https://firebasestorage.googleapis.com/v0/b/$bucket/o/unity-sdk%2F$VERSION%2F$INFO_NAME?alt=media"
    
    # Test download URLs
    echo -e "${BLUE}🌐 Testing package download URL...${NC}"
    if curl -f -s -I "$package_url" > /dev/null; then
        echo -e "${GREEN}✅ Package URL accessible${NC}"
    else
        echo -e "${RED}❌ Package URL not accessible${NC}"
        return 1
    fi
    
    echo -e "${BLUE}🌐 Testing info download URL...${NC}"
    if curl -f -s -I "$info_url" > /dev/null; then
        echo -e "${GREEN}✅ Info URL accessible${NC}"
    else
        echo -e "${RED}❌ Info URL not accessible${NC}"
        return 1
    fi
    
    echo -e "${GREEN}✅ Upload validation passed${NC}"
    return 0
}

# Main execution
main() {
    if [ -z "$VERSION" ]; then
        echo -e "${RED}❌ Version parameter is required${NC}"
        show_help
        exit 1
    fi
    
    # Check for required environment variables
    if [ -z "$FIREBASE_PROJECT_ID" ]; then
        echo -e "${RED}❌ FIREBASE_PROJECT_ID environment variable is required${NC}"
        echo -e "${YELLOW}Set it with: export FIREBASE_PROJECT_ID=your-project-id${NC}"
        exit 1
    fi
    
    echo -e "${BLUE}🔍 Checking prerequisites...${NC}"
    if ! check_prerequisites; then
        exit 1
    fi
    
    echo -e "${BLUE}🔐 Authenticating with Firebase...${NC}"
    if ! authenticate_firebase; then
        exit 1
    fi
    
    echo -e "${BLUE}☁️ Uploading files...${NC}"
    
    # Try Firebase CLI first, fall back to gsutil
    if command -v firebase &> /dev/null; then
        if ! upload_with_firebase_cli; then
            echo -e "${YELLOW}Firebase CLI upload failed, trying gsutil...${NC}"
            if command -v gsutil &> /dev/null; then
                upload_with_gsutil
            else
                echo -e "${RED}❌ Both Firebase CLI and gsutil failed${NC}"
                exit 1
            fi
        fi
    elif command -v gsutil &> /dev/null; then
        upload_with_gsutil
    else
        echo -e "${RED}❌ No upload method available${NC}"
        exit 1
    fi
    
    echo -e "${BLUE}🔗 Generating download URLs...${NC}"
    generate_download_urls
    
    echo -e "${BLUE}✅ Validating upload...${NC}"
    if ! validate_upload; then
        echo -e "${YELLOW}⚠️ Upload validation failed, but files may still be accessible${NC}"
    fi
    
    # Show final results
    echo ""
    echo -e "${GREEN}🎉 UPLOAD COMPLETE!${NC}"
    echo -e "${BLUE}Firebase Storage URLs:${NC}"
    echo -e "  Package: https://firebasestorage.googleapis.com/v0/b/${FIREBASE_STORAGE_BUCKET:-${FIREBASE_PROJECT_ID}.appspot.com}/o/unity-sdk%2F$VERSION%2F$PACKAGE_NAME?alt=media"
    echo -e "  Info: https://firebasestorage.googleapis.com/v0/b/${FIREBASE_STORAGE_BUCKET:-${FIREBASE_PROJECT_ID}.appspot.com}/o/unity-sdk%2F$VERSION%2F$INFO_NAME?alt=media"
    echo -e "  Latest: https://firebasestorage.googleapis.com/v0/b/${FIREBASE_STORAGE_BUCKET:-${FIREBASE_PROJECT_ID}.appspot.com}/o/unity-sdk%2Flatest.json?alt=media"
    echo ""
    echo -e "${BLUE}Local download info: $BUILD_DIR/download-info-${VERSION}.json${NC}"
    echo ""
    
    # Cleanup service account key if used
    if [ -f "/tmp/firebase-key.json" ]; then
        rm "/tmp/firebase-key.json"
    fi
    
    return 0
}

# Help function
show_help() {
    echo "GameAlytics Firebase Storage Upload Script"
    echo ""
    echo "Usage: $0 <VERSION>"
    echo ""
    echo "Environment Variables (required):"
    echo "  FIREBASE_PROJECT_ID           Firebase project ID"
    echo "  FIREBASE_STORAGE_BUCKET       Firebase storage bucket (optional, defaults to PROJECT_ID.appspot.com)"
    echo "  FIREBASE_SERVICE_ACCOUNT_KEY  Service account JSON key (optional, for CI/CD)"
    echo ""
    echo "Examples:"
    echo "  export FIREBASE_PROJECT_ID=gamealytics-sdk"
    echo "  $0 2.0.9"
    echo ""
    echo "Prerequisites:"
    echo "  - Firebase CLI: npm install -g firebase-tools"
    echo "  - Or Google Cloud SDK with gsutil"
    echo "  - Unity package built with build-unity-package.sh"
}

# Parse command line arguments
case "$1" in
    -h|--help)
        show_help
        exit 0
        ;;
    "")
        echo -e "${RED}❌ Version parameter is required${NC}"
        show_help
        exit 1
        ;;
    *)
        main "$@"
        ;;
esac