# 🎮 Gamepulse SDK

[![CI](https://github.com/gamepulse/gamepulse-sdk/workflows/CI/badge.svg)](https://github.com/gamepulse/gamepulse-sdk/actions)
[![JitPack](https://jitpack.io/v/gamepulse/gamepulse-sdk.svg)](https://jitpack.io/#gamepulse/gamepulse-sdk)
[![Web](https://img.shields.io/npm/v/@gamepulse/web-sdk)](https://www.npmjs.com/package/@gamepulse/web-sdk)
[![Unity](https://img.shields.io/github/v/release/gamepulse/gamepulse-sdk)](https://github.com/gamepulse/gamepulse-sdk/releases)

Cross-platform game analytics SDK with **fluent builder API** for Unity, Android, and Web.

## 🚀 Quick Setup

### 📱 Android 
```gradle
// Add JitPack repository to settings.gradle
repositories {
    maven { url 'https://jitpack.io' }
}

// Add to app/build.gradle
implementation 'com.github.gamepulse:gamepulse-sdk:2.0.16'
```
[📖 Android Guide](packages/android/README.md)

### 🎮 Unity
**Download**: [Gamepulse-2.0.16.unitypackage](https://github.com/gamepulse/gamepulse-sdk/releases/download/2.0.16/Gamepulse-2.0.16.unitypackage)

1. Download the `.unitypackage` from [GitHub Releases](https://github.com/gamepulse/gamepulse-sdk/releases)
2. Import: `Assets > Import Package > Custom Package`

[📖 Unity Guide](packages/unity-package/Assets/GamePulse/Documentation/README.md)

### 🌐 Web/JavaScript
```bash
# NPM
npm install @gamepulse/web-sdk

# Yarn  
yarn add @gamepulse/web-sdk
```
```javascript
import Gamepulse from '@gamepulse/web-sdk';
```
[📖 Web Guide](packages/web/README.md)

## 📈 Features

- 🎯 **Event Tracking**: Custom events, system events, user sessions
- 🚀 **Fluent API**: Type-safe builder pattern for easy integration
- 📱 **Cross-Platform**: Unity, Android, Web/JavaScript support
- ⚡ **Performance**: Event queuing, batching, offline support

## 📊 Common API Example

```typescript
// Initialize
Gamepulse.init("your-api-key", Environment.PRODUCTION)
    .userConfig(userConfig)
    .create();

// Track events
Gamepulse.getInstance().systemEvent()
    .category(GameplayEvents)
    .type(GameplayEvents.LEVEL_START)
    .setProperties({ level: "1", difficulty: "easy" })
    .trigger();
```

## 📁 Documentation

| Platform | Package | Installation | Guide |
|----------|---------|--------------|-------|
| **Android** | `com.github.gamepulse:gamepulse-sdk` | [JitPack](https://jitpack.io/#gamepulse/gamepulse-sdk) | [📖](packages/android/README.md) |
| **Unity** | `Gamepulse-{version}.unitypackage` | [Releases](https://github.com/gamepulse/gamepulse-sdk/releases) | [📖](packages/unity-package/Assets/GamePulse/Documentation/README.md) |
| **Web/JS** | `@gamepulse/web-sdk` | [NPM](https://www.npmjs.com/package/@gamepulse/web-sdk) | [📖](packages/web/README.md) |

---

**Latest Release**: [v2.0.16](https://github.com/gamepulse/gamepulse-sdk/releases) • **License**: [MIT](LICENSE) • **Support**: [Issues](https://github.com/gamepulse/gamepulse-sdk/issues)
</div>
