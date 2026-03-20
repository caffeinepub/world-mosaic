import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { Grid3X3, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { backendInterface as FullBackend, SocialUser } from "../backend.d";
import { useAuth } from "../contexts/AuthContext";
import { useActor } from "../hooks/useActor";
import { usePostsByUser, useSocialUser } from "../hooks/useQueries";
import { ALL_COUNTRIES } from "../utils/flags";
import { uploadFileToStorage } from "../utils/uploadFile";

function EditProfileDialog({
  open,
  onOpenChange,
  user,
  userId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  user: SocialUser;
  userId: bigint;
}) {
  const { actor: rawActor } = useActor();
  const actor = rawActor as unknown as FullBackend | null;
  const queryClient = useQueryClient();
  const [displayName, setDisplayName] = useState(user.displayName);
  const [country, setCountry] = useState(user.country);
  const [bio, setBio] = useState(user.bio);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadFileToStorage(file);
      setAvatarUrl(url);
    } catch {
      toast.error("Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actor) return;
    setSaving(true);
    try {
      await actor.updateSocialUser(
        userId,
        displayName,
        country,
        bio,
        avatarUrl,
      );
      queryClient.invalidateQueries({
        queryKey: ["socialUser", userId.toString()],
      });
      toast.success("Profile updated!");
      onOpenChange(false);
    } catch {
      toast.error("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-ocid="profile.edit.dialog"
        className="max-w-md rounded-2xl"
      >
        <DialogHeader>
          <DialogTitle className="font-display">Edit Profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-4 mt-2">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            <Avatar className="w-20 h-20">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback className="bg-primary/15 text-primary font-bold text-2xl">
                {displayName?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              data-ocid="profile.edit.avatar.upload_button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="rounded-xl gap-2"
            >
              {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
              Change Photo
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-name">Display Name</Label>
            <Input
              id="edit-name"
              data-ocid="profile.edit.name.input"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-country">Country</Label>
            <Input
              id="edit-country"
              data-ocid="profile.edit.country.input"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              list="edit-country-list"
              className="rounded-xl"
            />
            <datalist id="edit-country-list">
              {ALL_COUNTRIES.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-bio">Bio</Label>
            <Textarea
              id="edit-bio"
              data-ocid="profile.edit.bio.textarea"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="rounded-xl min-h-20"
            />
          </div>

          <Button
            type="submit"
            data-ocid="profile.edit.submit_button"
            disabled={saving}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Changes
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function UserProfile() {
  const params = useParams({ strict: false });
  const rawId = (params as Record<string, string>).userId;
  const userId = rawId ? BigInt(rawId) : null;
  const { userId: currentUserId } = useAuth();
  const [editOpen, setEditOpen] = useState(false);

  const { data: user, isLoading: userLoading } = useSocialUser(userId);
  const { data: posts = [], isLoading: postsLoading } = usePostsByUser(userId);

  const isOwnProfile =
    currentUserId !== null &&
    userId !== null &&
    currentUserId.toString() === userId.toString();

  if (userLoading) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8">
          <Skeleton className="w-24 h-24 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-40 rounded" />
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-4 w-64 rounded" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-1">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="aspect-square rounded" />
          ))}
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-display font-bold mb-2">User not found</h1>
        <p className="text-muted-foreground">
          This profile doesn&apos;t exist.
        </p>
      </main>
    );
  }

  const sortedPosts = [...posts].sort((a, b) =>
    Number(b.createdAt - a.createdAt),
  );

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      {/* Profile header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8">
        <Avatar className="w-24 h-24 flex-shrink-0">
          <AvatarImage src={user.avatarUrl} />
          <AvatarFallback className="bg-primary/15 text-primary font-bold text-3xl">
            {user.displayName?.[0]?.toUpperCase() ?? "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap mb-2">
            <h1 className="text-xl font-display font-bold text-foreground">
              {user.displayName}
            </h1>
            {isOwnProfile && (
              <Button
                variant="outline"
                size="sm"
                data-ocid="profile.edit_button"
                onClick={() => setEditOpen(true)}
                className="rounded-xl text-sm"
              >
                Edit Profile
              </Button>
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-1">
            @{user.username} &middot; {user.country}
          </p>
          {user.bio && <p className="text-sm text-foreground">{user.bio}</p>}
          <p className="text-sm font-semibold text-foreground mt-2">
            {posts.length} {posts.length === 1 ? "post" : "posts"}
          </p>
        </div>
      </div>

      {/* Posts grid */}
      <div className="border-t border-border pt-6">
        <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-foreground">
          <Grid3X3 className="w-4 h-4" />
          Posts
        </div>
        {postsLoading ? (
          <div className="grid grid-cols-3 gap-1">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="aspect-square rounded" />
            ))}
          </div>
        ) : sortedPosts.length === 0 ? (
          <div
            data-ocid="profile.posts.empty_state"
            className="text-center py-12 text-muted-foreground"
          >
            <div className="text-4xl mb-3">📷</div>
            <p className="font-medium">No posts yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1">
            {sortedPosts.map((post, i) => (
              <div
                key={post.id.toString()}
                data-ocid={`profile.posts.item.${i + 1}`}
                className="aspect-square bg-muted overflow-hidden rounded"
              >
                <img
                  src={post.imageUrl}
                  alt={post.caption || "Post"}
                  className="w-full h-full object-cover hover:opacity-90 transition-opacity"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {isOwnProfile && userId && (
        <EditProfileDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          user={user}
          userId={userId}
        />
      )}
    </main>
  );
}
