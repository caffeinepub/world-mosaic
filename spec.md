# World Mosaic

## Current State
World Mosaic is a full social platform with user auth, posts, feed, badges, friend requests, leaderboard, and explore. SocialUser has no verification field. Admin panel manages badges/posts/profiles.

## Requested Changes (Diff)

### Add
- `isVerified: Bool` field on `SocialUser`
- `verifyUser(userId: Nat, adminPass: Text)` backend method
- `revokeVerification(userId: Nat, adminPass: Text)` backend method
- Blue tick (✓) displayed next to username everywhere: Feed posts, comments, UserProfile page, Explore grid, Leaderboard, search results
- Admin panel UI section: list all users with Verify/Revoke buttons
- Notification created when a user is verified or revoked

### Modify
- `registerUser` and `updateSocialUser` to preserve `isVerified` field
- `getSocialUser` / `getAllSocialUsers` / `getLeaderboard` return updated type including `isVerified`
- Admin panel to include verification management tab/section

### Remove
- Nothing removed

## Implementation Plan
1. Add `isVerified: Bool` to `SocialUser` type; default false on new registrations
2. Add `verifyUser` and `revokeVerification` methods (admin-password gated)
3. Update all user reads to include `isVerified`
4. Frontend: create `VerifiedBadge` component (blue checkmark icon)
5. Inject `VerifiedBadge` in Feed posts, comments, UserProfile, Explore, Leaderboard
6. Add Verification Management section in Admin panel with verify/revoke per user
7. On verify/revoke, call `createNotification` for the affected user
