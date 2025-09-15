/**
 * Event queue for offline storage and retry mechanisms
 */

export interface QueuedEvent {
  id: string;
  payload: any;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

export interface QueueOptions {
  maxQueueSize: number;
  maxRetries: number;
  retryDelays: number[];
  storageKey: string;
}

export class EventQueue {
  private queue: QueuedEvent[] = [];
  private isProcessing = false;
  private options: QueueOptions;
  private retryTimeouts: Map<string, NodeJS.Timeout> = new Map();

  constructor(options: Partial<QueueOptions> = {}) {
    this.options = {
      maxQueueSize: options.maxQueueSize || 100,
      maxRetries: options.maxRetries || 3,
      retryDelays: options.retryDelays || [1000, 2000, 4000], // 1s, 2s, 4s
      storageKey: options.storageKey || 'ga_event_queue',
    };

    this.loadFromStorage();
    this.setupNetworkListeners();
  }

  /**
   * Add event to queue
   */
  enqueue(payload: any): void {
    const event: QueuedEvent = {
      id: this.generateId(),
      payload,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: this.options.maxRetries,
    };

    // Remove oldest events if queue is full
    if (this.queue.length >= this.options.maxQueueSize) {
      this.queue.shift();
    }

    this.queue.push(event);
    this.saveToStorage();

    // Try to process immediately if online
    if (this.isOnline()) {
      this.processQueue();
    }
  }

  /**
   * Process queued events
   */
  async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;

    try {
      // Process events in batches of 5
      const batchSize = 5;
      const batch = this.queue.slice(0, batchSize);

      try {
        await this.sendBatch(batch);
        // Remove all events in the successful batch
        batch.forEach(event => this.removeEvent(event.id));
      } catch (error) {
        // If batch fails, handle each event individually
        for (const event of batch) {
          await this.handleEventFailure(event, error);
        }
      }
    } finally {
      this.isProcessing = false;
      this.saveToStorage();

      // Continue processing if there are more events
      if (this.queue.length > 0 && this.isOnline()) {
        setTimeout(() => this.processQueue(), 100);
      }
    }
  }

  /**
   * Send batch of events
   */
  private async sendBatch(events: QueuedEvent[]): Promise<void> {
    const payloads = events.map(event => event.payload);
    
    const response = await fetch(`${this.getBaseUrl()}/events/collect/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.getApiKey(),
      },
      body: JSON.stringify(payloads),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }

  /**
   * Send individual event (fallback for failed batches)
   */
  private async sendEvent(event: QueuedEvent): Promise<void> {
    const response = await fetch(`${this.getBaseUrl()}/events/collect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.getApiKey(),
      },
      body: JSON.stringify(event.payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }

  /**
   * Handle event sending failure
   */
  private async handleEventFailure(event: QueuedEvent, error: any): Promise<void> {
    event.retryCount++;

    if (event.retryCount >= event.maxRetries) {
      // Max retries reached, remove event
      this.removeEvent(event.id);
      console.warn(`GameAlytics: Event ${event.id} dropped after ${event.maxRetries} retries:`, error);
      return;
    }

    // Schedule retry with exponential backoff
    const delay = this.options.retryDelays[Math.min(event.retryCount - 1, this.options.retryDelays.length - 1)];
    
    const timeoutId = setTimeout(() => {
      this.retryTimeouts.delete(event.id);
      if (this.isOnline()) {
        this.processQueue();
      }
    }, delay);

    this.retryTimeouts.set(event.id, timeoutId);
  }

  /**
   * Remove event from queue
   */
  private removeEvent(eventId: string): void {
    this.queue = this.queue.filter(event => event.id !== eventId);
    
    // Clear any pending retry timeout
    const timeoutId = this.retryTimeouts.get(eventId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      this.retryTimeouts.delete(eventId);
    }
  }

  /**
   * Check if device is online
   */
  private isOnline(): boolean {
    if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
      return navigator.onLine;
    }
    return true; // Assume online in non-browser environments
  }

  /**
   * Setup network status listeners
   */
  private setupNetworkListeners(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        console.log('GameAlytics: Network connection restored, processing queue');
        this.processQueue();
      });

      window.addEventListener('offline', () => {
        console.log('GameAlytics: Network connection lost, events will be queued');
      });
    }
  }

  /**
   * Load queue from local storage
   */
  private loadFromStorage(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    try {
      const stored = localStorage.getItem(this.options.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.queue = Array.isArray(parsed) ? parsed : [];
        
        // Clean up old events (older than 24 hours)
        const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
        this.queue = this.queue.filter(event => event.timestamp > oneDayAgo);
      }
    } catch (error) {
      console.warn('GameAlytics: Failed to load queue from storage:', error);
      this.queue = [];
    }
  }

  /**
   * Save queue to local storage
   */
  private saveToStorage(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    try {
      localStorage.setItem(this.options.storageKey, JSON.stringify(this.queue));
    } catch (error) {
      console.warn('GameAlytics: Failed to save queue to storage:', error);
    }
  }

  /**
   * Generate unique event ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get base URL (placeholder - will be injected by GameAlytics instance)
   */
  private getBaseUrl(): string {
    // This will be set by the GameAlytics instance
    return (window as any).__GA_BASE_URL__ || 'https://api.gamealytics.com';
  }

  /**
   * Get API key (placeholder - will be injected by GameAlytics instance)
   */
  private getApiKey(): string {
    // This will be set by the GameAlytics instance
    return (window as any).__GA_API_KEY__ || '';
  }

  /**
   * Get queue status for debugging
   */
  getStatus(): { queueSize: number; isProcessing: boolean; pendingRetries: number } {
    return {
      queueSize: this.queue.length,
      isProcessing: this.isProcessing,
      pendingRetries: this.retryTimeouts.size,
    };
  }

  /**
   * Clear all queued events
   */
  clear(): void {
    this.queue = [];
    this.retryTimeouts.forEach(timeout => clearTimeout(timeout));
    this.retryTimeouts.clear();
    this.saveToStorage();
  }
}
