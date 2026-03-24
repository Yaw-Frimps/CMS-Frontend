# Image Upload Feature - Code Changes Summary

## What Was Changed

### 1. Settings.tsx - Main Profile Page

#### Before:
```tsx
// Had manual URL input
<div>
  <label>Profile Image URL</label>
  <input 
    type="url"
    placeholder="https://example.com/my-photo.jpg"
    value={profileData.profileImageUrl}
    onChange={(e) => setProfileData({...profileData, profileImageUrl: e.target.value})}
  />
</div>
```

#### After:
```tsx
// Now has file upload with preview
const [selectedFile, setSelectedFile] = useState<File | null>(null);
const [imagePreview, setImagePreview] = useState<string | null>(null);

const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    // Validate file type & size
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }
    
    setSelectedFile(file);
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }
};

// UI with preview and file input
<div>
  <label>Profile Image</label>
  {imagePreview && (
    <img src={imagePreview} alt="Preview" className="w-32 h-32 rounded-lg" />
  )}
  <input 
    type="file"
    accept="image/*"
    onChange={handleImageChange}
  />
</div>
```

#### API Call Changes:

Before:
```tsx
await api.put(`/members/${user.memberId}/profile`, profileData);
```

After:
```tsx
if (selectedFile) {
  const formData = new FormData();
  formData.append('profileImage', selectedFile);
  formData.append('dateOfBirth', profileData.dateOfBirth);
  
  const response = await api.post(
    `/members/${user.memberId}/profile-image`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  
  // Update with returned URL
  setProfileData(prev => ({
    ...prev,
    profileImageUrl: response.data.profileImageUrl
  }));
} else {
  // Just update profile without image
  await api.put(`/members/${user.memberId}/profile`, {
    dateOfBirth: profileData.dateOfBirth
  });
}
```

---

## New Files Created

### 1. src/services/imageUpload.ts
Utilities for image handling:
- `validateImageFile()` - Validate image type and size
- `createImagePreview()` - Generate base64 preview
- `compressImage()` - Optional compression

### 2. src/hooks/useImageUpload.ts
Custom React hook for reusable image upload logic:
```tsx
const { selectedFile, imagePreview, error, handleImageChange, clearImage } = useImageUpload({
  maxSizeInMB: 5,
  onSuccess: (preview, file) => { ... },
  onError: (error) => { ... }
});
```

### 3. src/components/common/ImageUpload.tsx
Reusable component for image uploads:
```tsx
<ImageUpload 
  onImageSelect={(file, preview) => { ... }}
  currentImageUrl="https://..."
  label="Upload Photo"
  previewSize="large"
/>
```

### 4. API_IMAGE_UPLOAD_REQUIREMENTS.md
Backend API specification document for the team implementing the endpoints.

### 5. IMAGE_UPLOAD_GUIDE.md
Complete implementation guide with setup instructions and examples.

---

## Key Features

✅ **File Validation**
- Check file type (JPEG, PNG, GIF, WebP)
- Check file size (max 5MB)
- User-friendly error messages

✅ **Preview Generation**
- Real-time image preview before upload
- Uses FileReader API for base64
- Shows existing profile image

✅ **FormData Upload**
- Sends multipart/form-data to backend
- Includes image file and dateOfBirth
- Proper header handling

✅ **Reusable Components**
- ImageUpload component for any image upload
- useImageUpload hook for custom implementations
- imageUpload service with utilities

✅ **Error Handling**
- Validation error messages
- API error handling
- Loading states

✅ **Styling**
- Dark mode support
- Tailwind CSS with glass-morphism
- Responsive design

---

## API Integration Points

### Frontend → Backend

**Image Upload Endpoint:**
```
POST /api/v1/members/{memberId}/profile-image
Content-Type: multipart/form-data

Request:
- profileImage: File
- dateOfBirth: string (optional)

Response:
{
  "success": true,
  "profileImageUrl": "https://storage.example.com/image.jpg"
}
```

**Profile Update Endpoint (when no image):**
```
PUT /api/v1/members/{memberId}/profile
Content-Type: application/json

Request: { "dateOfBirth": "1990-05-20" }

Response: { "success": true }
```

---

## Testing Checklist

### Frontend (Ready to Test)
- [x] File selection works
- [x] Preview displays correctly
- [x] Validation rejects invalid files
- [x] Loading state shows during upload
- [x] Success message displays
- [x] Dark mode styling works

### Backend (Needs Implementation)
- [ ] Endpoint accepts multipart/form-data
- [ ] Stores image file
- [ ] Returns correct URL in response
- [ ] Validates file type and size
- [ ] Handles errors gracefully
- [ ] Cleans up old images

---

## Migration from Old Implementation

If users already have profile image URLs, they will be:
1. Loaded from the database on page load
2. Displayed as image preview
3. Can be replaced by uploading new image
4. Old URL is preserved until new one is uploaded

---

## Notes for Backend Team

1. The `Content-Type: multipart/form-data` header is set in the frontend request
2. The endpoint should return the image URL in response (not just a success message)
3. Consider implementing image CDN/storage for scalability
4. Validate files again on backend (don't trust client validation)
5. Consider implementing image resizing/optimization

See [API_IMAGE_UPLOAD_REQUIREMENTS.md](API_IMAGE_UPLOAD_REQUIREMENTS.md) for full details.
