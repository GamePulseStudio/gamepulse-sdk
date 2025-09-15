using System;
using System.Collections.Generic;
using UnityEngine;

namespace GameAnalyticsSDK
{
    /// <summary>
    /// Main class for the GameAnalytics Unity SDK.
    /// Provides an interface for tracking game events and analytics.
    /// </summary>
    public static class GameAnalytics
    {
        private static bool _initialized = false;
        private static string _gameKey;
        private static string _secretKey;
        private static string _build;
        private static string _userId;
        private static string _sessionId;
        private static string _deviceId;
        private static string _sdkVersion = "0.1.0";
        
        private static IGameAnalyticsPlatform _platform;
        
        /// <summary>
        /// Event that is triggered when the SDK is initialized.
        /// </summary>
        public static event Action OnInitialized;
        
        /// <summary>
        /// Initializes the GameAnalytics SDK.
        /// </summary>
        /// <param name="gameKey">Your GameAnalytics game key.</param>
        /// <param name="secretKey">Your GameAnalytics secret key.</param>
        /// <param name="build">The build version of your game.</param>
        /// <param name="userId">Optional user ID. If not provided, a unique ID will be generated.</param>
        public static void Initialize(string gameKey, string secretKey, string build, string userId = null)
        {
            if (_initialized)
            {
                Debug.LogWarning("GameAnalytics is already initialized.");
                return;
            }
            
            if (string.IsNullOrEmpty(gameKey))
            {
                Debug.LogError("Game key cannot be null or empty.");
                return;
            }
            
            if (string.IsNullOrEmpty(secretKey))
            {
                Debug.LogError("Secret key cannot be null or empty.");
                return;
            }
            
            _gameKey = gameKey;
            _secretKey = secretKey;
            _build = build ?? Application.version;
            
            // Generate or use provided user ID
            _userId = userId ?? SystemInfo.deviceUniqueIdentifier;
            
            // Generate a new session ID
            _sessionId = Guid.NewGuid().ToString();
            
            // Get or generate device ID
            _deviceId = SystemInfo.deviceUniqueIdentifier;
            
            // Initialize platform-specific implementation
            #if UNITY_ANDROID && !UNITY_EDITOR
            _platform = new AndroidGameAnalytics();
            #elif UNITY_IOS && !UNITY_EDITOR
            _platform = new IOSGameAnalytics();
            #else
            _platform = new DefaultGameAnalytics();
            #endif
            
            _platform.Initialize(gameKey, secretKey, _build, _userId);
            
            _initialized = true;
            
            // Track session start
            TrackSessionStart();
            
            // Notify listeners that the SDK is initialized
            OnInitialized?.Invoke();
            
            Debug.Log($"GameAnalytics SDK initialized. User ID: {_userId}, Session ID: {_sessionId}");
        }
        
        /// <summary>
        /// Tracks a custom event.
        /// </summary>
        /// <param name="eventName">The name of the event.</param>
        /// <param name="customFields">Optional custom fields to include with the event.</param>
        public static void TrackEvent(string eventName, Dictionary<string, object> customFields = null)
        {
            if (!_initialized)
            {
                Debug.LogWarning("GameAnalytics is not initialized. Call Initialize() first.");
                return;
            }
            
            var eventData = new Dictionary<string, object>
            {
                ["event_id"] = Guid.NewGuid().ToString(),
                ["timestamp"] = DateTime.UtcNow.ToString("o"),
                ["session_id"] = _sessionId,
                ["user_id"] = _userId,
                ["event_name"] = eventName,
                ["platform"] = GetPlatformString(),
                ["device_id"] = _deviceId,
                ["app_version"] = _build,
                ["sdk_version"] = _sdkVersion,
                ["custom_fields"] = customFields ?? new Dictionary<string, object>()
            };
            
            _platform.TrackEvent(eventData);
        }
        
        /// <summary>
        /// Tracks a session start event.
        /// </summary>
        public static void TrackSessionStart()
        {
            if (!_initialized) return;
            
            var eventData = new Dictionary<string, object>
            {
                ["event_id"] = Guid.NewGuid().ToString(),
                ["timestamp"] = DateTime.UtcNow.ToString("o"),
                ["session_id"] = _sessionId,
                ["user_id"] = _userId,
                ["event_name"] = "session_start",
                ["platform"] = GetPlatformString(),
                ["device_id"] = _deviceId,
                ["app_version"] = _build,
                ["sdk_version"] = _sdkVersion,
                ["custom_fields"] = new Dictionary<string, object>
                {
                    ["unity_version"] = Application.unityVersion,
                    ["device_model"] = SystemInfo.deviceModel,
                    ["device_name"] = SystemInfo.deviceName,
                    ["device_type"] = SystemInfo.deviceType.ToString(),
                    ["operating_system"] = SystemInfo.operatingSystem,
                    ["processor_type"] = SystemInfo.processorType,
                    ["system_memory_size"] = SystemInfo.systemMemorySize,
                    ["graphics_device_name"] = SystemInfo.graphicsDeviceName,
                    ["graphics_memory_size"] = SystemInfo.graphicsMemorySize,
                    ["graphics_device_type"] = SystemInfo.graphicsDeviceType.ToString(),
                    ["graphics_device_vendor"] = SystemInfo.graphicsDeviceVendor,
                    ["graphics_device_version"] = SystemInfo.graphicsDeviceVersion,
                }
            };
            
            _platform.TrackEvent(eventData);
        }
        
