# World Mosaic – Social Feed & Mobile Navigation Update

## Current State
The app has a working social layer: user auth (signup/login), a Feed page with posts, likes, and comments, and a Navbar. After login, users stay on the same page. There is no bottom navigation. No push notification system exists.

## Requested Changes (Diff)

### Add
- Redirect to `/feed` after successful login or signup
- Bottom navigation bar (mobile Instagram-style) visible only when logged in: Home (feed), + Post (create), Profile
- Web Push / Browser Notification system: request permission on login, send local notifications when someone likes a post, comments, or new posts appear (using Notification API + polling since no server push backend)
- "+ Post" quick-action in the bottom nav opens CreatePostModal
- Notification bell icon in the top navbar showing unread count badge

### Modify
- AuthContext: after login/signup, navigate to `/feed`
- App.tsx: render bottom nav bar only for logged-in users; add padding-bottom to main content on mobile so it doesn't hide behind the bottom nav
- Navbar: hide feed/profile nav items on mobile since bottom nav handles those; add notification bell with badge for logged-in users
- Feed page: make it the primary post-login landing page

### Remove
- Nothing removed from existing features

## Implementation Plan
1. Add `useNotifications` hook to manage browser notification permissions and send local notifications
2. Create `BottomNav` component with Home, + (CreatePost), Profile icons
3. Update `AuthContext` to navigate to `/feed` after login/signup (pass a `navigate` callback or use router)
4. Update `App.tsx` root layout to include `BottomNav` for logged-in users with `pb-16` padding on mobile
5. Update `Navbar` to add notification bell with badge for mobile/desktop when logged in
6. Wire notification triggers: after likePost, addComment, and on new post creation, fire browser notification to the post author (stored locally)
7. Add notification permission request on first login
