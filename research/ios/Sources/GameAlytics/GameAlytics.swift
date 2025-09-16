import Foundation
import UIKit

public enum EventType: String {
    // System Events
    case sessionStart = "session_start"
    case sessionEnd = "session_end"
    case levelStart = "level_start"
    case levelEnd = "level_end"
    case levelUp = "level_up"
    case tutorialComplete = "tutorial_complete"
    case achievementUnlocked = "achievement_unlocked"
    case purchase = "purchase"
    case adViewed = "ad_viewed"
    case adRewarded = "ad_rewarded"
}

public enum EventCategory: String {
    case user = "user"
    case gameplay = "gameplay"
    case economy = "economy"
    case progression = "progression"
    case ad = "ad"
    case iap = "iap"
}

public enum Environment: String {
    case development = "DEVELOPMENT"
    case production = "PRODUCTION"
}

typealias EventProperties = [String: Any]

public class UserConfig {
    public let sessionId: String
    public let userId: String?
    public let anonymousId: String?
    
    public init(sessionId: String, userId: String? = nil, anonymousId: String? = nil) {
        self.sessionId = sessionId
        self.userId = userId
        self.anonymousId = anonymousId
    }
    
    public static func builder() -> UserConfigBuilder {
        return UserConfigBuilder()
    }
}

public class UserConfigBuilder {
    private var sessionId: String?
    private var userId: String?
    private var anonymousId: String?
    
    public func setSessionId(_ sessionId: String) -> UserConfigBuilder {
        self.sessionId = sessionId
        return self
    }
    
    public func setUserId(_ userId: String) -> UserConfigBuilder {
        self.userId = userId
        return self
    }
    
    public func setAnonymous(_ anonymousId: String) -> UserConfigBuilder {
        self.anonymousId = anonymousId
        return self
    }
    
    public func build() -> UserConfig {
        guard let sessionId = sessionId else {
            fatalError("SessionId is required")
        }
        guard userId != nil || anonymousId != nil else {
            fatalError("Either userId or anonymousId must be provided")
        }
        return UserConfig(sessionId: sessionId, userId: userId, anonymousId: anonymousId)
    }
}

public class EventBuilder {
    private let gameAlytics: GameAlytics
    private let eventType: String
    private let eventCategory: String
    private let isCustom: Bool
    private var properties: EventProperties = [:]
    
    init(gameAlytics: GameAlytics, eventType: String, eventCategory: String, isCustom: Bool) {
        self.gameAlytics = gameAlytics
        self.eventType = eventType
        self.eventCategory = eventCategory
        self.isCustom = isCustom
    }
    
    @discardableResult
    public func setProperties(_ properties: EventProperties) -> EventBuilder {
        self.properties = properties
        return self
    }
    
    public func track() {
        gameAlytics.trackEvent(
            type: isCustom ? "CUSTOM" : "SYSTEM",
            eventType: eventType,
            category: eventCategory,
            properties: properties
        )
    }
}

public class InitBuilder {
    private let apiKey: String
    private let environment: Environment
    private var userConfig: UserConfig?
    
    init(apiKey: String, environment: Environment) {
        self.apiKey = apiKey
        self.environment = environment
    }
    
    public func userConfig(_ userConfig: UserConfig) -> InitBuilder {
        self.userConfig = userConfig
        return self
    }
    
    public func create() -> GameAlytics {
        guard !apiKey.isEmpty else {
            fatalError("API key is required")
        }
        guard let userConfig = userConfig else {
            fatalError("UserConfig is required")
        }
        
        GameAlytics.instance = GameAlytics(apiKey: apiKey, environment: environment, userConfig: userConfig)
        return GameAlytics.instance!
    }
}

public class GameAlytics {
    // MARK: - Singleton
    static var instance: GameAlytics?
    
    // MARK: - Properties
    private let apiKey: String
    private let environment: Environment
    private let userConfig: UserConfig
    private let deviceInfo: DeviceInfo
    private let baseUrl: String
    private var isInitialized: Bool = false
    private let session = URLSession.shared
    
