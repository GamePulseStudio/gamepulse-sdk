package com.gamepulse.sdk;

import android.content.Context;
import android.os.Build;
import android.provider.Settings;
import android.util.DisplayMetrics;
import android.util.Log;
import android.view.WindowManager;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

public class GamePulse {
    public enum Environment {
        DEVELOPMENT("https://client.dev.gamepulse.click/events/collect"),
        PRODUCTION("https://client.gamepulse.click/events/collect");
        
        private final String baseUrl;
        
        Environment(String baseUrl) {
            this.baseUrl = baseUrl;
        }
        
        public String getBaseUrl() {
            return baseUrl;
        }
    }
    
    // Platform is automatically detected as ANDROID for this SDK
    
    public static class UserConfig {
        private final String sessionId;
        private final String userId;
        private final String anonymousId;
        
        private UserConfig(String sessionId, String userId, String anonymousId) {
            if (sessionId == null || sessionId.isEmpty()) {
                throw new IllegalArgumentException("sessionId is mandatory");
            }
            if ((userId == null || userId.isEmpty()) && (anonymousId == null || anonymousId.isEmpty())) {
                throw new IllegalArgumentException("Either userId or anonymousId must be provided");
            }
            
            this.sessionId = sessionId;
            this.userId = userId;
            this.anonymousId = anonymousId;
        }
        
        public String getSessionId() { return sessionId; }
        public String getUserId() { return userId; }
        public String getAnonymousId() { return anonymousId; }
        
        public static Builder builder() {
            return new Builder();
        }
        
        public static class Builder {
            private String sessionId;
            private String userId;
            private String anonymousId;
            
            public Builder setSessionId(String sessionId) {
                this.sessionId = sessionId;
                return this;
            }
            
            public Builder setUserId(String userId) {
                this.userId = userId;
                return this;
            }
            
            public Builder setAnonymous(String anonymousId) {
                this.anonymousId = anonymousId;
                return this;
            }
            
            public UserConfig build() {
                return new UserConfig(sessionId, userId, anonymousId);
            }
        }
    }
    
    public static class DeviceInfo {
        private final String platform;
        private final String osVersion;
        private final String appVersion;
        private final String deviceModel;
        private final String screenResolution;
        private final String deviceManufacturer;
        
        public DeviceInfo(String platform, String osVersion, String appVersion, 
                         String deviceModel, String screenResolution, String deviceManufacturer) {
            this.platform = platform;
            this.osVersion = osVersion;
            this.appVersion = appVersion;
            this.deviceModel = deviceModel;
            this.screenResolution = screenResolution;
            this.deviceManufacturer = deviceManufacturer;
        }
        
        public String getPlatform() { return platform; }
        public String getOsVersion() { return osVersion; }
        public String getAppVersion() { return appVersion; }
        public String getDeviceModel() { return deviceModel; }
        public String getScreenResolution() { return screenResolution; }
        public String getDeviceManufacturer() { return deviceManufacturer; }
    }
    
    private static final MediaType JSON = MediaType.get("application/json; charset=utf-8");

    private static GameAlytics instance;
    private final Context context;
    private final String apiKey;
    private final Environment environment;
    private final boolean debug;
    private final OkHttpClient httpClient;
    
    private UserConfig userConfig;
    private DeviceInfo deviceInfo;
    private boolean isInitialized = false;

    // User Events
    public static class UserEvents {
        public static final String CATEGORY = "user";
        public static final String SESSION_START = "session_start";
        public static final String SESSION_END = "session_end";
        public static final String USER_LOGIN = "user_login";
        public static final String USER_LOGOUT = "user_logout";
        public static final String USER_REGISTER = "user_register";
        
        private static final String[] VALID_EVENTS = {
            SESSION_START, SESSION_END, USER_LOGIN, USER_LOGOUT, USER_REGISTER
        };
        
        public static boolean isValidEvent(String eventType) {
            for (String event : VALID_EVENTS) {
                if (event.equals(eventType)) return true;
            }
            return false;
        }
    }
    
    // Gameplay Events
    public static class GameplayEvents {
        public static final String CATEGORY = "gameplay";
        public static final String LEVEL_START = "level_start";
        public static final String LEVEL_END = "level_end";
        public static final String LEVEL_UP = "level_up";
        public static final String GAME_START = "game_start";
        public static final String GAME_END = "game_end";
        public static final String BOSS_FIGHT = "boss_fight";
        
