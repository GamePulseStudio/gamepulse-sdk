# GameAlytics iOS SDK

Cross-platform game analytics SDK for iOS with modern Swift API and comprehensive event tracking.

## 🚀 Features

- **Native Swift**: Modern Swift 5.0 API with full type safety
- **Cross-Platform**: Consistent API across all GameAlytics SDKs
- **Real-time Analytics**: View your game's metrics in real-time
- **Event Tracking**: System events, custom events, user sessions
- **Lightweight**: Minimal performance impact on your iOS games
- **iOS 12.0+**: Supports iOS 12.0 and later

## 📦 Installation

### CocoaPods (Recommended)

Add to your `Podfile`:

```ruby
pod 'GameAlytics', '~> 2.0.14'
```

Then run:

```bash
pod install
```

### Manual Installation

1. Download the latest release from [GitHub Releases](https://github.com/gamealytics/gamealytics-sdk/releases)
2. Drag `GameAlytics.swift` and `PermissionManager.swift` into your Xcode project
3. Make sure to select "Copy items if needed"

## 🎯 Quick Start

### 1. Initialize the SDK

```swift
import GameAlytics

// In your AppDelegate or SceneDelegate
class AppDelegate: UIResponder, UIApplicationDelegate {
    
    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        
        // Create user configuration
        let userConfig = UserConfig.builder()
            .setSessionId(UUID().uuidString)
            .setUserId("user123") // or use setAnonymous() for anonymous users
            .build()
        
        // Initialize GameAlytics
        GameAlytics.initialize(apiKey: "your-api-key", environment: .production)
            .userConfig(userConfig)
            .create()
        
        return true
    }
}
```

### 2. Track System Events

```swift
// Track user events
GameAlytics.shared.systemEvent()
    .category(UserEvents.self)
    .type(UserEvents.SESSION_START)
    .setProperties([
        "platform": "iOS",
        "version": "1.0.0"
    ])
    .trigger()

// Track gameplay events
GameAlytics.shared.systemEvent()
    .category(GameplayEvents.self)
    .type(GameplayEvents.LEVEL_START)
    .setProperties([
        "level": "1",
        "difficulty": "easy"
    ])
    .trigger()

// Track in-app purchase events
GameAlytics.shared.systemEvent()
    .category(IAPEvents.self)
    .type(IAPEvents.PURCHASE)
    .setProperties([
        "product_id": "sword_001",
        "price": "4.99",
        "currency": "USD"
    ])
    .trigger()
```

### 3. Track Custom Events

```swift
// Track custom game-specific events
GameAlytics.shared.customEvent()
    .category("boss_fight")
    .type("boss_defeated")
    .setProperties([
        "boss_name": "Dragon King",
        "time_taken": "120",
        "health_remaining": "25"
    ])
    .trigger()
```

### 4. Session Management

```swift
// Start a new session (usually in applicationDidBecomeActive)
GameAlytics.shared.startSession()

// End current session (usually in applicationWillResignActive)
GameAlytics.shared.endSession()
```

## 📊 Event Categories

### User Events
- `SESSION_START` - Session management
- `SESSION_END` - Session end
- `USER_LOGIN` - User login
- `USER_LOGOUT` - User logout  
- `USER_REGISTER` - User registration

### Gameplay Events
- `LEVEL_START` - Level progression
- `LEVEL_END` - Level completion
- `LEVEL_UP` - Level advancement
- `GAME_START` - Game start
- `GAME_END` - Game end
- `BOSS_FIGHT` - Boss encounters

### Economy Events
- `CURRENCY_EARNED` - Currency transactions
- `CURRENCY_SPENT` - Currency usage
- `ITEM_PURCHASED` - Item purchases
- `ITEM_SOLD` - Item sales
- `SHOP_VIEWED` - Shop interactions

### IAP Events
- `PURCHASE` - Successful purchases
- `PURCHASE_FAILED` - Failed purchases
- `PURCHASE_RESTORED` - Restored purchases
- `SUBSCRIPTION_STARTED` - Subscription start
- `SUBSCRIPTION_CANCELLED` - Subscription cancellation

### Progression Events
- `TUTORIAL_COMPLETE` - Tutorial completion
- `ACHIEVEMENT_UNLOCKED` - Achievement unlocks
- `MILESTONE_REACHED` - Milestone achievements
- `QUEST_COMPLETED` - Quest completions

### Ad Events
- `AD_VIEWED` - Ad views
- `AD_CLICKED` - Ad clicks
- `AD_REWARDED` - Rewarded ads
- `AD_FAILED` - Ad failures

## 🛠 Advanced Usage

### Environment Configuration

```swift
// For development/testing
GameAlytics.initialize(apiKey: "your-api-key", environment: .development)

// For production
GameAlytics.initialize(apiKey: "your-api-key", environment: .production)
```

### Error Handling

```swift
do {
    try GameAlytics.initialize(apiKey: "your-api-key", environment: .production)
        .userConfig(userConfig)
        .create()
} catch {
    print("Failed to initialize GameAlytics: \\(error)")
}
```

### Privacy & Permissions

The SDK automatically handles privacy considerations:

```swift
// Check if analytics tracking is allowed
if GameAlytics.shared.isTrackingAllowed {
    // Track events
    GameAlytics.shared.customEvent()
        .category("gameplay")
        .type("action_performed")
        .trigger()
}
```

## 🎮 Platform Support

- **iOS**: 12.0+
- **Swift**: 5.0+
- **Xcode**: 12.0+

## 📱 Best Practices

1. **Initialize early**: Initialize in `application(_:didFinishLaunchingWithOptions:)`
2. **Track meaningful events**: Focus on events that provide actionable insights
3. **Use consistent naming**: Use consistent event and parameter names
4. **Test in development**: Use the development environment for testing
5. **Handle session lifecycle**: Call `startSession()` and `endSession()` appropriately
6. **Respect privacy**: Only collect necessary data and respect user preferences

## 🔧 Troubleshooting

### Common Issues

**Events not appearing in dashboard:**
- Verify your API key is correct
- Check your internet connection and device logs
- Make sure you're using the correct environment
- Check for any console error messages

**SDK not initializing:**
- Ensure you have internet connectivity
- Verify your API key and environment configuration
- Check for any Swift compilation errors

**Performance concerns:**
- Events are automatically batched and sent in the background
- The SDK uses minimal resources and runs asynchronously
- Consider reducing event frequency if sending excessive events

### Debug Logging

The SDK provides automatic logging in development environment:

```swift
// Development environment shows detailed logs
GameAlytics.initialize(apiKey: "your-api-key", environment: .development)
```

## 📞 Support

- **Email**: support@gamealytics.com
- **Documentation**: [docs.gamealytics.com](https://docs.gamealytics.com)
- **Issues**: [GitHub Issues](https://github.com/gamealytics/gamealytics-sdk/issues)

## 📄 License

This SDK is licensed under the MIT License. See the [LICENSE](../../LICENSE) file for more information.

## 📋 Version History

### v2.0.14
- CocoaPods distribution support
- Automated GitHub Actions publishing
- Modern Swift 5.0 API design
- Cross-platform compatibility with other GameAlytics SDKs
- iOS 12.0+ support with comprehensive event tracking

---

**Built with ❤️ by the GameAlytics Team**  
*Empowering iOS developers with actionable analytics*