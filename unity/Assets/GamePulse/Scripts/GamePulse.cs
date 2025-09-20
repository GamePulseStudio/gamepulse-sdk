using System;
using System.Collections;
using System.Collections.Generic;
using System.Text;
using UnityEngine;
using UnityEngine.Networking;

namespace GamePulse
{
    /// <summary>
    /// Environment configuration for GamePulse SDK
    /// </summary>
    public enum Environment
    {
        DEVELOPMENT,
        PRODUCTION
    }

    /// <summary>
    /// User configuration class for GamePulse SDK
    /// </summary>
    public class UserConfig
    {
        private readonly string sessionId;
        private readonly string userId;
        private readonly string anonymousId;
        
        private UserConfig(string sessionId, string userId, string anonymousId)
        {
            if (string.IsNullOrEmpty(sessionId))
            {
                throw new ArgumentException("sessionId is mandatory");
            }
            if (string.IsNullOrEmpty(userId) && string.IsNullOrEmpty(anonymousId))
            {
                throw new ArgumentException("Either userId or anonymousId must be provided");
            }
            
            this.sessionId = sessionId;
            this.userId = userId;
            this.anonymousId = anonymousId;
        }
        
        public string GetSessionId() { return sessionId; }
        public string GetUserId() { return userId; }
        public string GetAnonymousId() { return anonymousId; }
        
        public static Builder CreateBuilder()
        {
            return new Builder();
        }
        
        public class Builder
        {
            private string sessionId;
            private string userId;
            private string anonymousId;
            
            public Builder SetSessionId(string sessionId)
            {
                this.sessionId = sessionId;
                return this;
            }
            
            public Builder SetUserId(string userId)
            {
                this.userId = userId;
                return this;
            }
            
            public Builder SetAnonymous(string anonymousId)
            {
                this.anonymousId = anonymousId;
                return this;
            }
            
            public UserConfig Build()
            {
                return new UserConfig(sessionId, userId, anonymousId);
            }
        }
    }
    
    /// <summary>
    /// Device information class
    /// </summary>
    public class DeviceInfo
    {
        public readonly string platform;
        public readonly string osVersion;
        public readonly string appVersion;
        public readonly string deviceModel;
        public readonly string screenResolution;
        public readonly string deviceManufacturer;
        
        public DeviceInfo(string platform, string osVersion, string appVersion, 
                         string deviceModel, string screenResolution, string deviceManufacturer)
        {
            this.platform = platform;
            this.osVersion = osVersion;
            this.appVersion = appVersion;
            this.deviceModel = deviceModel;
            this.screenResolution = screenResolution;
            this.deviceManufacturer = deviceManufacturer;
        }
    }

    /// <summary>
    /// Gamepulse Unity SDK - Main class for analytics tracking
    /// </summary>
    public class Gamepulse : MonoBehaviour
    {
        // Singleton instance
        private static Gamepulse instance;
        
        // Configuration
        private string apiKey;
        private Environment environment;
        private UserConfig userConfig;
        private DeviceInfo deviceInfo;
        private string baseUrl;
        private bool isInitialized = false;
        
        // Queue for events
        private readonly Queue<Dictionary<string, object>> eventQueue = new Queue<Dictionary<string, object>>();
        private bool isSending = false;
        private const int MaxQueueSize = 1000;
        private const int BatchSize = 10;

        #region Event Categories
        
        /// <summary>
        /// User Events - Session management, login, registration
        /// </summary>
        public static class UserEvents
        {
            public const string CATEGORY = "user";
            public const string SESSION_START = "session_start";
            public const string SESSION_END = "session_end";
            public const string USER_LOGIN = "user_login";
            public const string USER_LOGOUT = "user_logout";
            public const string USER_REGISTER = "user_register";
            
            private static readonly string[] ValidEvents = {
                SESSION_START, SESSION_END, USER_LOGIN, USER_LOGOUT, USER_REGISTER
            };
            
            /// <summary>
            /// Check if event type is valid for user events
            /// </summary>
            /// <param name="eventType">Event type to validate</param>
            /// <returns>True if valid, false otherwise</returns>
            public static bool IsValidEvent(string eventType)
            {
                return Array.Exists(ValidEvents, e => e.Equals(eventType));
            }
        }
        
