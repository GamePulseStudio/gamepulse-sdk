package com.gamepulse.sdk.example;

import android.app.Application;
import android.content.Context;
import android.os.Handler;
import com.gamepulse.sdk.GamePulse;
import com.gamepulse.sdk.GamePulse.Environment;
import com.gamepulse.sdk.GamePulse.UserConfig;
import com.gamepulse.sdk.GamePulse.User;
import com.gamepulse.sdk.GamePulse.Gameplay;
import com.gamepulse.sdk.GamePulse.IAP;
import com.gamepulse.sdk.GamePulse.Progression;
import com.gamepulse.sdk.GamePulse.Ad;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Example usage of the GameAlytics Android SDK with the new fluent API
 */
public class AndroidUsageExample extends Application {

    private GamePulse gamePulse;

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
            gamePulse = GamePulse.init("your-api-key-here", Environment.DEVELOPMENT)
                    .userConfig(GamePulse.UserConfig.builder()
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
        
        gamePulse.systemEvent()
                .category(User.class).type(User.SESSION_START)
                .setProperties(sessionProperties)
                .trigger();

        // Track gameplay events
        Map<String, String> levelProperties = new HashMap<>();
        levelProperties.put("level", "1");
        levelProperties.put("difficulty", "easy");
        levelProperties.put("timestamp", String.valueOf(System.currentTimeMillis()));
        
        gamePulse.systemEvent()
                .category(Gameplay.class).type(Gameplay.LEVEL_START)
                .setProperties(levelProperties)
                .trigger();

        // Track IAP events
        Map<String, String> purchaseProperties = new HashMap<>();
        purchaseProperties.put("item_id", "premium_upgrade");
        purchaseProperties.put("price", "9.99");
        purchaseProperties.put("currency", "USD");
        
        gamePulse.systemEvent()
                .category(IAP.class).type(IAP.PURCHASE)
                .setProperties(purchaseProperties)
                .trigger();

        // Track custom events
        Map<String, String> buttonProperties = new HashMap<>();
        buttonProperties.put("button_name", "start_game");
        buttonProperties.put("screen", "main_menu");
        
        gamePulse.customEvent()
                .category("ui").type("button_click")
                .setProperties(buttonProperties)
                .trigger();

        Map<String, String> achievementProperties = new HashMap<>();
        achievementProperties.put("achievement_id", "first_win");
        achievementProperties.put("points", "100");
        
        gamePulse.systemEvent()
                .category(Progression.class).type(Progression.ACHIEVEMENT_UNLOCKED)
                .setProperties(achievementProperties)
                .trigger();
    }

    private void sessionManagement() {
        if (gamePulse == null) return;

        // Start a new session
        gamePulse.startSession();

        // Simulate session end after some time
        new Handler().postDelayed(() -> {
            if (gamePulse != null) {
                gamePulse.endSession();
            }
        }, 60000); // End session after 1 minute
    }

    // Example of tracking user progression
    public void trackUserProgression() {
        if (gamePulse == null) return;

        Map<String, String> properties = new HashMap<>();
        properties.put("new_level", "5");
        properties.put("experience_gained", "250");
        properties.put("time_played", "1800"); // 30 minutes

        gamePulse.customEvent("progression", "level_up")
                .setProperties(properties)
                .track();
    }

    // Example of tracking monetization events
    public void trackPurchase(String productId, double price, String currency) {
        if (gamePulse == null) return;

        Map<String, String> properties = new HashMap<>();
        properties.put("product_id", productId);
        properties.put("price", String.valueOf(price));
        properties.put("currency", currency);
        properties.put("platform", "Android");

        gamePulse.iapEvent(GamePulse.IAPEvents.PURCHASE)
                .setProperties(properties)
                .track();
    }

