"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Environment = exports.UserConfig = exports.GameAlytics = exports.CustomEventBuilder = exports.SystemEventBuilder = exports.Ad = exports.Progression = exports.User = exports.IAP = exports.Gameplay = void 0;
// Core types
var DataValidator_1 = require("./validation/DataValidator");
var EventQueue_1 = require("./queue/EventQueue");
var Environment;
(function (Environment) {
    Environment["DEVELOPMENT"] = "DEVELOPMENT";
    Environment["PRODUCTION"] = "PRODUCTION";
})(Environment || (exports.Environment = Environment = {}));
var UserConfigBuilder = /** @class */ (function () {
    function UserConfigBuilder() {
    }
    UserConfigBuilder.prototype.setSessionId = function (sessionId) {
        this.sessionId = sessionId;
        return this;
    };
    UserConfigBuilder.prototype.setUserId = function (userId) {
        this.userId = userId;
        return this;
    };
    UserConfigBuilder.prototype.setAnonymous = function (anonymousId) {
        this.anonymousId = anonymousId;
        return this;
    };
    UserConfigBuilder.prototype.build = function () {
        if (!this.sessionId) {
            throw new Error('SessionId is required');
        }
        if (!this.userId && !this.anonymousId) {
            throw new Error('Either userId or anonymousId must be provided');
        }
        return new UserConfig(this.sessionId, this.userId, this.anonymousId);
    };
    return UserConfigBuilder;
}());
var UserConfig = /** @class */ (function () {
    function UserConfig(sessionId, userId, anonymousId) {
        this.sessionId = sessionId;
        if (userId !== undefined) {
            this.userId = userId;
        }
        if (anonymousId !== undefined) {
            this.anonymousId = anonymousId;
        }
    }
    UserConfig.builder = function () {
        return new UserConfigBuilder();
    };
    return UserConfig;
}());
exports.UserConfig = UserConfig;
var EventBuilderImpl = /** @class */ (function () {
    function EventBuilderImpl(eventType, eventCategory, isCustom) {
        this.properties = {};
        this.eventType = eventType;
        this.eventCategory = eventCategory;
        this.isCustom = isCustom;
    }
    EventBuilderImpl.prototype.setProperties = function (properties) {
        this.properties = __assign(__assign({}, this.properties), properties);
        return this;
    };
    EventBuilderImpl.prototype.track = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                GameAlytics.getInstance().trackEvent(this.isCustom ? 'CUSTOM' : 'SYSTEM', this.eventType, this.eventCategory, this.properties);
                return [2 /*return*/];
            });
        });
    };
    return EventBuilderImpl;
}());
var InitBuilder = /** @class */ (function () {
    function InitBuilder(apiKey, environment) {
        this.apiKey = apiKey;
        this.environment = environment;
    }
    InitBuilder.prototype.userConfig = function (userConfig) {
        this.userConfigValue = userConfig;
        return this;
    };
    InitBuilder.prototype.create = function () {
        if (!this.apiKey) {
            throw new Error('API key is required');
        }
        if (!this.userConfigValue) {
            throw new Error('UserConfig is required');
        }
        GamePulse.instance = new GamePulse(this.apiKey, this.environment, this.userConfigValue);
        return GamePulse.instance;
    };
    return InitBuilder;
}());
var GamePulse = /** @class */ (function () {
    function GamePulse(apiKey, environment, userConfig) {
        this.isInitialized = false;
        this.apiKey = apiKey;
        this.environment = environment;
        this.userConfig = userConfig;
        this.deviceInfo = this.autoFetchDeviceInfo();
        this.baseUrl = environment === 'production' ? 'https://client.gamepulse.click' : 'https://client.dev.gamepulse.click';
        // Initialize event queue with base URL and API key injection
        this.eventQueue = new EventQueue_1.EventQueue();
        window.__GA_BASE_URL__ = this.baseUrl;
        window.__GA_API_KEY__ = this.apiKey;
        this.isInitialized = true;
    }
    GamePulse.init = function (apiKey, environment) {
        return new InitBuilder(apiKey, environment);
    };
    GamePulse.getInstance = function () {
        if (!GamePulse.instance) {
            throw new Error('GamePulse must be initialized first. Call GamePulse.init(...).create()');
        }
        return GamePulse.instance;
    };
    GamePulse.prototype.systemEvent = function () {
        return new SystemEventBuilder();
    };
    GamePulse.prototype.customEvent = function () {
        return new CustomEventBuilder();
    };
    GamePulse.prototype.autoFetchDeviceInfo = function () {
        try {
            var isBrowser = typeof window !== 'undefined';
            return {
                platform: isBrowser ? 'Web' : 'Node.js',
                osVersion: this.getOSVersion(),
                deviceModel: isBrowser ? window.navigator.platform : 'Node.js',
                screenResolution: this.getScreenResolution(),
                deviceManufacturer: isBrowser ? window.navigator.vendor || 'Unknown' : 'Node.js',
                appVersion: '1.0.0'
            };
        }
        catch (error) {
            // Silent failure for performance
            return {
                platform: 'Unknown',
                osVersion: 'Unknown',
                deviceModel: 'Unknown',
                screenResolution: 'Unknown',
                deviceManufacturer: 'Unknown',
                appVersion: '1.0.0'
            };
        }
    };
    GameAlytics.prototype.trackEvent = function (type, eventType, category, properties) {
        // Validate and sanitize properties
        var validationResult = DataValidator_1.DataValidator.validateProperties(properties, {
            maxLength: 100,
            allowHtml: false,
            allowedTypes: ['string', 'number', 'boolean']
        });
        // Log validation errors in development
        if (validationResult.errors.length > 0 && this.environment === Environment.DEVELOPMENT) {
            console.warn('GameAlytics validation warnings:', validationResult.errors);
        }
        var eventPayload = __assign(__assign({ type: type, value: eventType, category: category, properties: validationResult.sanitized }, this.deviceInfo), { timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, localDateTime: new Date().toISOString(), userId: this.userConfig.userId || '', anonymousId: this.userConfig.anonymousId || '', sessionId: this.userConfig.sessionId });
        // Use event queue for reliable delivery
        this.eventQueue.enqueue(eventPayload);
    };
    GamePulse.prototype.getOSVersion = function () {
        if (typeof window === 'undefined')
            return 'Node.js';
        var userAgent = window.navigator.userAgent;
        var platform = window.navigator.platform;
        var macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'];
        var windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'];
        var iosPlatforms = ['iPhone', 'iPad', 'iPod'];
        if (macosPlatforms.indexOf(platform) !== -1)
            return 'Mac OS';
        if (iosPlatforms.indexOf(platform) !== -1)
            return 'iOS';
        if (windowsPlatforms.indexOf(platform) !== -1)
            return 'Windows';
        if (/Android/.test(userAgent))
            return 'Android';
        if (/Linux/.test(platform))
            return 'Linux';
        return 'Unknown';
    };
    GamePulse.prototype.getScreenResolution = function () {
        if (typeof window !== 'undefined' && window.screen) {
            return "".concat(window.screen.width, "x").concat(window.screen.height);
        }
        return 'unknown';
    };
    GamePulse.prototype.ensureInitialized = function () {
        if (!this.isInitialized) {
            throw new Error('GamePulse must be initialized first. Call GamePulse.init()');
        }
    };
    GamePulse.instance = null;
    return GamePulse;
}());
exports.GamePulse = GamePulse;
// Event Category Classes
var Gameplay = /** @class */ (function () {
    function Gameplay() {
    }
    Gameplay.LEVEL_START = 'level_start';
    Gameplay.LEVEL_END = 'level_end';
    Gameplay.LEVEL_UP = 'level_up';
    Gameplay.BOSS_FIGHT = 'boss_fight';
    Gameplay.CHECKPOINT_REACHED = 'checkpoint_reached';
    return Gameplay;
}());
exports.Gameplay = Gameplay;
var IAP = /** @class */ (function () {
    function IAP() {
    }
    IAP.PURCHASE = 'purchase';
    IAP.PURCHASE_FAILED = 'purchase_failed';
    IAP.PURCHASE_RESTORED = 'purchase_restored';
    IAP.SUBSCRIPTION_STARTED = 'subscription_started';
    IAP.SUBSCRIPTION_CANCELLED = 'subscription_cancelled';
    return IAP;
}());
exports.IAP = IAP;
var User = /** @class */ (function () {
    function User() {
    }
    User.SESSION_START = 'session_start';
    User.SESSION_END = 'session_end';
    User.USER_LOGIN = 'user_login';
    User.USER_LOGOUT = 'user_logout';
    User.USER_REGISTER = 'user_register';
    return User;
}());
exports.User = User;
var Progression = /** @class */ (function () {
    function Progression() {
    }
    Progression.TUTORIAL_COMPLETE = 'tutorial_complete';
    Progression.ACHIEVEMENT_UNLOCKED = 'achievement_unlocked';
    Progression.MILESTONE_REACHED = 'milestone_reached';
    Progression.QUEST_COMPLETED = 'quest_completed';
    return Progression;
}());
exports.Progression = Progression;
var Ad = /** @class */ (function () {
    function Ad() {
    }
    Ad.AD_VIEWED = 'ad_viewed';
    Ad.AD_CLICKED = 'ad_clicked';
    Ad.AD_REWARDED = 'ad_rewarded';
    Ad.AD_FAILED = 'ad_failed';
    return Ad;
}());
exports.Ad = Ad;
// Event Builders
var SystemEventBuilder = /** @class */ (function () {
    function SystemEventBuilder() {
        this.properties = {};
    }
    SystemEventBuilder.prototype.categoryClass = function (categoryClass) {
        this.category = categoryClass.constructor.name.toLowerCase();
        return this;
    };
    SystemEventBuilder.prototype.eventType = function (type) {
        this.type = type;
        return this;
    };
    SystemEventBuilder.prototype.setProperties = function (properties) {
        this.properties = properties || {};
        return this;
    };
    SystemEventBuilder.prototype.trigger = function () {
        if (!GameAlytics.instance) {
            throw new Error('GameAlytics must be initialized first');
        }
        if (!this.category || !this.type) {
            throw new Error('Category and type are required');
        }
        GameAlytics.instance.trackEvent('SYSTEM', this.type, this.category, this.properties);
    };
    return SystemEventBuilder;
}());
exports.SystemEventBuilder = SystemEventBuilder;
var CustomEventBuilder = /** @class */ (function () {
    function CustomEventBuilder() {
        this.properties = {};
    }
    CustomEventBuilder.prototype.categoryName = function (category) {
        this.category = category;
        return this;
    };
    CustomEventBuilder.prototype.eventType = function (type) {
        this.type = type;
        return this;
    };
    CustomEventBuilder.prototype.setProperties = function (properties) {
        this.properties = properties || {};
        return this;
    };
    CustomEventBuilder.prototype.trigger = function () {
        if (!GameAlytics.instance) {
            throw new Error('GameAlytics must be initialized first');
        }
        if (!this.category || !this.type) {
            throw new Error('Category and type are required');
        }
        GameAlytics.instance.trackEvent('CUSTOM', this.type, this.category, this.properties);
    };
    return CustomEventBuilder;
}());
exports.CustomEventBuilder = CustomEventBuilder;
exports.default = GameAlytics;
