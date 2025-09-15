# GameAlytics Android SDK

## Installation via JitPack

Add JitPack repository to your project's `build.gradle` (project level):

```gradle
allprojects {
    repositories {
        google()
        mavenCentral()
        maven { url 'https://jitpack.io' }
    }
}
```

Add the dependency to your app's `build.gradle` (app level):

```gradle
dependencies {
    implementation 'com.github.gamealytics:gamealytics-sdk:2.0.0'
}
```

## Usage

```java
import com.gamealytics.sdk.GameAlytics;

// Initialize the SDK
GameAlytics.initialize(this, "your-game-key", "your-secret-key");

// Track events
GameAlytics.trackEvent("level_completed", eventData);
GameAlytics.trackPurchase("item_id", 9.99, "USD");
```

## Public Repository

This SDK is published via JitPack, which automatically builds from GitHub releases. No authentication is required to use this library.

## Version

Current version: 2.0.0
