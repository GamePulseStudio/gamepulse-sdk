import GameAlytics, { UserConfig, Environment, Gameplay, IAP, User, Progression, Ad } from '../src/GameAlytics';

// Example usage of the GameAlytics Web SDK with the new fluent API

class WebUsageExample {
    private gameAlytics: GameAlytics | null = null;

    async initializeSDK() {
        try {
            // Initialize GameAlytics with fluent API
            this.gameAlytics = GameAlytics.init("your-api-key-here", Environment.DEVELOPMENT)
                .userConfig(
                    UserConfig.builder()
                        .setSessionId("session-123")
                        .setUserId("user-456")
                        .build()
                )
                .create();

            console.log("GameAlytics Web SDK initialized successfully");
        } catch (error) {
            console.error("Failed to initialize GameAlytics:", error);
        }
    }

    trackEvents() {
        if (!this.gameAlytics) {
            console.error("GameAlytics not initialized");
            return;
        }

        // Use instance-based API for better performance (avoids singleton lookups)
        // This approach is more efficient as it reuses the initialized instance
        
        // Track system events using instance API (preferred for performance)
        this.gameAlytics.systemEvent()
            .categoryClass(Gameplay)
            .eventType(Gameplay.LEVEL_START)
            .setProperties({
                level: '1',
                difficulty: 'easy',
                timestamp: Date.now().toString()
            })
            .trigger();

        this.gameAlytics.systemEvent()
            .categoryClass(IAP)
            .eventType(IAP.PURCHASE)
            .setProperties({
                item_id: 'premium_upgrade',
                price: '9.99',
                currency: 'USD'
            })
            .trigger();

        // Track custom events using instance API
        this.gameAlytics.customEvent()
            .categoryName('ui')
            .eventType('button_tap')
            .setProperties({
                button_name: 'start_game',
                screen: 'main_menu'
            })
            .trigger();

        // Alternative: Direct method call (most efficient for simple events)
        this.gameAlytics.customEvent("feature_used", "engagement")
            .setProperties({ 
                feature: "tutorial",
                completion_rate: 0.8
            })
            .track();
    }

    async sessionManagement() {
        if (!this.gameAlytics) return;

        // Start a new session
        await this.gameAlytics.startSession();

        // Simulate some gameplay
        setTimeout(async () => {
            // End the session
            await this.gameAlytics!.endSession();
        }, 60000); // End session after 1 minute
    }
}

// Usage
const example = new WebUsageExample();

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', async () => {
    await example.initializeSDK();
    example.trackEvents();
    example.sessionManagement();
});

export default WebUsageExample;
