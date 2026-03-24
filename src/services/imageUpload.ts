/**
 * Image Upload Service
 * Handles image validation and processing before upload
 */

export interface ImageValidationOptions {
  maxSizeInMB?: number;
  allowedFormats?: string[];
}

const DEFAULT_MAX_SIZE = 5; // MB
const DEFAULT_FORMATS = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

/**
 * Validates an image file before upload
 * @param file - The file to validate
 * @param options - Validation options
 * @returns {isValid: boolean, error?: string}
 */
export function validateImageFile(
  file: File,
  options?: ImageValidationOptions
): { isValid: boolean; error?: string } {
  const maxSize = (options?.maxSizeInMB ?? DEFAULT_MAX_SIZE) * 1024 * 1024;
  const allowedFormats = options?.allowedFormats ?? DEFAULT_FORMATS;

  // Check file type
  if (!allowedFormats.includes(file.type)) {
    return {
      isValid: false,
      error: `Invalid file type. Allowed formats: ${allowedFormats.join(', ')}`
    };
  }

  // Check file size
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File size exceeds ${DEFAULT_MAX_SIZE}MB limit`
    };
  }

  return { isValid: true };
}

/**
 * Creates a preview URL for an image file
 * @param file - The image file
 * @returns Promise<string> - Data URL for preview
 */
export function createImagePreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Compresses an image file before upload
 * @param file - The image file to compress
 * @param quality - Compression quality (0-1), default 0.8
 * @returns Promise<File> - Compressed file
 */
export async function compressImage(
  file: File,
  quality: number = 0.8
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Set dimensions
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw and compress
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }
            const compressedFile = new File([blob], file.name, { type: 'image/jpeg' });
            resolve(compressedFile);
          },
          'image/jpeg',
          quality
        );
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