    // MARK: - Device Info Structure
    private struct DeviceInfo {
        let platform: String
        let osVersion: String
        let deviceModel: String
        let screenResolution: String
        let deviceManufacturer: String
        let appVersion: String
    }
    
    // MARK: - Initialization
    init(apiKey: String, environment: Environment, userConfig: UserConfig) {
        self.apiKey = apiKey
        self.environment = environment
        self.userConfig = userConfig
        self.deviceInfo = GameAlytics.autoFetchDeviceInfo()
        self.baseUrl = environment == .production 
            ? "https://client.gamealytics.click" 
            : "https://client.dev.gamealytics.click"
        self.isInitialized = true
    }
    
    // MARK: - Public Methods
    
    /// Initialize the GameAlytics SDK with fluent API
    /// - Parameters:
    ///   - apiKey: Your GameAlytics API key
    ///   - environment: The environment (development or production)
    /// - Returns: InitBuilder for chaining
    public static func init(apiKey: String, environment: Environment) -> InitBuilder {
        return InitBuilder(apiKey: apiKey, environment: environment)
    }
    
    public static func getInstance() -> GameAlytics {
        guard let instance = shared else {
            fatalError("GameAlytics must be initialized first. Call GameAlytics.init(...).create()")
        }
        return instance
    }
    
    /// Track a system event
    /// - Parameters:
    ///   - type: The type of event
    ///   - category: The category of the event
    /// - Returns: EventBuilder for chaining
    public func event(_ type: EventType, category: EventCategory) -> EventBuilder {
        ensureInitialized()
        return EventBuilder(
            gameAlytics: self,
            eventType: type.rawValue,
            eventCategory: category.rawValue,
            isCustom: false
        )
    }
    
    /// Track a custom event
    /// - Parameters:
    ///   - type: The custom event type
    ///   - category: The category of the event
    /// - Returns: EventBuilder for chaining
    public func customEvent(_ type: String, category: String) -> EventBuilder {
        ensureInitialized()
        return EventBuilder(
            gameAlytics: self,
            eventType: type,
            eventCategory: category,
            isCustom: true
        )
    }
    
    /// Start a new session
    public func startSession() {
        ensureInitialized()
        
        event(.sessionStart, category: .user)
            .setProperties([:])
            .track()
    }
    
    /// End the current session
    public func endSession() {
        ensureInitialized()
        
        event(.sessionEnd, category: .user)
            .setProperties([:])
            .track()
    }
    
    // MARK: - Device Info Auto-Fetch
    
    private static func autoFetchDeviceInfo() -> DeviceInfo {
        let device = UIDevice.current
        let screen = UIScreen.main
        let screenSize = screen.bounds.size
        
        let appVersion: String
        if let version = Bundle.main.infoDictionary?["CFBundleShortVersionString"] as? String {
            appVersion = version
        } else {
            appVersion = "1.0.0"
        }
        
        return DeviceInfo(
            platform: "iOS",
            osVersion: device.systemVersion,
            deviceModel: device.model,
            screenResolution: "\(Int(screenSize.width))x\(Int(screenSize.height))",
            deviceManufacturer: "Apple",
            appVersion: appVersion
        )
    }
    
    // MARK: - Private Methods
    
    fileprivate func trackEvent(type: String, eventType: String, category: String, properties: EventProperties) {
        let eventData: [String: Any] = [
            "type": type,
            "timezone": TimeZone.current.identifier,
            "localDateTime": ISO8601DateFormatter().string(from: Date()),
            "value": eventType,
            "category": category,
            "userId": userConfig.userId ?? "",
            "anonymousId": userConfig.anonymousId ?? "",
            "sessionId": userConfig.sessionId,
            "platform": deviceInfo.platform,
            "osVersion": deviceInfo.osVersion,
            "appVersion": deviceInfo.appVersion,
            "deviceModel": deviceInfo.deviceModel,
            "screenResolution": deviceInfo.screenResolution,
            "deviceManufacturer": deviceInfo.deviceManufacturer,
            "properties": properties
        ]
        
        sendEvent(eventData: eventData)
    }
    
