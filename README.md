# 🎮 GameAlytics SDK

[![CI](https://github.com/gamealytics/gamealytics-sdk/workflows/CI/badge.svg)](https://github.com/gamealytics/gamealytics-sdk/actions)
[![JitPack](https://jitpack.io/v/gamealytics/gamealytics-sdk.svg)](https://jitpack.io/#gamealytics/gamealytics-sdk)
[![Web](https://img.shields.io/npm/v/@gamealytics/web-sdk)](https://www.npmjs.com/package/@gamealytics/web-sdk)
[![Unity](https://img.shields.io/github/v/release/gamealytics/gamealytics-sdk)](https://github.com/gamealytics/gamealytics-sdk/releases)

A modern, cross-platform analytics SDK for game developers with a **fluent builder API** and comprehensive event tracking across all major gaming platforms.

## ✨ Features

- 🚀 **Easy Integration** - Simple, intuitive API with fluent builders
- 🎯 **Comprehensive Tracking** - System events, custom events, user sessions, and more
- 📱 **Cross-Platform** - Android, iOS, Unity, Web/Node.js support
- ⚡ **Performance Optimized** - Event queuing, batching, and offline support
- 🛡️ **Data Validation** - Built-in data sanitization and validation
- 🔄 **Real-time Analytics** - View your game's analytics in real-time
- 📊 **Rich Event Categories** - Predefined events for gameplay, IAP, progression, and more

## 🚀 Quick Start

Choose your platform to get started:

### 📱 Android
[![JitPack](https://img.shields.io/jitpack/version/gamealytics/gamealytics-sdk?style=flat-square)](https://jitpack.io/#gamealytics/gamealytics-sdk)

```gradle
// Add to app/build.gradle
implementation 'com.github.gamealytics:gamealytics-sdk:2.0.9'
```

**[📖 Android Documentation →](packages/android/README.md)**

### 🌐 Web/JavaScript
[![NPM](https://img.shields.io/npm/v/@gamealytics/web-sdk?style=flat-square)](https://www.npmjs.com/package/@gamealytics/web-sdk)

```bash
npm install @gamealytics/web-sdk
```

```javascript
import GameAlytics from '@gamealytics/web-sdk';
```

**[📖 Web SDK Documentation →](packages/web/README.md)**

### 🎮 Unity
[![GitHub Release](https://img.shields.io/github/v/release/gamealytics/gamealytics-sdk?style=flat-square)](https://github.com/gamealytics/gamealytics-sdk/releases)

**Download Unity Package (.unitypackage)**
1. Download `GameAlytics-2.0.9.unitypackage` from [GitHub Releases](https://github.com/gamealytics/gamealytics-sdk/releases)
2. In Unity: `Assets > Import Package > Custom Package`
3. Import the downloaded package

**[📖 Unity Documentation →](packages/unity-package/Assets/GameAlytics/Documentation/README.md)**

### 🍎 iOS
[![CocoaPods](https://img.shields.io/cocoapods/v/GameAlytics?style=flat-square)](https://cocoapods.org/pods/GameAlytics)

```ruby
# Add to Podfile
pod 'GameAlytics', '~> 2.0.9'
```

**[📖 iOS Documentation →](packages/ios/README.md)** *(Coming Soon)*

## 📚 Platform-Specific Guides

| Platform | Package | Installation | Documentation |
|----------|---------|--------------|---------------|
| **Android** | `com.github.gamealytics:gamealytics-sdk` | [JitPack](https://jitpack.io/#gamealytics/gamealytics-sdk) | [📖 Guide](packages/android/README.md) |
| **Web/JS** | `@gamealytics/web-sdk` | [NPM](https://www.npmjs.com/package/@gamealytics/web-sdk) | [📖 Guide](packages/web/README.md) |
| **Unity** | `GameAlytics.unitypackage` | [GitHub Releases](https://github.com/gamealytics/gamealytics-sdk/releases) | [📖 Guide](packages/unity-package/Assets/GameAlytics/Documentation/README.md) |
| **iOS** | `GameAlytics` | [CocoaPods](https://cocoapods.org/pods/GameAlytics) | [📖 Guide](packages/ios/README.md) |

## 🎯 Common Usage Example

All platforms follow a similar fluent API pattern:

```typescript
// Initialize (platform-specific syntax)
GameAlytics.init("your-api-key", Environment.PRODUCTION)
    .userConfig(userConfig)
    .create();

// Track system events
GameAlytics.getInstance().systemEvent()
    .category(GameplayEvents)
    .type(GameplayEvents.LEVEL_START)
    .setProperties({
        level: "1",
        difficulty: "easy"
    })
    .trigger();

// Track custom events
GameAlytics.getInstance().customEvent()
    .category("boss_fight")
    .type("boss_defeated")
    .setProperties({
        boss_name: "Dragon King",
        time_taken: "120"
    })
    .trigger();
```

## 📊 Event Categories

The SDK provides comprehensive predefined event categories:

- **👤 User Events**: Session management, login, registration
- **🎮 Gameplay Events**: Level progression, game flow, achievements
- **💰 IAP Events**: Purchases, subscriptions, transaction tracking
- **📈 Progression Events**: Tutorial completion, milestones, unlocks
- **📺 Ad Events**: Ad viewing, clicks, rewards, failures
- **🔧 Custom Events**: Your game-specific analytics needs

## 📁 Repository Structure

```
gamealytics-sdk/
├── packages/
│   ├── core/                  # Shared core functionality
│   ├── android/              # Android SDK (Java/Kotlin)
│   ├── ios/                   # iOS SDK (Swift/Objective-C)
│   ├── unity/                 # Unity SDK (C#)
│   └── web/                   # Web/Node.js SDK (TypeScript)
├── examples/                  # Example implementations
├── scripts/                   # Build and deployment scripts
└── .github/workflows/         # CI/CD automation
```

## 🔄 Latest Release: v2.0.9

### What's New
- ✅ Comprehensive README documentation for all platforms
- ✅ Enhanced Android SDK with complete API documentation
- ✅ New Web SDK README with framework integration examples
- ✅ Clean version tagging (no "v" prefix for cleaner dependencies)
- ✅ Improved CI/CD pipeline with single workflow triggers
- ✅ Updated cross-platform event builder APIs

[📋 View All Releases →](https://github.com/gamealytics/gamealytics-sdk/releases)

## 🛠 Development Setup

```bash
# Clone the repository
git clone https://github.com/gamealytics/gamealytics-sdk.git
cd gamealytics-sdk

# Install dependencies
npm install

# Build all packages
npm run build

# Run tests
npm test
```

## 📈 Monitoring & Analytics

- **🔗 GitHub Actions**: [View CI/CD Status](https://github.com/gamealytics/gamealytics-sdk/actions)
- **📦 Package Health**: Monitor NPM, JitPack, and CocoaPods
- **🐛 Issues**: [Report bugs or request features](https://github.com/gamealytics/gamealytics-sdk/issues)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for:

- Code of conduct
- Development workflow
- Pull request process
- Coding standards

## 📞 Support

- **📧 Email**: support@gamealytics.com
- **📚 Documentation**: [docs.gamealytics.com](https://docs.gamealytics.com)
- **🐛 Issues**: [GitHub Issues](https://github.com/gamealytics/gamealytics-sdk/issues)
- **💬 Discussions**: [GitHub Discussions](https://github.com/gamealytics/gamealytics-sdk/discussions)

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <strong>Built with ❤️ by the GameAlytics Team</strong>
  <br>
  <sub>Empowering game developers with actionable analytics</sub>
</div>
