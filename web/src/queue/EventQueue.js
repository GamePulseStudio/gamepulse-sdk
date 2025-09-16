"use strict";
/**
 * Event queue for offline storage and retry mechanisms
 */
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
exports.EventQueue = void 0;
var EventQueue = /** @class */ (function () {
    function EventQueue(options) {
        if (options === void 0) { options = {}; }
        this.queue = [];
        this.isProcessing = false;
        this.retryTimeouts = new Map();
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
    EventQueue.prototype.enqueue = function (payload) {
        var event = {
            id: this.generateId(),
            payload: payload,
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
    };
    /**
     * Process queued events
     */
    EventQueue.prototype.processQueue = function () {
        return __awaiter(this, void 0, void 0, function () {
            var batchSize, batch, error_1, _i, batch_1, event_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.isProcessing || this.queue.length === 0) {
                            return [2 /*return*/];
                        }
                        this.isProcessing = true;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, , 10, 11]);
                        batchSize = 5;
                        batch = this.queue.slice(0, batchSize);
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 9]);
                        return [4 /*yield*/, this.sendBatch(batch)];
                    case 3:
                        _a.sent();
                        // Remove all events in the successful batch
                        batch.forEach(function (event) { return _this.removeEvent(event.id); });
                        return [3 /*break*/, 9];
                    case 4:
                        error_1 = _a.sent();
                        _i = 0, batch_1 = batch;
                        _a.label = 5;
                    case 5:
                        if (!(_i < batch_1.length)) return [3 /*break*/, 8];
                        event_1 = batch_1[_i];
                        return [4 /*yield*/, this.handleEventFailure(event_1, error_1)];
                    case 6:
                        _a.sent();
                        _a.label = 7;
                    case 7:
                        _i++;
                        return [3 /*break*/, 5];
                    case 8: return [3 /*break*/, 9];
                    case 9: return [3 /*break*/, 11];
                    case 10:
                        this.isProcessing = false;
                        this.saveToStorage();
                        // Continue processing if there are more events
                        if (this.queue.length > 0 && this.isOnline()) {
                            setTimeout(function () { return _this.processQueue(); }, 100);
                        }
                        return [7 /*endfinally*/];
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Send batch of events
     */
    EventQueue.prototype.sendBatch = function (events) {
        return __awaiter(this, void 0, void 0, function () {
            var payloads, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        payloads = events.map(function (event) { return event.payload; });
                        return [4 /*yield*/, fetch("".concat(this.getBaseUrl(), "/events/collect/batch"), {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'x-api-key': this.getApiKey(),
                                },
                                body: JSON.stringify(payloads),
                            })];
                    case 1:
                        response = _a.sent();
                        if (!response.ok) {
                            throw new Error("HTTP ".concat(response.status, ": ").concat(response.statusText));
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Send individual event (fallback for failed batches)
     */
    EventQueue.prototype.sendEvent = function (event) {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch("".concat(this.getBaseUrl(), "/events/collect"), {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'x-api-key': this.getApiKey(),
                            },
                            body: JSON.stringify(event.payload),
                        })];
                    case 1:
                        response = _a.sent();
                        if (!response.ok) {
                            throw new Error("HTTP ".concat(response.status, ": ").concat(response.statusText));
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Handle event sending failure
     */
    EventQueue.prototype.handleEventFailure = function (event, error) {
        return __awaiter(this, void 0, void 0, function () {
            var delay, timeoutId;
            var _this = this;
            return __generator(this, function (_a) {
                event.retryCount++;
                if (event.retryCount >= event.maxRetries) {
                    // Max retries reached, remove event
                    this.removeEvent(event.id);
                    console.warn("GameAlytics: Event ".concat(event.id, " dropped after ").concat(event.maxRetries, " retries:"), error);
                    return [2 /*return*/];
                }
                delay = this.options.retryDelays[Math.min(event.retryCount - 1, this.options.retryDelays.length - 1)];
                timeoutId = setTimeout(function () {
                    _this.retryTimeouts.delete(event.id);
                    if (_this.isOnline()) {
                        _this.processQueue();
                    }
                }, delay);
                this.retryTimeouts.set(event.id, timeoutId);
                return [2 /*return*/];
            });
        });
    };
    /**
     * Remove event from queue
     */
    EventQueue.prototype.removeEvent = function (eventId) {
        this.queue = this.queue.filter(function (event) { return event.id !== eventId; });
        // Clear any pending retry timeout
        var timeoutId = this.retryTimeouts.get(eventId);
        if (timeoutId) {
            clearTimeout(timeoutId);
            this.retryTimeouts.delete(eventId);
        }
    };
    /**
     * Check if device is online
     */
    EventQueue.prototype.isOnline = function () {
        if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
            return navigator.onLine;
        }
        return true; // Assume online in non-browser environments
    };
    /**
     * Setup network status listeners
     */
    EventQueue.prototype.setupNetworkListeners = function () {
        var _this = this;
        if (typeof window !== 'undefined') {
            window.addEventListener('online', function () {
                console.log('GameAlytics: Network connection restored, processing queue');
                _this.processQueue();
            });
            window.addEventListener('offline', function () {
                console.log('GameAlytics: Network connection lost, events will be queued');
            });
        }
    };
    /**
     * Load queue from local storage
     */
    EventQueue.prototype.loadFromStorage = function () {
        if (typeof localStorage === 'undefined') {
            return;
        }
        try {
            var stored = localStorage.getItem(this.options.storageKey);
            if (stored) {
                var parsed = JSON.parse(stored);
                this.queue = Array.isArray(parsed) ? parsed : [];
                // Clean up old events (older than 24 hours)
                var oneDayAgo_1 = Date.now() - 24 * 60 * 60 * 1000;
                this.queue = this.queue.filter(function (event) { return event.timestamp > oneDayAgo_1; });
            }
        }
        catch (error) {
            console.warn('GameAlytics: Failed to load queue from storage:', error);
            this.queue = [];
        }
    };
    /**
     * Save queue to local storage
     */
    EventQueue.prototype.saveToStorage = function () {
        if (typeof localStorage === 'undefined') {
            return;
        }
        try {
            localStorage.setItem(this.options.storageKey, JSON.stringify(this.queue));
        }
        catch (error) {
            console.warn('GameAlytics: Failed to save queue to storage:', error);
        }
    };
    /**
     * Generate unique event ID
     */
    EventQueue.prototype.generateId = function () {
        return "".concat(Date.now(), "-").concat(Math.random().toString(36).substr(2, 9));
    };
    /**
     * Get base URL (placeholder - will be injected by GameAlytics instance)
     */
    EventQueue.prototype.getBaseUrl = function () {
        // This will be set by the GameAlytics instance
        return window.__GA_BASE_URL__ || 'https://api.gamealytics.com';
    };
    /**
     * Get API key (placeholder - will be injected by GameAlytics instance)
     */
    EventQueue.prototype.getApiKey = function () {
        // This will be set by the GameAlytics instance
        return window.__GA_API_KEY__ || '';
    };
    /**
     * Get queue status for debugging
     */
    EventQueue.prototype.getStatus = function () {
        return {
            queueSize: this.queue.length,
            isProcessing: this.isProcessing,
            pendingRetries: this.retryTimeouts.size,
        };
    };
    /**
     * Clear all queued events
     */
    EventQueue.prototype.clear = function () {
        this.queue = [];
        this.retryTimeouts.forEach(function (timeout) { return clearTimeout(timeout); });
        this.retryTimeouts.clear();
        this.saveToStorage();
    };
    return EventQueue;
}());
exports.EventQueue = EventQueue;
