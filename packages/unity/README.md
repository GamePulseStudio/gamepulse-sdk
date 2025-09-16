# GameAnalytics Unity SDK

The official Unity SDK for GameAlytics, providing game analytics tracking for Unity games across multiple platforms.

## Features

- **Cross-platform support**: Works on all major Unity platforms (iOS, Android, Windows, macOS, Linux, WebGL, and consoles)
- **Easy integration**: Simple API for tracking game events, errors, and in-app purchases
- **Real-time analytics**: View your game's analytics in real-time on the GameAlytics dashboard
- **Comprehensive event tracking**: Track custom events, errors, sessions, and more
- **Lightweight**: Minimal performance impact on your game

## Installation

### Method 1: Unity Package (.unitypackage) - **RECOMMENDED**

1. **Download the latest Unity package**:
   - Visit: [GameAlytics Unity SDK Downloads](https://firebase.google.com/docs/storage) *(Firebase Storage link will be provided)*
   - Or download directly: `GameAlytics-2.0.9.unitypackage`

2. **Import in Unity**:
   - Open your Unity project
   - Go to `Assets > Import Package > Custom Package`
   - Select the downloaded `GameAlytics.unitypackage` file
   - Click "Import" to add GameAlytics to your project

### Method 2: Unity Package Manager (Git URL)

1. Open Unity Package Manager (`Window > Package Manager`)
2. Click the `+` button and select `Add package from git URL`
3. Enter: `https://github.com/gamealytics/gamealytics-sdk.git?path=/packages/unity`

*Note: Method 1 (.unitypackage) is recommended as it provides a complete, authentic Unity package experience with proper Editor integration.*

## Usage

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
        GameAlytics.Init("your-api-key", Environment.PRODUCTION)
            .UserConfig(userConfig)
            .Create();
    }
}
```

### 2. Track System Events

```csharp
// Track user events
GameAlytics.GetInstance().SystemEvent()
    .Category(typeof(GameAlytics.UserEvents))
    .Type(GameAlytics.UserEvents.SESSION_START)
    .SetProperties(new Dictionary<string, string> 
    {
        {"platform", "mobile"}
    })
    .Trigger();

// Track gameplay events
GameAlytics.GetInstance().SystemEvent()
    .Category(typeof(GameAlytics.GameplayEvents))
    .Type(GameAlytics.GameplayEvents.LEVEL_START)
    .SetProperties(new Dictionary<string, string>
    {
        {"level", "1"},
        {"difficulty", "easy"}
    })
    .Trigger();

// Track IAP events
GameAlytics.GetInstance().SystemEvent()
    .Category(typeof(GameAlytics.IAPEvents))
    .Type(GameAlytics.IAPEvents.PURCHASE)
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
GameAlytics.GetInstance().CustomEvent()
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
GameAlytics.GetInstance().StartSession();

// End current session
GameAlytics.GetInstance().EndSession();
```

## Event Categories

### User Events
```csharp
GameAlytics.UserEvents.SESSION_START
GameAlytics.UserEvents.SESSION_END
GameAlytics.UserEvents.USER_LOGIN
GameAlytics.UserEvents.USER_LOGOUT
GameAlytics.UserEvents.USER_REGISTER
```

### Gameplay Events
```csharp
GameAlytics.GameplayEvents.LEVEL_START
GameAlytics.GameplayEvents.LEVEL_END
GameAlytics.GameplayEvents.LEVEL_UP
GameAlytics.GameplayEvents.GAME_START
GameAlytics.GameplayEvents.GAME_END
GameAlytics.GameplayEvents.BOSS_FIGHT
```

### Economy Events
```csharp
GameAlytics.EconomyEvents.CURRENCY_EARNED
GameAlytics.EconomyEvents.CURRENCY_SPENT
GameAlytics.EconomyEvents.ITEM_PURCHASED
GameAlytics.EconomyEvents.ITEM_SOLD
GameAlytics.EconomyEvents.SHOP_VIEWED
```

| Event | Description |
|-------|-------------|
| `OnInitialized` | Triggered when the SDK is successfully initialized |

## Best Practices

1. **Initialize early**: Initialize the SDK as early as possible in your game's lifecycle
2. **Track meaningful events**: Focus on events that provide actionable insights
3. **Use consistent naming**: Use consistent event and parameter names across your game
4. **Test in development**: Use the debug mode to verify events are being tracked correctly
5. **Respect privacy**: Only collect data that's necessary for improving your game

## Troubleshooting

### Common Issues

- **Events not appearing in dashboard**:
  - Verify your game key and secret key are correct
  - Check your internet connection
  - Make sure you're looking at the correct environment in the GameAlytics dashboard

- **SDK not initializing**:
  - Check the Unity console for any error messages
  - Make sure you have the required permissions in your Android/iOS manifest

### Debugging

Enable debug logging to see detailed information about SDK operations:

```csharp
// Enable debug logging before initializing the SDK
GameAnalytics.SetDebugLogEnabled(true);
GameAnalytics.Initialize(gameKey, secretKey, Application.version);
```

## Support

For support, please contact support@gamealytics.com or visit our [documentation](https://docs.gamealytics.com).

## License

This SDK is licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.
