# 🍎 CocoaPods Setup Guide

This guide will walk you through setting up CocoaPods publishing for the GameAlytics iOS SDK.

## 📋 Prerequisites

- macOS with Xcode installed
- CocoaPods installed (`gem install cocoapods`)
- Access to the `gamealytics/gamealytics-sdk` GitHub repository

## 🚀 One-Time Setup

### Step 1: Register CocoaPods Account

1. **Register your account** (replace with your actual email):
   ```bash
   pod trunk register your-email@domain.com 'GameAlytics' --description='GameAlytics iOS SDK Publisher'
   ```

2. **Verify your email**: Check your email inbox and click the verification link

3. **Confirm registration**:
   ```bash
   pod trunk me
   ```

### Step 2: Get Your Session Token

1. **Find your token**:
   ```bash
   cat ~/.netrc | grep cocoapods
   ```
   
   This will show something like:
   ```
   machine trunk.cocoapods.org
     login your-email@domain.com
     password your-session-token-here
   ```

2. **Copy the session token** (the password field)

### Step 3: Add GitHub Secret

1. Go to your GitHub repository: `https://github.com/gamealytics/gamealytics-sdk`
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `COCOAPODS_TRUNK_TOKEN`
5. Value: Paste your session token from Step 2
6. Click **Add secret**

## 📦 Publishing Process

### Automatic Publishing (Recommended)

The iOS SDK will be automatically published to CocoaPods when you:

1. **Push a new tag**:
   ```bash
   git tag 2.0.15
   git push origin --tags
   ```

2. **Or use manual workflow**:
   - Go to **Actions** tab in GitHub
   - Select **"Publish to CocoaPods"** workflow
   - Click **"Run workflow"**
   - Enter the version number
   - Click **"Run workflow"**

### Manual Publishing (If needed)

If you need to publish manually:

```bash
cd packages/ios

# Update version in podspec
sed -i '' "s/spec.version.*=.*/spec.version = \"2.0.15\"/" GameAlytics.podspec

# Validate the podspec
pod lib lint GameAlytics.podspec --allow-warnings

# Publish to CocoaPods
pod trunk push GameAlytics.podspec --allow-warnings
```

## 🔍 Verification

After publishing, verify the release:

1. **Check CocoaPods**: https://cocoapods.org/pods/GameAlytics
2. **Search in pod**:
   ```bash
   pod search GameAlytics
   ```
3. **Test installation** in a sample iOS project:
   ```ruby
   # Podfile
   pod 'GameAlytics', '~> 2.0.14'
   ```

## 🐛 Troubleshooting

### Common Issues

**❌ "Unable to find utility 'simctl'"**
- Solution: Install Xcode (not just command line tools)
- Run: `xcode-select --install`

**❌ "Session token invalid"**
- Solution: Re-register your CocoaPods account
- Get a new session token and update the GitHub secret

**❌ "Podspec validation failed"**
- Solution: Check the podspec syntax and source files
- Run: `pod lib lint GameAlytics.podspec --verbose`

**❌ "Pod already exists"**
- Solution: You can only push new versions, not overwrite existing ones
- Increment the version number in the podspec

### Getting Help

- **CocoaPods Guides**: https://guides.cocoapods.org
- **Trunk Documentation**: https://guides.cocoapods.org/making/getting-setup-with-trunk
- **GitHub Issues**: https://github.com/gamealytics/gamealytics-sdk/issues

## 📱 Developer Usage

Once published, iOS developers can install your SDK:

```ruby
# Podfile
pod 'GameAlytics', '~> 2.0.14'
```

```bash
pod install
```

```swift
import GameAlytics

// In your AppDelegate
GameAlytics.initialize(apiKey: "your-api-key")
```

---

**🎉 That's it!** Your iOS SDK will now be automatically published to CocoaPods with every release.