        /// <summary>
        /// Tracks a session end event.
        /// </summary>
        public static void TrackSessionEnd()
        {
            if (!_initialized) return;
            
            var eventData = new Dictionary<string, object>
            {
                ["event_id"] = Guid.NewGuid().ToString(),
                ["timestamp"] = DateTime.UtcNow.ToString("o"),
                ["session_id"] = _sessionId,
                ["user_id"] = _userId,
                ["event_name"] = "session_end",
                ["platform"] = GetPlatformString(),
                ["device_id"] = _deviceId,
                ["app_version"] = _build,
                ["sdk_version"] = _sdkVersion,
                ["custom_fields"] = new Dictionary<string, object>
                {
                    ["session_duration"] = (DateTime.UtcNow - DateTime.UtcNow).TotalSeconds // TODO: Track actual session duration
                }
            };
            
            _platform.TrackEvent(eventData);
            
            // Flush any pending events
            _platform.FlushEvents();
        }
        
        /// <summary>
        /// Tracks an error event.
        /// </summary>
        /// <param name="error">The error that occurred.</param>
        /// <param name="isFatal">Whether the error is fatal.</param>
        /// <param name="context">Additional context about the error.</param>
        public static void TrackError(Exception error, bool isFatal = false, Dictionary<string, object> context = null)
        {
            if (!_initialized)
            {
                Debug.LogWarning("GameAnalytics is not initialized. Call Initialize() first.");
                return;
            }
            
            var eventData = new Dictionary<string, object>
            {
                ["event_id"] = Guid.NewGuid().ToString(),
                ["timestamp"] = DateTime.UtcNow.ToString("o"),
                ["session_id"] = _sessionId,
                ["user_id"] = _userId,
                ["event_name"] = "error",
                ["platform"] = GetPlatformString(),
                ["device_id"] = _deviceId,
                ["app_version"] = _build,
                ["sdk_version"] = _sdkVersion,
                ["error_message"] = error.Message,
                ["error_stack"] = error.StackTrace,
                ["error_type"] = error.GetType().Name,
                ["is_fatal"] = isFatal,
                ["custom_fields"] = context ?? new Dictionary<string,object>()
            };
            
            _platform.TrackEvent(eventData);
        }
        
        /// <summary>
        /// Tracks an in-app purchase.
        /// </summary>
        public static void TrackPurchase(
            string productId,
            string currency,
            double amount,
            string transactionId,
            string receipt = null,
            Dictionary<string, object> customFields = null)
        {
            if (!_initialized)
            {
                Debug.LogWarning("GameAnalytics is not initialized. Call Initialize() first.");
                return;
            }
            
            var eventData = new Dictionary<string, object>
            {
                ["event_id"] = Guid.NewGuid().ToString(),
                ["timestamp"] = DateTime.UtcNow.ToString("o"),
                ["session_id"] = _sessionId,
                ["user_id"] = _userId,
                ["event_name"] = "purchase",
                ["platform"] = GetPlatformString(),
                ["device_id"] = _deviceId,
                ["app_version"] = _build,
                ["sdk_version"] = _sdkVersion,
                ["product_id"] = productId,
                ["currency"] = currency,
                ["amount"] = amount,
                ["transaction_id"] = transactionId,
                ["receipt"] = receipt,
                ["custom_fields"] = customFields ?? new Dictionary<string,object>()
            };
            
            _platform.TrackEvent(eventData);
        }
        
        /// <summary>
        /// Sets a custom user ID.
        /// </summary>
        public static void SetCustomUserId(string userId)
        {
            if (string.IsNullOrEmpty(userId))
            {
                Debug.LogError("User ID cannot be null or empty.");
                return;
            }
            
            _userId = userId;
            
            if (_initialized)
            {
                _platform.SetCustomUserId(userId);
            }
        }
        
        /// <summary>
        /// Gets the current user ID.
        /// </summary>
        public static string GetUserId()
        {
            return _userId;
        }
        
        /// <summary>
        /// Gets the current session ID.
        /// </summary>
        public static string GetSessionId()
        {
            return _sessionId;
        }
        
        /// <summary>
        /// Gets the device ID.
        /// </summary>
        public static string GetDeviceId()
        {
            return _deviceId;
        }
        
