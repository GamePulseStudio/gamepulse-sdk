/**
 * Data validation and sanitization for user properties
 */

export interface ValidationResult {
  isValid: boolean;
  sanitizedValue: any;
  errors: string[];
}

export interface ValidationOptions {
  maxLength: number;
  allowHtml: boolean;
  allowedTypes: string[];
}

export class DataValidator {
  private static readonly DEFAULT_MAX_LENGTH = 100;

  /**
   * Validates and sanitizes a single property value
   */
  static validateProperty(
    key: string,
    value: any,
    options: Partial<ValidationOptions> = {}
  ): ValidationResult {
    const opts: ValidationOptions = {
      maxLength: options.maxLength || this.DEFAULT_MAX_LENGTH,
      allowHtml: options.allowHtml || false,
      allowedTypes: options.allowedTypes || ['string', 'number', 'boolean'],
    };

    const errors: string[] = [];
    let sanitizedValue = value;

    // Type validation
    const typeResult = this.validateType(value, opts.allowedTypes);
    if (!typeResult.isValid) {
      errors.push(...typeResult.errors);
      sanitizedValue = null;
    } else {
      sanitizedValue = typeResult.sanitizedValue;
    }

    // Skip further validation if type is invalid
    if (sanitizedValue === null) {
      return { isValid: false, sanitizedValue: null, errors };
    }

    // Convert to string for further validation
    const stringValue = String(sanitizedValue);

    // Length validation
    if (stringValue.length > opts.maxLength) {
      sanitizedValue = stringValue.substring(0, opts.maxLength);
      errors.push(`Property '${key}' truncated to ${opts.maxLength} characters`);
    }

    // HTML/Script sanitization
    if (!opts.allowHtml) {
      const htmlResult = this.sanitizeHtml(sanitizedValue);
      if (htmlResult.sanitizedValue !== sanitizedValue) {
        sanitizedValue = htmlResult.sanitizedValue;
        errors.push(`HTML/script content removed from property '${key}'`);
      }
    }


    return {
      isValid: errors.length === 0,
      sanitizedValue,
      errors,
    };
  }

  /**
   * Validates and sanitizes an entire properties object
   */
  static validateProperties(
    properties: Record<string, any>,
    options: Partial<ValidationOptions> = {}
  ): { sanitized: Record<string, any>; errors: string[] } {
    const sanitized: Record<string, any> = {};
    const allErrors: string[] = [];

    for (const [key, value] of Object.entries(properties)) {
      // Validate property key
      const keyResult = this.validatePropertyKey(key);
      if (!keyResult.isValid) {
        allErrors.push(...keyResult.errors);
        continue;
      }

      // Validate property value
      const valueResult = this.validateProperty(key, value, options);
      if (valueResult.sanitizedValue !== null) {
        sanitized[key] = valueResult.sanitizedValue;
      }
      allErrors.push(...valueResult.errors);
    }

    return { sanitized, errors: allErrors };
  }

  private static validateType(
    value: any,
    allowedTypes: string[]
  ): ValidationResult {
    const actualType = typeof value;
    
    if (!allowedTypes.includes(actualType)) {
      return {
        isValid: false,
        sanitizedValue: null,
        errors: [`Invalid type '${actualType}', expected one of: ${allowedTypes.join(', ')}`],
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
  }

  private static validatePropertyKey(key: string): ValidationResult {
    const errors: string[] = [];

    // Length check
    if (key.length > 40) {
      errors.push(`Property key '${key}' exceeds 40 character limit`);
    }

    // Character validation (alphanumeric + underscore)
    if (!/^[a-zA-Z0-9_]+$/.test(key)) {
      errors.push(`Property key '${key}' contains invalid characters. Use only letters, numbers, and underscores`);
    }

    // Must start with letter
    if (!/^[a-zA-Z]/.test(key)) {
      errors.push(`Property key '${key}' must start with a letter`);
    }

    return {
      isValid: errors.length === 0,
      sanitizedValue: key,
      errors,
    };
  }

  private static sanitizeHtml(value: string): ValidationResult {
    // Remove HTML tags and script content
    let sanitized = value
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
  }

}