        /// <summary>
        /// Gameplay Events - Level progression, game flow, achievements
        /// </summary>
        public static class GameplayEvents
        {
            public const string CATEGORY = "gameplay";
            public const string LEVEL_START = "level_start";
            public const string LEVEL_END = "level_end";
            public const string LEVEL_UP = "level_up";
            public const string GAME_START = "game_start";
            public const string GAME_END = "game_end";
            public const string BOSS_FIGHT = "boss_fight";
            
            private static readonly string[] ValidEvents = {
                LEVEL_START, LEVEL_END, LEVEL_UP, GAME_START, GAME_END, BOSS_FIGHT
            };
            
            /// <summary>
            /// Check if event type is valid for gameplay events
            /// </summary>
            /// <param name="eventType">Event type to validate</param>
            /// <returns>True if valid, false otherwise</returns>
            public static bool IsValidEvent(string eventType)
            {
                return Array.Exists(ValidEvents, e => e.Equals(eventType));
            }
        }
        
        /// <summary>
        /// Economy Events - Currency transactions, shop interactions
        /// </summary>
        public static class EconomyEvents
        {
            public const string CATEGORY = "economy";
            public const string CURRENCY_EARNED = "currency_earned";
            public const string CURRENCY_SPENT = "currency_spent";
            public const string ITEM_PURCHASED = "item_purchased";
            public const string ITEM_SOLD = "item_sold";
            public const string SHOP_VIEWED = "shop_viewed";
            
            private static readonly string[] ValidEvents = {
                CURRENCY_EARNED, CURRENCY_SPENT, ITEM_PURCHASED, ITEM_SOLD, SHOP_VIEWED
            };
            
            /// <summary>
            /// Check if event type is valid for economy events
            /// </summary>
            /// <param name="eventType">Event type to validate</param>
            /// <returns>True if valid, false otherwise</returns>
            public static bool IsValidEvent(string eventType)
            {
                return Array.Exists(ValidEvents, e => e.Equals(eventType));
            }
        }
        
        /// <summary>
        /// Progression Events - Tutorial completion, milestones, unlocks
        /// </summary>
        public static class ProgressionEvents
        {
            public const string CATEGORY = "progression";
            public const string TUTORIAL_COMPLETE = "tutorial_complete";
            public const string ACHIEVEMENT_UNLOCKED = "achievement_unlocked";
            public const string MILESTONE_REACHED = "milestone_reached";
            public const string QUEST_COMPLETED = "quest_completed";
            
            private static readonly string[] ValidEvents = {
                TUTORIAL_COMPLETE, ACHIEVEMENT_UNLOCKED, MILESTONE_REACHED, QUEST_COMPLETED
            };
            
            /// <summary>
            /// Check if event type is valid for progression events
            /// </summary>
            /// <param name="eventType">Event type to validate</param>
            /// <returns>True if valid, false otherwise</returns>
            public static bool IsValidEvent(string eventType)
            {
                return Array.Exists(ValidEvents, e => e.Equals(eventType));
            }
        }
        
        /// <summary>
        /// Ad Events - Ad viewing, clicks, rewards, failures
        /// </summary>
        public static class AdEvents
        {
            public const string CATEGORY = "ad";
            public const string AD_VIEWED = "ad_viewed";
            public const string AD_CLICKED = "ad_clicked";
            public const string AD_REWARDED = "ad_rewarded";
            public const string AD_FAILED = "ad_failed";
            
            private static readonly string[] ValidEvents = {
                AD_VIEWED, AD_CLICKED, AD_REWARDED, AD_FAILED
            };
            
            /// <summary>
            /// Check if event type is valid for ad events
            /// </summary>
            /// <param name="eventType">Event type to validate</param>
            /// <returns>True if valid, false otherwise</returns>
            public static bool IsValidEvent(string eventType)
            {
                return Array.Exists(ValidEvents, e => e.Equals(eventType));
            }
        }
        
        /// <summary>
        /// IAP Events - Purchases, subscriptions, transaction tracking
        /// </summary>
        public static class IAPEvents
        {
            public const string CATEGORY = "iap";
            public const string PURCHASE = "purchase";
            public const string PURCHASE_FAILED = "purchase_failed";
            public const string PURCHASE_RESTORED = "purchase_restored";
            public const string SUBSCRIPTION_STARTED = "subscription_started";
            public const string SUBSCRIPTION_CANCELLED = "subscription_cancelled";
            
