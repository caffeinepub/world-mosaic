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
    email: string;
    socialMedia?: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createProfile(name: string, country: string, photoUrl: string, bio: string, email: string, socialMedia: string | null): Promise<bigint>;
    deleteProfile(id: bigint): Promise<void>;
    getCallerUserRole(): Promise<UserRole>;
    getCountries(): Promise<Array<[string, bigint]>>;
    getProfile(id: bigint): Promise<Profile>;
    getProfiles(): Promise<Array<Profile>>;
    getProfilesByCountry(country: string): Promise<Array<Profile>>;
    isCallerAdmin(): Promise<boolean>;
    searchProfiles(searchTerm: string): Promise<Array<Profile>>;
    updateProfile(id: bigint, name: string, country: string, photoUrl: string, bio: string, email: string, socialMedia: string | null): Promise<void>;
}
