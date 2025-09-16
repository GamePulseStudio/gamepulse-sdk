# GameAlytics Web SDK

Version: **2.0.20**

Cross-platform analytics SDK for web-based games and applications.

## Installation

### Using npm (Recommended)

```bash
npm install @gamealytics/sdk
```

### Using CDN

```html
<script src="https://cdn.jsdelivr.net/npm/@gamealytics/sdk@2.0.20/dist/gamealytics.min.js"></script>
```

### Using GitHub Releases

Download the latest `gamealytics-web-sdk.js` from the [Releases](https://github.com/gamealytics/gamealytics-sdk/releases) page.

## Usage

### Initialize the SDK

```javascript
import GameAlytics from '@gamealytics/sdk';

// Initialize GameAlytics
GameAlytics.init({
    apiKey: 'your-api-key',
    environment: 'sandbox', // or 'production'
    userId: 'unique-user-id' // optional
});
```

### Track Events

```javascript
// Custom events
GameAlytics.customEvent('level_completed', {
    eventValue: 100,
    level: '1',
    time: '120'
});

// Progression events
GameAlytics.progressionEvent({
    progression: 'start',
    progressionName: 'world_1'
});

// Ad events
GameAlytics.adEvent({
    adType: 'rewarded_video',
    adPlacement: 'main_menu',
    adProvider: 'admob'
});
```

### TypeScript Support

The SDK includes full TypeScript definitions:

```typescript
import GameAlytics, { 
    GameAlyticsConfig, 
    CustomEventData, 
    ProgressionEventData 
} from '@gamealytics/sdk';

const config: GameAlyticsConfig = {
    apiKey: 'your-api-key',
    environment: 'sandbox'
};

GameAlytics.init(config);
```

## Requirements

- Node.js 16.0 or higher (for development)
- Modern browsers (ES2015+)
- TypeScript 4.0+ (for TypeScript projects)

## Building from Source

```bash
# Clone the repository
git clone https://github.com/gamealytics/gamealytics-sdk.git
cd gamealytics-sdk/web

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