            private static readonly string[] ValidEvents = {
                PURCHASE, PURCHASE_FAILED, PURCHASE_RESTORED, SUBSCRIPTION_STARTED, SUBSCRIPTION_CANCELLED
            };
            
            /// <summary>
            /// Check if event type is valid for IAP events
            /// </summary>
            /// <param name="eventType">Event type to validate</param>
            /// <returns>True if valid, false otherwise</returns>
            public static bool IsValidEvent(string eventType)
            {
                return Array.Exists(ValidEvents, e => e.Equals(eventType));
            }
        }
        
        #endregion

        #region Initialization
        
        /// <summary>
        /// Initialize Gamepulse SDK
        /// </summary>
        /// <param name="apiKey">Your Gamepulse API key</param>
        /// <param name="environment">Environment (Development or Production)</param>
        /// <returns>InitBuilder for fluent initialization</returns>
        public static InitBuilder Init(string apiKey, Environment environment)
        {
            return new InitBuilder(apiKey, environment);
        }

        /// <summary>
        /// Get the Gamepulse singleton instance
        /// </summary>
        /// <returns>Gamepulse instance</returns>
        public static Gamepulse GetInstance()
        {
            if (instance == null)
            {
                throw new InvalidOperationException("Gamepulse must be initialized first. Call Gamepulse.Init(...).Create()");
            }
            return instance;
        }

        #endregion

        #region Event Builders
        
        /// <summary>
        /// Create a system event builder
        /// </summary>
        /// <returns>SystemEventBuilder</returns>
        public SystemEventBuilder SystemEvent()
        {
            return new SystemEventBuilder();
        }

        /// <summary>
        /// Create a custom event builder
        /// </summary>
        /// <returns>CustomEventBuilder</returns>
        public CustomEventBuilder CustomEvent()
        {
            return new CustomEventBuilder();
        }
        
        /// <summary>
        /// Create a custom event builder with type and category (Android-style API)
        /// </summary>
        /// <param name="type">Event type</param>
        /// <param name="category">Event category</param>
        /// <returns>EventBuilder for chaining</returns>
        public EventBuilder CustomEvent(string type, string category)
        {
            CheckInitialized();
            return new EventBuilder(type, category, true);
        }

        #endregion

        #region Initialization Builder
        
        public class InitBuilder
        {
            private readonly string apiKey;
            private readonly Environment environment;
            private UserConfig userConfig;
            
            public InitBuilder(string apiKey, Environment environment)
            {
                this.apiKey = apiKey;
                this.environment = environment;
            }
            
            public InitBuilder UserConfig(UserConfig userConfig)
            {
                this.userConfig = userConfig;
                return this;
            }
            
            public Gamepulse Create()
            {
                if (string.IsNullOrEmpty(apiKey))
                {
                    throw new ArgumentException("API key is required");
                }
                if (userConfig == null)
                {
                    throw new ArgumentException("UserConfig is required");
                }
                
                if (instance == null)
                {
                    var go = new GameObject("Gamepulse");
                    instance = go.AddComponent<Gamepulse>();
                    DontDestroyOnLoad(go);
                    instance.Initialize(apiKey, environment, userConfig);
                }
                
                return instance;
            }
        }

        #endregion

        #region Unity Lifecycle
        
        private void Awake()
        {
            if (instance != null && instance != this)
            {
                Destroy(gameObject);
            }
        }

        private void OnApplicationPause(bool pauseStatus)
        {
            if (pauseStatus)
            {
                StartCoroutine(FlushEvents());
            }
        }

        private void OnApplicationQuit()
        {
            if (isInitialized)
            {
                StartCoroutine(FlushEvents(true));
            }
        }

        #endregion

        #region Private Methods
        
        private void Initialize(string apiKey, Environment environment, UserConfig userConfig)
        {
            this.apiKey = apiKey;
            this.environment = environment;
            this.userConfig = userConfig;
            this.deviceInfo = AutoFetchDeviceInfo();
            this.baseUrl = environment == Environment.PRODUCTION 
                ? "https://client.gamepulse.studio/events/collect" 
                : "https://client.dev.gamepulse.studio/events/collect";
            this.isInitialized = true;
            
            Debug.Log($"Gamepulse initialized successfully for {environment} environment");
        }

