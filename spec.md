# World Mosaic

## Current State
World Mosaic is a full-stack social platform with custom username/password authentication (not ICP Internet Identity). The backend uses `AccessControl.isAdmin` which checks ICP principal — but since all callers are anonymous principals, this check always fails, blocking admin-only operations. Image upload accepts JPEG/PNG/WebP only, rejecting HEIC files from iPhones.

## Requested Changes (Diff)

### Add
- `adminPassword: Text` parameter to `awardBadge`, `removeBadge`, `postDailyQuestion`, `incrementUserActivity` backend functions
- HEIC image format support in upload flow (convert to JPEG via canvas before uploading)
- Client-side image compression/resizing before upload (max 1920px, quality 0.85)

### Modify
- `verifyUser` and `revokeVerification`: remove `AccessControl.isAdmin` check (already validated via adminPassword param)
- `awardBadge`, `removeBadge`, `postDailyQuestion`, `incrementUserActivity`: replace `AccessControl.isAdmin` with `adminPassword != "worldmossaic9876##"` check
- Frontend hooks: pass `"worldmossaic9876##"` to newly-password-gated functions
- `uploadFile.ts`: convert any image to JPEG via canvas before uploading (handles HEIC on iOS)
- `CreatePostModal.tsx` and `UserProfile.tsx`: change `accept` to `image/*` and allow heic/heif types
- Backend declarations (`backend.d.ts`, `backend.ts`, `backend.did.js`, `backend.did.d.ts`): update signatures

### Remove
- `AccessControl.isAdmin` calls from admin-action functions

## Implementation Plan
1. Update `src/backend/main.mo` — remove isAdmin checks, add adminPassword params
2. Update all 4 frontend declaration files with new signatures
3. Update `src/frontend/src/hooks/useQueries.ts` — pass admin password in mutationFn calls
4. Update `src/frontend/src/utils/uploadFile.ts` — add canvas-based image conversion + compression
5. Update `CreatePostModal.tsx` and `UserProfile.tsx` — broaden accept, allow heic type
