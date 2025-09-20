import {
  EventPayload,
  EventBuilder,
  EventProperties,
  GamepulseInterface,
  GamepulseConfig,
  EventType,
  EventCategory,
  UserEvents,
  GameplayEvents,
  EconomyEvents,
  ProgressionEvents,
  AdEvents,
  IAPEvents
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
    await (Gamepulse.getInstance() as any).trackEvent({
      type: this.isCustom ? 'CUSTOM' : 'SYSTEM',
      value: this.eventType,
      category: this.eventCategory,
      properties: this.properties,
    });
  }
}

export class Gamepulse implements GamepulseInterface {
  private static instance: Gamepulse;
  private config!: GamepulseConfig;
  private isInitialized = false;
  private userId: string | null = null;
  private sessionId: string | null = null;
  private anonymousId: string;

  private constructor() {
    // Generate a unique anonymous ID
    this.anonymousId = this.generateUUID();
  }

  public static getInstance(): Gamepulse {
    if (!Gamepulse.instance) {
      Gamepulse.instance = new Gamepulse();
    }
    return Gamepulse.instance;
  }

  public static init(config: GamepulseConfig): Gamepulse {
    const instance = Gamepulse.getInstance();
    instance.initialize(config);
    return instance;
  }

  private initialize(config: GamepulseConfig): void {
    if (this.isInitialized) {
      console.warn('Gamepulse is already initialized');
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
      console.log('Gamepulse initialized with config:', this.config);
    }
  }

  public event(type: string, category: string): EventBuilder {
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
    
    await this.event(UserEvents.SESSION_START, 'user')
      .setProperties({})
      .track();
  }

  public async endSession(): Promise<void> {
    this.ensureInitialized();
    
    if (!this.sessionId) {
      return;
    }
    
    await this.event(UserEvents.SESSION_END, 'user')
      .setProperties({})
      .track();
      
    this.sessionId = null;
  }

  public identify(userId: string): void {
    this.ensureInitialized();
    this.userId = userId;
  }

  public userEvent(eventType: string): EventBuilder {
    this.ensureInitialized();
    return new EventBuilderImpl(eventType, 'user', false);
  }

  public gameplayEvent(eventType: string): EventBuilder {
    this.ensureInitialized();
    return new EventBuilderImpl(eventType, 'gameplay', false);
  }

  public economyEvent(eventType: string): EventBuilder {
    this.ensureInitialized();
    return new EventBuilderImpl(eventType, 'economy', false);
  }

  public progressionEvent(eventType: string): EventBuilder {
    this.ensureInitialized();
    return new EventBuilderImpl(eventType, 'progression', false);
  }

  public adEvent(eventType: string): EventBuilder {
    this.ensureInitialized();
    return new EventBuilderImpl(eventType, 'ad', false);
  }

  public iapEvent(eventType: string): EventBuilder {
    this.ensureInitialized();
    return new EventBuilderImpl(eventType, 'iap', false);
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

  public async trackEvent(payload: Omit<EventPayload, keyof ReturnType<Gamepulse['getDeviceInfo']> | 'timezone' | 'localDateTime' | 'userId' | 'anonymousId' | 'sessionId'>) {
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
      const response = await fetch('https://client.dev.gamepulse.studio/events/collect', {
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
      throw new Error('Gamepulse must be initialized first. Call Gamepulse.init()');
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
export default Gamepulse.getInstance();

// Export types
export * from './types';
