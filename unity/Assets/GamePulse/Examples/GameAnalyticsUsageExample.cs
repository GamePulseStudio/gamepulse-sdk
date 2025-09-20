using System.Collections.Generic;
using UnityEngine;
using Gamepulse;

/// <summary>
/// Example usage of the Gamepulse Unity SDK
/// This script demonstrates how to initialize and use Gamepulse for tracking various game events
/// </summary>
public class GamepulseUsageExample : MonoBehaviour
{
    [Header("Gamepulse Configuration")]
    [SerializeField] private string apiKey = "your-api-key-here";
    [SerializeField] private Environment environment = Environment.DEVELOPMENT;
    
    private Gamepulse.Gamepulse gamepulse;

    void Start()
    {
        InitializeGamepulse();
        StartCoroutine(RunExampleEvents());
    }

    /// <summary>
    /// Initialize Gamepulse SDK
    /// </summary>
    private void InitializeGamepulse()
    {
        try
        {
            // Create user configuration
            var userConfig = UserConfig.CreateBuilder()
                .SetSessionId(System.Guid.NewGuid().ToString())
                .SetUserId("player_" + SystemInfo.deviceUniqueIdentifier)
                .Build();

            // Initialize Gamepulse with fluent API
            gamepulse = Gamepulse.Gamepulse.Init(apiKey, environment)
                .UserConfig(userConfig)
                .Create();

            Debug.Log("Gamepulse Unity SDK initialized successfully");
        }
        catch (System.Exception error)
        {
            Debug.LogError($"Failed to initialize Gamepulse: {error.Message}");
        }
    }

    /// <summary>
    /// Run example events to demonstrate SDK functionality
    /// </summary>
    private System.Collections.IEnumerator RunExampleEvents()
    {
        yield return new WaitForSeconds(1f);

        if (gamepulse == null)
        {
            Debug.LogError("Gamepulse not initialized, skipping examples");
            yield break;
        }

        // Example 1: Track session start
        TrackSessionStart();
        
        yield return new WaitForSeconds(2f);

        // Example 2: Track gameplay events
        TrackGameplayEvents();
        
        yield return new WaitForSeconds(2f);

        // Example 3: Track user progression
        TrackUserProgression();
        
        yield return new WaitForSeconds(2f);

        // Example 4: Track monetization
        TrackMonetizationEvents();
        
        yield return new WaitForSeconds(2f);

        // Example 5: Track custom events
        TrackCustomEvents();
    }

    /// <summary>
    /// Example: Track session events
    /// </summary>
    private void TrackSessionStart()
    {
        Debug.Log("Tracking session start event");
        
        Gamepulse.Gamepulse.GetInstance().SystemEvent()
            .Category(typeof(Gamepulse.Gamepulse.UserEvents))
            .Type(Gamepulse.Gamepulse.UserEvents.SESSION_START)
            .SetProperties(new Dictionary<string, string>
            {
                { "platform", Application.platform.ToString() },
                { "unity_version", Application.unityVersion },
                { "app_version", Application.version }
            })
            .Trigger();
    }

    /// <summary>
    /// Example: Track gameplay events
    /// </summary>
    private void TrackGameplayEvents()
    {
        Debug.Log("Tracking gameplay events");

        // Track level start
        Gamepulse.Gamepulse.GetInstance().SystemEvent()
            .Category(typeof(Gamepulse.Gamepulse.GameplayEvents))
            .Type(Gamepulse.Gamepulse.GameplayEvents.LEVEL_START)
            .SetProperties(new Dictionary<string, string>
            {
                { "level", "1" },
                { "difficulty", "easy" },
                { "game_mode", "campaign" }
            })
            .Trigger();

        // Track level completion
        Gamepulse.Gamepulse.GetInstance().SystemEvent()
            .Category(typeof(Gamepulse.Gamepulse.GameplayEvents))
            .Type(Gamepulse.Gamepulse.GameplayEvents.LEVEL_END)
            .SetProperties(new Dictionary<string, string>
            {
                { "level", "1" },
                { "success", "true" },
                { "score", "1500" },
                { "time_taken", "120" }
            })
            .Trigger();
    }

    /// <summary>
    /// Example: Track user progression events
    /// </summary>
    private void TrackUserProgression()
    {
        Debug.Log("Tracking user progression events");

        // Track level up
        Gamepulse.Gamepulse.GetInstance().SystemEvent()
            .Category(typeof(Gamepulse.Gamepulse.ProgressionEvents))
            .Type(Gamepulse.Gamepulse.ProgressionEvents.ACHIEVEMENT_UNLOCKED)
            .SetProperties(new Dictionary<string, string>
            {
                { "achievement_id", "first_victory" },
                { "achievement_name", "First Victory" },
                { "reward_type", "xp" },
                { "reward_amount", "100" }
            })
            .Trigger();

        // Track tutorial completion
        Gamepulse.Gamepulse.GetInstance().SystemEvent()
            .Category(typeof(Gamepulse.Gamepulse.ProgressionEvents))
            .Type(Gamepulse.Gamepulse.ProgressionEvents.TUTORIAL_COMPLETE)
            .SetProperties(new Dictionary<string, string>
            {
                { "tutorial_steps", "5" },
                { "completion_time", "180" },
                { "skipped", "false" }
            })
            .Trigger();
    }

