"use strict";
/**
 * Data validation and sanitization for user properties
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataValidator = void 0;
var DataValidator = /** @class */ (function () {
    function DataValidator() {
    }
    /**
     * Validates and sanitizes a single property value
     */
    DataValidator.validateProperty = function (key, value, options) {
        if (options === void 0) { options = {}; }
        var opts = {
            maxLength: options.maxLength || this.DEFAULT_MAX_LENGTH,
            allowHtml: options.allowHtml || false,
            allowedTypes: options.allowedTypes || ['string', 'number', 'boolean'],
        };
        var errors = [];
        var sanitizedValue = value;
        // Type validation
        var typeResult = this.validateType(value, opts.allowedTypes);
        if (!typeResult.isValid) {
            errors.push.apply(errors, typeResult.errors);
            sanitizedValue = null;
        }
        else {
            sanitizedValue = typeResult.sanitizedValue;
        }
        // Skip further validation if type is invalid
        if (sanitizedValue === null) {
            return { isValid: false, sanitizedValue: null, errors: errors };
        }
        // Convert to string for further validation
        var stringValue = String(sanitizedValue);
        // Length validation
        if (stringValue.length > opts.maxLength) {
            sanitizedValue = stringValue.substring(0, opts.maxLength);
            errors.push("Property '".concat(key, "' truncated to ").concat(opts.maxLength, " characters"));
        }
        // HTML/Script sanitization
        if (!opts.allowHtml) {
            var htmlResult = this.sanitizeHtml(sanitizedValue);
            if (htmlResult.sanitizedValue !== sanitizedValue) {
                sanitizedValue = htmlResult.sanitizedValue;
                errors.push("HTML/script content removed from property '".concat(key, "'"));
            }
        }
        return {
            isValid: errors.length === 0,
            sanitizedValue: sanitizedValue,
            errors: errors,
        };
    };
    /**
     * Validates and sanitizes an entire properties object
     */
    DataValidator.validateProperties = function (properties, options) {
        if (options === void 0) { options = {}; }
        var sanitized = {};
        var allErrors = [];
        for (var _i = 0, _a = Object.entries(properties); _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], value = _b[1];
            // Validate property key
            var keyResult = this.validatePropertyKey(key);
            if (!keyResult.isValid) {
                allErrors.push.apply(allErrors, keyResult.errors);
                continue;
            }
            // Validate property value
            var valueResult = this.validateProperty(key, value, options);
            if (valueResult.sanitizedValue !== null) {
                sanitized[key] = valueResult.sanitizedValue;
            }
            allErrors.push.apply(allErrors, valueResult.errors);
        }
        return { sanitized: sanitized, errors: allErrors };
    };
    DataValidator.validateType = function (value, allowedTypes) {
        var actualType = typeof value;
        if (!allowedTypes.includes(actualType)) {
            return {
                isValid: false,
                sanitizedValue: null,
                errors: ["Invalid type '".concat(actualType, "', expected one of: ").concat(allowedTypes.join(', '))],
            };
        }
        // Additional number validation
        if (actualType === 'number') {
            if (!Number.isFinite(value)) {
                return {
                    isValid: false,
                    sanitizedValue: null,
                    errors: ['Number must be finite'],
                };
            }
        }
        return {
            isValid: true,
            sanitizedValue: value,
            errors: [],
        };
    };
    DataValidator.validatePropertyKey = function (key) {
        var errors = [];
        // Length check
        if (key.length > 40) {
            errors.push("Property key '".concat(key, "' exceeds 40 character limit"));
        }
        // Character validation (alphanumeric + underscore)
        if (!/^[a-zA-Z0-9_]+$/.test(key)) {
            errors.push("Property key '".concat(key, "' contains invalid characters. Use only letters, numbers, and underscores"));
        }
        // Must start with letter
        if (!/^[a-zA-Z]/.test(key)) {
            errors.push("Property key '".concat(key, "' must start with a letter"));
        }
        return {
            isValid: errors.length === 0,
            sanitizedValue: key,
            errors: errors,
        };
    };
    DataValidator.sanitizeHtml = function (value) {
        // Remove HTML tags and script content
        var sanitized = value
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
            .replace(/<[^>]*>/g, '') // Remove all HTML tags
            .replace(/javascript:/gi, '') // Remove javascript: protocol
            .replace(/on\w+\s*=/gi, ''); // Remove event handlers
        // Decode HTML entities
        sanitized = sanitized
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
            .replace(/&quot;/g, '"')
            .replace(/&#x27;/g, "'");
        return {
            isValid: true,
            sanitizedValue: sanitized.trim(),
            errors: [],
        };
    };
    DataValidator.DEFAULT_MAX_LENGTH = 100;
    return DataValidator;
}());
exports.DataValidator = DataValidator;
