# GamePulse Web SDK

Version: **2.0.22**

Cross-platform analytics SDK for web-based games and applications.

## Installation

### Using npm (Recommended)

```bash
npm install @gamepulse-studio/web-sdk
```

### Using CDN

```html
<script src="https://cdn.jsdelivr.net/npm/@gamepulse-studio/web-sdk@2.0.22/dist/gamepulse.min.js"></script>
```

### Using GitHub Releases

Download the latest `gamepulse-web-sdk.js` from the [Releases](https://github.com/gamepulse/gamepulse-sdk/releases) page.

## Usage

### Initialize the SDK

```javascript
import GamePulse from '@gamepulse-studio/web-sdk';

// Initialize GamePulse
GamePulse.init({
    apiKey: 'your-api-key',
    environment: 'sandbox', // or 'production'
    userId: 'unique-user-id' // optional
});
```

### Track Events

```javascript
// Custom events
GamePulse.customEvent('level_completed', {
    eventValue: 100,
    level: '1',
    time: '120'
});

// Progression events
GamePulse.progressionEvent({
    progression: 'start',
    progressionName: 'world_1'
});

// Ad events
GamePulse.adEvent({
    adType: 'rewarded_video',
    adPlacement: 'main_menu',
    adProvider: 'admob'
});
```

### TypeScript Support

The SDK includes full TypeScript definitions:

```typescript
import GamePulse, { 
    GamePulseConfig, 
    CustomEventData, 
    ProgressionEventData 
} from '@gamepulse-studio/web-sdk';

const config: GamePulseConfig = {
    apiKey: 'your-api-key',
    environment: 'sandbox'
};

GamePulse.init(config);
```

## Requirements

- Node.js 16.0 or higher (for development)
- Modern browsers (ES2015+)
- TypeScript 4.0+ (for TypeScript projects)

## Building from Source

```bash
# Clone the repository
git clone https://github.com/gamepulse/gamepulse-sdk.git
cd gamepulse-sdk/web

# Install dependencies
npm install

# Build the SDK
npm run build

# Run tests
npm test

# Run example
npm run example
```

## License

MIT License - see LICENSE file in the root directory.