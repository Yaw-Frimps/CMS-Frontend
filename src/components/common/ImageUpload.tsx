/**
 * ImageUpload Component
 * Reusable image upload component with preview
 */

import { Upload, X, AlertCircle } from 'lucide-react';
import { useImageUpload } from '../../hooks/useImageUpload';

interface ImageUploadProps {
  onImageSelect: (file: File, preview: string) => void;
  currentImageUrl?: string;
  label?: string;
  helpText?: string;
  className?: string;
  previewSize?: 'small' | 'medium' | 'large';
  disabled?: boolean;
}

const PREVIEW_SIZES = {
  small: 'w-20 h-20',
  medium: 'w-32 h-32',
  large: 'w-48 h-48'
};

export default function ImageUpload({
  onImageSelect,
  currentImageUrl,
  label = 'Profile Image',
  helpText = 'Accepted formats: JPG, PNG, GIF, WebP. Max size: 5MB',
  className = '',
  previewSize = 'medium',
  disabled = false
}: ImageUploadProps) {
  const { 
    selectedFile, 
    imagePreview, 
    error, 
    isLoading, 
    handleImageChange, 
    clearImage 
  } = useImageUpload({
    onSuccess: (preview, file) => {
      onImageSelect(file, preview);
    }
  });

  const displayPreview = imagePreview || currentImageUrl;

  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
        {label}
      </label>

      {/* Preview */}
      {displayPreview && (
        <div className="relative inline-block">
          <img 
            src={displayPreview} 
            alt="Preview" 
            className={`${PREVIEW_SIZES[previewSize]} object-cover rounded-lg border border-gray-200 dark:border-gray-700`}
          />
          {imagePreview && (
            <button
              type="button"
              onClick={clearImage}
              className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
              aria-label="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* File Input */}
      <div className="relative">
        <input 
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          disabled={disabled || isLoading}
          className="w-full px-4 py-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all duration-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 dark:file:bg-primary-900/20 file:text-primary-700 dark:file:text-primary-400 hover:file:bg-primary-100 dark:hover:file:bg-primary-900/30 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={label}
        />
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-gray-900/50 rounded-lg">
            <div className="animate-spin">
              <Upload className="w-4 h-4 text-primary-500" />
            </div>
          </div>
        )}
      </div>

      {/* Help Text */}
      <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">
        {helpText}
      </p>

      {/* Selected File Info */}
      {selectedFile && (
        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-sm text-blue-700 dark:text-blue-400">
          ✓ Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
        </div>
      )}
    </div>
  );
}
