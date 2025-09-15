/**
 * Core types for GameAlytics SDK
 */

export enum Environment {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production'
}

export enum Platform {
  ANDROID = 'ANDROID',
  IOS = 'IOS',
  PC = 'PC',
  PS = 'PS',
  XBOX = 'XBOX',
  WEB = 'WEB',
  UNITY = 'UNITY'
}

export const API_ENDPOINTS = {
  [Environment.DEVELOPMENT]: 'https://client.dev.gamealytics.click/events/collect',
  [Environment.PRODUCTION]: 'https://client.gamealytics.click/events/collect'
};

// Base interface for all event categories
export interface EventCategory {
  name: string;
  getEventTypes(): string[];
}

// User Events
export class UserEvents implements EventCategory {
  name = 'user';
  
  static readonly SESSION_START = 'session_start';
  static readonly SESSION_END = 'session_end';
  static readonly USER_LOGIN = 'user_login';
  static readonly USER_LOGOUT = 'user_logout';
  static readonly USER_REGISTER = 'user_register';
  
  getEventTypes(): string[] {
    return [UserEvents.SESSION_START, UserEvents.SESSION_END, UserEvents.USER_LOGIN, UserEvents.USER_LOGOUT, UserEvents.USER_REGISTER];
  }
}

// Gameplay Events
export class GameplayEvents implements EventCategory {
  name = 'gameplay';
  
  static readonly LEVEL_START = 'level_start';
  static readonly LEVEL_END = 'level_end';
  static readonly LEVEL_UP = 'level_up';
  static readonly GAME_START = 'game_start';
  static readonly GAME_END = 'game_end';
  static readonly BOSS_FIGHT = 'boss_fight';
  
  getEventTypes(): string[] {
    return [GameplayEvents.LEVEL_START, GameplayEvents.LEVEL_END, GameplayEvents.LEVEL_UP, GameplayEvents.GAME_START, GameplayEvents.GAME_END, GameplayEvents.BOSS_FIGHT];
  }
}

// Economy Events
export class EconomyEvents implements EventCategory {
  name = 'economy';
  
  static readonly CURRENCY_EARNED = 'currency_earned';
  static readonly CURRENCY_SPENT = 'currency_spent';
  static readonly ITEM_PURCHASED = 'item_purchased';
  static readonly ITEM_SOLD = 'item_sold';
  static readonly SHOP_VIEWED = 'shop_viewed';
  
  getEventTypes(): string[] {
    return [EconomyEvents.CURRENCY_EARNED, EconomyEvents.CURRENCY_SPENT, EconomyEvents.ITEM_PURCHASED, EconomyEvents.ITEM_SOLD, EconomyEvents.SHOP_VIEWED];
  }
}

// Progression Events
export class ProgressionEvents implements EventCategory {
  name = 'progression';
  
  static readonly TUTORIAL_COMPLETE = 'tutorial_complete';
  static readonly ACHIEVEMENT_UNLOCKED = 'achievement_unlocked';
  static readonly MILESTONE_REACHED = 'milestone_reached';
  static readonly QUEST_COMPLETED = 'quest_completed';
  
  getEventTypes(): string[] {
    return [ProgressionEvents.TUTORIAL_COMPLETE, ProgressionEvents.ACHIEVEMENT_UNLOCKED, ProgressionEvents.MILESTONE_REACHED, ProgressionEvents.QUEST_COMPLETED];
  }
}

// Ad Events
export class AdEvents implements EventCategory {
  name = 'ad';
  
  static readonly AD_VIEWED = 'ad_viewed';
  static readonly AD_CLICKED = 'ad_clicked';
  static readonly AD_REWARDED = 'ad_rewarded';
  static readonly AD_FAILED = 'ad_failed';
  
  getEventTypes(): string[] {
    return [AdEvents.AD_VIEWED, AdEvents.AD_CLICKED, AdEvents.AD_REWARDED, AdEvents.AD_FAILED];
  }
}

// IAP Events
export class IAPEvents implements EventCategory {
  name = 'iap';
  
  static readonly PURCHASE = 'purchase';
  static readonly PURCHASE_FAILED = 'purchase_failed';
  static readonly PURCHASE_RESTORED = 'purchase_restored';
  static readonly SUBSCRIPTION_STARTED = 'subscription_started';
  static readonly SUBSCRIPTION_CANCELLED = 'subscription_cancelled';
  
  getEventTypes(): string[] {
    return [IAPEvents.PURCHASE, IAPEvents.PURCHASE_FAILED, IAPEvents.PURCHASE_RESTORED, IAPEvents.SUBSCRIPTION_STARTED, IAPEvents.SUBSCRIPTION_CANCELLED];
  }
}

export interface EventProperties {
  [key: string]: string | number | boolean | null | undefined;
}

export interface EventPayload {
  type: 'SYSTEM' | 'CUSTOM';
  timezone: string;
  localDateTime: string;
  value: string;
  category: string;
  userId: string;
  anonymousId: string;
  sessionId: string;
  platform: string;
  osVersion: string;
  appVersion: string;
  deviceModel: string;
  screenResolution: string;
  deviceManufacturer: string;
  properties: EventProperties;
}

export interface EventBuilder {
  setProperties(properties: EventProperties): this;
  track(): Promise<void>;
}

export interface GameAlyticsInterface {
  // System Events with category validation
  userEvent(eventType: string): EventBuilder;
  gameplayEvent(eventType: string): EventBuilder;
  economyEvent(eventType: string): EventBuilder;
  progressionEvent(eventType: string): EventBuilder;
  adEvent(eventType: string): EventBuilder;
  iapEvent(eventType: string): EventBuilder;
  
  // Custom Events
  customEvent(type: string, category: string): EventBuilder;
  
  // Session Management
  startSession(): Promise<void>;
  endSession(): Promise<void>;
  
  // User Identification
  identify(userId: string): void;
  
  // Device Info
  getDeviceInfo(): {
    platform: string;
    osVersion: string;
    deviceModel: string;
    screenResolution: string;
    deviceManufacturer: string;
    appVersion: string;
  };
}

export interface UserConfig {
  sessionId: string; // mandatory
  userId?: string; // optional, but either userId or anonymousId must be provided
  anonymousId?: string; // optional, but either userId or anonymousId must be provided
}

export interface DeviceInfo {
  platform: Platform;
  osVersion: string;
  appVersion: string;
  deviceModel: string;
  screenResolution: string;
  deviceManufacturer: string;
}

export interface GameAlyticsConfig {
  apiKey: string;
  environment?: Environment;
  userConfig: UserConfig;
  appVersion?: string;
  debug?: boolean;
}
