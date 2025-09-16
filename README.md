# 🎮 GameAlytics SDK

[![CI](https://github.com/gamealytics/gamealytics-sdk/workflows/CI/badge.svg)](https://github.com/gamealytics/gamealytics-sdk/actions)
[![JitPack](https://jitpack.io/v/gamealytics/gamealytics-sdk.svg)](https://jitpack.io/#gamealytics/gamealytics-sdk)
[![Web](https://img.shields.io/npm/v/@gamealytics/web-sdk)](https://www.npmjs.com/package/@gamealytics/web-sdk)
[![Unity](https://img.shields.io/github/v/release/gamealytics/gamealytics-sdk)](https://github.com/gamealytics/gamealytics-sdk/releases)

Cross-platform game analytics SDK with **fluent builder API** for Unity, Android, iOS, and Web.

## 🚀 Quick Setup

### 📱 Android 
```gradle
// Add JitPack repository to settings.gradle
repositories {
    maven { url 'https://jitpack.io' }
}

// Add to app/build.gradle
implementation 'com.github.gamealytics:gamealytics-sdk:2.0.15'
```
[📖 Android Guide](packages/android/README.md)

### 🎮 Unity
**Download**: [GameAlytics-2.0.15.unitypackage](https://github.com/gamealytics/gamealytics-sdk/releases/download/2.0.15/GameAlytics-2.0.15.unitypackage)

1. Download the `.unitypackage` from [GitHub Releases](https://github.com/gamealytics/gamealytics-sdk/releases)
2. Import: `Assets > Import Package > Custom Package`

[📖 Unity Guide](packages/unity-package/Assets/GameAlytics/Documentation/README.md)

### 🌐 Web/JavaScript
```bash
# NPM
npm install @gamealytics/web-sdk

# Yarn  
yarn add @gamealytics/web-sdk
```
```javascript
import GameAlytics from '@gamealytics/web-sdk';
```
[📖 Web Guide](packages/web/README.md)

### 🍎 iOS
```ruby
# Add to your Podfile
pod 'GameAlytics', '~> 2.0.15'
```
```bash
pod install
```
[📖 iOS Guide](packages/ios/README.md)
## 📈 Features

- 🎯 **Event Tracking**: Custom events, system events, user sessions
- 🚀 **Fluent API**: Type-safe builder pattern for easy integration
- 📱 **Cross-Platform**: Unity, Android, iOS, Web/JavaScript support
- ⚡ **Performance**: Event queuing, batching, offline support

## 📊 Common API Example

```typescript
// Initialize
GameAlytics.init("your-api-key", Environment.PRODUCTION)
    .userConfig(userConfig)
    .create();

// Track events
GameAlytics.getInstance().systemEvent()
    .category(GameplayEvents)
    .type(GameplayEvents.LEVEL_START)
    .setProperties({ level: "1", difficulty: "easy" })
    .trigger();
```

## 📁 Documentation

| Platform | Package | Installation | Guide |
|----------|---------|--------------|-------|
| **Android** | `com.github.gamealytics:gamealytics-sdk` | [JitPack](https://jitpack.io/#gamealytics/gamealytics-sdk) | [📖](packages/android/README.md) |
| **Unity** | `GameAlytics-{version}.unitypackage` | [Releases](https://github.com/gamealytics/gamealytics-sdk/releases) | [📖](packages/unity-package/Assets/GameAlytics/Documentation/README.md) |
| **Web/JS** | `@gamealytics/web-sdk` | [NPM](https://www.npmjs.com/package/@gamealytics/web-sdk) | [📖](packages/web/README.md) |
| **iOS** | `GameAlytics` | [CocoaPods](https://cocoapods.org/pods/GameAlytics) | [📖](packages/ios/README.md) |

---

**Latest Release**: [v2.0.15](https://github.com/gamealytics/gamealytics-sdk/releases) • **License**: [MIT](LICENSE) • **Support**: [Issues](https://github.com/gamealytics/gamealytics-sdk/issues)
</div>
