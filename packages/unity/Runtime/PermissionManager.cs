using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

namespace GameAlytics.Unity
{
    /// <summary>
    /// Simplified permission manager for GameAlytics Unity SDK
    /// - Internet permission: Available by default on Unity, no check needed
    /// - Storage permission: persistentDataPath available by default, no check needed
    /// - Location permission: Optional, adds latitude/longitude to events if available
    /// - No automatic permission requests - SDK ready only if permissions available
    /// </summary>
    public static class PermissionManager
    {
        private static LocationInfo? _currentLocation;
        private static bool _locationInitialized = false;
        
        /// <summary>
        /// Check if location services are enabled and permitted (optional)
        /// </summary>
        public static bool HasLocationPermission()
        {
#if UNITY_ANDROID || UNITY_IOS
            return Input.location.isEnabledByUser;
#else
            return false; // Desktop platforms don't have location services
#endif
        }
        
        /// <summary>
        /// Initialize location services if permissions are available
        /// </summary>
        public static void InitializeLocation()
        {
#if UNITY_ANDROID || UNITY_IOS
            if (!_locationInitialized && HasLocationPermission())
            {
                Input.location.Start(100f, 100f); // 100m accuracy, 100m distance filter
                _locationInitialized = true;
            }
#endif
        }
        
        /// <summary>
        /// Get location data to add to events (if available)
        /// </summary>
        public static Dictionary<string, string> GetLocationData()
        {
            var locationData = new Dictionary<string, string>();
            
#if UNITY_ANDROID || UNITY_IOS
            if (HasLocationPermission())
            {
                InitializeLocation();
                
                if (Input.location.status == LocationServiceStatus.Running)
                {
                    var location = Input.location.lastData;
                    locationData["latitude"] = location.latitude.ToString();
                    locationData["longitude"] = location.longitude.ToString();
                }
            }
#endif
            
            return locationData;
        }
    }
    
    /// <summary>
    /// Network connectivity helper
    /// </summary>
    public static class NetworkHelper
    {
        /// <summary>
        /// Check if device is online
        /// </summary>
        public static bool IsOnline()
        {
            return Application.internetReachability != NetworkReachability.NotReachable;
        }
        
        /// <summary>
        /// Check if device is on WiFi
        /// </summary>
        public static bool IsOnWiFi()
        {
            return Application.internetReachability == NetworkReachability.ReachableViaLocalAreaNetwork;
        }
        
        /// <summary>
        /// Check if device is on mobile data
        /// </summary>
        public static bool IsOnMobileData()
        {
            return Application.internetReachability == NetworkReachability.ReachableViaCarrierDataNetwork;
        }
    }
}
