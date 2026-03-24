/**
 * useImageUpload Hook
 * Provides reusable image upload state and handlers
 */

import { useState, useCallback } from 'react';
import { validateImageFile, createImagePreview } from '../services/imageUpload';

interface UseImageUploadOptions {
  maxSizeInMB?: number;
  allowedFormats?: string[];
  onSuccess?: (preview: string, file: File) => void;
  onError?: (error: string) => void;
}

interface UseImageUploadReturn {
  selectedFile: File | null;
  imagePreview: string | null;
  error: string | null;
  isLoading: boolean;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  clearImage: () => void;
  setImagePreview: (preview: string | null) => void;
}

export function useImageUpload(options?: UseImageUploadOptions): UseImageUploadReturn {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreviewState] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleImageChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      setError(null);

      if (!file) return;

      // Validate file
      const validation = validateImageFile(file, {
        maxSizeInMB: options?.maxSizeInMB,
        allowedFormats: options?.allowedFormats
      });

      if (!validation.isValid) {
        const errorMsg = validation.error || 'Invalid image file';
        setError(errorMsg);
        options?.onError?.(errorMsg);
        return;
      }

      try {
        setIsLoading(true);
        setSelectedFile(file);

        // Create preview
        const preview = await createImagePreview(file);
        setImagePreviewState(preview);
        options?.onSuccess?.(preview, file);
      } catch (err) {
        const errorMsg = 'Failed to process image';
        setError(errorMsg);
        options?.onError?.(errorMsg);
        console.error('Image processing error:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [options]
  );

  const clearImage = useCallback(() => {
    setSelectedFile(null);
    setImagePreviewState(null);
    setError(null);
  }, []);

  return {
    selectedFile,
    imagePreview,
    error,
    isLoading,
    handleImageChange,
    clearImage,
    setImagePreview: setImagePreviewState
  };
}
