import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, X, Image, FileImage } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { validateFile, ALLOWED_MIME_TYPES, sanitizeFileName } from '@/lib/security/file-validation';
import { fileSecurityManager } from '@/lib/security/file-security-enhanced';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number; // in KB
  currentFile?: File | null;
  preview?: boolean;
  disabled?: boolean;
  placeholder?: string;
  category?: 'profileImage' | 'productImage' | 'shopLogo' | 'paymentScreenshot' | 'document';
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  accept = "image/*",
  maxSize = 5120, // 5MB default for product images
  currentFile = null,
  preview = true,
  disabled = false,
  placeholder = "Click to upload file",
  category = 'productImage'
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const validateFileContent = async (file: File): Promise<boolean> => {
    try {
      // Validate MIME type for images
      if (category === 'productImage' || category === 'shopLogo' || category === 'profileImage') {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
          toast({
            title: "Invalid file type",
            description: "Only JPG, PNG, and WebP images are allowed",
            variant: "destructive"
          });
          return false;
        }
      }

      // Enhanced security validation using the security manager
      const securityResult = await fileSecurityManager.performEnhancedValidation(file, category);
      
      if (!securityResult.isValid) {
        toast({
          title: "Security validation failed",
          description: securityResult.errors.join('. '),
          variant: "destructive"
        });
        return false;
      }

      // Log security threats if detected
      if (securityResult.securityThreats.length > 0) {
        console.warn('Security threats detected in file:', securityResult.securityThreats);
        toast({
          title: "Security concerns detected",
          description: "File contains suspicious content and was blocked for security.",
          variant: "destructive"
        });
        return false;
      }

      // Legacy size check for backward compatibility
      if (file.size > maxSize * 1024) {
        toast({
          title: "File too large",
          description: `Please upload a file smaller than ${maxSize}KB`,
          variant: "destructive"
        });
        return false;
      }

      return true;
    } catch (error) {
      console.error('File validation error:', error);
      toast({
        title: "File validation error",
        description: "Failed to validate file. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  const handleFileSelect = async (file: File) => {
    // Sanitize filename
    const sanitizedName = sanitizeFileName(file.name);
    if (sanitizedName !== file.name) {
      console.warn('Filename was sanitized:', { original: file.name, sanitized: sanitizedName });
    }

    const isValid = await validateFileContent(file);
    if (!isValid) return;

    // Create a new file object with sanitized name if needed
    const processedFile = sanitizedName !== file.name 
      ? new File([file], sanitizedName, { type: file.type })
      : file;

    onFileSelect(processedFile);
    
    // Create preview for images
    if (preview && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }

    toast({
      title: "File uploaded successfully",
      description: `${sanitizedName} (${(file.size / 1024).toFixed(1)}KB)`,
      variant: "default"
    });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${dragActive ? 'border-primary bg-primary/10' : 'border-gray-300'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary'}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <Input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled}
        />

        {previewUrl ? (
          <div className="space-y-4">
            <div className="relative inline-block">
              <img
                src={previewUrl}
                alt="Preview"
                className="max-w-full max-h-32 rounded-lg object-cover"
              />
              <Button
                type="button"
                size="sm"
                variant="destructive"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            <p className="text-sm text-green-600">
              ✓ {currentFile?.name} uploaded ({currentFile ? (currentFile.size / 1024).toFixed(1) : '0'}KB)
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center">
              {accept.includes('image/') ? (
                <Image className="h-12 w-12 text-gray-400" />
              ) : (
                <FileImage className="h-12 w-12 text-gray-400" />
              )}
            </div>
            <div>
              <p className="text-primary font-medium">{placeholder}</p>
              <p className="text-sm text-gray-500 mt-1">
                {accept.includes('image/') ? 'PNG, JPG' : 'File'} up to {maxSize}KB
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;