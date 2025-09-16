# GameAlytics Web SDK

The official Web/JavaScript SDK for GameAlytics, providing comprehensive game analytics tracking for web-based games, Node.js applications, and cross-platform web projects.

## Features

- **Cross-platform support**: Works in browsers, Node.js, and web-based game engines
- **TypeScript support**: Full TypeScript definitions included for better development experience
- **Easy integration**: Fluent API design for intuitive event tracking
- **Real-time analytics**: View your game's analytics in real-time on the GameAlytics dashboard
- **Comprehensive event tracking**: Track system events, custom events, user sessions, and more
- **Lightweight**: Minimal performance impact with efficient event queuing
- **Automatic device detection**: Automatically collects browser/device information
- **Event validation**: Built-in data validation and sanitization for reliable analytics
- **Offline support**: Event queue handles offline scenarios gracefully

## Installation

### Via NPM

```bash
npm install @gamealytics/web-sdk
```

### Via Yarn

```bash
yarn add @gamealytics/web-sdk
```

### Via CDN (Browser)

```html
<script src="https://unpkg.com/@gamealytics/web-sdk@latest/dist/index.js"></script>
```

## Usage

### 1. Initialize the SDK

#### ES Modules / TypeScript

```typescript
import GameAlytics, { UserConfig, Environment } from '@gamealytics/web-sdk';

// Create user configuration
const userConfig = UserConfig.builder()
    .setSessionId(crypto.randomUUID()) // or any unique session ID
    .setUserId('user123') // or use setAnonymous() for anonymous users
    .build();

// Initialize GameAlytics
const analytics = GameAlytics.init('your-api-key', Environment.PRODUCTION)
    .userConfig(userConfig)
    .create();
```

#### CommonJS / Node.js

```javascript
const GameAlytics = require('@gamealytics/web-sdk');
const { UserConfig, Environment } = GameAlytics;

// Create user configuration
const userConfig = UserConfig.builder()
    .setSessionId(require('crypto').randomUUID())
    .setUserId('user123')
    .build();

// Initialize GameAlytics
const analytics = GameAlytics.init('your-api-key', Environment.PRODUCTION)
    .userConfig(userConfig)
    .create();
```

#### Browser (Global)

```html
<script src="https://unpkg.com/@gamealytics/web-sdk@latest/dist/index.js"></script>
<script>
    // Create user configuration
    const userConfig = GameAlytics.UserConfig.builder()
        .setSessionId('session-' + Date.now())
        .setUserId('user123')
        .build();

    // Initialize GameAlytics
    const analytics = GameAlytics.init('your-api-key', GameAlytics.Environment.PRODUCTION)
        .userConfig(userConfig)
        .create();
</script>
```

### 2. Track System Events

```typescript
import { Gameplay, IAP, User, Progression, Ad } from '@gamealytics/web-sdk';

// Track gameplay events
GameAlytics.getInstance().systemEvent()
    .categoryClass(Gameplay)
    .eventType(Gameplay.LEVEL_START)
    .setProperties({
        level: '1',
        difficulty: 'easy',
        timestamp: Date.now().toString()
    })
    .trigger();

// Track IAP events
GameAlytics.getInstance().systemEvent()
    .categoryClass(IAP)
    .eventType(IAP.PURCHASE)
    .setProperties({
        item_id: 'premium_upgrade',
        price: '9.99',
        currency: 'USD'
    })
    .trigger();

// Track user session events
GameAlytics.getInstance().systemEvent()
    .categoryClass(User)
    .eventType(User.SESSION_START)
    .setProperties({
        platform: 'web',
        browser: navigator.userAgent
    })
    .trigger();
```

### 3. Track Custom Events

```typescript
// Track custom events with fluent API
GameAlytics.getInstance().customEvent()
    .categoryName('ui')
    .eventType('button_click')
    .setProperties({
        button_name: 'start_game',
        screen: 'main_menu',
        timestamp: Date.now().toString()
    })
    .trigger();

// Track game-specific events
GameAlytics.getInstance().customEvent()
    .categoryName('boss_fight')
    .eventType('boss_defeated')
    .setProperties({
        boss_name: 'Dragon King',
        time_taken: '120',
        health_remaining: '25'
    })
    .trigger();
```

