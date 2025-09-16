# GameAlytics Unity SDK

Cross-platform game analytics SDK for Unity with fluent builder API.

## 📱 Quick Setup

1. Download the `.unitypackage` from [GitHub Releases](https://github.com/gamealytics/gamealytics-sdk/releases)
2. Import: `Assets > Import Package > Custom Package`
3. Add the GameAlytics prefab to your scene or initialize via script

## 🚀 Basic Usage

```csharp
using GameAlytics;

// Initialize (do this once at app start)
GameAlytics.Initialize("your-api-key");

// Track events
GameAlytics.TrackEvent("level_completed", new Dictionary<string, object>
{
    ["level"] = 5,
    ["score"] = 1250,
    ["time"] = 45.2f
});

// Track user properties
GameAlytics.SetUserProperty("player_level", 12);
GameAlytics.SetUserProperty("premium_user", true);
```

## 📊 Event Categories

- **Gameplay Events**: Level progress, achievements, game actions
- **Monetization Events**: Purchases, ads, in-app transactions
- **User Events**: Registration, login, preferences
- **System Events**: Performance, errors, device info

## 🔗 Resources

- [Main Repository](https://github.com/gamealytics/gamealytics-sdk)
- [All Platforms Guide](https://github.com/gamealytics/gamealytics-sdk#quick-setup)
- [Issue Tracker](https://github.com/gamealytics/gamealytics-sdk/issues)

---

**Version**: 2.0.16 • **License**: MIT
