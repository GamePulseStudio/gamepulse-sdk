# GamePulse Android SDK

Version: **2.0.22**

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
    implementation 'com.github.gamepulse:gamepulse-sdk:v2.0.22'
}
```

## Usage

### Initialize the SDK

```java
import com.gamepulse.sdk.GamePulse;

// Initialize in your Application or MainActivity
GamePulse.init("your-api-key")
    .withEnvironment(GamePulse.Environment.SANDBOX) // or PRODUCTION
    .withUserId("unique-user-id")
    .build();
```

### Track Events

```java
// Custom events
GamePulse.customEvent("level_completed")
    .setEventValue(100)
    .addCustomParameter("level", "1")
    .addCustomParameter("time", "120")
    .send();

// Progression events
GamePulse.progressionEvent()
    .setProgression(GamePulse.Progression.START)
    .setProgressionName("world_1")
    .send();

// Ad events
GamePulse.adEvent()
    .setAdType(GamePulse.Ad.REWARDED_VIDEO)
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
git clone https://github.com/gamepulse/gamepulse-sdk.git
cd gamepulse-sdk/android

# Build the AAR
./gradlew assembleRelease

# Run tests
./gradlew test
```

## License

MIT License - see LICENSE file in the root directory.