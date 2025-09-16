package com.gamealytics.sdk.example;

import android.app.Application;
import android.content.Context;
import android.os.Handler;
import com.gamealytics.sdk.GameAlytics;
import com.gamealytics.sdk.GameAlytics.Environment;
import com.gamealytics.sdk.GameAlytics.UserConfig;
import com.gamealytics.sdk.GameAlytics.User;
import com.gamealytics.sdk.GameAlytics.Gameplay;
import com.gamealytics.sdk.GameAlytics.IAP;
import com.gamealytics.sdk.GameAlytics.Progression;
import com.gamealytics.sdk.GameAlytics.Ad;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Example usage of the GameAlytics Android SDK with the new fluent API
 */
public class AndroidUsageExample extends Application {

    private GameAlytics gameAlytics;

    @Override
    public void onCreate() {
        super.onCreate();
        initializeSDK();
        trackEvents();
        sessionManagement();
    }

    private void initializeSDK() {
        try {
            // Initialize GameAlytics with fluent API
            gameAlytics = GameAlytics.init("your-api-key-here", Environment.DEVELOPMENT)
                    .userConfig(UserConfig.builder()
                            .setSessionId("session-123")
                            .setUserId("user-456")
                            .build())
                    .create(this);

            System.out.println("GameAlytics Android SDK initialized successfully");
        } catch (Exception error) {
            System.err.println("Failed to initialize GameAlytics: " + error.getMessage());
        }
    }

    private void trackEvents() {
        // Track system events using new static API
        Map<String, String> sessionProperties = new HashMap<>();
        sessionProperties.put("source", "android_app");
        sessionProperties.put("app_version", "1.0.0");
        
        GameAlytics.getInstance().systemEvent()
                .category(User.class).type(User.SESSION_START)
                .setProperties(sessionProperties)
                .trigger();

        // Track gameplay events
        Map<String, String> levelProperties = new HashMap<>();
        levelProperties.put("level", "1");
        levelProperties.put("difficulty", "easy");
        levelProperties.put("timestamp", String.valueOf(System.currentTimeMillis()));
        
        GameAlytics.getInstance().systemEvent()
                .category(Gameplay.class).type(Gameplay.LEVEL_START)
                .setProperties(levelProperties)
                .trigger();

        // Track IAP events
        Map<String, String> purchaseProperties = new HashMap<>();
        purchaseProperties.put("item_id", "premium_upgrade");
        purchaseProperties.put("price", "9.99");
        purchaseProperties.put("currency", "USD");
        
        GameAlytics.getInstance().systemEvent()
                .category(IAP.class).type(IAP.PURCHASE)
                .setProperties(purchaseProperties)
                .trigger();

        // Track custom events
        Map<String, String> buttonProperties = new HashMap<>();
        buttonProperties.put("button_name", "start_game");
        buttonProperties.put("screen", "main_menu");
        
        GameAlytics.getInstance().customEvent()
                .category("ui").type("button_click")
                .setProperties(buttonProperties)
                .trigger();

        Map<String, String> achievementProperties = new HashMap<>();
        achievementProperties.put("achievement_id", "first_win");
        achievementProperties.put("points", "100");
        
        GameAlytics.getInstance().systemEvent()
                .category(Progression.class).type(Progression.ACHIEVEMENT_UNLOCKED)
                .setProperties(achievementProperties)
                .trigger();
    }

    private void sessionManagement() {
        if (gameAlytics == null) return;

        // Start a new session
        gameAlytics.startSession();

        // Simulate session end after some time
        new Handler().postDelayed(() -> {
            if (gameAlytics != null) {
                gameAlytics.endSession();
            }
        }, 60000); // End session after 1 minute
    }

    // Example of tracking user progression
    public void trackUserProgression() {
        if (gameAlytics == null) return;

        Map<String, String> properties = new HashMap<>();
        properties.put("new_level", "5");
        properties.put("experience_gained", "250");
        properties.put("time_played", "1800"); // 30 minutes

        gameAlytics.gameplayEvent(GameAlytics.GameplayEvents.LEVEL_UP)
                .setProperties(properties)
                .track();
    }

    // Example of tracking monetization events
    public void trackPurchase(String productId, double price, String currency) {
        if (gameAlytics == null) return;

        Map<String, String> properties = new HashMap<>();
        properties.put("product_id", productId);
        properties.put("price", String.valueOf(price));
        properties.put("currency", currency);
        properties.put("platform", "Android");

        gameAlytics.iapEvent(GameAlytics.IAPEvents.PURCHASE)
                .setProperties(properties)
                .track();
    }

