import Foundation
import CoreLocation
import UIKit

/**
 * Simplified permission manager for GameAlytics iOS SDK
 * - Internet permission: Available by default on iOS, no check needed
 * - Storage permission: App-specific storage available by default, no check needed
 * - Location permission: Optional, adds latitude/longitude to events if available
 * - No automatic permission requests - SDK ready only if permissions available
 */
@objc public class PermissionManager: NSObject {
    
    // MARK: - Location Permission Management
    
    private static var locationManager: CLLocationManager?
    private static var currentLocation: CLLocation?
    private static var locationInitialized = false
    
    /**
     * Check if location permissions are granted (optional)
     */
    @objc public static func hasLocationPermission() -> Bool {
        switch CLLocationManager.authorizationStatus() {
        case .authorizedWhenInUse, .authorizedAlways:
            return true
        default:
            return false
        }
    }
    
    /**
     * Initialize location services if permissions are available
     */
    @objc public static func initializeLocation() {
        if !locationInitialized && hasLocationPermission() {
            locationManager = CLLocationManager()
            locationManager?.delegate = LocationDelegate.shared
            locationManager?.desiredAccuracy = kCLLocationAccuracyHundredMeters
            locationManager?.distanceFilter = 100 // Update every 100 meters
            locationManager?.startUpdatingLocation()
            locationInitialized = true
        }
    }
    
    /**
     * Get location data to add to events (if available)
     */
    @objc public static func getLocationData() -> [String: String] {
        var locationData: [String: String] = [:]
        
        if hasLocationPermission() {
            initializeLocation()
            
            if let location = currentLocation {
                locationData["latitude"] = String(location.coordinate.latitude)
                locationData["longitude"] = String(location.coordinate.longitude)
            }
        }
        
        return locationData
    }
    
    /**
     * Update current location (called by delegate)
     */
    internal static func updateLocation(_ location: CLLocation) {
        currentLocation = location
    }
    
    /**
     * Check if background app refresh is enabled
     */
    @objc public static func hasBackgroundRefreshPermission() -> Bool {
        return UIApplication.shared.backgroundRefreshStatus == .available
    }
    
}

// MARK: - Location Delegate

private class LocationDelegate: NSObject, CLLocationManagerDelegate {
    static let shared = LocationDelegate()
    
    func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        if let location = locations.last {
            PermissionManager.updateLocation(location)
        }
    }
    
    func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        print("GameAlytics SDK: Location update failed: \(error.localizedDescription)")
    }
}

// MARK: - Background Task Management

@objc public class BackgroundTaskManager: NSObject {
    
    private static var backgroundTaskId: UIBackgroundTaskIdentifier = .invalid
    
    /**
     * Begin background task for event processing
     */
    @objc public static func beginBackgroundTask(name: String = "GameAlytics Event Processing") -> UIBackgroundTaskIdentifier {
        backgroundTaskId = UIApplication.shared.beginBackgroundTask(withName: name) {
            endBackgroundTask()
        }
        return backgroundTaskId
    }
    
    /**
     * End background task
     */
    @objc public static func endBackgroundTask() {
        if backgroundTaskId != .invalid {
            UIApplication.shared.endBackgroundTask(backgroundTaskId)
            backgroundTaskId = .invalid
        }
    }
    
    /**
     * Check if background time is available
     */
    @objc public static func hasBackgroundTimeRemaining() -> Bool {
        return UIApplication.shared.backgroundTimeRemaining > 10.0 // At least 10 seconds
    }
}