        #endregion

        #region Category-Specific Event Methods (Android-Style API)
        
        /// <summary>
        /// Create a user event builder with validation
        /// </summary>
        /// <param name="eventType">User event type</param>
        /// <returns>EventBuilder for chaining</returns>
        public EventBuilder UserEvent(string eventType)
        {
            CheckInitialized();
            if (!UserEvents.IsValidEvent(eventType))
            {
                throw new ArgumentException($"Invalid user event type: {eventType}");
            }
            return new EventBuilder(eventType, UserEvents.CATEGORY, false);
        }
        
        /// <summary>
        /// Create a gameplay event builder with validation
        /// </summary>
        /// <param name="eventType">Gameplay event type</param>
        /// <returns>EventBuilder for chaining</returns>
        public EventBuilder GameplayEvent(string eventType)
        {
            CheckInitialized();
            if (!GameplayEvents.IsValidEvent(eventType))
            {
                throw new ArgumentException($"Invalid gameplay event type: {eventType}");
            }
            return new EventBuilder(eventType, GameplayEvents.CATEGORY, false);
        }
        
        /// <summary>
        /// Create an economy event builder with validation
        /// </summary>
        /// <param name="eventType">Economy event type</param>
        /// <returns>EventBuilder for chaining</returns>
        public EventBuilder EconomyEvent(string eventType)
        {
            CheckInitialized();
            if (!EconomyEvents.IsValidEvent(eventType))
            {
                throw new ArgumentException($"Invalid economy event type: {eventType}");
            }
            return new EventBuilder(eventType, EconomyEvents.CATEGORY, false);
        }
        
        /// <summary>
        /// Create a progression event builder with validation
        /// </summary>
        /// <param name="eventType">Progression event type</param>
        /// <returns>EventBuilder for chaining</returns>
        public EventBuilder ProgressionEvent(string eventType)
        {
            CheckInitialized();
            if (!ProgressionEvents.IsValidEvent(eventType))
            {
                throw new ArgumentException($"Invalid progression event type: {eventType}");
            }
            return new EventBuilder(eventType, ProgressionEvents.CATEGORY, false);
        }
        
        /// <summary>
        /// Create an ad event builder with validation
        /// </summary>
        /// <param name="eventType">Ad event type</param>
        /// <returns>EventBuilder for chaining</returns>
        public EventBuilder AdEvent(string eventType)
        {
            CheckInitialized();
            if (!AdEvents.IsValidEvent(eventType))
            {
                throw new ArgumentException($"Invalid ad event type: {eventType}");
            }
            return new EventBuilder(eventType, AdEvents.CATEGORY, false);
        }
        
        /// <summary>
        /// Create an IAP event builder with validation
        /// </summary>
        /// <param name="eventType">IAP event type</param>
        /// <returns>EventBuilder for chaining</returns>
        public EventBuilder IAPEvent(string eventType)
        {
            CheckInitialized();
            if (!IAPEvents.IsValidEvent(eventType))
            {
                throw new ArgumentException($"Invalid IAP event type: {eventType}");
            }
            return new EventBuilder(eventType, IAPEvents.CATEGORY, false);
        }

        #endregion

        #region Event Builders Implementation
        
        public class SystemEventBuilder
        {
            private string category;
            private string type;
            private Dictionary<string, string> properties = new Dictionary<string, string>();
            
            public SystemEventBuilder Category(Type categoryClass)
            {
                this.category = categoryClass.Name.ToLower().Replace("events", "");
                return this;
            }
            
            public SystemEventBuilder Type(string type)
            {
                this.type = type;
                return this;
            }
            
            public SystemEventBuilder SetProperties(Dictionary<string, string> properties)
            {
                this.properties = properties ?? new Dictionary<string, string>();
                return this;
            }
            
            public void Trigger()
            {
                if (instance == null)
                {
                    throw new InvalidOperationException("Gamepulse must be initialized first");
                }
                if (string.IsNullOrEmpty(category) || string.IsNullOrEmpty(type))
                {
                    throw new ArgumentException("Category and type are required");
                }
                instance.TrackEventInternal("SYSTEM", type, category, properties);
            }
        }
        