        private static final String[] VALID_EVENTS = {
            LEVEL_START, LEVEL_END, LEVEL_UP, GAME_START, GAME_END, BOSS_FIGHT
        };
        
        public static boolean isValidEvent(String eventType) {
            for (String event : VALID_EVENTS) {
                if (event.equals(eventType)) return true;
            }
            return false;
        }
    }
    
    // Economy Events
    public static class EconomyEvents {
        public static final String CATEGORY = "economy";
        public static final String CURRENCY_EARNED = "currency_earned";
        public static final String CURRENCY_SPENT = "currency_spent";
        public static final String ITEM_PURCHASED = "item_purchased";
        public static final String ITEM_SOLD = "item_sold";
        public static final String SHOP_VIEWED = "shop_viewed";
        
        private static final String[] VALID_EVENTS = {
            CURRENCY_EARNED, CURRENCY_SPENT, ITEM_PURCHASED, ITEM_SOLD, SHOP_VIEWED
        };
        
        public static boolean isValidEvent(String eventType) {
            for (String event : VALID_EVENTS) {
                if (event.equals(eventType)) return true;
            }
            return false;
        }
    }
    
    // Progression Events
    public static class ProgressionEvents {
        public static final String CATEGORY = "progression";
        public static final String TUTORIAL_COMPLETE = "tutorial_complete";
        public static final String ACHIEVEMENT_UNLOCKED = "achievement_unlocked";
        public static final String MILESTONE_REACHED = "milestone_reached";
        public static final String QUEST_COMPLETED = "quest_completed";
        
        private static final String[] VALID_EVENTS = {
            TUTORIAL_COMPLETE, ACHIEVEMENT_UNLOCKED, MILESTONE_REACHED, QUEST_COMPLETED
        };
        
        public static boolean isValidEvent(String eventType) {
            for (String event : VALID_EVENTS) {
                if (event.equals(eventType)) return true;
            }
            return false;
        }
    }
    
    // Ad Events
    public static class AdEvents {
        public static final String CATEGORY = "ad";
        public static final String AD_VIEWED = "ad_viewed";
        public static final String AD_CLICKED = "ad_clicked";
        public static final String AD_REWARDED = "ad_rewarded";
        public static final String AD_FAILED = "ad_failed";
        
        private static final String[] VALID_EVENTS = {
            AD_VIEWED, AD_CLICKED, AD_REWARDED, AD_FAILED
        };
        
        public static boolean isValidEvent(String eventType) {
            for (String event : VALID_EVENTS) {
                if (event.equals(eventType)) return true;
            }
            return false;
        }
    }
    
    // IAP Events
    public static class IAPEvents {
        public static final String CATEGORY = "iap";
        public static final String PURCHASE = "purchase";
        public static final String PURCHASE_FAILED = "purchase_failed";
        public static final String PURCHASE_RESTORED = "purchase_restored";
        public static final String SUBSCRIPTION_STARTED = "subscription_started";
        public static final String SUBSCRIPTION_CANCELLED = "subscription_cancelled";
        
        private static final String[] VALID_EVENTS = {
            PURCHASE, PURCHASE_FAILED, PURCHASE_RESTORED, SUBSCRIPTION_STARTED, SUBSCRIPTION_CANCELLED
        };
        
        public static boolean isValidEvent(String eventType) {
            for (String event : VALID_EVENTS) {
                if (event.equals(eventType)) return true;
            }
            return false;
        }
    }

    private GamePulse(Context context, String apiKey, Environment environment) {
        this.context = context.getApplicationContext();
        this.apiKey = apiKey;
        this.environment = environment;
        this.debug = false;
        
        this.httpClient = new OkHttpClient.Builder()
                .connectTimeout(10, TimeUnit.SECONDS)
                .writeTimeout(10, TimeUnit.SECONDS)
                .readTimeout(30, TimeUnit.SECONDS)
                .build();
    }

    public static InitBuilder init(String apiKey, Environment environment) {
        return new InitBuilder(apiKey, environment);
    }

    public static GamePulse getInstance(Context context) {
        if (instance == null) {
            throw new IllegalStateException("GamePulse must be initialized first. Call GamePulse.init(...).create(context)");
        }
        return instance;
    }

    public static GamePulse getInstance() {
        if (instance == null) {
            throw new IllegalStateException("GamePulse must be initialized first. Call GamePulse.init(...).create(context)");
        }
        return instance;
    }

