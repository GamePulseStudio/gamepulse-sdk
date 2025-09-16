import UIKit
import GameAlytics

// Example usage of the GameAlytics iOS SDK with the new fluent API

class iOSUsageExample: UIViewController {
    private var gameAlytics: GameAlytics?
    
    override func viewDidLoad() {
        super.viewDidLoad()
        initializeSDK()
        trackEvents()
        sessionManagement()
    }
    
    private func initializeSDK() {
        do {
            // Initialize GameAlytics with fluent API
            gameAlytics = try GameAlytics.init("your-api-key-here", environment: .development)
                .userConfig(
                    UserConfig.builder()
                        .setSessionId("session-123")
                        .setUserId("user-456")
                        .build()
                )
                .create()
            
            print("GameAlytics iOS SDK initialized successfully")
        } catch {
            print("Failed to initialize GameAlytics: \(error)")
        }
    }
    
    private func trackEvents() {
        guard let gameAlytics = gameAlytics else {
            print("GameAlytics not initialized")
            return
        }
        
        // Track system events using the new static API
        GameAlytics.getInstance().systemEvent()
            .category(GameAlytics.Gameplay.self)
            .type(GameAlytics.Gameplay.levelStart)
            .setProperties(["level": "1", "difficulty": "easy"])
            .trigger()
        
        GameAlytics.getInstance().systemEvent()
            .category(GameAlytics.IAP.self)
            .type(GameAlytics.IAP.purchase)
            .setProperties(["item": "sword", "price": "4.99"])
            .trigger()
        
        GameAlytics.getInstance().systemEvent()
            .category(GameAlytics.User.self)
            .type(GameAlytics.User.sessionStart)
            .setProperties([:])
            .trigger()
        
        // Track custom events
        GameAlytics.getInstance().customEvent()
            .category("combat")
            .type("boss_defeated")
            .setProperties(["boss": "dragon", "attempts": "3"])
            .trigger()
        
        gameAlytics.event(.levelStart, category: .gameplay)
            .setProperties([
                "level": 1,
                "difficulty": "easy",
                "timestamp": Date().timeIntervalSince1970
            ])
            .track()
        
        gameAlytics.event(.purchase, category: .iap)
            .setProperties([
                "item_id": "premium_upgrade",
                "price": 9.99,
                "currency": "USD"
            ])
            .track()
        
        gameAlytics.customEvent("button_tap", category: "ui")
            .setProperties([
                "button_name": "start_game",
                "screen": "main_menu"
            ])
            .track()
        
        gameAlytics.customEvent("achievement_earned", category: "progression")
            .setProperties([
                "achievement_id": "first_win",
                "points": 100
            ])
            .track()
    }
    
    private func sessionManagement() {
        guard let gameAlytics = gameAlytics else { return }
        
        // Start a new session
        gameAlytics.startSession()
        
        // Simulate some gameplay time
        DispatchQueue.main.asyncAfter(deadline: .now() + 60) {
            // End the session after 1 minute
            gameAlytics.endSession()
        }
    }
    
    // Example of tracking user progression
    private func trackUserProgression() {
        guard let gameAlytics = gameAlytics else { return }
        
        gameAlytics.event(.levelUp, category: .progression)
            .setProperties([
                "new_level": 5,
                "experience_gained": 250,
                "time_played": 1800 // 30 minutes
            ])
            .track()
    }
    
    // Example of tracking monetization events
    private func trackPurchase() {
        guard let gameAlytics = gameAlytics else { return }
        
        gameAlytics.event(.purchase, category: .iap)
            .setProperties([
                "product_id": "com.yourapp.coins_pack_large",
                "price": 4.99,
                "currency": "USD",
                "quantity": 1000
            ])
            .track()
    }
    
    // Example of tracking ad events
    private func trackAdViewed() {
        guard let gameAlytics = gameAlytics else { return }
        
        gameAlytics.event(.adViewed, category: .ad)
            .setProperties([
                "ad_type": "rewarded_video",
                "ad_network": "admob",
                "placement": "level_complete"
            ])
            .track()
    }
}

// Usage in AppDelegate or SceneDelegate
extension AppDelegate {
    func setupGameAlytics() {
        // This would typically be called in application:didFinishLaunchingWithOptions:
        do {
            let _ = try GameAlytics.init("your-production-api-key", environment: .production)
                .userConfig(
                    UserConfig.builder()
                        .setSessionId(UUID().uuidString)
                        .setAnonymous(UIDevice.current.identifierForVendor?.uuidString ?? UUID().uuidString)
                        .build()
                )
                .create()
        } catch {
            print("Failed to initialize GameAlytics in AppDelegate: \(error)")
        }
    }
}
