import { GameAnalytics, EventCategory } from '../GameAnalytics';

describe('GameAnalytics', () => {
  let ga: GameAnalytics;
  const mockConfig = {
    gameKey: 'test-game-key',
    secretKey: 'test-secret-key',
    debug: false,
  };

  beforeEach(() => {
    // Create a new instance before each test
    ga = new GameAnalytics(mockConfig);
    
    // Mock console methods
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Clean up after each test
    if (ga) {
      ga.destroy();
    }
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with default values', () => {
      expect(ga).toBeDefined();
      // @ts-ignore - accessing private property for test
      expect(ga.config.gameKey).toBe(mockConfig.gameKey);
      // @ts-ignore - accessing private property for test
      expect(ga.config.secretKey).toBe(mockConfig.secretKey);
      // @ts-ignore - accessing private property for test
      expect(ga.config.debug).toBe(false);
    });

    it('should initialize with custom values', () => {
      const customConfig = {
        ...mockConfig,
        debug: true,
        maxQueueSize: 500,
        batchSize: 20,
        flushInterval: 60000,
      };
      
      const customGA = new GameAnalytics(customConfig);
      
      try {
        // @ts-ignore - accessing private property for test
        expect(customGA.config.maxQueueSize).toBe(500);
        // @ts-ignore - accessing private property for test
        expect(customGA.config.batchSize).toBe(20);
        // @ts-ignore - accessing private property for test
        expect(customGA.config.flushInterval).toBe(60000);
        // @ts-ignore - accessing private property for test
        expect(customGA.config.debug).toBe(true);
      } finally {
        customGA.destroy();
      }
    });
  });

  describe('initialize', () => {
    it('should set user ID and mark as initialized', () => {
      const userId = 'test-user-123';
      ga.initialize(userId);
      
      // @ts-ignore - accessing private property for test
      expect(ga.isInitialized).toBe(true);
      // @ts-ignore - accessing private property for test
      expect(ga.config.userId).toBe(userId);
    });

    it('should generate a user ID if not provided', () => {
      ga.initialize();
      
      // @ts-ignore - accessing private property for test
      expect(ga.isInitialized).toBe(true);
      // @ts-ignore - accessing private property for test
      expect(ga.config.userId).toBeDefined();
      // @ts-ignore - accessing private property for test
      expect(ga.config.userId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });

    it('should track session start on initialize', () => {
      // Mock trackEvent to verify it's called
      const trackEventSpy = jest.spyOn(ga as any, 'trackEvent');
      
      ga.initialize('test-user');
      
      expect(trackEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          category: EventCategory.SESSION_START,
          event_type: 'session_start',
          game_id: mockConfig.gameKey,
        })
      );
    });
  });

  describe('trackEvent', () => {
    beforeEach(() => {
      // Initialize before each test that needs it
      ga.initialize('test-user');
    });

    it('should add event to queue', () => {
      const event = {
        category: EventCategory.CUSTOM,
        event_type: 'test_event',
        game_id: mockConfig.gameKey,
        build_version: '1.0.0',
      };
      
      // @ts-ignore - accessing private property for test
      const addToQueueSpy = jest.spyOn(ga, 'addToQueue');
      
      ga.trackEvent(event);
      
      expect(addToQueueSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          ...event,
          event_id: expect.any(String),
          timestamp: expect.any(String),
          session_id: expect.any(String),
          user_id: 'test-user',
          platform: 'unknown',
          device_id: expect.any(String),
          app_version: '1.0.0',
          sdk_version: '0.1.0',
        })
      );
    });

    it('should not track event if not initialized', () => {
      // Create a new instance without initializing
      const uninitializedGA = new GameAnalytics(mockConfig);
      
      // @ts-ignore - accessing private property for test
      const addToQueueSpy = jest.spyOn(uninitializedGA, 'addToQueue');
      
      uninitializedGA.trackEvent({
        category: EventCategory.CUSTOM,
        event_type: 'test_event',
        game_id: mockConfig.gameKey,
        build_version: '1.0.0',
      });
      
      expect(addToQueueSpy).not.toHaveBeenCalled();
      
      // Clean up
      uninitializedGA.destroy();
    });
  });

  describe('trackSessionEnd', () => {
    beforeEach(() => {
      ga.initialize('test-user');
      
      // Mock Date.now() to return a fixed timestamp
      jest.spyOn(Date, 'now').mockImplementation(() => 1000000);
    });

    it('should track session end with duration', () => {
      // @ts-ignore - accessing private property for test
      ga.sessionStartTime = 900000; // 100 seconds before now
      
      // @ts-ignore - accessing private property for test
      const trackEventSpy = jest.spyOn(ga, 'trackEvent');
      
      ga.trackSessionEnd();
      
      expect(trackEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          category: EventCategory.SESSION_END,
          event_type: 'session_end',
          game_id: mockConfig.gameKey,
          metadata: {
            session_duration: 100,
          },
        })
      );
    });
  });

  describe('trackError', () => {
    beforeEach(() => {
      ga.initialize('test-user');
    });

    it('should track error with stack trace', () => {
      const error = new Error('Test error');
      error.stack = 'Error: Test error\n    at test.js:1:1';
      
      // @ts-ignore - accessing private property for test
      const trackEventSpy = jest.spyOn(ga, 'trackEvent');
      
      ga.trackError(error, true, { custom: 'context' });
      
      expect(trackEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          category: EventCategory.ERROR,
          event_type: 'error',
          game_id: mockConfig.gameKey,
          error_code: 'Error',
          error_message: 'Test error',
          stack_trace: error.stack,
          fatal: true,
          metadata: {
            custom: 'context',
            platform: 'unknown',
          },
        })
      );
    });
  });

  describe('trackPurchase', () => {
    beforeEach(() => {
      ga.initialize('test-user');
    });

    it('should track purchase event', () => {
      // @ts-ignore - accessing private property for test
      const trackEventSpy = jest.spyOn(ga, 'trackEvent');
      
      ga.trackPurchase(
        'com.example.product',
        'USD',
        4.99,
        'transaction-123',
        'app_store',
        1,
        'receipt-123'
      );
      
      expect(trackEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          category: EventCategory.PURCHASE,
          event_type: 'purchase_completed',
          game_id: mockConfig.gameKey,
          product_id: 'com.example.product',
          currency: 'USD',
          price: 4.99,
          quantity: 1,
          transaction_id: 'transaction-123',
          store: 'app_store',
          receipt: 'receipt-123',
          is_restored: false,
        })
      );
    });

    it('should track restored purchase', () => {
      // @ts-ignore - accessing private property for test
      const trackEventSpy = jest.spyOn(ga, 'trackEvent');
      
      ga.trackPurchase(
        'com.example.product',
        'USD',
        4.99,
        'transaction-123',
        'app_store',
        1,
        'receipt-123',
        true
      );
      
      expect(trackEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          event_type: 'purchase_restored',
          is_restored: true,
        })
      );
    });
  });

  describe('flush', () => {
    beforeEach(() => {
      ga.initialize('test-user');
      
      // Mock the sendEvents method
      // @ts-ignore - accessing private property for test
      jest.spyOn(ga, 'sendEvents').mockResolvedValue(undefined);
    });

    it('should not send events if queue is empty', async () => {
      // @ts-ignore - accessing private property for test
      const sendEventsSpy = jest.spyOn(ga, 'sendEvents');
      
      await ga.flush();
      
      expect(sendEventsSpy).not.toHaveBeenCalled();
    });

    it('should send events in batches', async () => {
      // Add more events than batch size
      const events = Array(15).fill(0).map((_, i) => ({
        category: EventCategory.CUSTOM,
        event_type: `event_${i}`,
        game_id: mockConfig.gameKey,
        build_version: '1.0.0',
      }));
      
      // @ts-ignore - accessing private property for test
      const sendEventsSpy = jest.spyOn(ga, 'sendEvents');
      
      // Add events to queue
      events.forEach(event => ga.trackEvent(event));
      
      // Default batch size is 10, so should make 2 batches
      await ga.flush();
      
      expect(sendEventsSpy).toHaveBeenCalledTimes(2);
      expect(sendEventsSpy.mock.calls[0][0]).toHaveLength(10); // First batch of 10
      expect(sendEventsSpy.mock.calls[1][0]).toHaveLength(5);  // Second batch of 5
      
      // Queue should be empty
      // @ts-ignore - accessing private property for test
      expect(ga.queue).toHaveLength(0);
    });

    it('should return events to queue on error', async () => {
      // Make sendEvents fail
      // @ts-ignore - accessing private property for test
      jest.spyOn(ga, 'sendEvents').mockRejectedValue(new Error('Network error'));
      
      // Add some events
      const event = {
        category: EventCategory.CUSTOM,
        event_type: 'test_event',
        game_id: mockConfig.gameKey,
        build_version: '1.0.0',
      };
      
      ga.trackEvent(event);
      
      // @ts-ignore - accessing private property for test
      const originalQueue = [...ga.queue];
      
      await ga.flush();
      
      // Queue should still have the event
      // @ts-ignore - accessing private property for test
      expect(ga.queue).toEqual(originalQueue);
    });
  });

  describe('destroy', () => {
    it('should clean up resources', () => {
      // @ts-ignore - accessing private property for test
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
      
      // @ts-ignore - accessing private property for test
      const flushSpy = jest.spyOn(ga, 'flush').mockResolvedValue(undefined);
      
      // Add an event to test flush on destroy
      ga.initialize('test-user');
      ga.trackEvent({
        category: EventCategory.CUSTOM,
        event_type: 'test_event',
        game_id: mockConfig.gameKey,
        build_version: '1.0.0',
      });
      
      ga.destroy();
      
      // Should clear the flush timer
      expect(clearIntervalSpy).toHaveBeenCalled();
      
      // Should flush remaining events
      expect(flushSpy).toHaveBeenCalled();
      
      // Should mark as not initialized
      // @ts-ignore - accessing private property for test
      expect(ga.isInitialized).toBe(false);
      
      // Queue should be empty
      // @ts-ignore - accessing private property for test
      expect(ga.queue).toHaveLength(0);
    });
  });
});
