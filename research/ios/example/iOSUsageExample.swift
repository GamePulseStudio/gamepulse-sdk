import UIKit
import Gamepulse

// Example usage of the Gamepulse iOS SDK with the new fluent API

class iOSUsageExample: UIViewController {
    private var gamepulse: Gamepulse?
    
    override func viewDidLoad() {
        super.viewDidLoad()
        initializeSDK()
        trackEvents()
        sessionManagement()
    }
    
    private func initializeSDK() {
        do {
            // Initialize Gamepulse with fluent API
            gamepulse = try Gamepulse.init("your-api-key-here", environment: .development)
                .userConfig(
                    UserConfig.builder()
                        .setSessionId("session-123")
                        .setUserId("user-456")
                        .build()
                )
                .create()
            
            print("Gamepulse iOS SDK initialized successfully")
        } catch {
            print("Failed to initialize Gamepulse: \(error)")
        }
    }
    
    private func trackEvents() {
        guard let gamepulse = gamepulse else {
            print("Gamepulse not initialized")
            return
        }
        
        // Track system events using the new static API
        Gamepulse.getInstance().systemEvent()
            .category(Gamepulse.Gameplay.self)
            .type(Gamepulse.Gameplay.levelStart)
            .setProperties(["level": "1", "difficulty": "easy"])
            .trigger()
        
        Gamepulse.getInstance().systemEvent()
            .category(Gamepulse.IAP.self)
            .type(Gamepulse.IAP.purchase)
            .setProperties(["item": "sword", "price": "4.99"])
            .trigger()
        
        Gamepulse.getInstance().systemEvent()
            .category(Gamepulse.User.self)
            .type(Gamepulse.User.sessionStart)
            .setProperties([:])
            .trigger()
        
        // Track custom events
        Gamepulse.getInstance().customEvent()
            .category("combat")
            .type("boss_defeated")
            .setProperties(["boss": "dragon", "attempts": "3"])
            .trigger()
        
        gamepulse.event(.levelStart, category: .gameplay)
            .setProperties([
                "level": 1,
                "difficulty": "easy",
                "timestamp": Date().timeIntervalSince1970
            ])
            .track()
        
        gamepulse.event(.purchase, category: .iap)
            .setProperties([
                "item_id": "premium_upgrade",
                "price": 9.99,
                "currency": "USD"
            ])
            .track()
        
        gamepulse.customEvent("button_tap", category: "ui")
            .setProperties([
                "button_name": "start_game",
                "screen": "main_menu"
            ])
            .track()
        
        gamepulse.customEvent("achievement_earned", category: "progression")
            .setProperties([
                "achievement_id": "first_win",
                "points": 100
            ])
            .track()
    }
    
    private func sessionManagement() {
        guard let gamepulse = gamepulse else { return }
        
        // Start a new session
        gamepulse.startSession()
        
        // Simulate some gameplay time
        DispatchQueue.main.asyncAfter(deadline: .now() + 60) {
            // End the session after 1 minute
            gamepulse.endSession()
        }
    }
    
    // Example of tracking user progression
    private func trackUserProgression() {
        guard let gamepulse = gamepulse else { return }
        
        gamepulse.event(.levelUp, category: .progression)
            .setProperties([
                "new_level": 5,
                "experience_gained": 250,
                "time_played": 1800 // 30 minutes
            ])
            .track()
    }
    
    // Example of tracking monetization events
    private func trackPurchase() {
        guard let gamepulse = gamepulse else { return }
        
        gamepulse.event(.purchase, category: .iap)
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
        guard let gamepulse = gamepulse else { return }
        
        gamepulse.event(.adViewed, category: .ad)
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
    func setupGamepulse() {
        // This would typically be called in application:didFinishLaunchingWithOptions:
        do {
            let _ = try Gamepulse.init("your-production-api-key", environment: .production)
                .userConfig(
                    UserConfig.builder()
                        .setSessionId(UUID().uuidString)
                        .setAnonymous(UIDevice.current.identifierForVendor?.uuidString ?? UUID().uuidString)
                        .build()
                )
                .create()
        } catch {
            print("Failed to initialize Gamepulse in AppDelegate: \(error)")
        }
    }
}
