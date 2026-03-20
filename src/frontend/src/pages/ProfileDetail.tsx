import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  ExternalLink,
  Globe,
  Heart,
  Loader2,
  Mail,
  MapPin,
  MessageSquare,
  Star,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useAddReview,
  useLikeCount,
  useLikeProfile,
  useProfile,
  useReviews,
} from "../hooks/useQueries";
import { getFlagEmoji, getInitials } from "../utils/flags";

function StarRating({
  value,
  onChange,
  readOnly = false,
  size = "md",
}: {
  value: number;
  onChange?: (v: number) => void;
  readOnly?: boolean;
  size?: "sm" | "md";
}) {
  const [hovered, setHovered] = useState(0);
  const sz = size === "sm" ? "w-4 h-4" : "w-6 h-6";
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(star)}
          onMouseEnter={() => !readOnly && setHovered(star)}
          onMouseLeave={() => !readOnly && setHovered(0)}
          className={
            readOnly
              ? "cursor-default"
              : "cursor-pointer transition-transform hover:scale-110"
          }
        >
          <Star
            className={`${sz} ${
              star <= (hovered || value)
                ? "fill-amber-400 text-amber-400"
                : "text-muted-foreground/40"
            } transition-colors`}
          />
        </button>
      ))}
    </div>
  );
}