    public SystemEventBuilder systemEvent() {
        return new SystemEventBuilder();
    }

    public CustomEventBuilder customEvent() {
        return new CustomEventBuilder();
    }

    public static class InitBuilder {
        private final String apiKey;
        private final Environment environment;
        private UserConfig userConfig;
        
        private InitBuilder(String apiKey, Environment environment) {
            this.apiKey = apiKey;
            this.environment = environment;
        }
        
        public InitBuilder userConfig(UserConfig userConfig) {
            this.userConfig = userConfig;
            return this;
        }
        
        public GamePulse create(Context context) {
            if (apiKey == null || apiKey.isEmpty()) {
                throw new IllegalArgumentException("API key is required");
            }
            if (userConfig == null) {
                throw new IllegalArgumentException("UserConfig is required");
            }
            
            synchronized (GamePulse.class) {
                if (instance == null) {
                    instance = new GamePulse(context, apiKey, environment);
                    instance.userConfig = userConfig;
                    instance.deviceInfo = instance.autoFetchDeviceInfo();
                    instance.isInitialized = true;
                }
            }
            
            return instance;
        }
    }

    // Event Category Classes
    public static class Gameplay {
        public static final String LEVEL_START = "level_start";
        public static final String LEVEL_END = "level_end";
        public static final String LEVEL_UP = "level_up";
        public static final String BOSS_FIGHT = "boss_fight";
        public static final String CHECKPOINT_REACHED = "checkpoint_reached";
    }

    public static class IAP {
        public static final String PURCHASE = "purchase";
        public static final String PURCHASE_FAILED = "purchase_failed";
        public static final String PURCHASE_RESTORED = "purchase_restored";
        public static final String SUBSCRIPTION_STARTED = "subscription_started";
        public static final String SUBSCRIPTION_CANCELLED = "subscription_cancelled";
    }

    public static class User {
        public static final String SESSION_START = "session_start";
        public static final String SESSION_END = "session_end";
        public static final String USER_LOGIN = "user_login";
        public static final String USER_LOGOUT = "user_logout";
        public static final String USER_REGISTER = "user_register";
    }

    public static class Progression {
        public static final String TUTORIAL_COMPLETE = "tutorial_complete";
        public static final String ACHIEVEMENT_UNLOCKED = "achievement_unlocked";
        public static final String MILESTONE_REACHED = "milestone_reached";
        public static final String QUEST_COMPLETED = "quest_completed";
    }

    public static class Ad {
        public static final String AD_VIEWED = "ad_viewed";
        public static final String AD_CLICKED = "ad_clicked";
        public static final String AD_REWARDED = "ad_rewarded";
        public static final String AD_FAILED = "ad_failed";
    }

    // Event Builders
    public static class SystemEventBuilder {
        private String category;
        private String type;
        private Map<String, String> properties = new HashMap<>();

        public SystemEventBuilder category(Class<?> categoryClass) {
            this.category = categoryClass.getSimpleName().toLowerCase();
            return this;
        }

        public SystemEventBuilder type(String type) {
            this.type = type;
            return this;
        }

        public SystemEventBuilder setProperties(Map<String, String> properties) {
            this.properties = properties != null ? properties : new HashMap<>();
            return this;
        }

        public void trigger() {
            if (instance == null) {
                throw new IllegalStateException("GameAlytics must be initialized first");
            }
            if (category == null || type == null) {
                throw new IllegalArgumentException("Category and type are required");
            }
            instance.trackEventInternal("SYSTEM", type, category, properties);
        }
    }

    public static class CustomEventBuilder {
        private String category;
        private String type;
        private Map<String, String> properties = new HashMap<>();

        public CustomEventBuilder category(String category) {
            this.category = category;
            return this;
        }

        public CustomEventBuilder type(String type) {
            this.type = type;
            return this;
        }

        public CustomEventBuilder setProperties(Map<String, String> properties) {
            this.properties = properties != null ? properties : new HashMap<>();
            return this;
        }

        public void trigger() {
            if (instance == null) {
                throw new IllegalStateException("GameAlytics must be initialized first");
            }
            if (category == null || type == null) {
                throw new IllegalArgumentException("Category and type are required");
            }
            instance.trackEventInternal("CUSTOM", type, category, properties);
        }
    }