    // Example of tracking ad events
    public void trackAdViewed(String adType, String placement) {
        if (gameAlytics == null) return;

        Map<String, String> properties = new HashMap<>();
        properties.put("ad_type", adType);
        properties.put("placement", placement);
        properties.put("timestamp", String.valueOf(System.currentTimeMillis()));

        gameAlytics.adEvent(GameAlytics.AdEvents.AD_VIEWED)
                .setProperties(properties)
                .track();
    }

    // Example of tracking tutorial completion
    public void trackTutorialComplete(int stepCount, float timeSpent) {
        if (gameAlytics == null) return;

        Map<String, String> properties = new HashMap<>();
        properties.put("step_count", String.valueOf(stepCount));
        properties.put("time_spent", String.valueOf(timeSpent));
        properties.put("completion_rate", "1.0");

        gameAlytics.progressionEvent(GameAlytics.ProgressionEvents.TUTORIAL_COMPLETE)
                .setProperties(properties)
                .track();
    }

    // Example of tracking level completion
    public void trackLevelComplete(int level, float score, boolean success) {
        if (gameAlytics == null) return;

        Map<String, String> properties = new HashMap<>();
        properties.put("level", String.valueOf(level));
        properties.put("score", String.valueOf(score));
        properties.put("success", String.valueOf(success));
        properties.put("attempts", success ? "1" : "2");

        gameAlytics.gameplayEvent(GameAlytics.GameplayEvents.LEVEL_END)
                .setProperties(properties)
                .track();
    }

    // Example for production initialization (typically in Application class)
    public static void initializeForProduction(Context context) {
        try {
            GameAlytics.init("your-production-api-key", Environment.PRODUCTION)
                    .userConfig(UserConfig.builder()
                            .setSessionId(UUID.randomUUID().toString())
                            .setAnonymous("anonymous_" + UUID.randomUUID().toString())
                            .build())
                    .create(context);
        } catch (Exception error) {
            System.err.println("Failed to initialize GameAlytics for production: " + error.getMessage());
        }
    }

    // Example of user login/logout handling
    public void onUserLogin(String newUserId) {
        if (gameAlytics == null) return;

        String newSessionId = UUID.randomUUID().toString();
        UserConfig newUserConfig = UserConfig.builder()
                .setSessionId(newSessionId)
                .setUserId(newUserId)
                .build();
        
        gameAlytics.updateUserConfig(newUserConfig);
        
        // Track login event
        gameAlytics.userEvent(GameAlytics.UserEvents.USER_LOGIN)
                .setProperties(new HashMap<>())
                .track();
    }
    
    public void onUserLogout() {
        if (gameAlytics == null) return;

        // Track logout event
        gameAlytics.userEvent(GameAlytics.UserEvents.USER_LOGOUT)
                .setProperties(new HashMap<>())
                .track();
        
        // Create anonymous session
        String newSessionId = UUID.randomUUID().toString();
        String anonymousId = "anonymous_" + UUID.randomUUID().toString();
        
        UserConfig anonymousConfig = UserConfig.builder()
                .setSessionId(newSessionId)
                .setAnonymous(anonymousId)
                .build();
        
        gameAlytics.updateUserConfig(anonymousConfig);
    }

    // Example of advanced event tracking
    public void trackAdvancedEvents() {
        if (gameAlytics == null) return;

        // Track quest completion
        Map<String, String> questProperties = new HashMap<>();
        questProperties.put("quest_id", "main_quest_01");
        questProperties.put("reward_type", "experience");
        questProperties.put("reward_amount", "500");
        
        gameAlytics.progressionEvent(GameAlytics.ProgressionEvents.QUEST_COMPLETED)
                .setProperties(questProperties)
                .track();

        // Track milestone reached
        Map<String, String> milestoneProperties = new HashMap<>();
        milestoneProperties.put("milestone_type", "playtime");
        milestoneProperties.put("milestone_value", "3600"); // 1 hour
        
        gameAlytics.progressionEvent(GameAlytics.ProgressionEvents.MILESTONE_REACHED)
                .setProperties(milestoneProperties)
                .track();

        // Track subscription event
        Map<String, String> subscriptionProperties = new HashMap<>();
        subscriptionProperties.put("subscription_type", "premium");
        subscriptionProperties.put("duration", "monthly");
        subscriptionProperties.put("price", "9.99");
        
        gameAlytics.iapEvent(GameAlytics.IAPEvents.SUBSCRIPTION_STARTED)
                .setProperties(subscriptionProperties)
                .track();
    }
}
