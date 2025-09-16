# GameAlytics Unity SDK

The official Unity SDK for GameAlytics, providing comprehensive game analytics tracking for Unity games across multiple platforms.

## 🚀 Features

- **Cross-platform support**: Works on all major Unity platforms (iOS, Android, Windows, macOS, Linux, WebGL, and consoles)
- **Easy integration**: Simple API for tracking game events, errors, and in-app purchases
- **Real-time analytics**: View your game's analytics in real-time on the GameAlytics dashboard
- **Comprehensive event tracking**: Track custom events, errors, sessions, and more
- **Lightweight**: Minimal performance impact on your game
- **Fluent API**: Discoverable, type-safe event tracking with method chaining
- **Event Queuing**: Automatic batching and offline support

## 📦 Installation

### Method 1: Import Unity Package (.unitypackage)

1. Download `GameAlytics.unitypackage` from Firebase Storage
2. In Unity, go to `Assets > Import Package > Custom Package`
3. Select the downloaded `GameAlytics.unitypackage` file
4. Click "Import" to add GameAlytics to your project

### Method 2: Manual Installation

1. Copy the `GameAlytics` folder to your project's `Assets` directory
2. Unity will automatically compile the scripts

## 🎯 Quick Start

### 1. Initialize the SDK

```csharp
using GameAlytics;

public class GameManager : MonoBehaviour
{
    void Start()
    {
        // Create user configuration
        var userConfig = UserConfig.CreateBuilder()
            .SetSessionId(System.Guid.NewGuid().ToString())
            .SetUserId("user123") // or use SetAnonymous() for anonymous users
            .Build();

        // Initialize GameAlytics
        GameAlytics.GameAlytics.Init("your-api-key", Environment.PRODUCTION)
            .UserConfig(userConfig)
            .Create();
    }
}
```

### 2. Track System Events

```csharp
// Track user events
GameAlytics.GameAlytics.GetInstance().SystemEvent()
    .Category(typeof(GameAlytics.GameAlytics.UserEvents))
    .Type(GameAlytics.GameAlytics.UserEvents.SESSION_START)
    .SetProperties(new Dictionary<string, string> 
    {
        {"platform", "mobile"}
    })
    .Trigger();

// Track gameplay events
GameAlytics.GameAlytics.GetInstance().SystemEvent()
    .Category(typeof(GameAlytics.GameAlytics.GameplayEvents))
    .Type(GameAlytics.GameAlytics.GameplayEvents.LEVEL_START)
    .SetProperties(new Dictionary<string, string>
    {
        {"level", "1"},
        {"difficulty", "easy"}
    })
    .Trigger();

// Track IAP events
GameAlytics.GameAlytics.GetInstance().SystemEvent()
    .Category(typeof(GameAlytics.GameAlytics.IAPEvents))
    .Type(GameAlytics.GameAlytics.IAPEvents.PURCHASE)
    .SetProperties(new Dictionary<string, string>
    {
        {"item_id", "sword_001"},
        {"price", "4.99"},
        {"currency", "USD"}
    })
    .Trigger();
```

### 3. Track Custom Events

```csharp
// Track custom events
GameAlytics.GameAlytics.GetInstance().CustomEvent()
    .Category("boss_fight")
    .Type("boss_defeated")
    .SetProperties(new Dictionary<string, string>
    {
        {"boss_name", "Dragon King"},
        {"time_taken", "120"}
    })
    .Trigger();
```

### 4. Session Management

```csharp
// Start a new session
GameAlytics.GameAlytics.GetInstance().StartSession();

// End current session
GameAlytics.GameAlytics.GetInstance().EndSession();
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

```csharp
// For development/testing
GameAlytics.GameAlytics.Init("your-api-key", Environment.DEVELOPMENT)

// For production
GameAlytics.GameAlytics.Init("your-api-key", Environment.PRODUCTION)
```

### Error Handling

```csharp
try 
{
    var analytics = GameAlytics.GameAlytics.Init("your-api-key", Environment.PRODUCTION)
        .UserConfig(userConfig)
        .Create();
}
catch (System.Exception e)
{
    Debug.LogError($"Failed to initialize GameAlytics: {e.Message}");
}
```

### Performance Optimization

```csharp
// Store instance reference to avoid repeated GetInstance() calls
var analytics = GameAlytics.GameAlytics.GetInstance();

analytics.SystemEvent()
    .Category(typeof(GameAlytics.GameAlytics.GameplayEvents))
    .Type(GameAlytics.GameAlytics.GameplayEvents.LEVEL_START)
    .Trigger();
```

## 🎮 Platform Support

The GameAlytics Unity SDK supports all major Unity platforms:

- **Mobile**: iOS, Android
- **Desktop**: Windows, macOS, Linux
- **Web**: WebGL
- **Console**: Xbox, PlayStation, Nintendo Switch
- **Editor**: Unity Editor (for testing)

## 📱 Best Practices

1. **Initialize early**: Initialize the SDK in your game's startup sequence
2. **Track meaningful events**: Focus on events that provide actionable insights
3. **Use consistent naming**: Use consistent event and parameter names across your game
4. **Test in development**: Use the development environment to verify events are being tracked correctly
5. **Handle session lifecycle**: Call `StartSession()` and `EndSession()` appropriately
6. **Respect privacy**: Only collect data that's necessary for improving your game
7. **Use proper error handling**: Wrap SDK calls in try-catch blocks for production builds

## 🔧 Troubleshooting

### Common Issues

**Events not appearing in dashboard**:
- Verify your API key is correct
- Check your internet connection
- Make sure you're looking at the correct environment in the GameAlytics dashboard
- Check Unity console for any error messages

**SDK not initializing**:
- Check the Unity console for any error messages
- Make sure you have the required internet permissions
- Verify your API key and environment configuration

**Performance concerns**:
- Events are automatically batched and sent in the background
- The SDK uses minimal resources and runs on separate threads where possible
- Consider reducing event frequency if you're sending thousands of events per second

### Debug Logging

The SDK automatically provides detailed logging in the Development environment:

```csharp
// Development environment shows detailed logs
GameAlytics.GameAlytics.Init("your-api-key", Environment.DEVELOPMENT)
    .UserConfig(userConfig)
    .Create();
```

### Editor Tools

Access GameAlytics tools from the Unity menu bar:

- **GameAlytics > Export Package**: Export the GameAlytics package
- **GameAlytics > Validate Package Structure**: Validate installation
- **GameAlytics > About**: View version and support information

## 📞 Support

- **📧 Email**: support@gamealytics.com
- **📚 Documentation**: [docs.gamealytics.com](https://docs.gamealytics.com)
- **🐛 Issues**: [GitHub Issues](https://github.com/gamealytics/gamealytics-sdk/issues)

## 📄 License

This SDK is licensed under the MIT License. See the LICENSE file for more information.

## 📋 Version History

### v2.0.9
- Authentic Unity package distribution via Firebase Storage
- Enhanced fluent API design
- Comprehensive event categories
- Cross-platform support for all Unity targets
- Performance optimizations with event batching
- Improved error handling and validation
- Unity Editor integration tools

---

**Built with ❤️ by the GameAlytics Team**  
*Empowering Unity developers with actionable analytics*