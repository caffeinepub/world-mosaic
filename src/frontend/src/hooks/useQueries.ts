import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  backendInterface as FullBackend,
  Post,
  PostComment,
  Profile,
  Review,
  SocialUser,
} from "../backend.d";
import { useActor } from "./useActor";

// ── Existing profile hooks ──────────────────────────────────────────────────

export function useProfiles() {
  const { actor, isFetching } = useActor();
  return useQuery<Profile[]>({
    queryKey: ["profiles"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getProfiles();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useProfile(id: bigint | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery<Profile>({
    queryKey: ["profile", id?.toString()],
    queryFn: async () => {
      if (!actor || id === undefined) throw new Error("No actor or id");
      return actor.getProfile(id);
    },
    enabled: !!actor && !isFetching && id !== undefined,
  });
}

export function useSearchProfiles(searchTerm: string) {
  const { actor, isFetching } = useActor();
  return useQuery<Profile[]>({
    queryKey: ["profiles", "search", searchTerm],
    queryFn: async () => {
      if (!actor) return [];
      if (!searchTerm.trim()) return actor.getProfiles();
      return actor.searchProfiles(searchTerm);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useProfilesByCountry(country: string | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Profile[]>({
    queryKey: ["profiles", "country", country],
    queryFn: async () => {
      if (!actor) return [];
      if (!country) return actor.getProfiles();
      return actor.getProfilesByCountry(country);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCountries() {
  const { actor, isFetching } = useActor();
  return useQuery<Array<[string, bigint]>>({
    queryKey: ["countries"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getCountries();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      country: string;
      photoUrl: string;
      bio: string;
      email: string | null;
      socialMedia: string | null;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.createProfile(
        data.name,
        data.country,
        data.photoUrl,
        data.bio,
        data.email,
        data.socialMedia,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      queryClient.invalidateQueries({ queryKey: ["countries"] });
    },
  });
}

export function useUpdateProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      id: bigint;
      name: string;
      country: string;
      photoUrl: string;
      bio: string;
      email: string | null;
      socialMedia: string | null;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateProfile(
        data.id,
        data.name,
        data.country,
        data.photoUrl,
        data.bio,
        data.email,
        data.socialMedia,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      queryClient.invalidateQueries({ queryKey: ["countries"] });
    },
  });
}

export function useDeleteProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteProfile(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      queryClient.invalidateQueries({ queryKey: ["countries"] });
    },
  });
}

export function useReviews(profileId: bigint | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery<Review[]>({
    queryKey: ["reviews", profileId?.toString()],
    queryFn: async () => {
      if (!actor || profileId === undefined) return [];
      return actor.getReviews(profileId);
    },
    enabled: !!actor && !isFetching && profileId !== undefined,
  });
}

export function useLikeCount(profileId: bigint | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ["likeCount", profileId?.toString()],
    queryFn: async () => {
      if (!actor || profileId === undefined) return BigInt(0);
      return actor.getLikeCount(profileId);
    },
    enabled: !!actor && !isFetching && profileId !== undefined,
  });
}

export function useAddReview(profileId: bigint) {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      authorName: string;
      rating: bigint;
      comment: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.addReview(
        profileId,
        data.authorName,
        data.rating,
        data.comment,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["reviews", profileId.toString()],
      });
    },
  });
}

export function useLikeProfile(profileId: bigint) {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.likeProfile(profileId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["likeCount", profileId.toString()],
      });
    },
  });
}

// ── Social user hooks ───────────────────────────────────────────────────────

export function useSocialUser(userId: bigint | null) {
  const { actor: rawActor, isFetching } = useActor();
  const actor = rawActor as unknown as FullBackend | null;
  return useQuery<SocialUser | null>({
    queryKey: ["socialUser", userId?.toString()],
    queryFn: async () => {
      if (!actor || !userId) return null;
      return actor.getSocialUser(userId);
    },
    enabled: !!actor && !isFetching && !!userId,
  });
}

