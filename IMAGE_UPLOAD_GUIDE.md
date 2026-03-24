# Image Upload Implementation Guide

## Summary

You now have a complete image upload system for user profile pictures. The implementation includes:

### ✅ Completed Frontend Components

1. **Settings Page** ([Settings.tsx](src/pages/settings/Settings.tsx))
   - File input for image selection
   - Real-time image preview
   - Validation (file type and size)
   - API integration with FormData
   - Success/error feedback

2. **Image Upload Service** ([imageUpload.ts](src/services/imageUpload.ts))
   - File validation utility
   - Image preview generation
   - Optional image compression
   - Reusable across the app

3. **Custom Hook** ([useImageUpload.ts](src/hooks/useImageUpload.ts))
   - `useImageUpload()` hook for reusable state management
   - Built-in validation and preview handling
   - Error handling and callbacks

4. **Reusable Component** ([ImageUpload.tsx](src/components/common/ImageUpload.tsx))
   - Drop-in image upload component
   - Customizable sizes and styling
   - Can be used anywhere in the app

### 🔧 How It Works

#### Frontend Flow
1. User selects image from device
2. Frontend validates file (type & size)
3. Preview is generated (base64)
4. User submits form
5. If new image selected: POST to `/members/{memberId}/profile-image` with FormData
6. Backend returns new image URL
7. Profile is updated and event dispatched

#### API Calls

**When uploading a new image:**
```
POST /api/v1/members/{memberId}/profile-image
Content-Type: multipart/form-data

Body:
- profileImage: File
- dateOfBirth: string (optional)

Response:
{
  "success": true,
  "profileImageUrl": "https://..."
}
```

**When updating without image:**
```
PUT /api/v1/members/{memberId}/profile
Content-Type: application/json

Body: { "dateOfBirth": "..." }
```

---

## Setup Instructions

### 1. Backend Implementation Required

The backend team needs to implement these endpoints:

**See:** [API_IMAGE_UPLOAD_REQUIREMENTS.md](API_IMAGE_UPLOAD_REQUIREMENTS.md)

Key endpoint:
- `POST /api/v1/members/{memberId}/profile-image` - Image upload with FormData

---

### 2. Frontend is Ready for Use

The Settings page is already configured. No additional setup needed on frontend.

#### Usage in Settings Page:
```tsx
// The Settings page already handles:
- File selection via input[type="file"]
- Image validation (type & size)
- Preview generation
- API upload with FormData
- Error handling and success messages
```

---

### 3. Using in Other Components

If you need image upload elsewhere, use the **ImageUpload component**:

```tsx
import ImageUpload from '@/components/common/ImageUpload';
import { api } from '@/services/api';

export default function MyComponent() {
  const handleImageSelect = async (file: File, preview: string) => {
    const formData = new FormData();
    formData.append('profileImage', file);
    
    try {
      const response = await api.post('/members/123/profile-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      // Handle success
    } catch (error) {
      // Handle error
    }
  };

  return (
    <ImageUpload 
      onImageSelect={handleImageSelect}
      currentImageUrl="https://..."
      label="Upload Photo"
      previewSize="large"
    />
  );
}
```

Or use the **useImageUpload hook** for custom UI:

```tsx
import { useImageUpload } from '@/hooks/useImageUpload';

export default function CustomImageUpload() {
  const {
    selectedFile,
    imagePreview,
    error,
    isLoading,
    handleImageChange,
    clearImage
  } = useImageUpload({
    onSuccess: (preview, file) => {
      console.log('Image selected:', file);
    },
    onError: (error) => {
      alert(error);
    }
  });

  return (
    <div>
      <input 
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        disabled={isLoading}
      />
      {imagePreview && <img src={imagePreview} alt="Preview" />}
      {error && <p className="text-red-600">{error}</p>}
    </div>
  );
}
```

---

## File Structure

```
src/
├── components/
│   └── common/
│       └── ImageUpload.tsx          ← Reusable upload component
├── hooks/
│   └── useImageUpload.ts            ← Custom hook for image upload
├── pages/
│   └── settings/
│       └── Settings.tsx             ← Updated with image upload
├── services/
│   ├── api.ts                       ← API client (unchanged)
│   └── imageUpload.ts               ← Image utilities
└── API_IMAGE_UPLOAD_REQUIREMENTS.md ← Backend docs
```

---

## Validation Rules

### Frontend Validation
- **File types:** JPEG, PNG, GIF, WebP
- **Max size:** 5MB
- **Error handling:** User-friendly alerts and messages

### Recommended Backend Validation
- Re-validate MIME type on server
- Scan for malware
- Re-validate file size
- Use secure file naming (UUID)

---

## Features Implemented

✅ File selection with preview
✅ Client-side validation (type & size)
✅ Base64 preview generation
✅ FormData API integration
✅ Error handling and messages
✅ Loading states
✅ Reusable components and hooks
✅ Dark mode support
✅ TypeScript support

---

## Next Steps

### Backend Team Actions:
1. Implement `POST /members/{memberId}/profile-image` endpoint
2. Store image files (local or cloud storage)
3. Return profileImageUrl in response
4. Add database columns for image metadata
5. Implement security measures (malware scanning, etc.)

### Frontend Team Actions:
1. ✅ Code is ready - Settings page works out of the box
2. Test once backend endpoints are ready
3. Optionally use ImageUpload component in other parts of the app
4. Add image cropping if desired (optional enhancement)

### Optional Enhancements:
- Image cropping before upload (`react-image-crop`)
- Drag-and-drop upload
- Image optimization/resizing
- Multiple image formats support
- Image gallery for past uploads

---

## Testing

### Frontend Testing Checklist
- [ ] Select image file
- [ ] Preview displays correctly
- [ ] Validation works (reject large/invalid files)
- [ ] Form submission
- [ ] Wait for backend endpoints
- [ ] Verify image displays in profile after upload
- [ ] Test switching between existing and new image
- [ ] Test dark mode display

### Backend Testing Checklist
- [ ] Endpoint accepts multipart/form-data
- [ ] Image file is stored correctly
- [ ] Returns correct profileImageUrl
- [ ] Validation works (file type, size)
- [ ] Security measures are in place
- [ ] Old images are handled (replace/cleanup)

---

## Common Issues & Solutions

### Issue: File not uploading
**Solution:** Check that backend endpoint is implemented and returns correct format

### Issue: Preview not showing
**Solution:** Check image file format, ensure it's a valid image type

### Issue: CORS errors
**Solution:** Backend must have proper CORS headers configured

### Issue: FormData not sending correctly
**Solution:** Make sure NOT to set `Content-Type: application/json` with FormData. Let axios handle it or explicitly set to `multipart/form-data`

---

## Documentation Files

- **This file:** Implementation guide and usage instructions
- **API_IMAGE_UPLOAD_REQUIREMENTS.md:** Detailed API specification for backend team
- **Code comments:** Inline documentation in all source files

For questions or issues, refer to the inline code comments or API requirements document.