function ReviewSection({ profileId }: { profileId: bigint }) {
  const { data: reviews, isLoading: reviewsLoading } = useReviews(profileId);
  const { data: likeCount, isLoading: likeLoading } = useLikeCount(profileId);
  const addReview = useAddReview(profileId);
  const likeProfile = useLikeProfile(profileId);

  const [showForm, setShowForm] = useState(false);
  const [authorName, setAuthorName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [liked, setLiked] = useState(false);

  const handleLike = async () => {
    if (liked) return;
    setLiked(true);
    try {
      await likeProfile.mutateAsync();
    } catch {
      setLiked(false);
      toast.error("Could not register like.");
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim()) {
      toast.error("Please enter your name.");
      return;
    }
    if (!comment.trim()) {
      toast.error("Please write a comment.");
      return;
    }
    try {
      await addReview.mutateAsync({
        authorName: authorName.trim(),
        rating: BigInt(rating),
        comment: comment.trim(),
      });
      toast.success("Review submitted! Thank you 🎉");
      setAuthorName("");
      setRating(5);
      setComment("");
      setShowForm(false);
    } catch {
      toast.error("Could not submit review. Please try again.");
    }
  };

  const displayLikeCount = liked
    ? (likeCount ?? BigInt(0)) + BigInt(1)
    : (likeCount ?? BigInt(0));

  const avgRating =
    reviews && reviews.length > 0
      ? reviews.reduce((sum, r) => sum + Number(r.rating), 0) / reviews.length
      : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="mt-6 space-y-6"
    >
      {/* ── Likes ── */}
      <div className="bg-card border border-border rounded-3xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
              <Heart className="w-5 h-5 text-rose-500" />
            </div>
            <div>
              <p className="font-display font-semibold text-foreground">
                Likes
              </p>
              <p className="text-sm text-muted-foreground">
                {likeLoading ? "..." : displayLikeCount.toString()} people liked
                this profile
              </p>
            </div>
          </div>
          <Button
            data-ocid="profile.like.button"
            onClick={handleLike}
            disabled={liked || likeProfile.isPending}
            className={`rounded-xl gap-2 transition-all ${
              liked
                ? "bg-rose-500 text-white hover:bg-rose-500"
                : "bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800"
            }`}
            variant="outline"
          >
            {likeProfile.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Heart className={`w-4 h-4 ${liked ? "fill-white" : ""}`} />
            )}
            {liked ? "Liked!" : "Like"}
          </Button>
        </div>
      </div>

      {/* ── Reviews ── */}
      <div className="bg-card border border-border rounded-3xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="font-display font-semibold text-foreground">
                Reviews
              </p>
              {avgRating !== null && (
                <div className="flex items-center gap-1.5">
                  <StarRating
                    value={Math.round(avgRating)}
                    readOnly
                    size="sm"
                  />
                  <span className="text-sm text-muted-foreground">
                    {avgRating.toFixed(1)} / 5
                  </span>
                </div>
              )}
            </div>
          </div>
          <Button
            data-ocid="profile.review.open_modal_button"
            onClick={() => setShowForm((v) => !v)}
            variant="outline"
            className="rounded-xl gap-2 border-primary/30 text-primary hover:bg-primary/10"
          >
            <Star className="w-4 h-4" />
            Write a Review
          </Button>
        </div>

        {/* Write Review Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <form
                onSubmit={handleSubmitReview}
                data-ocid="profile.review.modal"
                className="bg-muted/40 rounded-2xl p-5 mb-5 space-y-4 border border-border"
              >
                <h3 className="font-display font-semibold text-foreground">
                  Write a Review
                </h3>
                <div className="space-y-1.5">
                  <Label htmlFor="review-author">Your Name</Label>
                  <Input
                    id="review-author"
                    data-ocid="profile.review.input"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="e.g. Maria S."
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Rating</Label>
                  <StarRating value={rating} onChange={setRating} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="review-comment">Comment</Label>
                  <Textarea
                    id="review-comment"
                    data-ocid="profile.review.textarea"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your experience with this person..."
                    className="rounded-xl min-h-24"
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    type="submit"
                    data-ocid="profile.review.submit_button"
                    disabled={addReview.isPending}
                    className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                  >
                    {addReview.isPending && (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    )}
                    Submit Review
                  </Button>
                  <Button
                    type="button"
                    data-ocid="profile.review.cancel_button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                    className="rounded-xl"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Review List */}
        {reviewsLoading ? (
          <div data-ocid="profile.reviews.loading_state" className="space-y-3">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
        ) : !reviews || reviews.length === 0 ? (
          <div
            data-ocid="profile.reviews.empty_state"
            className="text-center py-10 text-muted-foreground"
          >
            <div className="text-4xl mb-3">✨</div>
            <p className="font-medium">No reviews yet. Be the first!</p>
            <p className="text-sm mt-1">
              Share your thoughts by clicking "Write a Review" above.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((review, i) => (
              <motion.div
                key={review.id.toString()}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                data-ocid={`profile.reviews.item.${i + 1}`}
                className="bg-background border border-border rounded-2xl p-4"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="font-semibold text-foreground text-sm">
                      {review.authorName}
                    </p>
                    <StarRating
                      value={Number(review.rating)}
                      readOnly
                      size="sm"
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(
                      Number(review.createdAt) / 1_000_000,
                    ).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed">
                  {review.comment}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function ProfileDetail() {
  const params = useParams({ from: "/profile/$id" });
  const navigate = useNavigate();
  const id = BigInt(params.id);
  const { data: profile, isLoading, isError } = useProfile(id);

  if (isLoading) {
    return (
      <main className="container max-w-3xl mx-auto px-4 py-10">
        <Skeleton className="h-8 w-24 mb-8" />
        <div className="bg-card rounded-3xl overflow-hidden border border-border">
          <Skeleton className="h-72 w-full" />
          <div className="p-8 space-y-4">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </main>
    );
  }

  if (isError || !profile) {
    return (
      <main className="container max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-4">😕</div>
        <h2 className="text-2xl font-display font-bold mb-2">
          Profile not found
        </h2>
        <p className="text-muted-foreground mb-6">
          This person may have removed their profile.
        </p>
        <Link to="/browse" search={{}}>
          <Button className="rounded-xl">Browse Friends</Button>
        </Link>
      </main>
    );
  }

  const flag = getFlagEmoji(profile.country);
  const isPlaceholderPhoto =
    !profile.photoUrl ||
    profile.photoUrl === "" ||
    profile.photoUrl.startsWith("placeholder");

  return (
    <main className="container max-w-3xl mx-auto px-4 py-10 pb-16">
      <Button
        variant="ghost"
        onClick={() => navigate({ to: "/browse" })}
        className="mb-8 gap-2 rounded-xl hover:bg-muted"
        data-ocid="profile.back.button"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Browse
      </Button>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-card border border-border rounded-3xl overflow-hidden shadow-card"
      >
        {/* Photo */}
        <div className="relative h-72 md:h-96 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
          {isPlaceholderPhoto ? (
            <div className="w-36 h-36 rounded-full bg-primary/20 flex items-center justify-center text-5xl font-display font-bold text-primary">
              {getInitials(profile.name)}
            </div>
          ) : (
            <img
              src={profile.photoUrl}
              alt={profile.name}
              className="w-full h-full object-cover"
            />
          )}
          <Badge className="absolute bottom-4 right-4 text-base px-4 py-2 bg-white/90 text-foreground border-0 shadow">
            {flag} {profile.country}
          </Badge>
        </div>

        {/* Info */}
        <div className="p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-display font-bold text-foreground">
                {profile.name}
              </h1>
              <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{profile.country}</span>
              </div>
            </div>
            <span className="text-5xl">{flag}</span>
          </div>

          <div className="mt-6">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              About
            </h2>
            <p className="text-foreground leading-relaxed">{profile.bio}</p>
          </div>

          <div className="mt-8 pt-8 border-t border-border">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              Contact & Connect
            </h2>
            <div className="flex flex-col gap-3">
              {profile.email && (
                <a
                  href={`mailto:${profile.email}`}
                  className="flex items-center gap-3 p-4 rounded-2xl bg-muted/50 hover:bg-primary/10 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                      {profile.email}
                    </p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground ml-auto" />
                </a>
              )}
              {profile.socialMedia && (
                <a
                  href={
                    profile.socialMedia.startsWith("http")
                      ? profile.socialMedia
                      : `https://${profile.socialMedia}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 rounded-2xl bg-muted/50 hover:bg-accent/10 transition-colors group"
                >
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Social Media
                    </p>
                    <p className="text-sm font-medium text-foreground group-hover:text-accent transition-colors">
                      {profile.socialMedia}
                    </p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-muted-foreground ml-auto" />
                </a>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Reviews & Likes Section */}
      <ReviewSection profileId={id} />
    </main>
  );
}
