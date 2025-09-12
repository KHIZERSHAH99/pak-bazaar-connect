import { supabase } from '@/integrations/supabase/client';

/**
 * Client-side field encryption utilities
 * Note: For production, consider using Web Crypto API for stronger encryption
 */

export class FieldEncryption {
  private static encoder = new TextEncoder();
  private static decoder = new TextDecoder();

  /**
   * Mask sensitive data for display
   */
  static maskSensitiveField(value: string | null | undefined, type: 'phone' | 'email' | 'account' | 'cnic'): string {
    if (!value) return '';

    switch (type) {
      case 'phone':
        // Show only last 4 digits: ****1234
        return value.length > 4 ? '****' + value.slice(-4) : '****';
      
      case 'email':
        // Show first char and domain: a****@example.com
        const [localPart, domain] = value.split('@');
        if (!domain) return '****';
        return localPart[0] + '****@' + domain;
      
      case 'account':
        // Show only last 4 digits
        return value.length > 4 ? 'XXXX-XXXX-' + value.slice(-4) : 'XXXX';
      
      case 'cnic':
        // Show format: *****-*******-*
        return value.length > 0 ? '*****-*******-' + value.slice(-1) : '*****-*******-*';
      
      default:
        return '[REDACTED]';
    }
  }

  /**
   * Check if a field should be encrypted based on its name
   */
  static shouldEncrypt(fieldName: string): boolean {
    const encryptedFields = [
      'cnic_image',
      'selfie_image',
      'account_number',
      'jazzcash_number',
      'easypaisa_number',
      'bank_account',
      'ntn_number',
      'strn_number'
    ];

    return encryptedFields.some(field => 
      fieldName.toLowerCase().includes(field.toLowerCase())
    );
  }

  /**
   * Sanitize file path to prevent directory traversal
   */
  static sanitizeFilePath(path: string): string {
    // Remove any directory traversal attempts
    return path.replace(/\.\./g, '').replace(/[^a-zA-Z0-9\-\_\.\/]/g, '');
  }

  /**
   * Validate file upload for security
   */
  static validateFileUpload(file: File): { valid: boolean; error?: string } {
    const MAX_SIZE = 100 * 1024; // 100KB
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
    
    if (file.size > MAX_SIZE) {
      return { valid: false, error: 'File size must be less than 100KB' };
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return { valid: false, error: 'Only JPEG, PNG, and WebP images are allowed' };
    }

    // Check file extension matches MIME type
    const extension = file.name.split('.').pop()?.toLowerCase();
    const expectedExtensions: Record<string, string[]> = {
      'image/jpeg': ['jpg', 'jpeg'],
      'image/png': ['png'],
      'image/webp': ['webp']
    };

    const validExtensions = expectedExtensions[file.type] || [];
    if (!extension || !validExtensions.includes(extension)) {
      return { valid: false, error: 'File extension does not match file type' };
    }

    return { valid: true };
  }

  /**
   * Generate secure random filename
   */
  static generateSecureFilename(originalName: string): string {
    const extension = originalName.split('.').pop()?.toLowerCase() || '';
    const randomBytes = new Uint8Array(16);
    crypto.getRandomValues(randomBytes);
    const randomHex = Array.from(randomBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    return `${randomHex}.${extension}`;
  }
}

/**
 * Secure data handling utilities
 */
export class SecureDataHandler {
  /**
   * Clear sensitive data from memory
   */
  static clearSensitiveData(data: any): void {
    if (typeof data === 'object' && data !== null) {
      const sensitiveFields = [
        'password',
        'cnic',
        'selfie',
        'account_number',
        'jazzcash',
        'easypaisa',
        'token',
        'secret'
      ];

      for (const key in data) {
        if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
          delete data[key];
        }
      }
    }
  }

  /**
   * Redact sensitive data from logs
   */
  static redactForLogging(data: any): any {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    const cloned = JSON.parse(JSON.stringify(data));
    
    const sensitivePatterns = [
      /password/i,
      /token/i,
      /secret/i,
      /cnic/i,
      /account/i,
      /jazzcash/i,
      /easypaisa/i,
      /api[_-]?key/i
    ];

    function redact(obj: any): void {
      for (const key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          redact(obj[key]);
        } else if (sensitivePatterns.some(pattern => pattern.test(key))) {
          obj[key] = '[REDACTED]';
        }
      }
    }

    redact(cloned);
    return cloned;
  }
}