using System;
using System.Collections;
using System.Collections.Generic;
using System.Text;
using UnityEngine;
using UnityEngine.Networking;

namespace GameAlytics
{
    public enum EventType
    {
        // System Events
        SESSION_START,
        SESSION_END,
        LEVEL_START,
        LEVEL_END,
        LEVEL_UP,
        TUTORIAL_COMPLETE,
        ACHIEVEMENT_UNLOCKED,
        PURCHASE,
        AD_VIEWED,
        AD_REWARDED
    }

    public enum EventCategory
    {
        USER,
        GAMEPLAY,
        ECONOMY,
        PROGRESSION,
        AD,
        IAP
    }

    public enum Environment
    {
        DEVELOPMENT,
        PRODUCTION
    }

    [System.Serializable]
    public class UserConfig
    {
        public string sessionId;
        public string userId;
        public string anonymousId;

        public UserConfig(string sessionId, string userId = null, string anonymousId = null)
        {
            this.sessionId = sessionId;
            this.userId = userId;
            this.anonymousId = anonymousId;
        }

        public static UserConfigBuilder Builder()
        {
            return new UserConfigBuilder();
        }
    }

    public class UserConfigBuilder
    {
        private string sessionId;
        private string userId;
        private string anonymousId;

        public UserConfigBuilder SetSessionId(string sessionId)
        {
            this.sessionId = sessionId;
            return this;
        }

        public UserConfigBuilder SetUserId(string userId)
        {
            this.userId = userId;
            return this;
        }

        public UserConfigBuilder SetAnonymous(string anonymousId)
        {
            this.anonymousId = anonymousId;
            return this;
        }

        public UserConfig Build()
        {
            if (string.IsNullOrEmpty(sessionId))
            {
                throw new ArgumentException("SessionId is required");
            }
            if (string.IsNullOrEmpty(userId) && string.IsNullOrEmpty(anonymousId))
            {
                throw new ArgumentException("Either userId or anonymousId must be provided");
            }
            return new UserConfig(sessionId, userId, anonymousId);
        }
    }

    public class EventBuilder
    {
        private readonly GameAlytics _gameAlytics;
        private readonly string _eventType;
        private readonly string _eventCategory;
        private readonly bool _isCustom;
        private Dictionary<string, object> _properties = new Dictionary<string, object>();

        public EventBuilder(GameAlytics gameAlytics, string eventType, string eventCategory, bool isCustom)
        {
            _gameAlytics = gameAlytics;
            _eventType = eventType;
            _eventCategory = eventCategory;
            _isCustom = isCustom;
        }

        public EventBuilder SetProperties(Dictionary<string, object> properties)
        {
            if (properties != null)
            {
                _properties = new Dictionary<string, object>(properties);
            }
            return this;
        }

        public void Track()
        {
            _gameAlytics.TrackEvent(
                _isCustom ? "CUSTOM" : "SYSTEM",
                _eventType,
                _eventCategory,
                _properties
            );
        }
    }

    public class InitBuilder
    {
        private readonly string _apiKey;
        private readonly Environment _environment;
        private UserConfig _userConfig;

        public InitBuilder(string apiKey, Environment environment)
        {
            _apiKey = apiKey;
            _environment = environment;
        }

        public InitBuilder UserConfig(UserConfig userConfig)
        {
            _userConfig = userConfig;
            return this;
        }

        public GameAlytics Create()
        {
            if (string.IsNullOrEmpty(_apiKey))
            {
                throw new ArgumentException("API key is required");
            }
            if (_userConfig == null)
            {
                throw new ArgumentException("UserConfig is required");
            }

            GameAlytics._instance = GameAlytics.CreateInstance(_apiKey, _environment, _userConfig);
            return GameAlytics._instance;
        }
    }

    [System.Serializable]
    public struct DeviceInfo
    {
        public string platform;
        public string osVersion;
        public string deviceModel;
        public string screenResolution;
        public string deviceManufacturer;
        public string appVersion;
    }

    public class GameAlytics : MonoBehaviour
    {
        // Singleton instance
        internal static GameAlytics _instance;
        private static readonly object _lock = new object();
        
        // Configuration
        private string _apiKey = string.Empty;
        private Environment _environment;
        private UserConfig _userConfig;
        private DeviceInfo _deviceInfo;
        private string _baseUrl;
        private bool _isInitialized = false;
        
        // Queue for events
        private readonly Queue<Dictionary<string, object>> _eventQueue = new Queue<Dictionary<string, object>>();
        private bool _isSending = false;
        private const int MaxQueueSize = 1000;
        private const int BatchSize = 10;
        
        // Static initialization method
        public static InitBuilder Init(string apiKey, Environment environment)
        {
            return new InitBuilder(apiKey, environment);
        }
        