    private func sendEvent(eventData: [String: Any]) {
        guard let url = URL(string: "\(baseUrl)/events/collect") else {
            return
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.addValue("application/json", forHTTPHeaderField: "Content-Type")
        request.addValue(apiKey, forHTTPHeaderField: "x-api-key")
        
        do {
            let jsonData = try JSONSerialization.data(withJSONObject: eventData, options: [])
            request.httpBody = jsonData
            
            let task = session.dataTask(with: request) { data, response, error in
                // Silent failure for performance optimization
            }
            
            task.resume()
        } catch {
            // Silent failure for performance optimization
        }
    }
    
    private func ensureInitialized() {
        guard isInitialized else {
            fatalError("GameAlytics must be initialized first. Call GameAlytics.init()")
        }
    }
}

// MARK: - Event Category Classes
extension GameAlytics {
    public struct Gameplay {
        public static let levelStart = "level_start"
        public static let levelEnd = "level_end"
        public static let levelUp = "level_up"
        public static let bossFight = "boss_fight"
        public static let checkpointReached = "checkpoint_reached"
    }
    
    public struct IAP {
        public static let purchase = "purchase"
        public static let purchaseFailed = "purchase_failed"
        public static let purchaseRestored = "purchase_restored"
        public static let subscriptionStarted = "subscription_started"
        public static let subscriptionCancelled = "subscription_cancelled"
    }
    
    public struct User {
        public static let sessionStart = "session_start"
        public static let sessionEnd = "session_end"
        public static let userLogin = "user_login"
        public static let userLogout = "user_logout"
        public static let userRegister = "user_register"
    }
    
    public struct Progression {
        public static let tutorialComplete = "tutorial_complete"
        public static let achievementUnlocked = "achievement_unlocked"
        public static let milestoneReached = "milestone_reached"
        public static let questCompleted = "quest_completed"
    }
    
    public struct Ad {
        public static let adViewed = "ad_viewed"
        public static let adClicked = "ad_clicked"
        public static let adRewarded = "ad_rewarded"
        public static let adFailed = "ad_failed"
    }
}

// MARK: - Event Builders
public class SystemEventBuilder {
    private var category: String?
    private var type: String?
    private var properties: EventProperties = [:]
    
    public func category<T>(_ categoryType: T.Type) -> SystemEventBuilder {
        self.category = String(describing: categoryType).lowercased()
        return self
    }
    
    public func type(_ type: String) -> SystemEventBuilder {
        self.type = type
        return self
    }
    
    public func setProperties(_ properties: EventProperties) -> SystemEventBuilder {
        self.properties = properties
        return self
    }
    
    public func trigger() {
        guard let instance = GameAlytics.shared else {
            fatalError("GameAlytics must be initialized first")
        }
        guard let category = category, let type = type else {
            fatalError("Category and type are required")
        }
        instance.trackEvent(type: "SYSTEM", eventType: type, category: category, properties: properties)
    }
}

public class CustomEventBuilder {
    private var category: String?
    private var type: String?
    private var properties: EventProperties = [:]
    
    public func category(_ category: String) -> CustomEventBuilder {
        self.category = category
        return self
    }
    
    public func type(_ type: String) -> CustomEventBuilder {
        self.type = type
        return self
    }
    
    public func setProperties(_ properties: EventProperties) -> CustomEventBuilder {
        self.properties = properties
        return self
    }
    
    public func trigger() {
        guard let instance = GameAlytics.shared else {
            fatalError("GameAlytics must be initialized first")
        }
        guard let category = category, let type = type else {
            fatalError("Category and type are required")
        }
        instance.trackEvent(type: "CUSTOM", eventType: type, category: category, properties: properties)
    }
}
