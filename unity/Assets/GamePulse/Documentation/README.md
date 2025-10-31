# Gamepulse Unity SDK

Cross-platform game analytics SDK for Unity with fluent builder API.

## 📱 Quick Setup

1. Download the `.unitypackage` from [GitHub Releases](https://github.com/gamepulse/gamepulse-sdk/releases)
2. Import: `Assets > Import Package > Custom Package`
3. Add the Gamepulse prefab to your scene or initialize via script

## 🚀 Basic Usage

```csharp
using Gamepulse;

// Initialize (do this once at app start)
Gamepulse.Initialize("your-api-key");

// Track events
Gamepulse.TrackEvent("level_completed", new Dictionary<string, object>
{
    ["level"] = 5,
    ["score"] = 1250,
    ["time"] = 45.2f
});

// Track user properties
Gamepulse.SetUserProperty("player_level", 12);
Gamepulse.SetUserProperty("premium_user", true);
```

## 📊 Event Categories

- **Gameplay Events**: Level progress, achievements, game actions
- **Monetization Events**: Purchases, ads, in-app transactions
- **User Events**: Registration, login, preferences
- **System Events**: Performance, errors, device info

## 🔗 Resources

- [Main Repository](https://github.com/gamepulse/gamepulse-sdk)
- [All Platforms Guide](https://github.com/gamepulse/gamepulse-sdk#quick-setup)
- [Issue Tracker](https://github.com/gamepulse/gamepulse-sdk/issues)

---

**License**: MIT
