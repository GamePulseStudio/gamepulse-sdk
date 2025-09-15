import {
  EventPayload,
  EventBuilder,
  EventProperties,
  GameAlyticsInterface,
  GameAlyticsConfig,
  EventType,
  EventCategory
} from './types';

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

  setProperties(properties: EventProperties): this {
    this.properties = { ...this.properties, ...properties };
    return this;
  }

  async track(): Promise<void> {
    await GameAlytics.getInstance().trackEvent({
      type: this.isCustom ? 'CUSTOM' : 'SYSTEM',
      value: this.eventType,
      category: this.eventCategory,
      properties: this.properties,
    });
  }
}

export class GameAlytics implements GameAlyticsInterface {
  private static instance: GameAlytics;
  private config: GameAlyticsConfig;
  private isInitialized = false;
  private userId: string | null = null;
  private sessionId: string | null = null;
  private anonymousId: string;

  private constructor() {
    // Generate a unique anonymous ID
    this.anonymousId = this.generateUUID();
  }

  public static getInstance(): GameAlytics {
    if (!GameAlytics.instance) {
      GameAlytics.instance = new GameAlytics();
    }
    return GameAlytics.instance;
  }

  public static init(config: GameAlyticsConfig): GameAlytics {
    const instance = GameAlytics.getInstance();
    instance.initialize(config);
    return instance;
  }

  private initialize(config: GameAlyticsConfig): void {
    if (this.isInitialized) {
      console.warn('GameAlytics is already initialized');
      return;
    }

    if (!config.apiKey) {
      throw new Error('API key is required');
    }

    this.config = {
      debug: false,
      ...config,
    };

    this.isInitialized = true;
    
    if (this.config.debug) {
      console.log('GameAlytics initialized with config:', this.config);
    }
  }

  public event(type: EventType, category: EventCategory): EventBuilder {
    this.ensureInitialized();
    return new EventBuilderImpl(type, category, false);
  }

  public customEvent(type: string, category: string): EventBuilder {
    this.ensureInitialized();
    return new EventBuilderImpl(type, category, true);
  }

  public async startSession(): Promise<void> {
    this.ensureInitialized();
    this.sessionId = this.generateUUID();
    
    await this.event(EventType.SESSION_START, EventCategory.USER)
      .setProperties({})
      .track();
  }

  public async endSession(): Promise<void> {
    this.ensureInitialized();
    
    if (!this.sessionId) {
      return;
    }
    
    await this.event(EventType.SESSION_END, EventCategory.USER)
      .setProperties({})
      .track();
      
    this.sessionId = null;
  }

  public identify(userId: string): void {
    this.ensureInitialized();
    this.userId = userId;
  }

  public getDeviceInfo() {
    return {
      platform: this.getPlatform(),
      osVersion: this.getOSVersion(),
      deviceModel: this.getDeviceModel(),
      screenResolution: this.getScreenResolution(),
      deviceManufacturer: this.getDeviceManufacturer(),
      appVersion: this.config.appVersion || '1.0.0',
    };
  }

  protected async trackEvent(payload: Omit<EventPayload, keyof ReturnType<GameAlytics['getDeviceInfo']> | 'timezone' | 'localDateTime' | 'userId' | 'anonymousId' | 'sessionId'>) {
    const deviceInfo = this.getDeviceInfo();
    const now = new Date();
    
    const eventPayload: EventPayload = {
      ...payload,
      ...deviceInfo,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      localDateTime: now.toISOString(),
      userId: this.userId || '',
      anonymousId: this.anonymousId,
      sessionId: this.sessionId || '',
    };

    if (this.config.debug) {
      console.log('Tracking event:', eventPayload);
    }

    try {
      const response = await fetch('https://client.dev.gamealytics.click/events/collect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.config.apiKey,
        },
        body: JSON.stringify(eventPayload),
      });

      if (!response.ok) {
        throw new Error(`Failed to track event: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error tracking event:', error);
      throw error;
    }
  }

  private ensureInitialized(): void {
    if (!this.isInitialized) {
      throw new Error('GameAlytics must be initialized first. Call GameAlytics.init()');
    }
  }

  // Platform-specific implementations (to be overridden by platform-specific classes)
  protected getPlatform(): string {
    return 'web';
  }

  protected getOSVersion(): string {
    return 'unknown';
  }

  protected getDeviceModel(): string {
    return 'unknown';
  }

  protected getScreenResolution(): string {
    if (typeof window !== 'undefined' && window.screen) {
      return `${window.screen.width}x${window.screen.height}`;
    }
    return 'unknown';
  }

  protected getDeviceManufacturer(): string {
    return 'unknown';
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}

// Export a singleton instance
export default GameAlytics.getInstance();

// Export types
export * from './types';
