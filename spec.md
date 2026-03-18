# World Mosaic

## Current State
- Admin panel at /admin requires Internet Identity login and isAdmin check
- Backend enforces admin-only access for create/update/delete profile operations
- Frontend shows "Access Denied" if user is not an Internet Identity admin

## Requested Changes (Diff)

### Add
- Password gate on the Admin page: anyone who enters the correct password gets access
- Password: worldmossaic9876##
- Password stored in sessionStorage so user stays logged in during session

### Modify
- Backend: remove admin-only guards from createProfile, updateProfile, deleteProfile so any caller can perform these operations (access is now controlled by the frontend password gate)
- Frontend Admin page: replace Internet Identity login requirement with a simple password input screen

### Remove
- Internet Identity login requirement from admin access flow
- "Access Denied" screen tied to Internet Identity principal

## Implementation Plan
1. Update backend main.mo: remove AccessControl.isAdmin checks from createProfile, updateProfile, deleteProfile
2. Update frontend Admin.tsx: add password gate UI (input + submit), store auth in sessionStorage, show admin panel only after correct password
