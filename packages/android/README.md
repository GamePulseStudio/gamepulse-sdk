# GameAlytics Android SDK

The official Android SDK for GameAlytics, providing comprehensive game analytics tracking for Android games.

## Features

- **Easy integration**: Simple API for tracking game events, user actions, and in-app purchases
- **Real-time analytics**: View your game's analytics in real-time on the GameAlytics dashboard
- **Comprehensive event tracking**: Track system events, custom events, user sessions, and more
- **Lightweight**: Minimal performance impact on your game
- **Automatic device info**: Automatically collects device information and user agent data
- **Event validation**: Built-in data validation and sanitization

## Installation

### Via JitPack

Add JitPack repository to your project's `build.gradle` (project level):

```gradle
allprojects {
    repositories {
        google()
        mavenCentral()
        maven { url 'https://jitpack.io' }
    }
}
```

Add the dependency to your app's `build.gradle` (app level):

```gradle
dependencies {
    implementation 'com.github.gamealytics:gamealytics-sdk:2.0.14'
}
```

## Usage

### 1. Initialize the SDK

```java
import com.gamealytics.sdk.GameAlytics;
import com.gamealytics.sdk.UserConfig;
import com.gamealytics.sdk.Environment;

public class MainActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Create user configuration
        UserConfig userConfig = UserConfig.createBuilder()
            .setSessionId(UUID.randomUUID().toString())
            .setUserId("user123") // or use setAnonymous() for anonymous users
            .build();

        // Initialize GameAlytics
        GameAlytics.init("your-api-key", Environment.PRODUCTION)
            .userConfig(userConfig)
            .create();
    }
}
```

### 2. Track System Events

```java
// Track user events
GameAlytics.getInstance().systemEvent()
    .category(GameAlytics.UserEvents.class)
    .type(GameAlytics.UserEvents.SESSION_START)
    .setProperties(new HashMap<String, String>() {{
        put("platform", "mobile");
        put("version", "1.0.0");
    }})
    .trigger();

// Track gameplay events
GameAlytics.getInstance().systemEvent()
    .category(GameAlytics.GameplayEvents.class)
    .type(GameAlytics.GameplayEvents.LEVEL_START)
    .setProperties(new HashMap<String, String>() {{
        put("level", "1");
        put("difficulty", "easy");
    }})
    .trigger();

// Track IAP events
GameAlytics.getInstance().systemEvent()
    .category(GameAlytics.IAPEvents.class)
    .type(GameAlytics.IAPEvents.PURCHASE)
    .setProperties(new HashMap<String, String>() {{
        put("item_id", "sword_001");
        put("price", "4.99");
        put("currency", "USD");
    }})
    .trigger();
```

### 3. Track Custom Events

```java
// Track custom events
GameAlytics.getInstance().customEvent()
    .category("boss_fight")
    .type("boss_defeated")
    .setProperties(new HashMap<String, String>() {{
        put("boss_name", "Dragon King");
        put("time_taken", "120");
        put("health_remaining", "25");
    }})
    .trigger();
```

### 4. Session Management

```java
// Start a new session (usually called in onResume)
GameAlytics.getInstance().startSession();

// End current session (usually called in onPause)
GameAlytics.getInstance().endSession();
```

## Event Categories

### User Events
```java
GameAlytics.UserEvents.SESSION_START
GameAlytics.UserEvents.SESSION_END
GameAlytics.UserEvents.USER_LOGIN
GameAlytics.UserEvents.USER_LOGOUT
GameAlytics.UserEvents.USER_REGISTER
```

### Gameplay Events
```java
GameAlytics.GameplayEvents.LEVEL_START
GameAlytics.GameplayEvents.LEVEL_END
GameAlytics.GameplayEvents.LEVEL_UP
GameAlytics.GameplayEvents.GAME_START
GameAlytics.GameplayEvents.GAME_END
GameAlytics.GameplayEvents.BOSS_FIGHT
```

### Economy Events
```java
GameAlytics.EconomyEvents.CURRENCY_EARNED
GameAlytics.EconomyEvents.CURRENCY_SPENT
GameAlytics.EconomyEvents.ITEM_PURCHASED
GameAlytics.EconomyEvents.ITEM_SOLD
GameAlytics.EconomyEvents.SHOP_VIEWED
```

### IAP Events
```java
GameAlytics.IAPEvents.PURCHASE
GameAlytics.IAPEvents.PURCHASE_FAILED
GameAlytics.IAPEvents.PURCHASE_RESTORED
GameAlytics.IAPEvents.SUBSCRIPTION_STARTED
GameAlytics.IAPEvents.SUBSCRIPTION_CANCELLED
```

### Progression Events
```java
GameAlytics.ProgressionEvents.TUTORIAL_COMPLETE
GameAlytics.ProgressionEvents.ACHIEVEMENT_UNLOCKED
GameAlytics.ProgressionEvents.MILESTONE_REACHED
GameAlytics.ProgressionEvents.QUEST_COMPLETED
```

### Ad Events
```java
GameAlytics.AdEvents.AD_VIEWED
GameAlytics.AdEvents.AD_CLICKED
GameAlytics.AdEvents.AD_REWARDED
GameAlytics.AdEvents.AD_FAILED
```

## Environment Configuration

```java
// For development/testing
GameAlytics.init("your-api-key", Environment.DEVELOPMENT)

// For production
GameAlytics.init("your-api-key", Environment.PRODUCTION)
```

## ProGuard Configuration

If you're using ProGuard, add these rules to your `proguard-rules.pro` file:

```proguard
-keep class com.gamealytics.sdk.** { *; }
-keepclassmembers class com.gamealytics.sdk.** { *; }
```

## Permissions

The SDK requires the following permission in your `AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.INTERNET" />
```

## Best Practices

1. **Initialize early**: Initialize the SDK in your `Application.onCreate()` or main `Activity.onCreate()`
2. **Track meaningful events**: Focus on events that provide actionable insights
3. **Use consistent naming**: Use consistent event and parameter names across your game
4. **Test in development**: Use the development environment to verify events are being tracked correctly
5. **Handle session lifecycle**: Call `startSession()` and `endSession()` appropriately with Activity lifecycle
6. **Respect privacy**: Only collect data that's necessary for improving your game

## Troubleshooting

### Common Issues

- **Events not appearing in dashboard**:
  - Verify your API key is correct
  - Check your internet connection
  - Make sure you're looking at the correct environment in the GameAlytics dashboard
  - Check Android logs for any error messages

- **SDK not initializing**:
  - Ensure you have the INTERNET permission in your manifest
  - Check that your API key and environment are valid
  - Verify JitPack dependency is properly added

### Debugging

Enable debug logging to see detailed information about SDK operations:

```java
// Enable debug logging before initializing the SDK (Development environment only)
GameAlytics.setDebugEnabled(true);
```

## Version History

Current version: **2.0.14**

- Added comprehensive event categories
- Improved error handling and validation
- Enhanced session management
- Added fluent API for better developer experience

## Support

For support, please contact support@gamealytics.com or visit our [documentation](https://docs.gamealytics.com).

## License

This SDK is licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.
