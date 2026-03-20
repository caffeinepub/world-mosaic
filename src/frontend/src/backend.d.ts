import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
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
    username: string;
    passwordHash: string;
    displayName: string;
    country: string;
    bio: string;
    avatarUrl: string;
    createdAt: bigint;
}
export interface Post {
    id: bigint;
    authorId: bigint;
    imageUrl: string;
    caption: string;
    createdAt: bigint;
}
export interface PostComment {
    id: bigint;
    postId: bigint;
    authorId: bigint;
    authorName: string;
    text: string;
    createdAt: bigint;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    // Existing profile methods
    addReview(profileId: bigint, authorName: string, rating: bigint, comment: string): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createProfile(name: string, country: string, photoUrl: string, bio: string, email: string | null, socialMedia: string | null): Promise<bigint>;
    deleteProfile(id: bigint): Promise<void>;
    getAverageRating(profileId: bigint): Promise<number | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCountries(): Promise<Array<[string, bigint]>>;
    getLikeCount(profileId: bigint): Promise<bigint>;
    getProfile(id: bigint): Promise<Profile>;
    getProfiles(): Promise<Array<Profile>>;
    getProfilesByCountry(country: string): Promise<Array<Profile>>;
    getReviews(profileId: bigint): Promise<Array<Review>>;
    isCallerAdmin(): Promise<boolean>;
    likeProfile(profileId: bigint): Promise<void>;
    searchProfiles(searchTerm: string): Promise<Array<Profile>>;
    updateProfile(id: bigint, name: string, country: string, photoUrl: string, bio: string, email: string | null, socialMedia: string | null): Promise<void>;
    // Social user auth
    registerUser(username: string, passwordHash: string, displayName: string, country: string, bio: string, avatarUrl: string): Promise<bigint>;
    loginUser(username: string, passwordHash: string): Promise<bigint | null>;
    getSocialUser(userId: bigint): Promise<SocialUser>;
    updateSocialUser(userId: bigint, displayName: string, country: string, bio: string, avatarUrl: string): Promise<void>;
    getAllSocialUsers(): Promise<Array<SocialUser>>;
    // Posts
    createPost(authorId: bigint, imageUrl: string, caption: string): Promise<bigint>;
    getPosts(): Promise<Array<Post>>;
    getPostsByUser(userId: bigint): Promise<Array<Post>>;
    deletePost(postId: bigint): Promise<void>;
    // Post likes
    likePost(postId: bigint, userId: bigint): Promise<void>;
    unlikePost(postId: bigint, userId: bigint): Promise<void>;
    getPostLikeCount(postId: bigint): Promise<bigint>;
    hasUserLikedPost(postId: bigint, userId: bigint): Promise<boolean>;
    // Post comments
    addPostComment(postId: bigint, authorId: bigint, authorName: string, text: string): Promise<bigint>;
    getPostComments(postId: bigint): Promise<Array<PostComment>>;
    deletePostComment(commentId: bigint): Promise<void>;
}