### 4. Session Management

The SDK automatically handles sessions, but you can also manage them manually:

```typescript
// Start a new session (usually automatic)
await GameAlytics.getInstance().startSession();

// End current session (usually automatic on page unload)
await GameAlytics.getInstance().endSession();
```

## Event Categories

### Gameplay Events
```typescript
import { Gameplay } from '@gamealytics/web-sdk';

Gameplay.LEVEL_START
Gameplay.LEVEL_END
Gameplay.LEVEL_UP
Gameplay.BOSS_FIGHT
Gameplay.CHECKPOINT_REACHED
```

### IAP Events
```typescript
import { IAP } from '@gamealytics/web-sdk';

IAP.PURCHASE
IAP.PURCHASE_FAILED
IAP.PURCHASE_RESTORED
IAP.SUBSCRIPTION_STARTED
IAP.SUBSCRIPTION_CANCELLED
```

### User Events
```typescript
import { User } from '@gamealytics/web-sdk';

User.SESSION_START
User.SESSION_END
User.USER_LOGIN
User.USER_LOGOUT
User.USER_REGISTER
```

### Progression Events
```typescript
import { Progression } from '@gamealytics/web-sdk';

Progression.TUTORIAL_COMPLETE
Progression.ACHIEVEMENT_UNLOCKED
Progression.MILESTONE_REACHED
Progression.QUEST_COMPLETED
```

### Ad Events
```typescript
import { Ad } from '@gamealytics/web-sdk';

Ad.AD_VIEWED
Ad.AD_CLICKED
Ad.AD_REWARDED
Ad.AD_FAILED
```

## Environment Configuration

```typescript
import { Environment } from '@gamealytics/web-sdk';

// For development/testing
GameAlytics.init('your-api-key', Environment.DEVELOPMENT)

// For production
GameAlytics.init('your-api-key', Environment.PRODUCTION)
```

## Advanced Usage

### Instance-Based API (Recommended for Performance)

```typescript
// Store the instance for better performance
const analytics = GameAlytics.getInstance();

// Use instance methods to avoid repeated singleton lookups
analytics.systemEvent()
    .categoryClass(Gameplay)
    .eventType(Gameplay.LEVEL_START)
    .setProperties({ level: '1' })
    .trigger();
```

### Event Batching and Queuing

The SDK automatically handles event queuing and batching for optimal performance:

```typescript
// Events are automatically queued and sent in batches
for (let i = 0; i < 100; i++) {
    analytics.customEvent()
        .categoryName('bulk_test')
        .eventType('test_event')
        .setProperties({ index: i.toString() })
        .trigger();
}
```

### Error Handling

```typescript
try {
    const analytics = GameAlytics.init('your-api-key', Environment.PRODUCTION)
        .userConfig(userConfig)
        .create();
    
    // Track events with error handling
    await analytics.customEvent()
        .categoryName('test')
        .eventType('error_test')
        .setProperties({ test: 'value' })
        .trigger();
        
} catch (error) {
    console.error('GameAlytics error:', error);
}
```

## Framework Integration

### React

```tsx
import React, { useEffect } from 'react';
import GameAlytics, { UserConfig, Environment, Gameplay } from '@gamealytics/web-sdk';

function App() {
    useEffect(() => {
        // Initialize GameAlytics
        const userConfig = UserConfig.builder()
            .setSessionId(crypto.randomUUID())
            .setUserId('user123')
            .build();

        GameAlytics.init('your-api-key', Environment.PRODUCTION)
            .userConfig(userConfig)
            .create();

        // Track app start
        GameAlytics.getInstance().customEvent()
            .categoryName('app')
            .eventType('app_start')
            .trigger();
    }, []);

    const handleLevelStart = () => {
        GameAlytics.getInstance().systemEvent()
            .categoryClass(Gameplay)
            .eventType(Gameplay.LEVEL_START)
            .setProperties({ level: '1' })
            .trigger();
    };

    return (
        <div>
            <button onClick={handleLevelStart}>Start Level</button>
        </div>
    );
}
```

