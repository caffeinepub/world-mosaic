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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { Grid3X3, Loader2, UserCheck, UserPlus, Users, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { SocialUser } from "../backend.d";
import { Variant_pending_rejected_accepted } from "../backend.d";
import { BadgeDisplay, BadgeList } from "../components/BadgeDisplay";
import { VerifiedBadge } from "../components/VerifiedBadge";
import { useAuth } from "../contexts/AuthContext";
import {
  useAcceptFriendRequest,
  useAreFriends,
  useFriendRequestsReceived,
  useFriendRequestsSent,
  useFriends,
  usePostsByUser,
  useRejectFriendRequest,
  useSendFriendRequest,
  useSocialUser,
  useUpdateSocialUser,
  useUserBadges,
} from "../hooks/useQueries";
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
  const queryClient = useQueryClient();
  const { refreshUser } = useAuth();
  const updateUser = useUpdateSocialUser();
  const [displayName, setDisplayName] = useState(user.displayName);
  const [email, setEmail] = useState(user.email);
  const [country, setCountry] = useState(user.country);
  const [bio, setBio] = useState(user.bio);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);
  const [stageName, setStageName] = useState(user.stageName ?? "");
  const [portfolioLink, setPortfolioLink] = useState(user.portfolioLink ?? "");
  const [uploading, setUploading] = useState(false);
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
    try {
      await updateUser.mutateAsync({
        userId,
        displayName,
        email,
        country,
        bio,
        avatarUrl,
        userType: user.userType || "member",
        stageName: stageName || null,
        portfolioLink: portfolioLink || null,
      });
      await refreshUser();
      queryClient.invalidateQueries({
        queryKey: ["socialUser", userId.toString()],
      });
      toast.success("Profile updated!");
      onOpenChange(false);
    } catch {
      toast.error("Failed to update profile.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-ocid="profile.edit.dialog"
        className="max-w-md rounded-2xl max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle className="font-display">Edit Profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-4 mt-2">
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
            <Label htmlFor="edit-email">Email</Label>
            <Input
              id="edit-email"
              type="email"
              data-ocid="profile.edit.email.input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
          {user.userType === "actor" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="edit-stagename">Stage Name</Label>
                <Input
                  id="edit-stagename"
                  data-ocid="profile.edit.stagename.input"
                  value={stageName}
                  onChange={(e) => setStageName(e.target.value)}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-portfolio">Portfolio Link</Label>
                <Input
                  id="edit-portfolio"
                  data-ocid="profile.edit.portfolio.input"
                  value={portfolioLink}
                  onChange={(e) => setPortfolioLink(e.target.value)}
                  className="rounded-xl"
                />
              </div>
            </>
          )}

          <Button
            type="submit"
            data-ocid="profile.edit.submit_button"
            disabled={updateUser.isPending}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl gap-2"
          >
            {updateUser.isPending && (
              <Loader2 className="w-4 h-4 animate-spin" />
            )}
            Save Changes
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function FriendButton({
  profileUserId,
  currentUserId,
}: { profileUserId: bigint; currentUserId: bigint }) {
  const { data: areFriends } = useAreFriends(currentUserId, profileUserId);
  const { data: sentRequests = [] } = useFriendRequestsSent(currentUserId);
  const { data: receivedRequests = [] } =
    useFriendRequestsReceived(currentUserId);
  const sendReq = useSendFriendRequest();
  const acceptReq = useAcceptFriendRequest();

  const pendingSent = sentRequests.find(
    (r) =>
      r.toUserId.toString() === profileUserId.toString() &&
      r.status === Variant_pending_rejected_accepted.pending,
  );
  const pendingReceived = receivedRequests.find(
    (r) =>
      r.fromUserId.toString() === profileUserId.toString() &&
      r.status === Variant_pending_rejected_accepted.pending,
  );

  if (areFriends) {
    return (
      <Button
        variant="outline"
        size="sm"
        data-ocid="profile.friends.button"
        className="rounded-xl gap-2 border-green-300 text-green-700"
        disabled
      >
        <UserCheck className="w-4 h-4" />
        Friends ✓
      </Button>
    );
  }

  if (pendingReceived) {
    return (
      <Button
        size="sm"
        data-ocid="profile.accept_request.button"
        onClick={() =>
          acceptReq
            .mutateAsync(pendingReceived.id)
            .then(() => toast.success("Friend request accepted!"))
        }
        disabled={acceptReq.isPending}
        className="rounded-xl gap-2 bg-green-600 hover:bg-green-700 text-white"
      >
        <UserCheck className="w-4 h-4" />
        Accept Request
      </Button>
    );
  }

  if (pendingSent) {
    return (
      <Button
        variant="outline"
        size="sm"
        data-ocid="profile.request_sent.button"
        disabled
        className="rounded-xl gap-2"
      >
        Request Sent
      </Button>
    );
  }

  return (
    <Button
      size="sm"
      data-ocid="profile.send_friend_request.button"
      onClick={() =>
        sendReq
          .mutateAsync({ fromId: currentUserId, toId: profileUserId })
          .then(() => toast.success("Friend request sent!"))
          .catch(() => toast.error("Failed to send request."))
      }
      disabled={sendReq.isPending}
      className="rounded-xl gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
    >
      <UserPlus className="w-4 h-4" />
      Add Friend
    </Button>
  );
}

function IncomingFriendRequests({ userId }: { userId: bigint }) {
  const { data: requests = [] } = useFriendRequestsReceived(userId);
  const acceptReq = useAcceptFriendRequest();
  const rejectReq = useRejectFriendRequest();

  const pending = requests.filter(
    (r) => r.status === Variant_pending_rejected_accepted.pending,
  );

  if (pending.length === 0) return null;

  return (
    <div className="border border-border rounded-2xl p-4 bg-card">
      <h3 className="font-display font-semibold text-sm mb-3 flex items-center gap-2">
        <UserPlus className="w-4 h-4 text-primary" />
        Friend Requests ({pending.length})
      </h3>
      <div className="space-y-2">
        {pending.map((req) => (
          <FriendRequestItem
            key={req.id.toString()}
            request={req}
            onAccept={() =>
              acceptReq
                .mutateAsync(req.id)
                .then(() => toast.success("Accepted!"))
            }
            onReject={() =>
              rejectReq
                .mutateAsync(req.id)
                .then(() => toast.success("Rejected."))
            }
          />
        ))}
      </div>
    </div>
  );
}

function FriendRequestItem({
  request,
  onAccept,
  onReject,
}: {
  request: import("../backend.d").FriendRequest;
  onAccept: () => void;
  onReject: () => void;
}) {
  const { data: sender } = useSocialUser(request.fromUserId);
  return (
    <div className="flex items-center gap-3 p-2 rounded-xl bg-muted/40">
      <Avatar className="w-8 h-8">
        <AvatarImage src={sender?.avatarUrl} />
        <AvatarFallback className="text-xs">
          {sender?.displayName?.[0]?.toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">
          {sender?.displayName ?? "..."}
        </p>
        <p className="text-xs text-muted-foreground">{sender?.country}</p>
      </div>
      <div className="flex gap-1">
        <Button
          size="sm"
          data-ocid="profile.friend_request.confirm_button"
          onClick={onAccept}
          className="rounded-lg h-7 px-2 bg-primary text-primary-foreground text-xs"
        >
          Accept
        </Button>
        <Button
          size="sm"
          variant="ghost"
          data-ocid="profile.friend_request.cancel_button"
          onClick={onReject}
          className="rounded-lg h-7 px-2 text-xs"
        >
          <X className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}

function FriendsList({ userId }: { userId: bigint }) {
  const { data: friendIds = [] } = useFriends(userId);

  if (friendIds.length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic">No friends yet.</p>
    );
  }

  return (
    <div className="space-y-2">
      {friendIds.map((fid) => (
        <FriendItem key={fid.toString()} friendId={fid} />
      ))}
    </div>
  );
}

function FriendItem({ friendId }: { friendId: bigint }) {
  const { data: friend } = useSocialUser(friendId);
  return (
    <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/40 transition-colors">
      <Avatar className="w-8 h-8">
        <AvatarImage src={friend?.avatarUrl} />
        <AvatarFallback className="text-xs">
          {friend?.displayName?.[0]?.toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">
          {friend?.displayName ?? "..."}
        </p>
        <p className="text-xs text-muted-foreground">{friend?.country}</p>
      </div>
    </div>
  );
}

export function UserProfile() {
  const params = useParams({ strict: false });
  const rawId = (params as Record<string, string>).userId;
  const userId = rawId ? BigInt(rawId) : null;
  const { userId: currentUserId } = useAuth();
  const [editOpen, setEditOpen] = useState(false);
  const [showFriends, setShowFriends] = useState(false);

  const { data: user, isLoading: userLoading } = useSocialUser(userId);
  const { data: posts = [], isLoading: postsLoading } = usePostsByUser(userId);
  const { data: badges = [] } = useUserBadges(userId);
  const { data: friendIds = [] } = useFriends(userId);

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
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-6">
        <Avatar className="w-24 h-24 flex-shrink-0">
          <AvatarImage src={user.avatarUrl} />
          <AvatarFallback className="bg-primary/15 text-primary font-bold text-3xl">
            {user.displayName?.[0]?.toUpperCase() ?? "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap mb-1">
            <h1 className="text-xl font-display font-bold text-foreground flex items-center gap-1.5">
              {user.displayName}
              {user.isVerified && <VerifiedBadge size={18} />}
            </h1>
            {user.userType === "actor" && (
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">
                🎭 Actor
              </span>
            )}
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
            {!isOwnProfile && currentUserId && userId && (
              <FriendButton
                profileUserId={userId}
                currentUserId={currentUserId}
              />
            )}
          </div>
          <p className="text-sm text-muted-foreground mb-1">
            @{user.username} &middot; {user.country}
          </p>
          {user.stageName && (
            <p className="text-sm text-purple-600 font-medium">
              Stage: {user.stageName}
            </p>
          )}
          {user.portfolioLink && (
            <a
              href={user.portfolioLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              Portfolio ↗
            </a>
          )}
          {user.bio && (
            <p className="text-sm text-foreground mt-1">{user.bio}</p>
          )}
          <div className="flex items-center gap-4 mt-2 text-sm font-semibold text-foreground">
            <span>
              {posts.length} {posts.length === 1 ? "post" : "posts"}
            </span>
            <button
              type="button"
              data-ocid="profile.friends_count.button"
              onClick={() => setShowFriends((v) => !v)}
              className="hover:text-primary transition-colors flex items-center gap-1"
            >
              <Users className="w-4 h-4" />
              {friendIds.length} friends
            </button>
          </div>
        </div>
      </div>

      {/* Badges */}
      {badges.length > 0 && (
        <div className="mb-6 p-4 bg-card border border-border rounded-2xl">
          <h3 className="font-display font-semibold text-sm mb-3 flex items-center gap-2">
            🏅 Badges & Achievements
          </h3>
          <div className="flex flex-wrap gap-2">
            {badges.map((b) => (
              <BadgeDisplay key={b.id.toString()} badge={b} size="md" />
            ))}
          </div>
        </div>
      )}

      {/* Friends list (collapsible) */}
      {showFriends && isOwnProfile && userId && (
        <div className="mb-6 p-4 bg-card border border-border rounded-2xl">
          <h3 className="font-display font-semibold text-sm mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" /> Friends
          </h3>
          <FriendsList userId={userId} />
        </div>
      )}

      {/* Incoming friend requests (own profile only) */}
      {isOwnProfile && userId && (
        <div className="mb-6">
          <IncomingFriendRequests userId={userId} />
        </div>
      )}

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