// ── Post hooks ──────────────────────────────────────────────────────────────

export function usePosts() {
  const { actor: rawActor, isFetching } = useActor();
  const actor = rawActor as unknown as FullBackend | null;
  return useQuery<Post[]>({
    queryKey: ["posts"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPosts();
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePostsByUser(userId: bigint | null) {
  const { actor: rawActor, isFetching } = useActor();
  const actor = rawActor as unknown as FullBackend | null;
  return useQuery<Post[]>({
    queryKey: ["posts", "user", userId?.toString()],
    queryFn: async () => {
      if (!actor || !userId) return [];
      return actor.getPostsByUser(userId);
    },
    enabled: !!actor && !isFetching && !!userId,
  });
}

export function usePostLikeCount(postId: bigint) {
  const { actor: rawActor, isFetching } = useActor();
  const actor = rawActor as unknown as FullBackend | null;
  return useQuery<bigint>({
    queryKey: ["postLikeCount", postId.toString()],
    queryFn: async () => {
      if (!actor) return BigInt(0);
      return actor.getPostLikeCount(postId);
    },
    enabled: !!actor && !isFetching,
  });
}

export function usePostComments(postId: bigint, enabled: boolean) {
  const { actor: rawActor, isFetching } = useActor();
  const actor = rawActor as unknown as FullBackend | null;
  return useQuery<PostComment[]>({
    queryKey: ["postComments", postId.toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPostComments(postId);
    },
    enabled: !!actor && !isFetching && enabled,
  });
}

export function useHasUserLikedPost(postId: bigint, userId: bigint | null) {
  const { actor: rawActor, isFetching } = useActor();
  const actor = rawActor as unknown as FullBackend | null;
  return useQuery<boolean>({
    queryKey: ["hasLiked", postId.toString(), userId?.toString()],
    queryFn: async () => {
      if (!actor || !userId) return false;
      return actor.hasUserLikedPost(postId, userId);
    },
    enabled: !!actor && !isFetching && !!userId,
  });
}

export function useCreatePost() {
  const { actor: rawActor } = useActor();
  const actor = rawActor as unknown as FullBackend | null;
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      authorId: bigint;
      imageUrl: string;
      caption: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.createPost(data.authorId, data.imageUrl, data.caption);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}

export function useLikePost() {
  const { actor: rawActor } = useActor();
  const actor = rawActor as unknown as FullBackend | null;
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { postId: bigint; userId: bigint }) => {
      if (!actor) throw new Error("No actor");
      return actor.likePost(data.postId, data.userId);
    },
    onSuccess: (_, { postId, userId }) => {
      queryClient.invalidateQueries({
        queryKey: ["postLikeCount", postId.toString()],
      });
      queryClient.invalidateQueries({
        queryKey: ["hasLiked", postId.toString(), userId.toString()],
      });
    },
  });
}

export function useUnlikePost() {
  const { actor: rawActor } = useActor();
  const actor = rawActor as unknown as FullBackend | null;
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { postId: bigint; userId: bigint }) => {
      if (!actor) throw new Error("No actor");
      return actor.unlikePost(data.postId, data.userId);
    },
    onSuccess: (_, { postId, userId }) => {
      queryClient.invalidateQueries({
        queryKey: ["postLikeCount", postId.toString()],
      });
      queryClient.invalidateQueries({
        queryKey: ["hasLiked", postId.toString(), userId.toString()],
      });
    },
  });
}

export function useAddPostComment() {
  const { actor: rawActor } = useActor();
  const actor = rawActor as unknown as FullBackend | null;
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      postId: bigint;
      authorId: bigint;
      authorName: string;
      text: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.addPostComment(
        data.postId,
        data.authorId,
        data.authorName,
        data.text,
      );
    },
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({
        queryKey: ["postComments", postId.toString()],
      });
    },
  });
}
