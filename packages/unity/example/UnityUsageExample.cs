using System.Collections.Generic;
using UnityEngine;
using GameAlytics;

// Example usage of the GameAlytics Unity SDK with the new fluent API

public class UnityUsageExample : MonoBehaviour
{
    private GameAlytics.GameAlytics gameAlytics;

    void Start()
    {
        InitializeSDK();
        TrackEvents();
        SessionManagement();
    }

    private void InitializeSDK()
    {
        try
        {
            // Initialize GameAlytics with fluent API
            gameAlytics = GameAlytics.GameAlytics.Init("your-api-key-here", Environment.DEVELOPMENT)
                .UserConfig(
                    UserConfig.Builder()
                        .SetSessionId("session-123")
                        .SetUserId("user-456")
                        .Build()
                )
                .Create();

            Debug.Log("GameAlytics Unity SDK initialized successfully");
        }
        catch (System.Exception error)
        {
            Debug.LogError($"Failed to initialize GameAlytics: {error.Message}");
        }
    }

    private void TrackEvents()
    {
        if (gameAlytics == null)
        {
            Debug.LogError("GameAlytics not initialized");
            return;
        }

        // Track system events
        gameAlytics.Event(EventType.SESSION_START, EventCategory.USER)
            .SetProperties(new Dictionary<string, object> { { "source", "unity_game" } })
            .Track();

        // Track system events using the new static API
        GameAlytics.GetInstance().SystemEvent()
            .Category<Gameplay>()
            .Type(Gameplay.LevelStart)
            .SetProperties(new Dictionary<string, string>
            {
                { "level", "1" },
                { "difficulty", "easy" }
            })
            .Trigger();

        GameAlytics.GetInstance().SystemEvent()
            .Category<IAP>()
            .Type(IAP.Purchase)
            .SetProperties(new Dictionary<string, string>
            {
                { "item_id", "premium_upgrade" },
                { "price", "9.99" },
                { "currency", "USD" }
            })
            .Trigger();

        // Track custom events
        GameAlytics.GetInstance().CustomEvent()
            .Category("ui")
            .Type("button_tap")
            .SetProperties(new Dictionary<string, string>
            {
                { "button_name", "start_game" },
                { "screen", "main_menu" }
            })
            .Trigger();

        gameAlytics.CustomEvent("achievement_earned", "progression")
            .SetProperties(new Dictionary<string, object>
            {
                { "achievement_id", "first_win" },
                { "points", 100 }
            })
            .Track();
    }

    private void SessionManagement()
    {
        if (gameAlytics == null) return;

        // Start a new session
        gameAlytics.StartSession();

        // Simulate some gameplay time
        Invoke(nameof(EndGameSession), 60f); // End session after 1 minute
    }

    private void EndGameSession()
    {
        if (gameAlytics != null)
        {
            gameAlytics.EndSession();
        }
    }

    // Example of tracking user progression
    public void TrackUserProgression()
    {
        if (gameAlytics == null) return;

        gameAlytics.Event(EventType.LEVEL_UP, EventCategory.PROGRESSION)
            .SetProperties(new Dictionary<string, object>
            {
                { "new_level", 5 },
                { "experience_gained", 250 },
                { "time_played", 1800 } // 30 minutes
            })
            .Track();
    }

    // Example of tracking monetization events
    public void TrackPurchase(string productId, float price, string currency)
    {
        if (gameAlytics == null) return;

        gameAlytics.Event(EventType.PURCHASE, EventCategory.IAP)
            .SetProperties(new Dictionary<string, object>
            {
                { "product_id", productId },
                { "price", price },
                { "currency", currency },
                { "platform", Application.platform.ToString() }
            })
            .Track();
    }

    // Example of tracking ad events
    public void TrackAdViewed(string adType, string placement)
    {
        if (gameAlytics == null) return;

        gameAlytics.Event(EventType.AD_VIEWED, EventCategory.AD)
            .SetProperties(new Dictionary<string, object>
            {
                { "ad_type", adType },
                { "placement", placement },
                { "timestamp", System.DateTimeOffset.UtcNow.ToUnixTimeSeconds() }
            })
            .Track();
    }

    // Example of tracking tutorial completion
    public void TrackTutorialComplete(int stepCount, float timeSpent)
    {
        if (gameAlytics == null) return;

        gameAlytics.Event(EventType.TUTORIAL_COMPLETE, EventCategory.PROGRESSION)
            .SetProperties(new Dictionary<string, object>
            {
                { "step_count", stepCount },
                { "time_spent", timeSpent },
                { "completion_rate", 1.0f }
            })
            .Track();
    }

    // Example of tracking level completion
    public void TrackLevelComplete(int level, float score, bool success)
    {
        if (gameAlytics == null) return;

        gameAlytics.Event(EventType.LEVEL_END, EventCategory.GAMEPLAY)
            .SetProperties(new Dictionary<string, object>
            {
                { "level", level },
                { "score", score },
                { "success", success },
                { "attempts", success ? 1 : 2 }
            })
            .Track();
    }

    void OnApplicationPause(bool pauseStatus)
    {
        if (gameAlytics == null) return;

        if (pauseStatus)
        {
            // App is pausing
            gameAlytics.CustomEvent("app_pause", "lifecycle")
                .SetProperties(new Dictionary<string, object>
                {
                    { "timestamp", System.DateTimeOffset.UtcNow.ToUnixTimeSeconds() }
                })
                .Track();
        }
        else
        {
            // App is resuming
            gameAlytics.CustomEvent("app_resume", "lifecycle")
                .SetProperties(new Dictionary<string, object>
                {
                    { "timestamp", System.DateTimeOffset.UtcNow.ToUnixTimeSeconds() }
                })
                .Track();
        }
    }
}

// Example of a game manager that uses GameAlytics
public class GameManager : MonoBehaviour
{
    private GameAlytics.GameAlytics gameAlytics;

    void Awake()
    {
        // Initialize GameAlytics for production
        try
        {
            gameAlytics = GameAlytics.GameAlytics.Init("your-production-api-key", Environment.PRODUCTION)
                .UserConfig(
                    UserConfig.Builder()
                        .SetSessionId(System.Guid.NewGuid().ToString())
                        .SetAnonymous(SystemInfo.deviceUniqueIdentifier)
                        .Build()
                )
                .Create();
        }
        catch (System.Exception error)
        {
            Debug.LogError($"Failed to initialize GameAlytics in GameManager: {error.Message}");
        }
    }

    public void OnPlayerDeath(int level, float survivalTime)
    {
        if (gameAlytics == null) return;

        gameAlytics.CustomEvent("player_death", "gameplay")
            .SetProperties(new Dictionary<string, object>
            {
                { "level", level },
                { "survival_time", survivalTime },
                { "cause", "enemy_collision" }
            })
            .Track();
    }

    public void OnPowerUpCollected(string powerUpType)
    {
        if (gameAlytics == null) return;

        gameAlytics.CustomEvent("powerup_collected", "gameplay")
            .SetProperties(new Dictionary<string, object>
            {
                { "powerup_type", powerUpType },
                { "timestamp", System.DateTimeOffset.UtcNow.ToUnixTimeSeconds() }
            })
            .Track();
    }
}
