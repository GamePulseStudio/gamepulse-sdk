# GameAlytics SDK

**Version: 2.0.18**

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![GitHub Release](https://img.shields.io/github/release/gamealytics/gamealytics-sdk.svg)](https://github.com/gamealytics/gamealytics-sdk/releases)
[![GitHub Issues](https://img.shields.io/github/issues/gamealytics/gamealytics-sdk.svg)](https://github.com/gamealytics/gamealytics-sdk/issues)

Cross-platform analytics SDK for game developers. Track player behavior, game events, and performance metrics across Android, Unity, and Web platforms.

## 🚀 Quick Start

Choose your platform and get started in minutes:

| Platform | Status | Installation | Documentation |
|----------|--------|--------------|---------------|
| **Android** | ✅ Production Ready | [JitPack](https://jitpack.io/#gamealytics/gamealytics-sdk) | [Android README](android/README.md) |
| **Unity** | ✅ Production Ready | [Unity Package Manager](https://docs.unity3d.com/Manual/upm-ui-giturl.html) | [Unity README](unity/README.md) |
| **Web** | ✅ Production Ready | [npm](https://www.npmjs.com/package/@gamealytics/sdk) | [Web README](web/README.md) |
| **iOS** | 🔬 Research | Coming Soon | [Research README](research/README.md) |

## 📁 Repository Structure

```
gamealytics-sdk/
├── android/          # Android SDK (Java/Kotlin)
├── unity/            # Unity Package (C#)
├── web/              # Web/JavaScript SDK (TypeScript)
├── research/         # Experimental features (iOS, Core)
├── version.json      # Centralized version configuration
└── README.md         # This file
```

## 🎯 Features

### Core Analytics
- **Custom Events** - Track any game-specific events
- **Progression Events** - Monitor player progress through levels/stages
- **Ad Events** - Track advertisement interactions and revenue
- **User Management** - Handle user identification and segmentation

### Platform-Specific Features
- **Android**: Native performance, ProGuard support, JitPack distribution
- **Unity**: Unity Package Manager support, C# APIs, Cross-platform builds
- **Web**: TypeScript support, CDN distribution, Modern browsers compatibility

### Data & Privacy
- **GDPR Compliant** - Built-in privacy controls
- **Local Storage** - Offline event queueing
- **Secure Transport** - HTTPS-only data transmission
- **Data Validation** - Client-side event validation

## 🔧 Installation

### Android (JitPack)
```gradle
dependencies {
    implementation 'com.github.gamealytics:gamealytics-sdk:v2.0.20'
}
```

### Unity (Package Manager)
```
https://github.com/gamealytics/gamealytics-sdk.git?path=unity
```

### Web (npm)
```bash
npm install @gamealytics/sdk@2.0.20
```

## 📊 Usage Examples

### Android
```java
GameAlytics.init("your-api-key")
    .withEnvironment(GameAlytics.Environment.SANDBOX)
    .build();

GameAlytics.customEvent("level_completed")
    .setEventValue(100)
    .send();
```

### Unity
```csharp
GameAlytics.Initialize("your-api-key");
GameAlytics.CustomEvent("level_completed")
    .SetEventValue(100)
    .Send();
```

### Web
```javascript
GameAlytics.init({ apiKey: 'your-api-key' });
GameAlytics.customEvent('level_completed', { eventValue: 100 });
```

## 🛠️ Development

### Version Management
All platform versions are managed centrally via [`version.json`](version.json). Update this file to change versions across all platforms.

### Building from Source
Each platform has its own build system:

```bash
# Android
cd android && ./gradlew assembleRelease

# Unity  
cd unity && ./build-unity-package.sh

# Web
cd web && npm run build
```

### Testing
```bash
# Android
cd android && ./gradlew test

# Web
cd web && npm test
```

## 📈 Supported Platforms

### Minimum Requirements
- **Android**: API level 21 (Android 5.0), Java 17
- **Unity**: Unity 2020.3+, .NET Standard 2.0
- **Web**: Node.js 16+, ES2015+ browsers

### Tested Platforms
- **Android**: API 21-34, Java 17-21
- **Unity**: 2020.3 - 2023.2, Windows/Mac/Linux
- **Web**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes in the appropriate platform folder
4. Update version.json if needed
5. Test your changes
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Platform-specific READMEs in each folder
- **Issues**: [GitHub Issues](https://github.com/gamealytics/gamealytics-sdk/issues)
- **Discussions**: [GitHub Discussions](https://github.com/gamealytics/gamealytics-sdk/discussions)
- **Email**: support@gamealytics.com

## 🗺️ Roadmap

### Current Version (2.0.18)
- ✅ Android SDK with JitPack distribution
- ✅ Unity Package Manager support
- ✅ Web SDK with TypeScript
- ✅ Centralized version management

### Upcoming
- 🔬 iOS SDK (Research phase)
- 📱 React Native bindings
- 🎮 Additional game engine integrations
- 📊 Advanced analytics dashboard

---

**GameAlytics SDK** - Empowering game developers with actionable insights 🎮📊