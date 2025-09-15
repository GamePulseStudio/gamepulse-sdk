# GameAlytics SDK - Runtime Permissions Guide

This document outlines the runtime permissions required by the GameAlytics SDK across different platforms and how to handle them following industry best practices.

## Overview

The GameAlytics SDK requires certain permissions to function optimally across Android, iOS, Unity, and Web platforms. All permissions are requested at runtime following platform-specific best practices.

## Android Permissions

### Required Permissions

#### Internet Access
```xml
<uses-permission android:name="android.permission.INTERNET" />
```
- **Purpose**: Send analytics data to GameAlytics servers
- **When requested**: Automatically granted (normal permission)
- **Fallback**: SDK will queue events offline if network unavailable

#### Network State
```xml
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```
- **Purpose**: Detect online/offline status for event queue management
- **When requested**: Automatically granted (normal permission)
- **Fallback**: Assumes online if permission denied

### Storage Permissions (Android 9 and below)
```xml
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="28" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />
```
- **Purpose**: Persist event queue when offline
- **When requested**: Runtime (dangerous permission)
- **Fallback**: Uses app-specific storage (no permission needed on Android 10+)

### Optional Permissions

#### Location Services
```xml
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
```
- **Purpose**: Geo-analytics features (future enhancement)
- **When requested**: Only when geo-analytics is enabled
- **Fallback**: Analytics work without location data

#### Background Processing
```xml
<uses-permission android:name="android.permission.WAKE_LOCK" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_DATA_SYNC" />
```
- **Purpose**: Ensure critical events are delivered in background
- **When requested**: Automatically granted (normal permissions)
- **Fallback**: Events queued until app becomes active

### Usage Example
```java
// SDK automatically logs missing permissions when features are used
// No automatic permission requests - developer controls when to ask

// Developer-controlled permission requests (call when appropriate in your UX flow)
GameAlytics.requestPermissions(activity); // Triggers required permissions dialog

// Optional: Request location permissions when geo-analytics needed
GameAlytics.requestLocationPermission(activity); // Triggers location permission dialog

// Handle permission results
@Override
public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
    if (PermissionManager.handlePermissionResult(requestCode, permissions, grantResults)) {
        // All required permissions granted
        Log.i("App", "GameAlytics permissions granted");
    } else {
        // Permissions denied - SDK will continue with limited functionality
        Log.w("App", "Some GameAlytics permissions denied");
    }
}
```

## iOS Permissions

### Network Security
```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <false/>
    <key>NSExceptionDomains</key>
    <dict>
        <key>gamealytics.click</key>
        <dict>
            <key>NSExceptionMinimumTLSVersion</key>
            <string>TLSv1.2</string>
        </dict>
    </dict>
</dict>
```
- **Purpose**: Secure HTTPS connections to GameAlytics servers
- **When requested**: Automatically handled by iOS
- **Fallback**: Requests will fail if TLS requirements not met

### Optional Permissions

#### Location Services
```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>This app uses location data to provide geo-analytics insights for game performance optimization.</string>
```
- **Purpose**: Geo-analytics features (future enhancement)
- **When requested**: Only when geo-analytics is enabled
- **Fallback**: Analytics work without location data

#### Background Processing
```xml
<key>UIBackgroundModes</key>
<array>
    <string>background-processing</string>
    <string>background-fetch</string>
</array>
```
- **Purpose**: Process event queue in background
- **When requested**: Automatically granted
- **Fallback**: Events processed when app becomes active

### Usage Example
```swift
// SDK automatically logs missing permissions when features are used
// No automatic permission requests - developer controls when to ask

// Developer-controlled permission requests (call when appropriate in your UX flow)
GameAlytics.requestLocationPermission { granted in
    if granted {
        print("Location permission granted for geo-analytics")
    } else {
        print("Location permission denied - continuing without geo-analytics")
    }
}

// Show permission rationale if needed
if !PermissionManager.hasLocationPermission() {
    PermissionManager.showPermissionRationale(
        for: "location",
        from: viewController
    ) { granted in
        // Handle user response
    }
}
```

## Unity Permissions

### Cross-Platform Support
Unity handles most permissions automatically, but some platform-specific permissions may be required:

#### Internet Access
- **Android**: Automatically added to manifest
- **iOS**: Handled by iOS networking stack
- **WebGL**: Handled by browser
- **Desktop**: No permission required

#### Location Services
```csharp
// SDK automatically logs missing permissions when features are used
// No automatic permission requests - developer controls when to ask

// Check if location is available
if (PermissionManager.HasLocationPermission()) {
    // Enable geo-analytics
}

// Developer-controlled permission request
GameAlytics.RequestLocationPermission(granted => {
    if (granted) {
        Debug.Log("Location permission granted for geo-analytics");
    } else {
        Debug.Log("Location permission denied - continuing without geo-analytics");
    }
});
```

