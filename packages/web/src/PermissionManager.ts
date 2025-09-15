/**
 * Simplified permission manager for GameAlytics Web SDK
 * - Internet permission: Available by default in browsers, no check needed
 * - Storage permission: localStorage/sessionStorage available by default, no check needed  
 * - Location permission: Optional, adds latitude/longitude to events if available
 * - No automatic permission requests - SDK ready only if permissions available
 */
export class PermissionManager {
    private static currentLocation: GeolocationPosition | null = null;
    private static locationInitialized = false;

    /**
     * Check if geolocation is available and permitted (optional)
     */
    public static hasLocationPermission(): boolean {
        return 'geolocation' in navigator;
    }

    /**
     * Initialize location services if permissions are available
     */
    public static initializeLocation(): void {
        if (!this.locationInitialized && this.hasLocationPermission()) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    this.currentLocation = position;
                },
                (error) => {
                    // Silent failure - location is optional
                    console.debug('GameAlytics SDK: Location access denied or unavailable');
                },
                {
                    enableHighAccuracy: false,
                    timeout: 10000,
                    maximumAge: 300000 // 5 minutes
                }
            );
            this.locationInitialized = true;
        }
    }

    /**
     * Get location data to add to events (if available)
     */
    public static getLocationData(): { [key: string]: string } {
        const locationData: { [key: string]: string } = {};

        if (this.hasLocationPermission()) {
            this.initializeLocation();

            if (this.currentLocation) {
                locationData.latitude = this.currentLocation.coords.latitude.toString();
                locationData.longitude = this.currentLocation.coords.longitude.toString();
            }
        }

        return locationData;
    }
}