        public class CustomEventBuilder
        {
            private string category;
            private string type;
            private Dictionary<string, string> properties = new Dictionary<string, string>();
            
            public CustomEventBuilder Category(string category)
            {
                this.category = category;
                return this;
            }
            
            public CustomEventBuilder Type(string type)
            {
                this.type = type;
                return this;
            }
            
            public CustomEventBuilder SetProperties(Dictionary<string, string> properties)
            {
                this.properties = properties ?? new Dictionary<string, string>();
                return this;
            }
            
            public void Trigger()
            {
                if (instance == null)
                {
                    throw new InvalidOperationException("Gamepulse must be initialized first");
                }
                if (string.IsNullOrEmpty(category) || string.IsNullOrEmpty(type))
                {
                    throw new ArgumentException("Category and type are required");
                }
                instance.TrackEventInternal("CUSTOM", type, category, properties);
            }
        }

        #endregion

        #region Event Tracking
        
        private void TrackEventInternal(string eventClass, string eventType, string category, Dictionary<string, string> properties)
        {
            if (eventQueue.Count >= MaxQueueSize)
            {
                eventQueue.Dequeue();
            }
            
            var eventData = new Dictionary<string, object>
            {
                ["type"] = eventClass,
                ["value"] = eventType,
                ["category"] = category,
                ["platform"] = deviceInfo.platform,
                ["osVersion"] = deviceInfo.osVersion,
                ["deviceModel"] = deviceInfo.deviceModel,
                ["deviceManufacturer"] = deviceInfo.deviceManufacturer,
                ["appVersion"] = deviceInfo.appVersion,
                ["screenResolution"] = deviceInfo.screenResolution,
                ["userId"] = userConfig.GetUserId() ?? "",
                ["anonymousId"] = userConfig.GetAnonymousId() ?? "",
                ["sessionId"] = userConfig.GetSessionId(),
                ["timezone"] = TimeZoneInfo.Local.StandardName,
                ["localDateTime"] = DateTime.UtcNow.ToString("o"),
                ["properties"] = properties ?? new Dictionary<string, string>()
            };
            
            eventQueue.Enqueue(eventData);
            
            if (eventQueue.Count >= BatchSize)
            {
                StartCoroutine(FlushEvents());
            }
        }

        #endregion

        #region Session Management
        
        /// <summary>
        /// Start a new session
        /// </summary>
        public void StartSession()
        {
            CheckInitialized();
            string newSessionId = System.Guid.NewGuid().ToString();
            this.userConfig = UserConfig.CreateBuilder()
                .SetSessionId(newSessionId)
                .SetUserId(userConfig.GetUserId())
                .SetAnonymous(userConfig.GetAnonymousId())
                .Build();
            
            SystemEvent()
                .Category(typeof(UserEvents))
                .Type(UserEvents.SESSION_START)
                .SetProperties(new Dictionary<string, string>())
                .Trigger();
        }

        /// <summary>
        /// End the current session
        /// </summary>
        public void EndSession()
        {
            CheckInitialized();
            
            if (string.IsNullOrEmpty(userConfig.GetSessionId()))
            {
                return;
            }
            
            SystemEvent()
                .Category(typeof(UserEvents))
                .Type(UserEvents.SESSION_END)
                .SetProperties(new Dictionary<string, string>())
                .Trigger();
        }

        #endregion

        #region Public API
        
        /// <summary>
        /// Update user configuration
        /// </summary>
        /// <param name="newUserConfig">New user configuration</param>
        public void UpdateUserConfig(UserConfig newUserConfig)
        {
            CheckInitialized();
            this.userConfig = newUserConfig;
        }
        
        /// <summary>
        /// Get current user configuration
        /// </summary>
        /// <returns>Current user configuration</returns>
        public UserConfig GetUserConfig()
        {
            return userConfig;
        }
        
        /// <summary>
        /// Get device information
        /// </summary>
        /// <returns>Device information</returns>
        public DeviceInfo GetDeviceInfo()
        {
            return deviceInfo;
        }

        #endregion

        #region Device Info
        
