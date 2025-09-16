# GameAlytics Android SDK

Version: **2.0.19**

Cross-platform analytics SDK for Android game developers.

## Installation

### Using JitPack (Recommended)

Add the JitPack repository to your project's `build.gradle`:

```gradle
allprojects {
    repositories {
        google()
        mavenCentral()
        maven { url 'https://jitpack.io' }
    }
}
```

Add the dependency to your app's `build.gradle`:

```gradle
dependencies {
    implementation 'com.github.gamealytics:gamealytics-sdk:v2.0.19'
}
```

## Usage

### Initialize the SDK

```java
import com.gamealytics.sdk.GameAlytics;

// Initialize in your Application or MainActivity
GameAlytics.init("your-api-key")
    .withEnvironment(GameAlytics.Environment.SANDBOX) // or PRODUCTION
    .withUserId("unique-user-id")
    .build();
```

### Track Events

```java
// Custom events
GameAlytics.customEvent("level_completed")
    .setEventValue(100)
    .addCustomParameter("level", "1")
    .addCustomParameter("time", "120")
    .send();

// Progression events
GameAlytics.progressionEvent()
    .setProgression(GameAlytics.Progression.START)
    .setProgressionName("world_1")
    .send();

// Ad events
GameAlytics.adEvent()
    .setAdType(GameAlytics.Ad.REWARDED_VIDEO)
    .setAdPlacement("main_menu")
    .setAdProvider("admob")
    .send();
```

## Requirements

- Android API level 21 or higher
- Java 17 or Kotlin

## Building from Source

```bash
# Clone the repository
git clone https://github.com/gamealytics/gamealytics-sdk.git
cd gamealytics-sdk/android

# Build the AAR
./gradlew assembleRelease

# Run tests
./gradlew test
```

## License

MIT License - see LICENSE file in the root directory.