    // Example of tracking ad events
    public void trackAdViewed(String adType, String placement) {
        if (gamePulse == null) return;

        Map<String, String> properties = new HashMap<>();
        properties.put("ad_type", adType);
        properties.put("placement", placement);
        properties.put("timestamp", String.valueOf(System.currentTimeMillis()));

        gamePulse.customEvent("ad", "ad_viewed")
                .setProperties(properties)
                .track();
    }

    // Example of tracking tutorial completion
    public void trackTutorialComplete(int stepCount, float timeSpent) {
        if (gamePulse == null) return;

        Map<String, String> properties = new HashMap<>();
        properties.put("step_count", String.valueOf(stepCount));
        properties.put("time_spent", String.valueOf(timeSpent));
        properties.put("completion_rate", "1.0");

        gamePulse.progressionEvent(GamePulse.ProgressionEvents.TUTORIAL_COMPLETE)
                .setProperties(properties)
                .track();
    }

    // Example of tracking level completion
    public void trackLevelComplete(int level, float score, boolean success) {
        if (gamePulse == null) return;

        Map<String, String> properties = new HashMap<>();
        properties.put("level", String.valueOf(level));
        properties.put("score", String.valueOf(score));
        properties.put("success", String.valueOf(success));
        properties.put("attempts", success ? "1" : "2");

        gamePulse.customEvent("gameplay", "level_end")
                .setProperties(properties)
                .track();
    }

    // Example for production initialization (typically in Application class)
    public static void initializeForProduction(Context context) {
        try {
            GamePulse.init("your-production-api-key", GamePulse.Environment.PRODUCTION)
                    .userConfig(GamePulse.UserConfig.builder()
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
        if (gamePulse == null) return;

        String newSessionId = UUID.randomUUID().toString();
        GamePulse.UserConfig newUserConfig = GamePulse.UserConfig.builder()
                .setSessionId(newSessionId)
                .setUserId(newUserId)
                .build();
        
        gamePulse.updateUserConfig(newUserConfig);
        
        // Track login event
        gamePulse.userEvent(GamePulse.UserEvents.USER_LOGIN)
                .setProperties(new HashMap<>())
                .track();
    }
    
    public void onUserLogout() {
        if (gamePulse == null) return;

        // Track logout event
        gamePulse.userEvent(GamePulse.UserEvents.USER_LOGOUT)
                .setProperties(new HashMap<>())
                .track();
        
        // Create anonymous session
        String newSessionId = UUID.randomUUID().toString();
        String anonymousId = "anonymous_" + UUID.randomUUID().toString();
        
        GamePulse.UserConfig anonymousConfig = GamePulse.UserConfig.builder()
                .setSessionId(newSessionId)
                .setAnonymous(anonymousId)
                .build();
        
        gamePulse.updateUserConfig(anonymousConfig);
    }

    // Example of advanced event tracking
    public void trackAdvancedEvents() {
        if (gamePulse == null) return;

        // Track quest completion
        Map<String, String> questProperties = new HashMap<>();
        questProperties.put("quest_id", "main_quest_01");
        questProperties.put("reward_type", "experience");
        questProperties.put("reward_amount", "500");
        
        gamePulse.progressionEvent(GamePulse.ProgressionEvents.QUEST_COMPLETED)
                .setProperties(questProperties)
                .track();

        // Track milestone reached
        Map<String, String> milestoneProperties = new HashMap<>();
        milestoneProperties.put("milestone_type", "playtime");
        milestoneProperties.put("milestone_value", "3600"); // 1 hour
        
        gamePulse.progressionEvent(GamePulse.ProgressionEvents.MILESTONE_REACHED)
                .setProperties(milestoneProperties)
                .track();

        // Track subscription event
        Map<String, String> subscriptionProperties = new HashMap<>();
        subscriptionProperties.put("subscription_type", "premium");
        subscriptionProperties.put("duration", "monthly");
        subscriptionProperties.put("price", "9.99");
        
        gamePulse.iapEvent(GamePulse.IAPEvents.SUBSCRIPTION_STARTED)
                .setProperties(subscriptionProperties)
                .track();
    }
}
