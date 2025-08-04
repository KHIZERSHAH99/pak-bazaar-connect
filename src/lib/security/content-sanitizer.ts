import DOMPurify from 'dompurify';
import { supabase } from '@/integrations/supabase/client';

export interface SanitizationResult {
  sanitizedContent: string;
  isModified: boolean;
  removedTags: string[];
  securityThreats: string[];
}

export const sanitizeHtmlContent = (content: string): SanitizationResult => {
  const originalContent = content;
  const removedTags: string[] = [];
  const securityThreats: string[] = [];

  // Check for dangerous content before sanitization
  const dangerousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
    /<form/gi,
    /<style/gi
  ];

  dangerousPatterns.forEach(pattern => {
    if (pattern.test(content)) {
      securityThreats.push(`Detected dangerous pattern: ${pattern.source}`);
    }
  });

  // Configure DOMPurify for safe HTML sanitization
  const cleanContent = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote', 'a', 'img', 'div', 'span'
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class'],
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input'],
    FORBID_ATTR: ['onclick', 'onload', 'onerror', 'onmouseover', 'onfocus', 'onblur'],
    KEEP_CONTENT: true
  });

  const isModified = originalContent !== cleanContent;

  // Log security events if threats were detected
  if (securityThreats.length > 0) {
    logSecurityThreat('content_sanitization', {
      threatsDetected: securityThreats,
      removedTags,
      originalLength: originalContent.length,
      cleanedLength: cleanContent.length
    });
  }

  return {
    sanitizedContent: cleanContent,
    isModified,
    removedTags,
    securityThreats
  };
};

export const sanitizeUserInput = (input: string, maxLength: number = 1000): string => {
  if (!input) return '';
  
  // Basic input sanitization
  let sanitized = input
    .trim()
    .slice(0, maxLength)
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .replace(/data:/gi, ''); // Remove data: protocol
  
  return sanitized;
};

const logSecurityThreat = async (eventType: string, details: any) => {
  try {
    await supabase.rpc('log_audit_event', {
      p_user_id: (await supabase.auth.getUser()).data.user?.id,
      p_event_type: eventType,
      p_new_values: JSON.stringify(details)
    });
  } catch (error) {
    console.error('Failed to log security threat:', error);
  }
};

export const isContentSafe = (content: string): boolean => {
  const dangerousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /data:(?!image\/)/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
    /<form/gi
  ];

  return !dangerousPatterns.some(pattern => pattern.test(content));
};