# World Mosaic

## Current State

World Mosaic is a full social platform with:
- Custom username/password auth stored in localStorage
- Backend using ICP AccessControl (principal-based) for permission gating
- Blob storage for image uploads via `uploadFileToStorage`
- Badge awarding by admin (password-protected frontend panel)
- Profile editing with avatar upload
- Post creation with image upload

**Root bug**: The backend uses `AccessControl.hasPermission(caller, #user)` and `AccessControl.isAdmin(caller)` but the app never registers users with the ICP principal system. The caller is always the anonymous principal, so EVERY write operation (create post, like, comment, award badge, update profile, etc.) throws "Unauthorized" and fails silently.

## Requested Changes (Diff)

### Add
- Client-side file type validation (JPEG, PNG, WebP) and 10 MB size limit before upload
- Upload progress indicator in CreatePostModal and avatar upload
- AuthContext refresh of `user` state after profile update
- Clear success/failure toast messages for all badge/post/profile operations

### Modify
- Backend: Remove all `AccessControl.hasPermission` and `AccessControl.isAdmin` guards. Replace with lightweight data-level validation (existence checks, basic sanity checks). App-level auth (who can do what) is enforced in the frontend.
- CreatePostModal: validate file type and size before upload; show upload progress
- UserProfile EditProfileDialog: invalidate `authUser` query / update AuthContext after save
- AuthContext: expose a `refreshUser` function; call it after `updateSocialUser`

### Remove
- Nothing removed

## Implementation Plan

1. Rewrite `src/backend/main.mo` - remove all AccessControl permission checks from write methods (keep the mixin include for compatibility but don't gate on it). Keep data-validation traps (e.g. profile not found, rating range).
2. Update `CreatePostModal` - add file type/size validation, wire `onProgress` to show % indicator.
3. Update `AuthContext` - add `refreshUser()`, call after signup/login, expose via context.
4. Update `UserProfile` EditProfileDialog - call `refreshUser` from AuthContext after save so navbar/avatar updates instantly.
5. Validate and build.
