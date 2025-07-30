// Enhanced file upload security with comprehensive validation

export interface FileSecurityResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  sanitizedFile?: File;
}

export interface FileSecurityOptions {
  maxSize?: number;
  allowedTypes?: string[];
  allowedExtensions?: string[];
  scanForMalware?: boolean;
  checkDimensions?: boolean;
  maxDimensions?: { width: number; height: number };
}

// Dangerous file extensions and MIME types
const DANGEROUS_EXTENSIONS = [
  'exe', 'bat', 'cmd', 'com', 'pif', 'scr', 'vbs', 'js', 'jar',
  'sh', 'ps1', 'php', 'asp', 'aspx', 'jsp', 'pl', 'py', 'rb'
];

const DANGEROUS_MIME_TYPES = [
  'application/x-executable',
  'application/x-msdownload',
  'application/x-msdos-program',
  'text/javascript',
  'application/javascript',
  'text/html',
  'application/x-php'
];

// Magic bytes for common file types (for MIME type verification)
const FILE_SIGNATURES = {
  'image/jpeg': [0xFF, 0xD8, 0xFF],
  'image/png': [0x89, 0x50, 0x4E, 0x47],
  'image/gif': [0x47, 0x49, 0x46],
  'image/webp': [0x52, 0x49, 0x46, 0x46],
  'application/pdf': [0x25, 0x50, 0x44, 0x46]
};

export const validateFileUpload = async (
  file: File, 
  options: FileSecurityOptions = {}
): Promise<FileSecurityResult> => {
  const errors: string[] = [];
  const warnings: string[] = [];

  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    scanForMalware = true,
    checkDimensions = true,
    maxDimensions = { width: 4096, height: 4096 }
  } = options;

  try {
    // 1. File size validation
    if (file.size > maxSize) {
      errors.push(`File size (${Math.round(file.size / 1024)}KB) exceeds maximum allowed size (${Math.round(maxSize / 1024)}KB)`);
    }

    if (file.size === 0) {
      errors.push('File appears to be empty');
    }

    // 2. File extension validation
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
    
    if (DANGEROUS_EXTENSIONS.includes(fileExtension)) {
      errors.push('File type is not allowed for security reasons');
    }

    if (!allowedExtensions.includes(fileExtension)) {
      errors.push(`File extension .${fileExtension} is not allowed`);
    }

    // 3. MIME type validation
    if (DANGEROUS_MIME_TYPES.includes(file.type)) {
      errors.push('File MIME type is not allowed for security reasons');
    }

    if (!allowedTypes.includes(file.type)) {
      errors.push(`File type ${file.type} is not allowed`);
    }

    // 4. File signature verification (magic bytes)
    const buffer = await file.slice(0, 12).arrayBuffer();
    const bytes = new Uint8Array(buffer);
    
    if (allowedTypes.some(type => type.startsWith('image/'))) {
      const isValidImage = await verifyImageSignature(bytes, file.type);
      if (!isValidImage) {
        errors.push('File appears to be corrupted or has mismatched file type');
      }
    }

    // 5. Filename security validation
    const sanitizedName = sanitizeFilename(file.name);
    if (sanitizedName !== file.name) {
      warnings.push('Filename contains potentially unsafe characters');
    }

    // 6. Content scanning for malicious patterns
    if (scanForMalware) {
      const textContent = await extractTextContent(file);
      if (textContent && containsMaliciousPatterns(textContent)) {
        errors.push('File contains potentially malicious content');
      }
    }

    // 7. Image dimensions validation
    if (checkDimensions && file.type.startsWith('image/')) {
      try {
        const dimensions = await getImageDimensions(file);
        if (dimensions.width > maxDimensions.width || dimensions.height > maxDimensions.height) {
          errors.push(`Image dimensions (${dimensions.width}x${dimensions.height}) exceed maximum allowed (${maxDimensions.width}x${maxDimensions.height})`);
        }

        // Check for suspicious dimensions
        if (dimensions.width > 10000 || dimensions.height > 10000) {
          warnings.push('Image has unusually large dimensions');
        }
      } catch (error) {
        warnings.push('Could not verify image dimensions');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      sanitizedFile: errors.length === 0 ? new File([file], sanitizedName, { type: file.type }) : undefined
    };

  } catch (error) {
    console.error('File validation error:', error);
    return {
      isValid: false,
      errors: ['File validation failed due to technical error'],
      warnings: []
    };
  }
};

const verifyImageSignature = async (bytes: Uint8Array, mimeType: string): Promise<boolean> => {
  const signature = FILE_SIGNATURES[mimeType as keyof typeof FILE_SIGNATURES];
  if (!signature) return true; // Skip verification if signature not known

  return signature.every((byte, index) => bytes[index] === byte);
};

const sanitizeFilename = (filename: string): string => {
  // Remove or replace dangerous characters
  return filename
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '_') // Replace dangerous chars with underscore
    .replace(/^\.+/, '') // Remove leading dots
    .replace(/\.+$/, '') // Remove trailing dots
    .substring(0, 255); // Limit length
};

const extractTextContent = async (file: File): Promise<string | null> => {
  try {
    // Only extract text from small files to prevent performance issues
    if (file.size > 1024 * 1024) return null; // Skip files larger than 1MB

    const text = await file.text();
    return text;
  } catch (error) {
    return null;
  }
};

const containsMaliciousPatterns = (content: string): boolean => {
  const maliciousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /onload\s*=/gi,
    /onerror\s*=/gi,
    /eval\s*\(/gi,
    /function\s*\(/gi,
    /\.exe\b/gi,
    /cmd\.exe/gi,
    /powershell/gi
  ];

  return maliciousPatterns.some(pattern => pattern.test(content));
};

const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    img.src = URL.createObjectURL(file);
  });
};

// Enhanced file upload with automatic security scanning
export const secureFileUpload = async (
  file: File,
  uploadFunction: (file: File) => Promise<any>,
  options: FileSecurityOptions = {}
): Promise<{ success: boolean; result?: any; errors: string[]; warnings: string[] }> => {
  try {
    // Validate file security
    const validation = await validateFileUpload(file, options);
    
    if (!validation.isValid) {
      return {
        success: false,
        errors: validation.errors,
        warnings: validation.warnings
      };
    }

    // Upload the sanitized file
    const result = await uploadFunction(validation.sanitizedFile!);
    
    return {
      success: true,
      result,
      errors: [],
      warnings: validation.warnings
    };

  } catch (error) {
    console.error('Secure file upload error:', error);
    return {
      success: false,
      errors: ['File upload failed due to technical error'],
      warnings: []
    };
  }
};