    /// <summary>
    /// Example: Track monetization events
    /// </summary>
    private void TrackMonetizationEvents()
    {
        Debug.Log("Tracking monetization events");

        // Track IAP purchase
        Gamepulse.Gamepulse.GetInstance().SystemEvent()
            .Category(typeof(Gamepulse.Gamepulse.IAPEvents))
            .Type(Gamepulse.Gamepulse.IAPEvents.PURCHASE)
            .SetProperties(new Dictionary<string, string>
            {
                { "product_id", "premium_upgrade" },
                { "price", "9.99" },
                { "currency", "USD" },
                { "transaction_id", "txn_" + System.DateTime.Now.Ticks }
            })
            .Trigger();

        // Track ad viewing
        Gamepulse.Gamepulse.GetInstance().SystemEvent()
            .Category(typeof(Gamepulse.Gamepulse.AdEvents))
            .Type(Gamepulse.Gamepulse.AdEvents.AD_VIEWED)
            .SetProperties(new Dictionary<string, string>
            {
                { "ad_type", "rewarded_video" },
                { "placement", "level_failed" },
                { "ad_network", "unity_ads" },
                { "reward_type", "extra_lives" }
            })
            .Trigger();
    }

    /// <summary>
    /// Example: Track custom events specific to your game
    /// </summary>
    private void TrackCustomEvents()
    {
        Debug.Log("Tracking custom events");

        // Track player death
        Gamepulse.Gamepulse.GetInstance().CustomEvent()
            .Category("player_death")
            .Type("enemy_collision")
            .SetProperties(new Dictionary<string, string>
            {
                { "enemy_type", "goblin" },
                { "player_level", "5" },
                { "location", "forest_level_1" },
                { "survival_time", "45" }
            })
            .Trigger();

        // Track item usage
        Gamepulse.Gamepulse.GetInstance().CustomEvent()
            .Category("item_usage")
            .Type("potion_consumed")
            .SetProperties(new Dictionary<string, string>
            {
                { "item_type", "health_potion" },
                { "item_rarity", "common" },
                { "player_health_before", "25" },
                { "player_health_after", "100" }
            })
            .Trigger();

        // Track UI interactions
        Gamepulse.Gamepulse.GetInstance().CustomEvent()
            .Category("ui_interaction")
            .Type("button_click")
            .SetProperties(new Dictionary<string, string>
            {
                { "button_name", "shop_button" },
                { "screen_name", "main_menu" },
                { "session_time", Time.time.ToString() }
            })
            .Trigger();
    }

    /// <summary>
    /// Example method to track level progression (call this from your game logic)
    /// </summary>
    public void OnLevelComplete(int level, bool success, float score, float timeSpent)
    {
        if (gamepulse == null) return;

        Gamepulse.Gamepulse.GetInstance().SystemEvent()
            .Category(typeof(Gamepulse.Gamepulse.GameplayEvents))
            .Type(success ? Gamepulse.Gamepulse.GameplayEvents.LEVEL_END : "level_failed")
            .SetProperties(new Dictionary<string, string>
            {
                { "level", level.ToString() },
                { "success", success.ToString().ToLower() },
                { "score", score.ToString("F0") },
                { "time_spent", timeSpent.ToString("F2") },
                { "attempts", "1" }
            })
            .Trigger();
    }

    /// <summary>
    /// Example method to track player purchases (call this from your IAP logic)
    /// </summary>
    public void OnPurchaseComplete(string productId, float price, string currency)
    {
        if (gamepulse == null) return;

        Gamepulse.Gamepulse.GetInstance().SystemEvent()
            .Category(typeof(Gamepulse.Gamepulse.IAPEvents))
            .Type(Gamepulse.Gamepulse.IAPEvents.PURCHASE)
            .SetProperties(new Dictionary<string, string>
            {
                { "product_id", productId },
                { "price", price.ToString("F2") },
                { "currency", currency },
                { "store", "unity" },
                { "timestamp", System.DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString() }
            })
            .Trigger();
    }

    /// <summary>
    /// Example method to track player achievements
    /// </summary>
    public void OnAchievementUnlocked(string achievementId, string achievementName)
    {
        if (gamepulse == null) return;

        Gamepulse.Gamepulse.GetInstance().SystemEvent()
            .Category(typeof(Gamepulse.Gamepulse.ProgressionEvents))
            .Type(Gamepulse.Gamepulse.ProgressionEvents.ACHIEVEMENT_UNLOCKED)
            .SetProperties(new Dictionary<string, string>
            {
                { "achievement_id", achievementId },
                { "achievement_name", achievementName },
                { "timestamp", System.DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString() }
            })
            .Trigger();
    }

    void OnApplicationPause(bool pauseStatus)
    {
        if (gamepulse == null) return;

        string eventType = pauseStatus ? "app_paused" : "app_resumed";
        
        Gamepulse.Gamepulse.GetInstance().CustomEvent()
            .Category("app_lifecycle")
            .Type(eventType)
            .SetProperties(new Dictionary<string, string>
            {
                { "timestamp", System.DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString() },
                { "session_time", Time.time.ToString("F2") }
            })
            .Trigger();
    }

    void OnDestroy()
    {
        // End session when this component is destroyed
        if (gamepulse != null)
        {
            gamepulse.EndSession();
        }
    }
}