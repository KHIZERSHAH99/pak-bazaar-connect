import { validateFile, ALLOWED_MIME_TYPES, MAX_FILE_SIZES, FileValidationResult } from './file-validation';
import { supabase } from '@/integrations/supabase/client';

// Enhanced file security with virus scanning simulation and advanced validation
export class FileSecurityManager {
  private readonly VIRUS_SCAN_PATTERNS = [
    // Suspicious binary patterns (simplified simulation)
    /(\x4D\x5A|\x50\x4B)/g, // PE/ZIP headers in unexpected files
    /<script[^>]*>[\s\S]*?<\/script>/gi, // Script tags in uploaded files
    /javascript:/gi, // JavaScript URLs
    /vbscript:/gi, // VBScript URLs
    /data:text\/html/gi, // HTML data URLs
  ];

  private readonly MALICIOUS_EXTENSIONS = [
    'exe', 'bat', 'cmd', 'com', 'pif', 'scr', 'vbs', 'js', 'jar',
    'php', 'asp', 'aspx', 'jsp', 'py', 'rb', 'pl', 'sh', 'ps1',
    'msi', 'dll', 'sys', 'app', 'deb', 'rpm', 'dmg', 'pkg'
  ];

  async performEnhancedValidation(file: File, category: keyof typeof MAX_FILE_SIZES): Promise<{
    isValid: boolean;
    errors: string[];
    securityThreats: string[];
    metadata: any;
  }> {
    const errors: string[] = [];
    const securityThreats: string[] = [];

    // Basic file validation first
    const allowedTypes = category === 'document' 
      ? ALLOWED_MIME_TYPES.documents 
      : ALLOWED_MIME_TYPES.images;
    
    const basicValidation = await validateFile(file, category, allowedTypes);
    
    if (!basicValidation.isValid) {
      errors.push(...basicValidation.errors);
    }

    // Enhanced security checks
    const securityChecks = await this.performSecurityChecks(file);
    securityThreats.push(...securityChecks.threats);

    // File content analysis
    const contentAnalysis = await this.analyzeFileContent(file);
    if (!contentAnalysis.isSafe) {
      securityThreats.push(...contentAnalysis.threats);
    }

    // Log security events
    if (securityThreats.length > 0) {
      await this.logSecurityEvent('malicious_file_detected', {
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        threats: securityThreats
      });
    }

    return {
      isValid: basicValidation.isValid && securityThreats.length === 0,
      errors,
      securityThreats,
      metadata: {
        ...basicValidation.metadata,
        scanTimestamp: new Date().toISOString(),
        threatLevel: securityThreats.length > 0 ? 'HIGH' : 'LOW'
      }
    };
  }

  private async performSecurityChecks(file: File): Promise<{
    threats: string[];
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  }> {
    const threats: string[] = [];

    // Check file extension against malicious list
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension && this.MALICIOUS_EXTENSIONS.includes(extension)) {
      threats.push(`Dangerous file extension detected: .${extension}`);
    }

    // Check for double extensions (e.g., file.pdf.exe)
    const parts = file.name.split('.');
    if (parts.length > 2) {
      const lastTwo = parts.slice(-2).join('.');
      if (this.MALICIOUS_EXTENSIONS.some(ext => lastTwo.includes(ext))) {
        threats.push('Suspicious double extension detected');
      }
    }

    // Check for suspicious file names
    const suspiciousNames = [
      /autorun\.inf/i,
      /desktop\.ini/i,
      /thumbs\.db/i,
      /\.htaccess/i,
      /config\.(php|asp|jsp)/i
    ];

    if (suspiciousNames.some(pattern => pattern.test(file.name))) {
      threats.push('Suspicious file name detected');
    }

    // Check file size anomalies
    if (file.size === 0) {
      threats.push('Zero-byte file detected');
    } else if (file.size > 100 * 1024 * 1024) { // 100MB
      threats.push('Unusually large file size');
    }

    const riskLevel = threats.length > 2 ? 'HIGH' : threats.length > 0 ? 'MEDIUM' : 'LOW';

    return { threats, riskLevel };
  }

  private async analyzeFileContent(file: File): Promise<{
    isSafe: boolean;
    threats: string[];
  }> {
    const threats: string[] = [];

    try {
      // Read file content for analysis
      const content = await this.readFileAsText(file);
      
      // Check for virus-like patterns
      for (const pattern of this.VIRUS_SCAN_PATTERNS) {
        if (pattern.test(content)) {
          threats.push('Malicious pattern detected in file content');
          break;
        }
      }

      // Check for embedded scripts in images
      if (file.type.startsWith('image/')) {
        if (content.includes('<script') || content.includes('javascript:')) {
          threats.push('Script injection detected in image file');
        }
      }

      // Check for suspicious URLs in content
      const urlPattern = /(https?:\/\/[^\s]+)/g;
      const urls = content.match(urlPattern);
      if (urls && urls.length > 10) {
        threats.push('Excessive URLs detected in file');
      }

      // Check for base64 encoded payloads
      const base64Pattern = /data:.*base64,([A-Za-z0-9+/=]+)/g;
      const base64Matches = content.match(base64Pattern);
      if (base64Matches && base64Matches.some(match => match.length > 1000)) {
        threats.push('Suspicious base64 payload detected');
      }

    } catch (error) {
      // If we can't read the file, it might be binary - that's okay for images
      if (!file.type.startsWith('image/')) {
        threats.push('Unable to analyze file content');
      }
    }

    return {
      isSafe: threats.length === 0,
      threats
    };
  }

  private async readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(file.slice(0, 10000)); // Read first 10KB only
    });
  }

  async quarantineFile(fileName: string, reason: string): Promise<void> {
    await this.logSecurityEvent('file_quarantined', {
      fileName,
      reason,
      timestamp: new Date().toISOString()
    });
  }

  async validatePaymentScreenshot(file: File): Promise<FileValidationResult & {
    securityAnalysis: {
      isSecure: boolean;
      threats: string[];
    };
  }> {
    const basicValidation = await validateFile(file, 'paymentScreenshot', ALLOWED_MIME_TYPES.images);
    const securityValidation = await this.performEnhancedValidation(file, 'paymentScreenshot');

    return {
      ...basicValidation,
      securityAnalysis: {
        isSecure: securityValidation.securityThreats.length === 0,
        threats: securityValidation.securityThreats
      }
    };
  }

  private async logSecurityEvent(eventType: string, details: any): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.rpc('log_audit_event', {
        p_user_id: user?.id,
        p_event_type: eventType,
        p_table_name: 'file_security',
        p_new_values: JSON.stringify(details)
      });
    } catch (error) {
      console.error('Failed to log file security event:', error);
    }
  }

  // Whitelist validation for critical file types
  isWhitelistedImageType(mimeType: string): boolean {
    const whitelistedTypes = [
      'image/jpeg',
      'image/png', 
      'image/webp',
      'image/gif'
    ];
    return whitelistedTypes.includes(mimeType);
  }

  // Generate secure filename
  generateSecureFileName(originalName: string): string {
    const extension = originalName.split('.').pop()?.toLowerCase();
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    
    return `secure_${timestamp}_${randomString}.${extension}`;
  }
}

// Export singleton instance
export const fileSecurityManager = new FileSecurityManager();
export default fileSecurityManager;