    private void trackEventInternal(String eventClass, String eventType, String category, Map<String, String> properties) {
        try {
            JSONObject json = new JSONObject();
            json.put("type", eventClass);
            json.put("value", eventType);
            json.put("category", category);
            
            // Add device info
            json.put("platform", deviceInfo.getPlatform());
            json.put("osVersion", deviceInfo.getOsVersion());
            json.put("deviceModel", deviceInfo.getDeviceModel());
            json.put("deviceManufacturer", deviceInfo.getDeviceManufacturer());
            json.put("appVersion", deviceInfo.getAppVersion());
            json.put("screenResolution", deviceInfo.getScreenResolution());
            
            // Add user/session info
            json.put("userId", userConfig.getUserId() != null ? userConfig.getUserId() : "");
            json.put("anonymousId", userConfig.getAnonymousId() != null ? userConfig.getAnonymousId() : "");
            json.put("sessionId", userConfig.getSessionId());
            
            // Add timestamp
            json.put("timezone", java.util.TimeZone.getDefault().getID());
            json.put("localDateTime", java.time.Instant.now().toString());
            
            // Add properties
            JSONObject propsJson = new JSONObject();
            for (Map.Entry<String, String> entry : properties.entrySet()) {
                propsJson.put(entry.getKey(), entry.getValue());
            }
            json.put("properties", propsJson);
            
            // Send the event
            sendEventInternal(json);
            
        } catch (JSONException e) {
            // Silent fail for performance
        }
    }
    
    public EventBuilder iapEvent(String eventType) {
        checkInitialized();
        if (!IAPEvents.isValidEvent(eventType)) {
            throw new IllegalArgumentException("Invalid IAP event type: " + eventType);
        }
        return new EventBuilder(eventType, IAPEvents.CATEGORY, false);
    }

    public EventBuilder customEvent(String type, String category) {
        checkInitialized();
        return new EventBuilder(type, category, true);
    }

    public void startSession() {
        checkInitialized();
        // Create new session in userConfig
        String newSessionId = UUID.randomUUID().toString();
        this.userConfig = new UserConfig(newSessionId, userConfig.getUserId(), userConfig.getAnonymousId());
        
        userEvent(UserEvents.SESSION_START)
            .setProperties(new HashMap<>())
            .track();
    }

    public void endSession() {
        checkInitialized();
        
        if (this.userConfig.getSessionId() == null) {
            return;
        }
        
        userEvent(UserEvents.SESSION_END)
            .setProperties(new HashMap<>())
            .track();
    }

    public void updateUserConfig(UserConfig newUserConfig) {
        checkInitialized();
        this.userConfig = newUserConfig;
    }
    
    public UserConfig getUserConfig() {
        return userConfig;
    }
    
    public DeviceInfo getDeviceInfo() {
        return deviceInfo;
    }
    
    // Missing event methods
    public EventBuilder userEvent(String eventType) {
        checkInitialized();
        if (!UserEvents.isValidEvent(eventType)) {
            throw new IllegalArgumentException("Invalid user event type: " + eventType);
        }
        return new EventBuilder(eventType, UserEvents.CATEGORY, false);
    }
    
    public EventBuilder gameplayEvent(String eventType) {
        checkInitialized();
        if (!GameplayEvents.isValidEvent(eventType)) {
            throw new IllegalArgumentException("Invalid gameplay event type: " + eventType);
        }
        return new EventBuilder(eventType, GameplayEvents.CATEGORY, false);
    }
    
    public EventBuilder adEvent(String eventType) {
        checkInitialized();
        if (!AdEvents.isValidEvent(eventType)) {
            throw new IllegalArgumentException("Invalid ad event type: " + eventType);
        }
        return new EventBuilder(eventType, AdEvents.CATEGORY, false);
    }
    
    public EventBuilder progressionEvent(String eventType) {
        checkInitialized();
        if (!ProgressionEvents.isValidEvent(eventType)) {
            throw new IllegalArgumentException("Invalid progression event type: " + eventType);
        }
        return new EventBuilder(eventType, ProgressionEvents.CATEGORY, false);
    }
    
    public EventBuilder economyEvent(String eventType) {
        checkInitialized();
        if (!EconomyEvents.isValidEvent(eventType)) {
            throw new IllegalArgumentException("Invalid economy event type: " + eventType);
        }
        return new EventBuilder(eventType, EconomyEvents.CATEGORY, false);
    }
    
