# GameAnalytics Unity SDK

The official Unity SDK for GameAlytics, providing game analytics tracking for Unity games across multiple platforms.

## Features

- **Cross-platform support**: Works on all major Unity platforms (iOS, Android, Windows, macOS, Linux, WebGL, and consoles)
- **Easy integration**: Simple API for tracking game events, errors, and in-app purchases
- **Real-time analytics**: View your game's analytics in real-time on the GameAlytics dashboard
- **Comprehensive event tracking**: Track custom events, errors, sessions, and more
- **Lightweight**: Minimal performance impact on your game

## Installation

### Using Unity Package Manager (UPM)

1. Open your Unity project
2. Open the Package Manager (Window > Package Manager)
3. Click the "+" button in the top-left corner and select "Add package from git URL..."
4. Enter the Git URL for this package: `https://github.com/your-org/gamealytics-sdk.git?path=packages/unity`
5. Click "Add"

### Manual Installation

1. Download the latest `.unitypackage` from the [releases page](https://github.com/your-org/gamealytics-sdk/releases)
2. Import the package into your Unity project (Assets > Import Package > Custom Package...)
3. Select the downloaded `.unitypackage` file and click "Import"

## Getting Started

### Initialization

Initialize the SDK in your game's startup code (e.g., in a `GameManager` script):

```csharp
using GameAnalyticsSDK;

public class GameManager : MonoBehaviour
{
    private void Start()
    {
        // Replace with your GameAnalytics game key and secret key
        string gameKey = "YOUR_GAME_KEY";
        string secretKey = "YOUR_SECRET_KEY";
        
        // Initialize the SDK
        GameAnalytics.Initialize(gameKey, secretKey, Application.version);
        
        // Optional: Listen for initialization
        GameAnalytics.OnInitialized += () => {
            Debug.Log("GameAnalytics initialized successfully!");
        };
    }
    
    private void OnApplicationQuit()
    {
        // Track session end when the application quits
        GameAnalytics.TrackSessionEnd();
    }
}
```

### Tracking Events

Track custom events to understand player behavior:

```csharp
// Track a simple event
GameAnalytics.TrackEvent("level_started", new Dictionary<string, object>
{
    { "level_name", "Forest Level" },
    { "difficulty", "hard" },
    { "player_class", "warrior" }
});

// Track an in-app purchase
GameAnalytics.TrackPurchase(
    productId: "com.yourgame.coins.100",
    currency: "USD",
    amount: 0.99,
    transactionId: "T123456789"
);

// Track an error
try
{
    // Your game code here
}
catch (Exception ex)
{
    GameAnalytics.TrackError(ex, isFatal: true, new Dictionary<string, object>
    {
        { "context", "loading_save_game" },
        { "player_level", 5 }
    });
}
```

### Configuration

You can configure the SDK by creating a `GameAnalyticsConfig` asset in your project:

1. Right-click in the Project window
2. Select Create > GameAnalytics > Config
3. Configure the settings as needed
4. The SDK will automatically use this configuration when initialized

## Advanced Usage

### Custom User IDs

To track users across devices or platforms, set a custom user ID:

```csharp
// Set a custom user ID (e.g., from your authentication system)
GameAnalytics.SetCustomUserId("player123");

// Get the current user ID
string userId = GameAnalytics.GetUserId();
```

### Manual Flushing

By default, events are sent in batches. You can manually flush the event queue:

```csharp
// Force send all queued events to the server
GameAnalytics.Flush();
```

### Platform-Specific Setup

#### Android

Add the following permissions to your `AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

#### iOS

Add the following to your `Info.plist`:

```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <true/>
</dict>
```

## API Reference

### Static Methods

| Method | Description |
|--------|-------------|
| `Initialize(string gameKey, string secretKey, string build, string userId = null)` | Initializes the GameAnalytics SDK |
| `TrackEvent(string eventName, Dictionary<string, object> customFields = null)` | Tracks a custom event |
| `TrackSessionStart()` | Tracks the start of a user session |
| `TrackSessionEnd()` | Tracks the end of a user session |
| `TrackError(Exception error, bool isFatal = false, Dictionary<string, object> context = null)` | Tracks an error event |
| `TrackPurchase(string productId, string currency, double amount, string transactionId, string receipt = null, Dictionary<string, object> customFields = null)` | Tracks an in-app purchase |
| `SetCustomUserId(string userId)` | Sets a custom user ID |
| `string GetUserId()` | Gets the current user ID |
| `string GetSessionId()` | Gets the current session ID |
| `string GetDeviceId()` | Gets the device ID |
| `void Flush()` | Flushes any queued events to the server |

### Events

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
