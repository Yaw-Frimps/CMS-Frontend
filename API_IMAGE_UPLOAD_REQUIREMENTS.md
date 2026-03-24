# Image Upload Feature - Backend API Requirements

This document outlines the backend API endpoints required to support image upload functionality in the church management system.

## Overview

Users should be able to upload profile images from their devices. The images are stored in the database (or cloud storage) and linked to their member profiles.

## Required Endpoints

### 1. Upload Profile Image

**Endpoint:** `POST /api/v1/members/{memberId}/profile-image`

**Description:** Upload and store a profile image for a member. Updates the member's profileImageUrl in the database.

**Authentication:** Required (Bearer token)

**Request:**
- **Headers:**
  - `Content-Type: multipart/form-data`
  - `Authorization: Bearer <token>`

- **Body (Form Data):**
  - `profileImage` (File, required) - Image file (JPG, PNG, GIF, WebP)
  - `dateOfBirth` (String, optional) - Member's date of birth (ISO format)

- **Path Parameters:**
  - `memberId` (Integer) - The ID of the member uploading the image

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Profile image uploaded successfully",
  "profileImageUrl": "https://your-storage-url/members/123/profile-image.jpg",
  "uploadedAt": "2025-03-17T12:34:56Z"
}
```

**Error Responses:**
- `400 Bad Request` - No file provided or invalid file format
- `401 Unauthorized` - Invalid or missing authentication token
- `403 Forbidden` - User trying to upload image for another member
- `413 Payload Too Large` - File size exceeds limit (5MB)
- `500 Internal Server Error` - Server error during upload

**Validation Requirements:**
- File must be an image (JPEG, PNG, GIF, WebP)
- File size must not exceed 5MB
- User can only upload for their own member profile
- Virus/malware scanning recommended before storage

**Storage Recommendations:**
- Local filesystem: `uploads/members/{memberId}/profile-image.{ext}`
- Cloud storage: AWS S3, Azure Blob Storage, etc.
- Return accessible URL in response

---

### 2. Update Member Profile (Modified)

**Endpoint:** `PUT /api/v1/members/{memberId}/profile`

**Description:** Update member profile information (existing endpoint, no changes needed but can be tested with dateOfBirth)

**Authentication:** Required (Bearer token)

**Request:**
- **Headers:**
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>`

- **Body:**
```json
{
  "dateOfBirth": "1990-05-20"
}
```

- **Path Parameters:**
  - `memberId` (Integer) - The ID of the member

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": 123,
    "memberId": 123,
    "dateOfBirth": "1990-05-20",
    "profileImageUrl": "https://your-storage-url/members/123/profile-image.jpg"
  }
}
```

---

## Database Schema Changes

### Members Table (Update)

Add these columns to store image information:

```sql
ALTER TABLE members ADD COLUMN (
  profileImageUrl VARCHAR(500),
  profileImageUploadedAt TIMESTAMP,
  profileImageFilename VARCHAR(255)
);
```

## Implementation Notes

1. **Security Considerations:**
   - Validate file MIME type (both frontend and backend)
   - Scan files for malware before storage
   - Prevent path traversal attacks
   - Use secure file naming (UUID + extension)
   - Set appropriate file permissions

2. **File Storage:**
   - Store original filename separately for display
   - Generate secure unique filename for storage
   - Consider image optimization/resizing
   - Implement cleanup for old/deleted images

3. **Performance:**
   - Consider asynchronous image processing
   - Implement image caching headers
   - CDN integration for faster delivery

4. **Constraints:**
   - Maximum file size: 5MB
   - Allowed formats: JPEG, PNG, GIF, WebP
   - Only profile image per member (replace old one)

## Frontend Integration

The frontend will:
1. Collect file from user input
2. Validate file locally (type, size)
3. Send multipart/form-data POST request to upload endpoint
4. Receive profileImageUrl in response
5. Update profile display with new image URL
6. Dispatch event to update UI components

## API Response Format

All responses should follow this format:

```json
{
  "success": boolean,
  "message": string,
  "data": object (optional),
  "error": string (optional, on error)
}
```

---

**Implementation Priority:** HIGH - Feature is blocked on these endpoints
