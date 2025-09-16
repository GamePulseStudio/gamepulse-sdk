"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionManager = void 0;
/**
 * Simplified permission manager for GameAlytics Web SDK
 * - Internet permission: Available by default in browsers, no check needed
 * - Storage permission: localStorage/sessionStorage available by default, no check needed
 * - Location permission: Optional, adds latitude/longitude to events if available
 * - No automatic permission requests - SDK ready only if permissions available
 */
var PermissionManager = /** @class */ (function () {
    function PermissionManager() {
    }
    /**
     * Check if geolocation is available and permitted (optional)
     */
    PermissionManager.hasLocationPermission = function () {
        return 'geolocation' in navigator;
    };
    /**
     * Initialize location services if permissions are available
     */
    PermissionManager.initializeLocation = function () {
        var _this = this;
        if (!this.locationInitialized && this.hasLocationPermission()) {
            navigator.geolocation.getCurrentPosition(function (position) {
                _this.currentLocation = position;
            }, function (error) {
                // Silent failure - location is optional
                console.debug('GameAlytics SDK: Location access denied or unavailable');
            }, {
                enableHighAccuracy: false,
                timeout: 10000,
                maximumAge: 300000 // 5 minutes
            });
            this.locationInitialized = true;
        }
    };
    /**
     * Get location data to add to events (if available)
     */
    PermissionManager.getLocationData = function () {
        var locationData = {};
        if (this.hasLocationPermission()) {
            this.initializeLocation();
            if (this.currentLocation) {
                locationData.latitude = this.currentLocation.coords.latitude.toString();
                locationData.longitude = this.currentLocation.coords.longitude.toString();
            }
        }
        return locationData;
    };
    PermissionManager.currentLocation = null;
    PermissionManager.locationInitialized = false;
    return PermissionManager;
}());
exports.PermissionManager = PermissionManager;