        /// <summary>
        /// Flushes any queued events to the server.
        /// </summary>
        public static void Flush()
        {
            if (!_initialized)
            {
                Debug.LogWarning("GameAnalytics is not initialized. Call Initialize() first.");
                return;
            }
            
            _platform.FlushEvents();
        }
        
        private static string GetPlatformString()
        {
            switch (Application.platform)
            {
                case RuntimePlatform.Android:
                    return "android";
                case RuntimePlatform.IPhonePlayer:
                    return "ios";
                case RuntimePlatform.WindowsPlayer:
                case RuntimePlatform.WindowsEditor:
                    return "windows";
                case RuntimePlatform.OSXPlayer:
                case RuntimePlatform.OSXEditor:
                    return "osx";
                case RuntimePlatform.LinuxPlayer:
                case RuntimePlatform.LinuxEditor:
                    return "linux";
                case RuntimePlatform.WebGLPlayer:
                    return "webgl";
                case RuntimePlatform.XboxOne:
                    return "xboxone";
                case RuntimePlatform.PS4:
                    return "ps4";
                case RuntimePlatform.PS5:
                    return "ps5";
                case RuntimePlatform.Switch:
                    return "switch";
                default:
                    return Application.platform.ToString().ToLower();
            }
        }
    }
    
    /// <summary>
    /// Interface for platform-specific GameAnalytics implementations.
    /// </summary>
    internal interface IGameAnalyticsPlatform
    {
        void Initialize(string gameKey, string secretKey, string build, string userId);
        void TrackEvent(Dictionary<string, object> eventData);
        void FlushEvents();
        void SetCustomUserId(string userId);
    }
    
    /// <summary>
    /// Default implementation of IGameAnalyticsPlatform.
    /// </summary>
    internal class DefaultGameAnalytics : IGameAnalyticsPlatform
    {
        private Queue<Dictionary<string, object>> _eventQueue = new Queue<Dictionary<string, object>>();
        private const int MAX_QUEUE_SIZE = 1000;
        private const int BATCH_SIZE = 10;
        private const float FLUSH_INTERVAL = 30f; // seconds
        
        private string _gameKey;
        private string _secretKey;
        private string _build;
        private string _userId;
        
        private float _lastFlushTime;
        
        public void Initialize(string gameKey, string secretKey, string build, string userId)
        {
            _gameKey = gameKey;
            _secretKey = secretKey;
            _build = build;
            _userId = userId;
            _lastFlushTime = Time.time;
            
            // Start coroutine for periodic flushing
            var go = new GameObject("GameAnalytics");
            go.AddComponent<GameAnalyticsMonoBehaviour>().Initialize(this);
            GameObject.DontDestroyOnLoad(go);
        }
        
        public void TrackEvent(Dictionary<string, object> eventData)
        {
            if (_eventQueue.Count >= MAX_QUEUE_SIZE)
            {
                Debug.LogWarning("Event queue is full. Dropping oldest event.");
                _eventQueue.Dequeue();
            }
            
            _eventQueue.Enqueue(eventData);
            
            // Flush if we've reached the batch size
            if (_eventQueue.Count >= BATCH_SIZE)
            {
                FlushEvents();
            }
        }
        
        public void FlushEvents()
        {
            if (_eventQueue.Count == 0)
                return;
                
            var batch = new List<Dictionary<string, object>>();
            
            // Take up to BATCH_SIZE events from the queue
            int count = Math.Min(BATCH_SIZE, _eventQueue.Count);
            for (int i = 0; i < count; i++)
            {
                batch.Add(_eventQueue.Dequeue());
            }
            
            // In a real implementation, this would send the events to the server
            // For now, we'll just log them
            Debug.Log($"[GameAnalytics] Flushing {batch.Count} events to server");
            
            // Simulate network request
            // SendEventsToServer(batch);
            
            _lastFlushTime = Time.time;
        }
        
        public void SetCustomUserId(string userId)
        {
            _userId = userId;
        }
        
        public void Update()
        {
            // Flush events periodically
            if (Time.time - _lastFlushTime > FLUSH_INTERVAL)
            {
                FlushEvents();
            }
        }
    }
    
    // MonoBehaviour to handle coroutines and updates
    internal class GameAnalyticsMonoBehaviour : MonoBehaviour
    {
        private DefaultGameAnalytics _gameAnalytics;
        
        public void Initialize(DefaultGameAnalytics gameAnalytics)
        {
            _gameAnalytics = gameAnalytics;
        }
        
        private void Update()
        {
            _gameAnalytics?.Update();
        }
        
        private void OnApplicationQuit()
        {
            // Flush any remaining events when the application quits
            _gameAnalytics?.FlushEvents();
        }
        
        private void OnApplicationPause(bool pauseStatus)
        {
            if (pauseStatus)
            {
                // Flush events when the application is paused
                _gameAnalytics?.FlushEvents();
            }
        }
    }
}
