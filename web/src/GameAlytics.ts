// Core types
import { DataValidator } from './validation/DataValidator';
import { EventQueue } from './queue/EventQueue';

type EventProperties = { [key: string]: string };

enum Environment {
  DEVELOPMENT = 'DEVELOPMENT',
  PRODUCTION = 'PRODUCTION'
}

interface DeviceInfo {
  platform: string;
  osVersion: string;
  deviceModel: string;
  screenResolution: string;
  deviceManufacturer: string;
  appVersion: string;
}

type EventBuilder = {
  setProperties(properties: EventProperties): EventBuilder;
  track(): Promise<void>;
};

class UserConfigBuilder {
  private sessionId?: string;
  private userId?: string;
  private anonymousId?: string;

  setSessionId(sessionId: string): UserConfigBuilder {
    this.sessionId = sessionId;
    return this;
  }

  setUserId(userId: string): UserConfigBuilder {
    this.userId = userId;
    return this;
  }

  setAnonymous(anonymousId: string): UserConfigBuilder {
    this.anonymousId = anonymousId;
    return this;
  }

  build(): UserConfig {
    if (!this.sessionId) {
      throw new Error('SessionId is required');
    }
    if (!this.userId && !this.anonymousId) {
      throw new Error('Either userId or anonymousId must be provided');
    }
    return new UserConfig(this.sessionId, this.userId, this.anonymousId);
  }
}

class UserConfig {
  public readonly sessionId: string;
  public readonly userId?: string;
  public readonly anonymousId?: string;

  constructor(sessionId: string, userId?: string, anonymousId?: string) {
    this.sessionId = sessionId;
    if (userId !== undefined) {
      this.userId = userId;
    }
    if (anonymousId !== undefined) {
      this.anonymousId = anonymousId;
    }
  }

  static builder(): UserConfigBuilder {
    return new UserConfigBuilder();
  }
}

class EventBuilderImpl implements EventBuilder {
  private properties: EventProperties = {};
  private readonly eventType: string;
  private readonly eventCategory: string;
  private readonly isCustom: boolean;

  constructor(eventType: string, eventCategory: string, isCustom: boolean) {
    this.eventType = eventType;
    this.eventCategory = eventCategory;
    this.isCustom = isCustom;
  }

  setProperties(properties: EventProperties): EventBuilder {
    this.properties = { ...this.properties, ...properties };
    return this;
  }

  async track(): Promise<void> {
    GameAlytics.getInstance().trackEvent(
      this.isCustom ? 'CUSTOM' : 'SYSTEM',
      this.eventType,
      this.eventCategory,
      this.properties
    );
  }
}

class InitBuilder {
  private apiKey: string;
  private environment: Environment;
  private userConfigValue?: UserConfig;

  constructor(apiKey: string, environment: Environment) {
    this.apiKey = apiKey;
    this.environment = environment;
  }

  public userConfig(userConfig: UserConfig): InitBuilder {
    this.userConfigValue = userConfig;
    return this;
  }

  public create(): GameAlytics {
    if (!this.apiKey) {
      throw new Error('API key is required');
    }
    if (!this.userConfigValue) {
      throw new Error('UserConfig is required');
    }

    GameAlytics.instance = new GameAlytics(this.apiKey, this.environment, this.userConfigValue);
    return GameAlytics.instance;
  }
}

class GameAlytics {
  public static instance: GameAlytics | null = null;
  private apiKey: string;
  private environment: Environment;
  private userConfig: UserConfig;
  private deviceInfo: DeviceInfo;
  private isInitialized: boolean = false;
  private baseUrl: string;
  private eventQueue: EventQueue;

  constructor(apiKey: string, environment: Environment, userConfig: UserConfig) {
    this.apiKey = apiKey;
    this.environment = environment;
    this.userConfig = userConfig;
    this.deviceInfo = this.autoFetchDeviceInfo();
    this.baseUrl = environment === Environment.PRODUCTION 
      ? 'https://client.gamealytics.click' 
      : 'https://client.dev.gamealytics.click';
    
    // Initialize event queue with base URL and API key injection
    this.eventQueue = new EventQueue();
    (window as any).__GA_BASE_URL__ = this.baseUrl;
    (window as any).__GA_API_KEY__ = this.apiKey;
    
    this.isInitialized = true;
  }

  public static init(apiKey: string, environment: Environment): InitBuilder {
    return new InitBuilder(apiKey, environment);
  }

  public static getInstance(): GameAlytics {
    if (!GameAlytics.instance) {
      throw new Error('GameAlytics must be initialized first. Call GameAlytics.init(...).create()');
    }
    return GameAlytics.instance;
  }

  public systemEvent(): SystemEventBuilder {
    return new SystemEventBuilder();
  }

  public customEvent(): CustomEventBuilder {
    return new CustomEventBuilder();
  }

