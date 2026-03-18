import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Profile } from "../backend.d";
import { useActor } from "./useActor";

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
      email: string;
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
      email: string;
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
