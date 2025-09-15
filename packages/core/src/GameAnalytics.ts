import { AnalyticsEvent, EventCategory } from './types/events';

/**
 * Configuration options for the GameAnalytics client
 */
export interface GameAnalyticsConfig {
  // Required configuration
  gameKey: string;
  secretKey: string;
  
  // Optional configuration with defaults
  endpoint?: string;
  maxQueueSize?: number;
  batchSize?: number;
  flushInterval?: number; // in milliseconds
  maxRetries?: number;
  debug?: boolean;
  userId?: string;
  sessionId?: string;
  deviceId?: string;
}

/**
 * Default configuration values
 */
const DEFAULT_CONFIG: Partial<GameAnalyticsConfig> = {
  endpoint: 'https://api.gamealytics.com/v2',
  maxQueueSize: 1000,
  batchSize: 10,
  flushInterval: 30000, // 30 seconds
  maxRetries: 3,
  debug: false,
};

/**
 * Main GameAnalytics client class
 */
export class GameAnalytics {
  private config: GameAnalyticsConfig;
  private queue: AnalyticsEvent[] = [];
  private flushTimer: NodeJS.Timeout | null = null;
  private isInitialized = false;
  private sessionStartTime: number = 0;
  
  /**
   * Create a new GameAnalytics instance
   */
  constructor(config: GameAnalyticsConfig) {
    // Merge provided config with defaults
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
    };
    
    // Initialize session and device IDs if not provided
    if (!this.config.sessionId) {
      this.config.sessionId = this.generateUUID();
    }
    
    if (!this.config.deviceId) {
      this.config.deviceId = this.generateDeviceId();
    }
    
