import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Review {
    id: bigint;
    createdAt: bigint;
    authorName: string;
    profileId: bigint;
    comment: string;
    rating: bigint;
}
export interface SocialUser {
    id: bigint;
    bio: string;
    portfolioLink?: string;
    userType: string;
    activityScore: bigint;
    country: string;
    username: string;
    displayName: string;
    createdAt: bigint;
    email: string;
    isVerified: boolean;
    avatarUrl: string;
    passwordHash: string;
    stageName?: string;
}
export interface DailyQuestion {
    id: bigint;
    postedBy: string;
    question: string;
    date: string;
    createdAt: bigint;
}
export interface Profile {
    id: bigint;
    bio: string;
    country: string;
    name: string;
    createdAt: bigint;
    photoUrl: string;
    email?: string;
    socialMedia?: string;
}
export interface Badge {
    id: bigint;
    badgeType: string;
    userId: bigint;
    color: string;
    awardedAt: bigint;
    awardedBy: string;
    reason: string;
}
export interface FriendRequest {
    id: bigint;
    status: Variant_pending_rejected_accepted;
    createdAt: bigint;
    toUserId: bigint;
    fromUserId: bigint;
}
export interface DailyAnswer {
    id: bigint;
    username: string;
    userId: bigint;
    createdAt: bigint;
    answer: string;
    questionId: bigint;
}
export interface Post {
    id: bigint;
    authorId: bigint;
    createdAt: bigint;
    imageUrl: string;
    caption: string;
}
export interface Notification {
    id: bigint;
    notifType: string;
    userId: bigint;
    createdAt: bigint;
    isRead: boolean;
    message: string;
    relatedId?: bigint;
}
export interface PostComment {
    id: bigint;
    authorId: bigint;
    createdAt: bigint;
    text: string;
    authorName: string;
    postId: bigint;
}
export interface UserProfile {
    socialUserId?: bigint;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_pending_rejected_accepted {
    pending = "pending",
    rejected = "rejected",
    accepted = "accepted"
}
export interface backendInterface {
    acceptFriendRequest(requestId: bigint): Promise<void>;
    addPostComment(postId: bigint, authorId: bigint, authorName: string, text: string): Promise<bigint>;
    addReview(profileId: bigint, authorName: string, rating: bigint, comment: string): Promise<bigint>;
    areFriends(userId1: bigint, userId2: bigint): Promise<boolean>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    awardBadge(userId: bigint, badgeType: string, color: string, awardedBy: string, reason: string, adminPassword: string): Promise<bigint>;
    createNotification(userId: bigint, notifType: string, message: string, relatedId: bigint | null): Promise<bigint>;
    createPost(authorId: bigint, imageUrl: string, caption: string): Promise<bigint>;
    createProfile(name: string, country: string, photoUrl: string, bio: string, email: string | null, socialMedia: string | null): Promise<bigint>;
    deletePost(postId: bigint): Promise<void>;
    deletePostComment(commentId: bigint): Promise<void>;
    deleteProfile(id: bigint): Promise<void>;
    getAllBadges(): Promise<Array<Badge>>;
    getAllSocialUsers(): Promise<Array<SocialUser>>;
    getAverageRating(profileId: bigint): Promise<number | null>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCountries(): Promise<Array<[string, bigint]>>;
    getDailyAnswers(questionId: bigint): Promise<Array<DailyAnswer>>;
    getFriendRequestsReceived(userId: bigint): Promise<Array<FriendRequest>>;
    getFriendRequestsSent(userId: bigint): Promise<Array<FriendRequest>>;
    getFriends(userId: bigint): Promise<Array<bigint>>;
    getLeaderboard(): Promise<Array<SocialUser>>;
    getLikeCount(profileId: bigint): Promise<bigint>;
    getNotifications(userId: bigint): Promise<Array<Notification>>;
    getPostComments(postId: bigint): Promise<Array<PostComment>>;
    getPostLikeCount(postId: bigint): Promise<bigint>;
    getPosts(): Promise<Array<Post>>;
    getPostsByUser(userId: bigint): Promise<Array<Post>>;
    getProfile(id: bigint): Promise<Profile>;
    getProfiles(): Promise<Array<Profile>>;
    getProfilesByCountry(country: string): Promise<Array<Profile>>;
    getReviews(profileId: bigint): Promise<Array<Review>>;
    getSocialUser(userId: bigint): Promise<SocialUser>;
    getTodayQuestion(date: string): Promise<DailyQuestion | null>;
    getUnreadCount(userId: bigint): Promise<bigint>;
    getUserBadges(userId: bigint): Promise<Array<Badge>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    hasSocialUserAnswered(questionId: bigint, userId: bigint): Promise<boolean>;
    hasUserLikedPost(postId: bigint, userId: bigint): Promise<boolean>;
    incrementUserActivity(userId: bigint, points: bigint, adminPassword: string): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    likePost(postId: bigint, userId: bigint): Promise<void>;
    likeProfile(profileId: bigint): Promise<void>;
    loginUser(username: string, passwordHash: string): Promise<bigint | null>;
    markAllNotificationsRead(userId: bigint): Promise<void>;
    markNotificationRead(notifId: bigint): Promise<void>;
    postDailyQuestion(question: string, date: string, postedBy: string, adminPassword: string): Promise<bigint>;
    registerUser(username: string, passwordHash: string, displayName: string, email: string, country: string, bio: string, avatarUrl: string): Promise<bigint>;
    rejectFriendRequest(requestId: bigint): Promise<void>;
    removeBadge(badgeId: bigint, adminPassword: string): Promise<void>;
    revokeVerification(userId: bigint, adminPassword: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchProfiles(searchTerm: string): Promise<Array<Profile>>;
    sendFriendRequest(fromId: bigint, toId: bigint): Promise<bigint>;
    submitDailyAnswer(questionId: bigint, userId: bigint, username: string, answer: string): Promise<bigint>;
    unlikePost(postId: bigint, userId: bigint): Promise<void>;
    updateProfile(id: bigint, name: string, country: string, photoUrl: string, bio: string, email: string | null, socialMedia: string | null): Promise<void>;
    updateSocialUser(userId: bigint, displayName: string, email: string, country: string, bio: string, avatarUrl: string, userType: string, stageName: string | null, portfolioLink: string | null): Promise<void>;
    verifyUser(userId: bigint, adminPassword: string): Promise<void>;
}
