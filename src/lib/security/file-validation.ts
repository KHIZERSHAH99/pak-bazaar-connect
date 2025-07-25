export interface FileValidationResult {
  isValid: boolean;
  errors: string[];
  metadata?: {
    size: number;
    type: string;
    name: string;
  };
}

// Allowed MIME types for each category
export const ALLOWED_MIME_TYPES = {
  images: [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp',
    'image/gif'
  ],
  documents: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
};

// Maximum file sizes (in bytes)
export const MAX_FILE_SIZES = {
  profileImage: 2 * 1024 * 1024,    // 2MB
  productImage: 5 * 1024 * 1024,    // 5MB
  shopLogo: 1 * 1024 * 1024,        // 1MB
  paymentScreenshot: 3 * 1024 * 1024, // 3MB
  document: 10 * 1024 * 1024         // 10MB
} as const;

// Dangerous file extensions to always block
const DANGEROUS_EXTENSIONS = [
  'exe', 'bat', 'cmd', 'com', 'pif', 'scr', 'vbs', 'js', 'jar',
  'php', 'asp', 'aspx', 'jsp', 'py', 'rb', 'pl', 'sh', 'ps1'
];

// Magic number signatures for common file types
const FILE_SIGNATURES: Record<string, number[][]> = {
  'image/jpeg': [[0xFF, 0xD8, 0xFF]],
  'image/png': [[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]],
  'image/gif': [[0x47, 0x49, 0x46, 0x38], [0x47, 0x49, 0x46, 0x39]],
  'image/webp': [[0x52, 0x49, 0x46, 0x46]], // RIFF header, WEBP checked separately
  'application/pdf': [[0x25, 0x50, 0x44, 0x46]] // %PDF
};

export const validateFileContent = async (file: File): Promise<boolean> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer;
      if (!arrayBuffer) {
        resolve(false);
        return;
      }
      
      const bytes = new Uint8Array(arrayBuffer.slice(0, 16)); // Read first 16 bytes
      const signatures = FILE_SIGNATURES[file.type];
      
      if (!signatures) {
        // If we don't have signatures for this type, rely on MIME type validation
        resolve(true);
        return;
      }
      
      // Check if any signature matches
      const isValid = signatures.some(signature => {
        return signature.every((byte, index) => bytes[index] === byte);
      });
      
      // Special case for WebP - check for WEBP string after RIFF
      if (file.type === 'image/webp' && bytes[0] === 0x52 && bytes[1] === 0x49) {
        const webpCheck = Array.from(bytes.slice(8, 12));
        const webpSignature = [0x57, 0x45, 0x42, 0x50]; // WEBP
        resolve(webpSignature.every((byte, index) => webpCheck[index] === byte));
        return;
      }
      
      resolve(isValid);
    };
    
    reader.onerror = () => resolve(false);
    reader.readAsArrayBuffer(file.slice(0, 16));
  });
};

export const validateFileName = (fileName: string): boolean => {
  // Check for dangerous extensions
  const extension = fileName.split('.').pop()?.toLowerCase();
  if (extension && DANGEROUS_EXTENSIONS.includes(extension)) {
    return false;
  }
  
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /\.(exe|bat|cmd)$/i,
    /[<>:"/\\|?*]/,  // Invalid filename characters
    /^\./,           // Hidden files
    /\s+$/,          // Trailing spaces
    /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i // Windows reserved names
  ];
  
  return !suspiciousPatterns.some(pattern => pattern.test(fileName));
};

export const validateFileSize = (file: File, category: keyof typeof MAX_FILE_SIZES): boolean => {
  const maxSize = MAX_FILE_SIZES[category];
  return file.size <= maxSize;
};

export const validateMimeType = (file: File, allowedTypes: string[]): boolean => {
  return allowedTypes.includes(file.type);
};

export const sanitizeFileName = (fileName: string): string => {
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special chars with underscore
    .replace(/_{2,}/g, '_')          // Replace multiple underscores with single
    .replace(/^_+|_+$/g, '')        // Remove leading/trailing underscores
    .slice(0, 100);                 // Limit length
};

export const validateFile = async (
  file: File, 
  category: keyof typeof MAX_FILE_SIZES,
  allowedTypes: string[]
): Promise<FileValidationResult> => {
  const errors: string[] = [];
  
  // Validate file name
  if (!validateFileName(file.name)) {
    errors.push('Invalid file name or potentially dangerous file type');
  }
  
  // Validate file size
  if (!validateFileSize(file, category)) {
    const maxSizeMB = (MAX_FILE_SIZES[category] / (1024 * 1024)).toFixed(1);
    errors.push(`File size must not exceed ${maxSizeMB}MB`);
  }
  
  // Validate MIME type
  if (!validateMimeType(file, allowedTypes)) {
    errors.push(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`);
  }
  
  // Validate file content (magic numbers)
  if (allowedTypes.some(type => type.startsWith('image/'))) {
    const isValidContent = await validateFileContent(file);
    if (!isValidContent) {
      errors.push('File content does not match the declared file type');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    metadata: {
      size: file.size,
      type: file.type,
      name: file.name
    }
  };
};

// Specific validation functions for different use cases
export const validateProfileImage = (file: File) => 
  validateFile(file, 'profileImage', [...ALLOWED_MIME_TYPES.images]);

export const validateProductImage = (file: File) => 
  validateFile(file, 'productImage', [...ALLOWED_MIME_TYPES.images]);

export const validateShopLogo = (file: File) => 
  validateFile(file, 'shopLogo', [...ALLOWED_MIME_TYPES.images]);

export const validatePaymentScreenshot = (file: File) => 
  validateFile(file, 'paymentScreenshot', [...ALLOWED_MIME_TYPES.images]);

export const validateDocument = (file: File) => 
  validateFile(file, 'document', [...ALLOWED_MIME_TYPES.documents]);