    // Start the flush timer
    this.startFlushTimer();
  }
  
  /**
   * Initialize the SDK
   */
  public initialize(userId?: string): void {
    if (this.isInitialized) {
      this.log('GameAnalytics already initialized');
      return;
    }
    
    // Set user ID if provided
    if (userId) {
      this.config.userId = userId;
    }
    
    // Generate a user ID if not provided
    if (!this.config.userId) {
      this.config.userId = this.generateUUID();
    }
    
    // Record session start
    this.sessionStartTime = Date.now();
    this.trackSessionStart();
    
    this.isInitialized = true;
    this.log('GameAnalytics initialized');
    if (this.config.debug) {
      this.log('Config details', 'debug', {
        userId: this.config.userId,
        sessionId: this.config.sessionId,
        deviceId: this.config.deviceId
      });
    }
  }
  
  /**
   * Track a custom event
   */
  public trackEvent(event: Omit<AnalyticsEvent, 'event_id' | 'timestamp' | 'session_id' | 'user_id' | 'platform' | 'device_id' | 'app_version' | 'sdk_version'>): void {
    if (!this.isInitialized) {
      this.log('GameAnalytics not initialized. Call initialize() first.', 'warn');
      return;
    }
    
    const timestamp = new Date().toISOString();
    const eventWithMetadata: AnalyticsEvent = {
      ...event,
      event_id: this.generateUUID(),
      timestamp,
      session_id: this.config.sessionId!,
      user_id: this.config.userId!,
      platform: this.getPlatform(),
      device_id: this.config.deviceId!,
      app_version: this.getAppVersion(),
      sdk_version: this.getSdkVersion(),
    };
    
    this.addToQueue(eventWithMetadata);
  }
  
  /**
   * Track a session start event
   */
  public trackSessionStart(): void {
    this.trackEvent({
      category: EventCategory.SESSION_START,
      event_type: 'session_start',
      game_id: this.config.gameKey,
      build_version: this.getAppVersion(),
      metadata: {
        sdk_version: this.getSdkVersion(),
        platform: this.getPlatform(),
        os_version: this.getOSVersion(),
      },
    });
  }
  
  /**
   * Track a session end event
   */
  public trackSessionEnd(): void {
    if (!this.isInitialized) {
      return;
    }
    
    const sessionDuration = Math.floor((Date.now() - this.sessionStartTime) / 1000); // in seconds
    
    this.trackEvent({
      category: EventCategory.SESSION_END,
      event_type: 'session_end',
      game_id: this.config.gameKey,
      build_version: this.getAppVersion(),
      metadata: {
        session_duration: sessionDuration,
      },
    });
    
    // Force flush before session ends
    this.flush();
  }
  
  /**
   * Track an error event
   */
  public trackError(error: Error, isFatal: boolean = false, context?: Record<string, any>): void {
    this.trackEvent({
      category: EventCategory.ERROR,
      event_type: 'error',
      game_id: this.config.gameKey,
      build_version: this.getAppVersion(),
      error_code: error.name,
      error_message: error.message,
      stack_trace: error.stack,
      fatal: isFatal,
      metadata: {
        ...context,
        platform: this.getPlatform(),
      },
    } as any);
  }
  
  /**
   * Track an in-app purchase
   */
  public trackPurchase(
    productId: string,
    currency: string,
    price: number,
    transactionId: string,
    store: 'app_store' | 'play_store' | 'amazon' | 'samsung' | 'huawei' | 'other',
    quantity: number = 1,
    receipt?: string,
    isRestored: boolean = false
  ): void {
    this.trackEvent({
      category: EventCategory.PURCHASE,
      event_type: isRestored ? 'purchase_restored' : 'purchase_completed',
      game_id: this.config.gameKey,
      build_version: this.getAppVersion(),
      product_id: productId,
      currency,
      price,
      quantity,
      transaction_id: transactionId,
      store,
      receipt,
      is_restored: isRestored,
    } as any);
  }
  
  /**
   * Manually flush the event queue
   */
  public async flush(): Promise<void> {
    if (this.queue.length === 0) {
      return;
    }
    
    // Take up to batchSize events from the queue
    const batch = this.queue.splice(0, this.config.batchSize);
    
    try {
      await this.sendEvents(batch);
      this.log(`Successfully sent ${batch.length} events`);
    } catch (error) {
      // Return failed events to the queue for retry
      this.queue.unshift(...batch);
      this.log(`Failed to send events: ${error}`, 'error');
      
      // TODO: Implement retry logic with exponential backoff
    }
  }
  
  /**
   * Clean up resources
   */
  public destroy(): void {
    // Stop the flush timer
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    
    // Flush any remaining events
    if (this.queue.length > 0) {
      this.flush().catch(error => {
        this.log(`Error during final flush: ${error}`, 'error');
      });
    }
    
    this.isInitialized = false;
    this.queue = [];
  }
  
  /**
   * Add an event to the queue and flush if needed
   */
  private addToQueue(event: AnalyticsEvent): void {
    // Add to queue
    this.queue.push(event);
    
    // Flush if queue reaches max size
    if (this.queue.length >= this.config.maxQueueSize!) {
      this.flush().catch(error => {
        this.log(`Error flushing queue: ${error}`, 'error');
      });
    }
  }
  
  /**
   * Send events to the server
   */
  private async sendEvents(events: AnalyticsEvent[]): Promise<void> {
    // In a real implementation, this would make an HTTP request to the GameAlytics API
    // For now, we'll just log the events
    this.log(`Sending ${events.length} events to ${this.config.endpoint}`, 'debug');
    
    // Simulate network request
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // In a real implementation, you would use fetch or axios to send the events
    // const response = await fetch(`${this.config.endpoint}/events`, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${this.config.secretKey}`,
    //   },
    //   body: JSON.stringify({
    //     game_key: this.config.gameKey,
    //     events,
    //   }),
    // });
    // 
    // if (!response.ok) {
    //   throw new Error(`HTTP error! status: ${response.status}`);
    // }
  }
  
  /**
   * Start the flush timer
   */
  private startFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    
    this.flushTimer = setInterval(() => {
      if (this.queue.length > 0) {
        this.flush().catch(error => {
          this.log(`Error in scheduled flush: ${error}`, 'error');
        });
      }
    }, this.config.flushInterval);
  }
  
  /**
   * Generate a UUID v4
   */
  private generateUUID(): string {
    // Simple UUID v4 implementation
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
  
  /**
   * Generate a device ID
   * In a real implementation, this would use platform-specific APIs
   */
  private generateDeviceId(): string {
    // This is a simple implementation. In a real app, you would use platform-specific APIs
    // to get a unique device identifier (like IDFA/IDFV on iOS, Android ID on Android, etc.)
    return `web_${this.generateUUID().replace(/-/g, '')}`;
  }
  
  /**
   * Get the current platform
   * This should be overridden by platform-specific implementations
   */
  protected getPlatform(): string {
    return 'unknown';
  }
  
  /**
   * Get the application version
   * This should be overridden by platform-specific implementations
   */
  protected getAppVersion(): string {
    return '1.0.0';
  }
  
  /**
   * Get the OS version
   * This should be overridden by platform-specific implementations
   */
  protected getOSVersion(): string {
    return 'unknown';
  }
  
  /**
   * Get the SDK version
   */
  protected getSdkVersion(): string {
    // This would come from package.json in a real implementation
    return '0.1.0';
  }
  
  /**
   * Log a message
   */
  private log(message: string, level: 'log' | 'warn' | 'error' | 'debug' = 'log', data?: any): void {
    if (!this.config.debug && level === 'debug') {
      return;
    }
    
    const timestamp = new Date().toISOString();
    const prefix = `[GameAnalytics][${timestamp}]`;
    
    if (data) {
      console[level](`${prefix} ${message}`, data);
    } else {
      console[level](`${prefix} ${message}`);
    }
  }
}

// Export a singleton instance
export const gameAnalytics = new GameAnalytics({
  gameKey: '',
  secretKey: '',
  debug: process.env.NODE_ENV === 'development',
});

// Export types
export * from './types/events';
