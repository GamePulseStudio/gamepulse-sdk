using System;
using System.Collections;
using System.Collections.Generic;
using System.Text;
using UnityEngine;
using UnityEngine.Networking;

namespace GameAlytics
{
    public enum Environment
    {
        DEVELOPMENT,
        PRODUCTION
    }

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

    public class GameAlytics : MonoBehaviour
    {
        // Singleton instance
        private static GameAlytics instance;
        
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

        // User Events
        public static class UserEvents
        {
            public const string CATEGORY = "user";
            public const string SESSION_START = "session_start";
            public const string SESSION_END = "session_end";
            public const string USER_LOGIN = "user_login";
            public const string USER_LOGOUT = "user_logout";
            public const string USER_REGISTER = "user_register";
        }
        
        // Gameplay Events
        public static class GameplayEvents
        {
            public const string CATEGORY = "gameplay";
            public const string LEVEL_START = "level_start";
            public const string LEVEL_END = "level_end";
            public const string LEVEL_UP = "level_up";
            public const string GAME_START = "game_start";
            public const string GAME_END = "game_end";
            public const string BOSS_FIGHT = "boss_fight";
        }
        
        // Economy Events
        public static class EconomyEvents
        {
            public const string CATEGORY = "economy";
            public const string CURRENCY_EARNED = "currency_earned";
            public const string CURRENCY_SPENT = "currency_spent";
            public const string ITEM_PURCHASED = "item_purchased";
            public const string ITEM_SOLD = "item_sold";
            public const string SHOP_VIEWED = "shop_viewed";
        }
        
        // Progression Events
        public static class ProgressionEvents
        {
            public const string CATEGORY = "progression";
            public const string TUTORIAL_COMPLETE = "tutorial_complete";
            public const string ACHIEVEMENT_UNLOCKED = "achievement_unlocked";
            public const string MILESTONE_REACHED = "milestone_reached";
            public const string QUEST_COMPLETED = "quest_completed";
        }
        
        // Ad Events
        public static class AdEvents
        {
            public const string CATEGORY = "ad";
            public const string AD_VIEWED = "ad_viewed";
            public const string AD_CLICKED = "ad_clicked";
            public const string AD_REWARDED = "ad_rewarded";
            public const string AD_FAILED = "ad_failed";
        }
        
        // IAP Events
        public static class IAPEvents
        {
            public const string CATEGORY = "iap";
            public const string PURCHASE = "purchase";
            public const string PURCHASE_FAILED = "purchase_failed";
            public const string PURCHASE_RESTORED = "purchase_restored";
            public const string SUBSCRIPTION_STARTED = "subscription_started";
            public const string SUBSCRIPTION_CANCELLED = "subscription_cancelled";
        }

        public static InitBuilder Init(string apiKey, Environment environment)
        {
            return new InitBuilder(apiKey, environment);
        }

        public static GameAlytics GetInstance()
        {
            if (instance == null)
            {
                throw new InvalidOperationException("GameAlytics must be initialized first. Call GameAlytics.Init(...).Create()");
            }
            return instance;
        }

        public SystemEventBuilder SystemEvent()
        {
            return new SystemEventBuilder();
        }

        public CustomEventBuilder CustomEvent()
        {
            return new CustomEventBuilder();
        }

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
            
            public GameAlytics Create()
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
                    var go = new GameObject("GameAlytics");
                    instance = go.AddComponent<GameAlytics>();
                    DontDestroyOnLoad(go);
                    instance.Initialize(apiKey, environment, userConfig);
                }
                
                return instance;
            }
        }

        private void Awake()
        {
            if (instance != null && instance != this)
            {
                Destroy(gameObject);
            }
        }

        private void Initialize(string apiKey, Environment environment, UserConfig userConfig)
        {
            this.apiKey = apiKey;
            this.environment = environment;
            this.userConfig = userConfig;
            this.deviceInfo = AutoFetchDeviceInfo();
            this.baseUrl = environment == Environment.PRODUCTION 
                ? "https://client.gamealytics.click/events/collect" 
                : "https://client.dev.gamealytics.click/events/collect";
            this.isInitialized = true;
        }

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
                    throw new InvalidOperationException("GameAlytics must be initialized first");
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
                    throw new InvalidOperationException("GameAlytics must be initialized first");
                }
                if (string.IsNullOrEmpty(category) || string.IsNullOrEmpty(type))
                {
                    throw new ArgumentException("Category and type are required");
                }
                instance.TrackEventInternal("CUSTOM", type, category, properties);
            }
        }

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

        public void UpdateUserConfig(UserConfig newUserConfig)
        {
            CheckInitialized();
            this.userConfig = newUserConfig;
        }
        
        public UserConfig GetUserConfig()
        {
            return userConfig;
        }
        
        public DeviceInfo GetDeviceInfo()
        {
            return deviceInfo;
        }

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
            }
            
            isSending = false;
            
            if (force && eventQueue.Count > 0)
            {
                yield return FlushEvents(true);
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

        private void CheckInitialized()
        {
            if (!isInitialized)
            {
                throw new InvalidOperationException("GameAlytics must be initialized first. Call GameAlytics.Init()");
            }
        }
    }
}
