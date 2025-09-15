# GameAlytics SDK Publishing Guide

This guide explains how to publish the GameAlytics SDK to various package managers and repositories.

## Prerequisites

Before publishing, ensure you have the following credentials and accounts set up:

### Required Accounts & Credentials

1. **Maven Central (Android)**
   - OSSRH (Sonatype) account
   - GPG signing key
   - Repository credentials

2. **CocoaPods (iOS)**
   - CocoaPods Trunk account
   - Registered email with CocoaPods

3. **NPM (Web/Core/Unity)**
   - NPM account with publishing permissions
   - Organization access to `@gameanalytics` scope

4. **GitHub**
   - Repository admin access
   - Secrets configured for CI/CD

## GitHub Secrets Configuration

Add the following secrets to your GitHub repository:

### Android Publishing
```
OSSRH_USERNAME=your_sonatype_username
OSSRH_PASSWORD=your_sonatype_password
SIGNING_KEY_ID=your_gpg_key_id
SIGNING_PASSWORD=your_gpg_key_password
SIGNING_SECRET_KEY=base64_encoded_gpg_private_key
```

### iOS Publishing
```
COCOAPODS_TRUNK_TOKEN=your_cocoapods_trunk_token
```

### NPM Publishing
```
NPM_TOKEN=your_npm_token
```

## Publishing Process

### Automated Publishing (Recommended)

1. **Tag a Release**
   ```bash
   git tag v2.0.0
   git push origin v2.0.0
   ```

2. **Manual Trigger**
   - Go to GitHub Actions
   - Select "Publish SDKs" workflow
   - Click "Run workflow"
   - Enter version number (e.g., 2.0.0)

### Manual Publishing

#### Android SDK
```bash
cd packages/android
./gradlew publishReleasePublicationToSonatypeRepository
```

#### iOS SDK
```bash
cd packages/ios
pod trunk push GameAlytics.podspec --allow-warnings
```

#### Web/Core SDKs
```bash
cd packages/core
npm publish --access public

cd ../web
npm publish --access public
```

#### Unity SDK
```bash
cd packages/unity
npm pack
# Upload the generated .tgz file to Unity Asset Store or distribute via Git URL
```

## Version Management

All packages use semantic versioning (semver). Update versions in:

- `packages/android/gradle.properties` (VERSION_NAME)
- `packages/ios/GameAlytics.podspec` (spec.version)
- `packages/core/package.json` (version)
- `packages/web/package.json` (version)
- `packages/unity/package.json` (version)

## Distribution Channels

### Android
- **Maven Central**: `com.gamealytics:gamealytics-android:2.0.0`
- **Gradle**: 
  ```gradle
  implementation 'com.gamealytics:gamealytics-android:2.0.0'
  ```

### iOS
- **CocoaPods**: `pod 'GameAlytics', '~> 2.0'`
- **Swift Package Manager**: Coming soon

### Web/JavaScript
- **NPM**: 
  ```bash
  npm install @gameanalytics/web-sdk
  npm install @gameanalytics/core
  ```

### Unity
- **Unity Package Manager**: 
  ```json
  "com.gamealytics.unity-sdk": "2.0.0"
  ```
- **Git URL**: `https://github.com/gamealytics/gamealytics-sdk.git?path=packages/unity`

## Troubleshooting

### Common Issues

1. **Android Signing Errors**
   - Verify GPG key is properly base64 encoded
   - Check signing credentials in GitHub secrets

2. **CocoaPods Validation Failures**
   - Run `pod lib lint` locally first
   - Use `--allow-warnings` flag if needed

3. **NPM Publishing Errors**
   - Verify NPM token has correct permissions
   - Check organization access for scoped packages

4. **Version Conflicts**
   - Ensure all package versions are synchronized
   - Check for existing versions on registries

### Getting Help

- Create an issue in the repository
- Check GitHub Actions logs for detailed error messages
- Verify all credentials and permissions are correctly configured

## Post-Publishing Checklist

- [ ] Verify packages are available on all registries
- [ ] Update documentation with new version numbers
- [ ] Test installation from each package manager
- [ ] Create release notes on GitHub
- [ ] Announce release to development team