### Vue.js

```vue
<template>
    <div>
        <button @click="trackEvent">Track Event</button>
    </div>
</template>

<script>
import GameAlytics, { UserConfig, Environment, Gameplay } from '@gamealytics/web-sdk';

export default {
    name: 'GameAnalyticsExample',
    mounted() {
        const userConfig = UserConfig.builder()
            .setSessionId(crypto.randomUUID())
            .setUserId('user123')
            .build();

        GameAlytics.init('your-api-key', Environment.PRODUCTION)
            .userConfig(userConfig)
            .create();
    },
    methods: {
        trackEvent() {
            GameAlytics.getInstance().systemEvent()
                .categoryClass(Gameplay)
                .eventType(Gameplay.LEVEL_START)
                .trigger();
        }
    }
};
</script>
```

## Best Practices

1. **Initialize early**: Initialize the SDK as early as possible in your application lifecycle
2. **Use meaningful events**: Focus on events that provide actionable insights for your game
3. **Consistent naming**: Use consistent event and parameter names across your application
4. **Test in development**: Use the development environment to verify events are being tracked correctly
5. **Handle errors gracefully**: Wrap GameAlytics calls in try-catch blocks for production applications
6. **Respect user privacy**: Only collect data necessary for improving your game experience
7. **Use TypeScript**: Take advantage of full TypeScript support for better development experience

## Troubleshooting

### Common Issues

- **Events not appearing in dashboard**:
  - Verify your API key is correct
  - Check your internet connection and browser console for errors
  - Make sure you're looking at the correct environment in the GameAlytics dashboard
  - Check for any CORS or Content Security Policy issues

- **SDK not initializing**:
  - Ensure you've provided a valid API key and environment
  - Check browser console for initialization errors
  - Verify UserConfig is properly configured with sessionId and userId/anonymousId

- **TypeScript compilation errors**:
  - Make sure you have the latest version of the SDK
  - Ensure your TypeScript configuration supports ES2020+ features
  - Check that all required dependencies are installed

### Debugging

Enable debug logging to see detailed information about SDK operations:

```typescript
// The SDK automatically provides more detailed logging in DEVELOPMENT environment
GameAlytics.init('your-api-key', Environment.DEVELOPMENT)
    .userConfig(userConfig)
    .create();

// Check browser console for validation warnings and debug information
```

### Browser Compatibility

The SDK supports all modern browsers:
- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

For older browser support, consider using polyfills for:
- `fetch()` API
- `Promise`
- `Map` and `Set`

## API Reference

### GameAlytics

The main SDK class providing initialization and instance management.

#### Static Methods
- `init(apiKey: string, environment: Environment): InitBuilder`
- `getInstance(): GameAlytics`

### UserConfig

Configuration class for user identification.

#### Methods
- `builder(): UserConfigBuilder`
- `setSessionId(sessionId: string): UserConfigBuilder`
- `setUserId(userId: string): UserConfigBuilder`
- `setAnonymous(anonymousId: string): UserConfigBuilder`
- `build(): UserConfig`

### Event Builders

#### SystemEventBuilder
- `categoryClass(categoryClass: any): SystemEventBuilder`
- `eventType(type: string): SystemEventBuilder`
- `setProperties(properties: EventProperties): SystemEventBuilder`
- `trigger(): void`

#### CustomEventBuilder
- `categoryName(category: string): CustomEventBuilder`
- `eventType(type: string): CustomEventBuilder`
- `setProperties(properties: EventProperties): CustomEventBuilder`
- `trigger(): void`

## Version History

Current version: **2.0.14**

- Added comprehensive event categories and builders
- Improved TypeScript support and type definitions
- Enhanced error handling and validation
- Added event queue for reliable delivery
- Cross-platform browser and Node.js support
- Fluent API design for better developer experience

## Support

For support, please contact support@gamealytics.com or visit our [documentation](https://docs.gamealytics.com).

## License

This SDK is licensed under the MIT License. See the [LICENSE](LICENSE) file for more information.