#### Storage Access
```csharp
// Check if persistent data path is writable
if (PermissionManager.HasStoragePermission()) {
    // Can persist event queue
} else {
    // Use in-memory queue only
}
```

## Web Platform

### Browser Permissions
Web platform uses browser APIs that don't require explicit permissions:

#### Network Access
- **Purpose**: Send analytics data via fetch API
- **When requested**: Automatically available
- **Fallback**: Events queued in localStorage if offline

#### Local Storage
- **Purpose**: Persist event queue when offline
- **When requested**: Automatically available
- **Fallback**: In-memory queue if localStorage unavailable

#### Geolocation (Optional)
```javascript
// Request geolocation (future enhancement)
if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
        position => {
            // Enable geo-analytics
        },
        error => {
            // Fallback to analytics without location
        }
    );
}
```

## Best Practices

### 1. Developer-Controlled Permission Requests
- **SDK never auto-requests permissions** - preserves your user experience
- **Logs missing permissions** - helps developers identify issues
- **Trigger methods available** - request permissions when appropriate in your UX flow
- **Graceful fallback** - SDK continues working with limited functionality

### 2. Permission Logging Strategy
- SDK logs warnings when features need missing permissions
- Logs include specific feature names and suggested trigger methods
- Use development builds to identify permission requirements
- Production apps continue silently with available permissions

### 3. User Experience Control
- You decide when and how to request permissions
- Integrate permission requests into your onboarding flow
- Show rationale dialogs before triggering SDK permission requests
- Handle permission denials gracefully in your app logic

### 4. Runtime Checks
- SDK automatically checks permissions before using features
- Missing permissions are logged, not requested
- Features degrade gracefully (e.g., offline queueing without storage)
- Core analytics always work with minimal permissions

### 5. Minimal Permissions
- Request only necessary permissions
- Optional permissions (location) only requested when needed
- Use least-privileged access patterns
- Avoid requesting all permissions upfront

## Permission Flow Diagram

```
App Launch
    ↓
Initialize SDK (always succeeds)
    ↓
Feature Usage → Check Permissions → Available? → Use Feature
    ↓                                    ↓
    Missing                              No
    ↓                                    ↓
Log Warning                         Graceful Fallback
    ↓                                    ↓
Continue with Limited Functionality     Continue
    ↓
Developer Calls Trigger Method → Request Permission → Handle Result
```

## Troubleshooting

### Common Issues

1. **Permission Denied**: Show rationale and settings link
2. **Network Unavailable**: Queue events and retry when online
3. **Storage Unavailable**: Use in-memory queue with size limits
4. **Location Disabled**: Continue analytics without geo-data

### Debug Commands
```bash
# Android: Check permissions
adb shell dumpsys package com.your.app | grep permission

# iOS: Check location services
# Settings → Privacy & Security → Location Services

# Unity: Check logs
Debug.Log($"Internet: {PermissionManager.HasInternetPermission()}");
Debug.Log($"Location: {PermissionManager.HasLocationPermission()}");
Debug.Log($"Storage: {PermissionManager.HasStoragePermission()}");
```

```java
{{ ... }}
        }
    );
}
```

### Best Practices

### 1. Progressive Permission Requests
- Request permissions only when needed
- Explain why each permission is required
- Provide clear fallback behavior

### 2. Graceful Degradation
- SDK functions without optional permissions
- Core analytics always work with minimal permissions
- Queue events offline and retry when online

### 3. User Education
- Show permission rationale before requesting
- Use clear, user-friendly descriptions
- Provide settings links for denied permissions

### 4. Runtime Checks
- Always check permissions before using features
- Handle permission changes during app lifecycle
- Provide status callbacks for permission changes

### 5. Minimal Permissions
- Request only necessary permissions
- Use least-privileged access patterns
- Avoid requesting all permissions upfront

## Permission Flow Diagram

```
App Launch
    ↓
Initialize SDK (always succeeds)
    ↓
Feature Usage → Check Permissions → Available? → Use Feature
    ↓                                    ↓
    Missing                              No
    ↓                                    ↓
Log Warning                         Graceful Fallback
    ↓                                    ↓
Continue with Limited Functionality     Continue
    ↓
Developer Calls Trigger Method → Request Permission → Handle Result
```

## Troubleshooting

### Common Issues

1. **Permission Denied**: Show rationale and settings link
2. **Network Unavailable**: Queue events and retry when online
3. **Storage Unavailable**: Use in-memory queue with size limits
4. **Location Disabled**: Continue analytics without geo-data

### Debug Commands
```bash
# Android: Check permissions
adb shell dumpsys package com.your.app | grep permission

# iOS: Check location services
# Settings → Privacy & Security → Location Services

# Unity: Check logs
Debug.Log($"Internet: {PermissionManager.HasInternetPermission()}");
Debug.Log($"Location: {PermissionManager.HasLocationPermission()}");
Debug.Log($"Storage: {PermissionManager.HasStoragePermission()}");
```
