package com.gamepulse.sdk.permissions;

import android.Manifest;
import android.content.Context;
import android.content.pm.PackageManager;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import androidx.core.content.ContextCompat;
import java.util.Map;
import java.util.HashMap;

/**
 * Simplified permission manager for Gamepulse SDK
 * - Internet permission: Required by default, logs error if missing
 * - Storage permission: Required for retries/failures, logs error if missing
 * - Location permission: Optional, adds latitude/longitude to events if available
 * - No automatic permission requests - SDK ready only if permissions available
 */
public class PermissionManager {
    
    private static final String TAG = "Gamepulse";
    private static LocationManager locationManager;
    private static Location lastKnownLocation;
    private static boolean locationInitialized = false;
    
    /**
     * Check if Internet permission is available (should be by default)
     */
    public static boolean hasInternetPermission(Context context) {
        boolean hasInternet = ContextCompat.checkSelfPermission(context, Manifest.permission.INTERNET) 
            == PackageManager.PERMISSION_GRANTED;
        
        if (!hasInternet) {
            Log.e(TAG, "Gamepulse SDK: INTERNET permission is missing. Add <uses-permission android:name=\"android.permission.INTERNET\" /> to AndroidManifest.xml");
        }
        
        return hasInternet;
    }
    
    /**
     * Check if storage permissions are granted (for event queue persistence)
     */
    public static boolean hasStoragePermissions(Context context) {
        // Android 10+ uses scoped storage, no permission needed for app-specific storage
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            return true;
        }
        
        // For older Android versions, check external storage permissions
        boolean hasWrite = ContextCompat.checkSelfPermission(context, Manifest.permission.WRITE_EXTERNAL_STORAGE) 
            == PackageManager.PERMISSION_GRANTED;
        boolean hasRead = ContextCompat.checkSelfPermission(context, Manifest.permission.READ_EXTERNAL_STORAGE) 
            == PackageManager.PERMISSION_GRANTED;
        
        if (!hasWrite || !hasRead) {
            Log.e(TAG, "Gamepulse SDK: Storage permissions missing. Event queue persistence may be limited. Add storage permissions to AndroidManifest.xml");
            return false;
        }
        
        return true;
    }
    
    /**
     * Check if location permissions are granted (optional)
     */
    public static boolean hasLocationPermissions(Context context) {
        return ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION) 
            == PackageManager.PERMISSION_GRANTED ||
            ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_COARSE_LOCATION) 
            == PackageManager.PERMISSION_GRANTED;
    }
    
    /**
     * Initialize location services if permissions are available
     */
    public static void initializeLocation(Context context) {
        if (!locationInitialized && hasLocationPermissions(context)) {
            try {
                locationManager = (LocationManager) context.getSystemService(Context.LOCATION_SERVICE);
                
                // Try to get last known location
                if (locationManager != null) {
                    lastKnownLocation = locationManager.getLastKnownLocation(LocationManager.GPS_PROVIDER);
                    if (lastKnownLocation == null) {
                        lastKnownLocation = locationManager.getLastKnownLocation(LocationManager.NETWORK_PROVIDER);
                    }
                    
                    // Request location updates for future events
                    LocationListener locationListener = new LocationListener() {
                        @Override
                        public void onLocationChanged(Location location) {
                            lastKnownLocation = location;
                        }
                        
                        @Override
                        public void onStatusChanged(String provider, int status, Bundle extras) {}
                        
                        @Override
                        public void onProviderEnabled(String provider) {}
                        
                        @Override
                        public void onProviderDisabled(String provider) {}
                    };
                    
                    // Request updates every 5 minutes or 100 meters
                    locationManager.requestLocationUpdates(
                        LocationManager.NETWORK_PROVIDER, 
                        300000, // 5 minutes
                        100,    // 100 meters
                        locationListener
                    );
                }
                
                locationInitialized = true;
            } catch (SecurityException e) {
                Log.w(TAG, "Gamepulse SDK: Location permission denied at runtime");
            } catch (Exception e) {
                Log.w(TAG, "Gamepulse SDK: Failed to initialize location services: " + e.getMessage());
            }
        }
    }
    
    /**
     * Get location data to add to events (if available)
     */
    public static Map<String, String> getLocationData(Context context) {
        Map<String, String> locationData = new HashMap<>();
        
        if (hasLocationPermissions(context)) {
            initializeLocation(context);
            
            if (lastKnownLocation != null) {
                locationData.put("latitude", String.valueOf(lastKnownLocation.getLatitude()));
                locationData.put("longitude", String.valueOf(lastKnownLocation.getLongitude()));
            }
        }
        
        return locationData;
    }
    
    /**
     * Check all required permissions and log errors for missing ones
     */
    public static boolean checkRequiredPermissions(Context context) {
        boolean hasInternet = hasInternetPermission(context);
        boolean hasStorage = hasStoragePermissions(context);
        
        return hasInternet && hasStorage;
    }
}
