# GamePulse Unity SDK

Version: **2.0.22**

Cross-platform analytics SDK for Unity game developers.

## Installation

### Unity Package Manager (Recommended)

1. Open Unity and go to Window > Package Manager
2. Click the "+" button and select "Add package from git URL"
3. Enter: `https://github.com/gamepulse/gamepulse-sdk.git?path=unity`

### Manual Installation

1. Download the latest `.unitypackage` file from the [Releases](https://github.com/gamepulse/gamepulse-sdk/releases) page
2. Import the package into your Unity project: Assets > Import Package > Custom Package

## Usage

### Initialize the SDK

```csharp
using GamePulse;

public class GameManager : MonoBehaviour
{
    void Start()
    {
        // Initialize GamePulse
        GamePulse.Initialize("your-api-key");
        
        // Set user properties (optional)
        GamePulse.SetUserId("unique-user-id");
        GamePulse.SetEnvironment(GPEnvironment.Sandbox); // or Production
    }
}
```

### Track Events

```csharp
// Custom events
GamePulse.CustomEvent("level_completed")
    .SetEventValue(100)
    .AddCustomParameter("level", "1")
    .AddCustomParameter("time", "120")
    .Send();

// Progression events
GamePulse.ProgressionEvent()
    .SetProgression(GPProgression.Start)
    .SetProgressionName("world_1")
    .Send();

// Ad events
GamePulse.AdEvent()
    .SetAdType(GPAdType.RewardedVideo)
    .SetAdPlacement("main_menu")
    .SetAdProvider("admob")
    .Send();
```

## Requirements

- Unity 2020.3 or higher
- .NET Standard 2.0 or .NET Framework 4.x

## Building Unity Package

```bash
# Clone the repository
git clone https://github.com/gamepulse/gamepulse-sdk.git
cd gamepulse-sdk/unity

# Build Unity package
./build-unity-package.sh
```

## License

MIT License - see LICENSE file in the root directory.