  private autoFetchDeviceInfo(): DeviceInfo {
    try {
      const isBrowser = typeof window !== 'undefined';
      return {
        platform: isBrowser ? 'Web' : 'Node.js',
        osVersion: this.getOSVersion(),
        deviceModel: isBrowser ? window.navigator.platform : 'Node.js',
        screenResolution: this.getScreenResolution(),
        deviceManufacturer: isBrowser ? window.navigator.vendor || 'Unknown' : 'Node.js',
        appVersion: '1.0.0'
      };
    } catch (error) {
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
  }

  public trackEvent(type: 'SYSTEM' | 'CUSTOM', eventType: string, category: string, properties: EventProperties): void {
    // Validate and sanitize properties
    const validationResult = DataValidator.validateProperties(properties, {
      maxLength: 100,
      allowHtml: false,
      allowedTypes: ['string', 'number', 'boolean']
    });

    // Log validation errors in development
    if (validationResult.errors.length > 0 && this.environment === Environment.DEVELOPMENT) {
      console.warn('GameAlytics validation warnings:', validationResult.errors);
    }

    const eventPayload = {
      type,
      value: eventType,
      category,
      properties: validationResult.sanitized,
      ...this.deviceInfo,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      localDateTime: new Date().toISOString(),
      userId: this.userConfig.userId || '',
      anonymousId: this.userConfig.anonymousId || '',
      sessionId: this.userConfig.sessionId,
    };

    // Use event queue for reliable delivery
    this.eventQueue.enqueue(eventPayload);
  }

  private getOSVersion(): string {
    if (typeof window === 'undefined') return 'Node.js';
    
    const userAgent = window.navigator.userAgent;
    const platform = window.navigator.platform;
    const macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'];
    const windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'];
    const iosPlatforms = ['iPhone', 'iPad', 'iPod'];
    
    if (macosPlatforms.indexOf(platform) !== -1) return 'Mac OS';
    if (iosPlatforms.indexOf(platform) !== -1) return 'iOS';
    if (windowsPlatforms.indexOf(platform) !== -1) return 'Windows';
    if (/Android/.test(userAgent)) return 'Android';
    if (/Linux/.test(platform)) return 'Linux';
    
    return 'Unknown';
  }

  private getScreenResolution(): string {
    if (typeof window !== 'undefined' && window.screen) {
      return `${window.screen.width}x${window.screen.height}`;
    }
    return 'unknown';
  }

  private ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new Error('GameAlytics must be initialized first. Call GameAlytics.init()');
    }
  }
}

// Event Category Classes
export class Gameplay {
  public static readonly LEVEL_START = 'level_start';
  public static readonly LEVEL_END = 'level_end';
  public static readonly LEVEL_UP = 'level_up';
  public static readonly BOSS_FIGHT = 'boss_fight';
  public static readonly CHECKPOINT_REACHED = 'checkpoint_reached';
}

export class IAP {
  public static readonly PURCHASE = 'purchase';
  public static readonly PURCHASE_FAILED = 'purchase_failed';
  public static readonly PURCHASE_RESTORED = 'purchase_restored';
  public static readonly SUBSCRIPTION_STARTED = 'subscription_started';
  public static readonly SUBSCRIPTION_CANCELLED = 'subscription_cancelled';
}

export class User {
  public static readonly SESSION_START = 'session_start';
  public static readonly SESSION_END = 'session_end';
  public static readonly USER_LOGIN = 'user_login';
  public static readonly USER_LOGOUT = 'user_logout';
  public static readonly USER_REGISTER = 'user_register';
}

export class Progression {
  public static readonly TUTORIAL_COMPLETE = 'tutorial_complete';
  public static readonly ACHIEVEMENT_UNLOCKED = 'achievement_unlocked';
  public static readonly MILESTONE_REACHED = 'milestone_reached';
  public static readonly QUEST_COMPLETED = 'quest_completed';
}

export class Ad {
  public static readonly AD_VIEWED = 'ad_viewed';
  public static readonly AD_CLICKED = 'ad_clicked';
  public static readonly AD_REWARDED = 'ad_rewarded';
  public static readonly AD_FAILED = 'ad_failed';
}

// Event Builders
export class SystemEventBuilder {
  private category?: string;
  private type?: string;
  private properties: EventProperties = {};
  
  public categoryClass(categoryClass: any): SystemEventBuilder {
    this.category = categoryClass.constructor.name.toLowerCase();
    return this;
  }
  
  public eventType(type: string): SystemEventBuilder {
    this.type = type;
    return this;
  }
  
  public setProperties(properties: EventProperties): SystemEventBuilder {
    this.properties = properties || {};
    return this;
  }
  
  public trigger(): void {
    if (!GameAlytics.instance) {
      throw new Error('GameAlytics must be initialized first');
    }
    if (!this.category || !this.type) {
      throw new Error('Category and type are required');
    }
    GameAlytics.instance.trackEvent('SYSTEM', this.type, this.category, this.properties);
  }
}

export class CustomEventBuilder {
  private category?: string;
  private type?: string;
  private properties: EventProperties = {};
  
  public categoryName(category: string): CustomEventBuilder {
    this.category = category;
    return this;
  }
  
  public eventType(type: string): CustomEventBuilder {
    this.type = type;
    return this;
  }
  
  public setProperties(properties: EventProperties): CustomEventBuilder {
    this.properties = properties || {};
    return this;
  }
  
  public trigger(): void {
    if (!GameAlytics.instance) {
      throw new Error('GameAlytics must be initialized first');
    }
    if (!this.category || !this.type) {
      throw new Error('Category and type are required');
    }
    GameAlytics.instance.trackEvent('CUSTOM', this.type, this.category, this.properties);
  }
}

export { GameAlytics, UserConfig, Environment };
export default GameAlytics;