        private DeviceInfo AutoFetchDeviceInfo()
        {
            try
            {
                return new DeviceInfo(
                    GetPlatformString(),
                    SystemInfo.operatingSystem,
                    Application.version,
                    SystemInfo.deviceModel,
                    $"{Screen.width}x{Screen.height}",
                    SystemInfo.deviceName
                );
            }
            catch
            {
                return new DeviceInfo(
                    "UNITY",
                    "Unknown",
                    "1.0.0",
                    "Unknown",
                    "Unknown",
                    "Unknown"
                );
            }
        }

        private string GetPlatformString()
        {
            switch (Application.platform)
            {
                case RuntimePlatform.Android:
                    return "ANDROID";
                case RuntimePlatform.IPhonePlayer:
                    return "IOS";
                case RuntimePlatform.WindowsPlayer:
                case RuntimePlatform.WindowsEditor:
                    return "WINDOWS";
                case RuntimePlatform.OSXPlayer:
                case RuntimePlatform.OSXEditor:
                    return "MACOS";
                case RuntimePlatform.LinuxPlayer:
                    return "LINUX";
                case RuntimePlatform.WebGLPlayer:
                    return "WEBGL";
                case RuntimePlatform.XboxOne:
                    return "XBOX";
                case RuntimePlatform.PS4:
                case RuntimePlatform.PS5:
                    return "PLAYSTATION";
                case RuntimePlatform.Switch:
                    return "NINTENDO_SWITCH";
                default:
                    return "UNITY";
            }
        }

        #endregion

        #region Network Communication
        
        private IEnumerator FlushEvents(bool force = false)
        {
            if (isSending || eventQueue.Count == 0) yield break;
            
            isSending = true;
            
            int count = Mathf.Min(BatchSize, eventQueue.Count);
            var batch = new List<Dictionary<string, object>>();
            
            for (int i = 0; i < count; i++)
            {
                batch.Add(eventQueue.Dequeue());
            }
            
            var json = JsonUtility.ToJson(new { events = batch });
            
            using (var request = new UnityWebRequest(baseUrl, "POST"))
            {
                byte[] bodyRaw = Encoding.UTF8.GetBytes(json);
                request.uploadHandler = new UploadHandlerRaw(bodyRaw);
                request.downloadHandler = new DownloadHandlerBuffer();
                request.SetRequestHeader("Content-Type", "application/json");
                request.SetRequestHeader("x-api-key", apiKey);
                
                yield return request.SendWebRequest();
                
                if (request.result != UnityWebRequest.Result.Success)
                {
                    Debug.LogWarning($"Gamepulse: Failed to send events - {request.error}");
                }
            }
            
            isSending = false;
            
            if (force && eventQueue.Count > 0)
            {
                yield return FlushEvents(true);
            }
        }

        #endregion

        #region Utility Methods
        
        private void CheckInitialized()
        {
            if (!isInitialized)
            {
                throw new InvalidOperationException("Gamepulse must be initialized first. Call Gamepulse.Init()");
            }
        }

        #endregion

        #region EventBuilder Class
        
        /// <summary>
        /// Event builder for fluent API event tracking (Android-style API)
        /// </summary>
        public class EventBuilder
        {
            private readonly string eventType;
            private readonly string eventCategory;
            private readonly bool isCustom;
            private Dictionary<string, string> properties = new Dictionary<string, string>();

            internal EventBuilder(string type, string category, bool isCustom)
            {
                this.eventType = type;
                this.eventCategory = category;
                this.isCustom = isCustom;
            }

            /// <summary>
            /// Set properties for the event
            /// </summary>
            /// <param name="properties">Event properties</param>
            /// <returns>EventBuilder for chaining</returns>
            public EventBuilder SetProperties(Dictionary<string, string> properties)
            {
                if (properties != null)
                {
                    this.properties = properties;
                }
                return this;
            }

            /// <summary>
            /// Track/send the event (Android-style API)
            /// </summary>
            public void Track()
            {
                Trigger();
            }

            /// <summary>
            /// Trigger/send the event (Unity-style API)
            /// </summary>
            public void Trigger()
            {
                if (instance == null)
                {
                    throw new InvalidOperationException("Gamepulse must be initialized first");
                }
                
                instance.TrackEventInternal(isCustom ? "CUSTOM" : "SYSTEM", eventType, eventCategory, properties);
            }
        }

        #endregion
    }
}