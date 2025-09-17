# Changelog

All notable changes to this project will be documented in this file.

## [2.0.15] - 2025-09-16

### 🧹 Repository Cleanup
- **BREAKING**: Removed unnecessary files and directories
  - Deleted IDE files (`.idea/`, `.gradle/`, `build/`)
  - Removed legacy documentation files
  - Cleaned up duplicate README files
  - Removed build artifacts and generated files
  - Eliminated redundant configuration files

### 📁 Structure Optimization
- Streamlined repository structure for better maintainability
- Optimized `.gitignore` to prevent build artifacts
- Reduced repository size by removing `node_modules/` and `dist/` folders
- Consolidated documentation to root level

### 🔧 Configuration Updates
- Updated all platform versions to 2.0.15
- Cleaned up GitHub Actions workflows
- Optimized package configurations

### 🎯 Focus
- Repository now contains only essential source code and configuration
- Improved developer experience with cleaner structure
- Faster clone times and reduced disk usage

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Request signing with HMAC for data integrity
- Client-side rate limiting and request throttling
- Data validation and sanitization for user properties
- Certificate pinning for enhanced security
- Offline event queueing and retry mechanisms
- User consent management (GDPR/CCPA)
- Event batching for performance optimization

## [2.0.13] - 2025-09-16

### Added
- ✅ **GitHub Releases Integration**: Automated Unity package releases via GitHub Actions
- ✅ **Unity Package Export**: Professional `.unitypackage` files with versioned releases
- ✅ **Direct Download URLs**: Versioned Unity packages available at predictable URLs

### Changed
- 🔧 **Release Automation**: Full CI/CD pipeline for Unity package distribution
- 🔧 **Documentation**: Updated integration guides for new release system

### Fixed
- 🐛 **JitPack Build**: All build issues resolved, Android SDK now available
- 🐛 **Unity CI**: Fixed validation workflow for new package structure

## [2.0.12] - 2025-09-16

### Fixed
- 🐛 **JitPack Configuration**: Gradle 8.5 + Java 17 compatibility
- 🐛 **Android Publishing**: Proper Maven publication with all required artifacts
- 🐛 **Build System**: Root-level gradle.properties with AndroidX configuration

## [2.0.11] - 2025-09-16

### Changed
- 🔧 **Unity Package Structure**: Migrated from NPM to authentic Unity package format
- 🔧 **Package Location**: Moved Unity SDK to `packages/unity-package/Assets/GameAlytics/`
- 🔧 **Documentation**: Comprehensive README files for all platforms

## [2.0.0] - 2024-09-15

### Added
- **Static singleton pattern** with `getInstance()` method for global SDK access
- **Fluent builder API** for type-safe event tracking
- `SystemEventBuilder` for predefined event categories with type safety
- `CustomEventBuilder` for flexible custom event tracking
- Event category classes: `Gameplay`, `IAP`, `User`, `Progression`, `Ad`
- Cross-platform support: Android, iOS, Unity, Web/Node.js
- Automatic device information collection
- Environment modes (DEVELOPMENT/PRODUCTION)
- Silent failure handling for network calls
- Performance optimizations

### Changed
- **BREAKING**: Replaced instance-based API with static singleton pattern
- **BREAKING**: New fluent builder syntax for event tracking
- **BREAKING**: Event categories now use class-based constants
- Improved type safety across all platforms
- Enhanced error handling and validation
- Updated all usage examples to new API

### Removed
- **BREAKING**: Old instance-based initialization and event methods
- Debug mode and verbose logging for performance
- Platform enum requirement (now auto-detected)

### Fixed
- Memory leaks in network client implementations
- Thread safety issues in event queueing
- JSON serialization edge cases

### Security
- API keys now passed securely in HTTP headers
- Removed debug logging to prevent sensitive data leaks
- Enhanced input validation and sanitization

## [1.0.0] - 2024-08-01

### Added
- Initial release of GamePulse SDK
- Basic event tracking functionality
- Android, iOS, Unity, and Web platform support
- JSON-based event serialization
- HTTP-based event collection
- Basic user configuration support

---

## Migration Guide

### From v1.x to v2.0

The v2.0 release introduces significant API changes for improved developer experience:

#### Before (v1.x)
```java
// Old initialization
GamePulse analytics = new GamePulse("api-key", Environment.DEVELOPMENT);
analytics.setUserConfig(userConfig);

// Old event tracking
analytics.trackEvent(EventType.LEVEL_START, EventCategory.GAMEPLAY, properties);
```

#### After (v2.0)
```java
// New initialization
GamePulse.init("api-key", Environment.DEVELOPMENT)
    .userConfig(userConfig)
    .create(context);

// New event tracking
GamePulse.getInstance().systemEvent()
    .category(Gameplay.class)
    .type(Gameplay.LEVEL_START)
    .setProperties(properties)
    .trigger();
```

For detailed migration instructions, see [MIGRATION.md](MIGRATION.md).
