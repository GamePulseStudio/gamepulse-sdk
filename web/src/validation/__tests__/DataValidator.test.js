"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DataValidator_1 = require("../DataValidator");
describe('DataValidator', function () {
    describe('validateProperty', function () {
        it('should validate valid string property', function () {
            var result = DataValidator_1.DataValidator.validateProperty('username', 'john_doe');
            expect(result.isValid).toBe(true);
            expect(result.sanitizedValue).toBe('john_doe');
            expect(result.errors).toHaveLength(0);
        });
        it('should validate valid number property', function () {
            var result = DataValidator_1.DataValidator.validateProperty('score', 1500);
            expect(result.isValid).toBe(true);
            expect(result.sanitizedValue).toBe(1500);
            expect(result.errors).toHaveLength(0);
        });
        it('should validate valid boolean property', function () {
            var result = DataValidator_1.DataValidator.validateProperty('completed', true);
            expect(result.isValid).toBe(true);
            expect(result.sanitizedValue).toBe(true);
            expect(result.errors).toHaveLength(0);
        });
        it('should reject invalid type', function () {
            var result = DataValidator_1.DataValidator.validateProperty('data', { nested: 'object' });
            expect(result.isValid).toBe(false);
            expect(result.sanitizedValue).toBe(null);
            expect(result.errors).toContain("Invalid type 'object', expected one of: string, number, boolean");
        });
        it('should truncate long strings', function () {
            var longString = 'a'.repeat(150);
            var result = DataValidator_1.DataValidator.validateProperty('description', longString);
            expect(result.sanitizedValue).toBe('a'.repeat(100));
            expect(result.errors).toContain("Property 'description' truncated to 100 characters");
        });
        it('should strip HTML and scripts', function () {
            var maliciousInput = '<script>alert("xss")</script><p>Hello</p>';
            var result = DataValidator_1.DataValidator.validateProperty('content', maliciousInput);
            expect(result.sanitizedValue).toBe('Hello');
            expect(result.errors).toContain("HTML/script content removed from property 'content'");
        });
        it('should reject infinite numbers', function () {
            var result = DataValidator_1.DataValidator.validateProperty('value', Infinity);
            expect(result.isValid).toBe(false);
            expect(result.sanitizedValue).toBe(null);
            expect(result.errors).toContain('Number must be finite');
        });
    });
    describe('validateProperties', function () {
        it('should validate multiple properties', function () {
            var properties = {
                level: '5',
                score: 1200,
                completed: true,
            };
            var result = DataValidator_1.DataValidator.validateProperties(properties);
            expect(result.sanitized).toEqual(properties);
            expect(result.errors).toHaveLength(0);
        });
        it('should handle mixed valid and invalid properties', function () {
            var properties = {
                validString: 'hello',
                tooLong: 'a'.repeat(150),
                invalidType: { nested: 'object' },
                withHtml: '<b>Bold</b> text',
            };
            var result = DataValidator_1.DataValidator.validateProperties(properties);
            expect(result.sanitized.validString).toBe('hello');
            expect(result.sanitized.tooLong).toBe('a'.repeat(100));
            expect(result.sanitized.invalidType).toBeUndefined();
            expect(result.sanitized.withHtml).toBe('Bold text');
            expect(result.errors.length).toBeGreaterThan(0);
        });
        it('should validate property keys', function () {
            var properties = {
                'valid_key': 'value',
                'invalid-key': 'value',
                '123invalid': 'value',
                'way_too_long_property_key_that_exceeds_limit': 'value',
            };
            var result = DataValidator_1.DataValidator.validateProperties(properties);
            expect(result.sanitized.valid_key).toBe('value');
            expect(result.sanitized['invalid-key']).toBeUndefined();
            expect(result.sanitized['123invalid']).toBeUndefined();
            expect(result.sanitized['way_too_long_property_key_that_exceeds_limit']).toBeUndefined();
            expect(result.errors).toContain("Property key 'invalid-key' contains invalid characters. Use only letters, numbers, and underscores");
            expect(result.errors).toContain("Property key '123invalid' must start with a letter");
            expect(result.errors).toContain("Property key 'way_too_long_property_key_that_exceeds_limit' exceeds 40 character limit");
        });
    });
    describe('HTML sanitization', function () {
        it('should remove script tags', function () {
            var input = 'Hello <script>alert("xss")</script> World';
            var result = DataValidator_1.DataValidator.validateProperty('test', input);
            expect(result.sanitizedValue).toBe('Hello  World');
        });
        it('should remove all HTML tags', function () {
            var input = '<div><p>Hello <strong>World</strong></p></div>';
            var result = DataValidator_1.DataValidator.validateProperty('test', input);
            expect(result.sanitizedValue).toBe('Hello World');
        });
        it('should remove javascript protocols', function () {
            var input = 'Click <a href="javascript:alert()">here</a>';
            var result = DataValidator_1.DataValidator.validateProperty('test', input);
            expect(result.sanitizedValue).toBe('Click here');
        });
        it('should remove event handlers', function () {
            var input = '<img src="x" onerror="alert()" onload="alert()">';
            var result = DataValidator_1.DataValidator.validateProperty('test', input);
            expect(result.sanitizedValue).toBe('');
        });
    });
    describe('PII detection', function () {
        it('should detect email addresses', function () {
            var result = DataValidator_1.DataValidator.validateProperty('test', 'user@example.com');
            expect(result.sanitizedValue).toBe('[REDACTED]');
        });
        it('should detect phone numbers', function () {
            var result = DataValidator_1.DataValidator.validateProperty('test', '555-123-4567');
            expect(result.sanitizedValue).toBe('[REDACTED]');
        });
        it('should detect SSN', function () {
            var result = DataValidator_1.DataValidator.validateProperty('test', '123-45-6789');
            expect(result.sanitizedValue).toBe('[REDACTED]');
        });
        it('should detect credit card numbers', function () {
            var result = DataValidator_1.DataValidator.validateProperty('test', '4111 1111 1111 1111');
            expect(result.sanitizedValue).toBe('[REDACTED]');
        });
    });
});
