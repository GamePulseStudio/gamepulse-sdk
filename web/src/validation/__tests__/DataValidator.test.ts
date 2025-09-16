import { DataValidator } from '../DataValidator';

describe('DataValidator', () => {
  describe('validateProperty', () => {
    it('should validate valid string property', () => {
      const result = DataValidator.validateProperty('username', 'john_doe');
      expect(result.isValid).toBe(true);
      expect(result.sanitizedValue).toBe('john_doe');
      expect(result.errors).toHaveLength(0);
    });

    it('should validate valid number property', () => {
      const result = DataValidator.validateProperty('score', 1500);
      expect(result.isValid).toBe(true);
      expect(result.sanitizedValue).toBe(1500);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate valid boolean property', () => {
      const result = DataValidator.validateProperty('completed', true);
      expect(result.isValid).toBe(true);
      expect(result.sanitizedValue).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid type', () => {
      const result = DataValidator.validateProperty('data', { nested: 'object' });
      expect(result.isValid).toBe(false);
      expect(result.sanitizedValue).toBe(null);
      expect(result.errors).toContain("Invalid type 'object', expected one of: string, number, boolean");
    });

    it('should truncate long strings', () => {
      const longString = 'a'.repeat(150);
      const result = DataValidator.validateProperty('description', longString);
      expect(result.sanitizedValue).toBe('a'.repeat(100));
      expect(result.errors).toContain("Property 'description' truncated to 100 characters");
    });

    it('should strip HTML and scripts', () => {
      const maliciousInput = '<script>alert("xss")</script><p>Hello</p>';
      const result = DataValidator.validateProperty('content', maliciousInput);
      expect(result.sanitizedValue).toBe('Hello');
      expect(result.errors).toContain("HTML/script content removed from property 'content'");
    });


    it('should reject infinite numbers', () => {
      const result = DataValidator.validateProperty('value', Infinity);
      expect(result.isValid).toBe(false);
      expect(result.sanitizedValue).toBe(null);
      expect(result.errors).toContain('Number must be finite');
    });
  });

  describe('validateProperties', () => {
    it('should validate multiple properties', () => {
      const properties = {
        level: '5',
        score: 1200,
        completed: true,
      };

      const result = DataValidator.validateProperties(properties);
      expect(result.sanitized).toEqual(properties);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle mixed valid and invalid properties', () => {
      const properties = {
        validString: 'hello',
        tooLong: 'a'.repeat(150),
        invalidType: { nested: 'object' },
        withHtml: '<b>Bold</b> text',
      };

      const result = DataValidator.validateProperties(properties);
      
      expect(result.sanitized.validString).toBe('hello');
      expect(result.sanitized.tooLong).toBe('a'.repeat(100));
      expect(result.sanitized.invalidType).toBeUndefined();
      expect(result.sanitized.withHtml).toBe('Bold text');
      
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should validate property keys', () => {
      const properties = {
        'valid_key': 'value',
        'invalid-key': 'value',
        '123invalid': 'value',
        'way_too_long_property_key_that_exceeds_limit': 'value',
      };

      const result = DataValidator.validateProperties(properties);
      
      expect(result.sanitized.valid_key).toBe('value');
      expect(result.sanitized['invalid-key']).toBeUndefined();
      expect(result.sanitized['123invalid']).toBeUndefined();
      expect(result.sanitized['way_too_long_property_key_that_exceeds_limit']).toBeUndefined();
      
      expect(result.errors).toContain("Property key 'invalid-key' contains invalid characters. Use only letters, numbers, and underscores");
      expect(result.errors).toContain("Property key '123invalid' must start with a letter");
      expect(result.errors).toContain("Property key 'way_too_long_property_key_that_exceeds_limit' exceeds 40 character limit");
    });
  });

  describe('HTML sanitization', () => {
    it('should remove script tags', () => {
      const input = 'Hello <script>alert("xss")</script> World';
      const result = DataValidator.validateProperty('test', input);
      expect(result.sanitizedValue).toBe('Hello  World');
    });

    it('should remove all HTML tags', () => {
      const input = '<div><p>Hello <strong>World</strong></p></div>';
      const result = DataValidator.validateProperty('test', input);
      expect(result.sanitizedValue).toBe('Hello World');
    });

    it('should remove javascript protocols', () => {
      const input = 'Click <a href="javascript:alert()">here</a>';
      const result = DataValidator.validateProperty('test', input);
      expect(result.sanitizedValue).toBe('Click here');
    });

    it('should remove event handlers', () => {
      const input = '<img src="x" onerror="alert()" onload="alert()">';
      const result = DataValidator.validateProperty('test', input);
      expect(result.sanitizedValue).toBe('');
    });
  });

  describe('PII detection', () => {
    it('should detect email addresses', () => {
      const result = DataValidator.validateProperty('test', 'user@example.com');
      expect(result.sanitizedValue).toBe('[REDACTED]');
    });

    it('should detect phone numbers', () => {
      const result = DataValidator.validateProperty('test', '555-123-4567');
      expect(result.sanitizedValue).toBe('[REDACTED]');
    });

    it('should detect SSN', () => {
      const result = DataValidator.validateProperty('test', '123-45-6789');
      expect(result.sanitizedValue).toBe('[REDACTED]');
    });

    it('should detect credit card numbers', () => {
      const result = DataValidator.validateProperty('test', '4111 1111 1111 1111');
      expect(result.sanitizedValue).toBe('[REDACTED]');
    });
  });
});