        public static GameAlytics GetInstance()
        {
            if (instance == null)
            {
                throw new System.InvalidOperationException("GameAlytics must be initialized first. Call GameAlytics.Init(...).Create()");
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


        // Internal method to create instance
        internal static GameAlytics CreateInstance(string apiKey, Environment environment, UserConfig userConfig)
        {
            lock (_lock)
            {
                if (_instance == null)
                {
                    var go = new GameObject("GameAlytics");
                    _instance = go.AddComponent<GameAlytics>();
                    DontDestroyOnLoad(go);
                    _instance.Initialize(apiKey, environment, userConfig);
                }
                return _instance;
            }
        }

        private void Awake()
        {
            if (_instance != null && _instance != this)
            {
                Destroy(gameObject);
            }
        }

        private void Initialize(string apiKey, Environment environment, UserConfig userConfig)
        {
            _apiKey = apiKey;
            _environment = environment;
            _userConfig = userConfig;
            _deviceInfo = AutoFetchDeviceInfo();
            _baseUrl = environment == Environment.PRODUCTION 
                ? "https://client.gamealytics.click" 
                : "https://client.dev.gamealytics.click";
            _isInitialized = true;
        }

        private DeviceInfo AutoFetchDeviceInfo()
        {
            try
            {
                return new DeviceInfo
                {
                    platform = GetPlatformString(),
                    osVersion = SystemInfo.operatingSystem,
                    deviceModel = SystemInfo.deviceModel,
                    screenResolution = $"{Screen.width}x{Screen.height}",
                    deviceManufacturer = SystemInfo.deviceName,
                    appVersion = Application.version
                };
            }
            catch
            {
                // Silent failure for performance
                return new DeviceInfo
                {
                    platform = "Unknown",
                    osVersion = "Unknown",
                    deviceModel = "Unknown",
                    screenResolution = "Unknown",
                    deviceManufacturer = "Unknown",
                    appVersion = "1.0.0"
                };
            }
        }

        private void OnApplicationPause(bool pauseStatus)
        {
            if (pauseStatus)
            {
                // App is pausing, flush events
                StartCoroutine(FlushEvents());
            }
        }

        private void OnApplicationQuit()
        {
            if (_isInitialized)
            {
                // Flush events
                StartCoroutine(FlushEvents(true));
            }
        }


        /// <summary>
        /// Track a system event
        /// </summary>
        public EventBuilder Event(EventType type, EventCategory category)
        {
            EnsureInitialized();
            return CreateEventBuilder(type.ToString(), category.ToString(), false);
        }

        /// <summary>
        /// Track a custom event
        /// </summary>
        public EventBuilder CustomEvent(string type, string category)
        {
            EnsureInitialized();
            return CreateEventBuilder(type, category, true);
        }

        /// <summary>
        /// Start a new session
        /// </summary>
        public void StartSession()
        {
            EnsureInitialized();
            
            Event(EventType.SESSION_START, EventCategory.USER)
                .SetProperties(new Dictionary<string, object>())
                .Track();
        }

        /// <summary>
        /// End the current session
        /// </summary>
        public void EndSession()
        {
            EnsureInitialized();
            
            Event(EventType.SESSION_END, EventCategory.USER)
                .SetProperties(new Dictionary<string, object>())
                .Track();
        }

        private EventBuilder CreateEventBuilder(string eventType, string eventCategory, bool isCustom)
        {
            return new EventBuilder(this, eventType, eventCategory, isCustom);
        }

        private void EnsureInitialized()
        {
            if (!_isInitialized)
            {
                throw new InvalidOperationException("GameAlytics must be initialized first. Call GameAlytics.Init()");
            }
        }

        internal void TrackEvent(string type, string eventType, string category, Dictionary<string, object> properties)
        {
            if (_eventQueue.Count >= MaxQueueSize)
            {
                _eventQueue.Dequeue();
            }
            
            var eventData = new Dictionary<string, object>
            {
                ["type"] = type,
                ["timezone"] = TimeZoneInfo.Local.StandardName,
                ["localDateTime"] = DateTime.UtcNow.ToString("o"),
                ["value"] = eventType,
                ["category"] = category,
                ["userId"] = _userConfig.userId ?? "",
                ["anonymousId"] = _userConfig.anonymousId ?? "",
                ["sessionId"] = _userConfig.sessionId,
                ["platform"] = _deviceInfo.platform,
                ["osVersion"] = _deviceInfo.osVersion,
                ["appVersion"] = _deviceInfo.appVersion,
                ["deviceModel"] = _deviceInfo.deviceModel,
                ["screenResolution"] = _deviceInfo.screenResolution,
                ["deviceManufacturer"] = _deviceInfo.deviceManufacturer,
                ["properties"] = properties ?? new Dictionary<string, object>()
            };
            
            _eventQueue.Enqueue(eventData);
            
            // Process queue if we've reached batch size
            if (_eventQueue.Count >= BatchSize)
            {
                StartCoroutine(FlushEvents());
            }
        }

        private IEnumerator FlushEvents(bool force = false)
        {
            if (_isSending || _eventQueue.Count == 0) yield break;
            
            _isSending = true;
            
            // Determine how many events to send (up to BatchSize)
            int count = Mathf.Min(BatchSize, _eventQueue.Count);
            var batch = new List<Dictionary<string, object>>();
            
            for (int i = 0; i < count; i++)
            {
                batch.Add(_eventQueue.Dequeue());
            }
            
            // Convert to JSON
            var json = JsonUtility.ToJson(new { events = batch });
            var url = $"{_baseUrl}/events/collect";
            
            using (var request = new UnityWebRequest(url, "POST"))
            {
                byte[] bodyRaw = Encoding.UTF8.GetBytes(json);
                request.uploadHandler = new UploadHandlerRaw(bodyRaw);
                request.downloadHandler = new DownloadHandlerBuffer();
                request.SetRequestHeader("Content-Type", "application/json");
                request.SetRequestHeader("x-api-key", _apiKey);
                
                yield return request.SendWebRequest();
                
                // Silent failure for performance optimization
            }
            
            _isSending = false;
            
            // If there are more events and we're forcing a flush, continue
            if (force && _eventQueue.Count > 0)
            {
                yield return FlushEvents(true);
            }
        }

        private string GetPlatformString()
        {
            switch (Application.platform)
            {
                case RuntimePlatform.Android:
                    return "Android";
                case RuntimePlatform.IPhonePlayer:
                    return "iOS";
                case RuntimePlatform.WindowsPlayer:
                case RuntimePlatform.WindowsEditor:
                    return "Windows";
                case RuntimePlatform.OSXPlayer:
                case RuntimePlatform.OSXEditor:
                    return "macOS";
                case RuntimePlatform.LinuxPlayer:
                    return "Linux";
                case RuntimePlatform.WebGLPlayer:
                    return "WebGL";
                case RuntimePlatform.XboxOne:
                    return "XboxOne";
                case RuntimePlatform.PS4:
                    return "PS4";
                case RuntimePlatform.PS5:
                    return "PS5";
                case RuntimePlatform.Switch:
                    return "Nintendo Switch";
                default:
                    return Application.platform.ToString();
            }
        }
    }
    
    // Event Category Classes
    public static class Gameplay
    {
        public const string LevelStart = "level_start";
        public const string LevelEnd = "level_end";
        public const string LevelUp = "level_up";
        public const string BossFight = "boss_fight";
        public const string CheckpointReached = "checkpoint_reached";
    }
    
    public static class IAP
    {
        public const string Purchase = "purchase";
        public const string PurchaseFailed = "purchase_failed";
        public const string PurchaseRestored = "purchase_restored";
        public const string SubscriptionStarted = "subscription_started";
        public const string SubscriptionCancelled = "subscription_cancelled";
    }
    
    public static class User
    {
        public const string SessionStart = "session_start";
        public const string SessionEnd = "session_end";
        public const string UserLogin = "user_login";
        public const string UserLogout = "user_logout";
        public const string UserRegister = "user_register";
    }
    
    public static class Progression
    {
        public const string TutorialComplete = "tutorial_complete";
        public const string AchievementUnlocked = "achievement_unlocked";
        public const string MilestoneReached = "milestone_reached";
        public const string QuestCompleted = "quest_completed";
    }
    
    public static class Ad
    {
        public const string AdViewed = "ad_viewed";
        public const string AdClicked = "ad_clicked";
        public const string AdRewarded = "ad_rewarded";
        public const string AdFailed = "ad_failed";
    }
    
    // Event Builders
    public class SystemEventBuilder
    {
        private string category;
        private string type;
        private Dictionary<string, string> properties = new Dictionary<string, string>();
        
        public SystemEventBuilder Category<T>()
        {
            this.category = typeof(T).Name.ToLower();
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
                throw new System.InvalidOperationException("GameAlytics must be initialized first");
            }
            if (string.IsNullOrEmpty(category) || string.IsNullOrEmpty(type))
            {
                throw new System.ArgumentException("Category and type are required");
            }
            instance.TrackEvent("SYSTEM", type, category, properties);
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
                throw new System.InvalidOperationException("GameAlytics must be initialized first");
            }
            if (string.IsNullOrEmpty(category) || string.IsNullOrEmpty(type))
            {
                throw new System.ArgumentException("Category and type are required");
            }
            instance.TrackEvent("CUSTOM", type, category, properties);
        }
    }
}
}