    // Send event internally
    private void sendEventInternal(JSONObject eventData) {
        RequestBody body = RequestBody.create(eventData.toString(), JSON);
        Request request = new Request.Builder()
                .url(environment.getBaseUrl())
                .addHeader("Content-Type", "application/json")
                .addHeader("x-api-key", apiKey)
                .post(body)
                .build();

        httpClient.newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                if (debug) {
                    System.out.println("GameAlytics: Failed to send event: " + e.getMessage());
                }
            }

            @Override
            public void onResponse(Call call, Response response) throws IOException {
                if (debug) {
                    System.out.println("GameAlytics: Event sent successfully: " + response.code());
                }
                response.close();
            }
        });
    }
    
    // Public sendEvent method (for backwards compatibility)
    private void sendEvent(JSONObject eventData) {
        sendEventInternal(eventData);
    }
    

    public class EventBuilder {
        private final String eventType;
        private final String eventCategory;
        private final boolean isCustom;
        private Map<String, String> properties = new HashMap<>();


        EventBuilder(String type, String category, boolean isCustom) {
            this.eventType = type;
            this.eventCategory = category;
            this.isCustom = isCustom;
        }

        public EventBuilder setProperties(Map<String, String> properties) {
            if (properties != null) {
                this.properties = properties;
            }
            return this;
        }

        public void track() {
            checkInitialized();
            
            JSONObject json = new JSONObject();
            try {
                // Add common fields
                json.put("type", isCustom ? "CUSTOM" : "SYSTEM");
                json.put("value", eventType);
                json.put("category", eventCategory);
                
                // Add device info
                json.put("platform", deviceInfo.getPlatform());
                json.put("osVersion", deviceInfo.getOsVersion());
                json.put("deviceModel", deviceInfo.getDeviceModel());
                json.put("deviceManufacturer", deviceInfo.getDeviceManufacturer());
                json.put("appVersion", deviceInfo.getAppVersion());
                json.put("screenResolution", deviceInfo.getScreenResolution());
                
                // Add user/session info
                json.put("userId", userConfig.getUserId() != null ? userConfig.getUserId() : "");
                json.put("anonymousId", userConfig.getAnonymousId() != null ? userConfig.getAnonymousId() : "");
                json.put("sessionId", userConfig.getSessionId());
                
                // Add timestamp
                json.put("timezone", java.util.TimeZone.getDefault().getID());
                json.put("localDateTime", java.time.Instant.now().toString());
                
                // Add properties
                JSONObject propsJson = new JSONObject();
                for (Map.Entry<String, String> entry : properties.entrySet()) {
                    propsJson.put(entry.getKey(), entry.getValue());
                }
                json.put("properties", propsJson);
                
                // Send the event
                GamePulse.this.sendEventInternal(json);
                
            } catch (JSONException e) {
                // Silent fail for performance
            }
        }
    }

    private DeviceInfo autoFetchDeviceInfo() {
        try {
            String appVersion = getAppVersion();
            String osVersion = Build.VERSION.RELEASE;
            String deviceModel = Build.MODEL;
            String deviceManufacturer = Build.MANUFACTURER;
            String screenResolution = getScreenResolution();
            
            return new DeviceInfo(
                "ANDROID", // Platform is hardcoded for Android SDK
                osVersion,
                appVersion,
                deviceModel,
                screenResolution,
                deviceManufacturer
            );
        } catch (Exception e) {
            // Silent fail for performance
            // Return default values if auto-fetch fails
            return new DeviceInfo(
                "ANDROID", // Platform is hardcoded for Android SDK
                "unknown",
                "1.0.0",
                "unknown",
                "unknown",
                "unknown"
            );
        }
    }
    
    private String getAppVersion() {
        try {
            return context.getPackageManager()
                    .getPackageInfo(context.getPackageName(), 0)
                    .versionName;
        } catch (Exception e) {
            return "1.0.0";
        }
    }

    private String getScreenResolution() {
        try {
            WindowManager windowManager = (WindowManager) context.getSystemService(Context.WINDOW_SERVICE);
            if (windowManager != null) {
                DisplayMetrics displayMetrics = new DisplayMetrics();
                windowManager.getDefaultDisplay().getMetrics(displayMetrics);
                return displayMetrics.widthPixels + "x" + displayMetrics.heightPixels;
            }
        } catch (Exception e) {
            // Silent fail for performance
        }
        return "unknown";
    }

    private void checkInitialized() {
        if (!isInitialized) {
            throw new IllegalStateException("GameAlytics must be initialized first. Call GameAlytics.init()");
        }
    }
}
