/**
 * Common event types for GameAlytics
 */

export enum EventCategory {
  // Core events
  SESSION_START = 'session_start',
  SESSION_END = 'session_end',
  ERROR = 'error',
  
  // Gameplay events
  LEVEL_START = 'level_start',
  LEVEL_END = 'level_end',
  LEVEL_UP = 'level_up',
  
  // Economy events
  CURRENCY_GAIN = 'currency_gain',
  CURRENCY_SPEND = 'currency_spend',
  ITEM_ACQUIRED = 'item_acquired',
  ITEM_CONSUMED = 'item_consumed',
  
  // Progression events
  ACHIEVEMENT_UNLOCKED = 'achievement_unlocked',
  TUTORIAL_COMPLETE = 'tutorial_complete',
  
  // Social events
  FRIEND_ADDED = 'friend_added',
  SHARED = 'shared',
  
  // Ad events
  AD_STARTED = 'ad_started',
  AD_COMPLETED = 'ad_completed',
  AD_REWARDED = 'ad_rewarded',
  
  // IAP events
  PURCHASE = 'purchase',
  PURCHASE_REFUNDED = 'purchase_refunded',
  
  // Custom events
  CUSTOM = 'custom'
}

export interface BaseEvent {
  // Required fields
  event_id: string;
  timestamp: string; // ISO 8601 format
  session_id: string;
  user_id: string;
  
  // Event details
  category: EventCategory;
  event_type: string;
  
  // Context
  platform: string;
  device_id: string;
  app_version: string;
  sdk_version: string;
  
  // Optional fields
  custom_attributes?: Record<string, any>;
  
  // For debugging
  debug?: boolean;
}

export interface GameEvent extends BaseEvent {
  // Game-specific context
  game_id: string;
  build_version: string;
  
  // Location/context in game
  level?: number | string;
  world?: string;
  
  // Additional metadata
  metadata?: Record<string, any>;
}

export interface ErrorEvent extends GameEvent {
  error_code: string;
  error_message: string;
  stack_trace?: string;
  fatal: boolean;
}

export interface EconomyEvent extends GameEvent {
  currency_type: string;
  amount: number;
  item_id?: string;
  item_type?: string;
  balance?: number;
  source?: string;
}

export interface AdEvent extends GameEvent {
  ad_network: string;
  ad_type: 'banner' | 'interstitial' | 'rewarded' | 'offerwall';
  ad_placement?: string;
  duration?: number; // in milliseconds
  success: boolean;
  error_code?: string;
}

export interface PurchaseEvent extends GameEvent {
  product_id: string;
  currency: string;
  price: number;
  quantity: number;
  transaction_id: string;
  receipt?: string;
  store: 'app_store' | 'play_store' | 'amazon' | 'samsung' | 'huawei' | 'other';
  is_restored?: boolean;
}

export type AnalyticsEvent = GameEvent | ErrorEvent | EconomyEvent | AdEvent | PurchaseEvent;
