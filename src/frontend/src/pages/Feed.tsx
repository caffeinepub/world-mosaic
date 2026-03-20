import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "@tanstack/react-router";
import { Heart, MessageCircle, Plus } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Post } from "../backend.d";
import { CreatePostModal } from "../components/CreatePostModal";
import { DynamicBackground } from "../components/DynamicBackground";
import { useAuth } from "../contexts/AuthContext";
import { sendNotification, useNotifications } from "../hooks/useNotifications";
import {
  useAddPostComment,
  useDailyAnswers,
  useHasAnswered,
  useHasUserLikedPost,
  useLikePost,
  usePostComments,
  usePostLikeCount,
  usePosts,
  useSocialUser,
  useSubmitDailyAnswer,
  useTodayQuestion,
  useUnlikePost,
} from "../hooks/useQueries";

function timeAgo(timestamp: bigint): string {
  const now = Date.now();
  const diff = now - Number(timestamp / BigInt(1_000_000));
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function getTodayDateStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function DailyQuestionCard() {
  const { userId, user } = useAuth();
  const todayDate = getTodayDateStr();
  const { data: question } = useTodayQuestion(todayDate);
  const { data: hasAnswered } = useHasAnswered(question?.id ?? null, userId);
  const { data: answers = [] } = useDailyAnswers(
    hasAnswered ? (question?.id ?? null) : null,
  );
  const submitAnswer = useSubmitDailyAnswer();
  const [answerText, setAnswerText] = useState("");

  if (!question) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !user || !answerText.trim()) return;
    try {
      await submitAnswer.mutateAsync({
        questionId: question.id,
        userId,
        username: user.username,
        answer: answerText.trim(),
      });
      setAnswerText("");
      toast.success("Answer submitted!");
    } catch {
      toast.error("Failed to submit answer.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-2xl p-4 mb-6"
      data-ocid="feed.daily_question.card"
    >
      <p className="text-xs font-semibold text-primary mb-1 uppercase tracking-wide">
        🌐 Today&apos;s Question
      </p>
      <p className="font-display font-semibold text-foreground mb-3">
        {question.question}
      </p>

      {!userId ? (
        <p className="text-sm text-muted-foreground">Log in to answer</p>
      ) : hasAnswered ? (
        <>
          <p className="text-xs text-muted-foreground mb-2">
            You&apos;ve answered — see what others said:
          </p>
          <ScrollArea className="max-h-40">
            <div className="space-y-2">
              {answers.map((a) => (
                <div
                  key={a.id.toString()}
                  className="flex gap-2 text-sm bg-card rounded-xl px-3 py-2"
                >
                  <span className="font-semibold text-foreground shrink-0">
                    {a.username}
                  </span>
                  <span className="text-foreground/70">{a.answer}</span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-2">
          <Textarea
            data-ocid="feed.daily_question.answer.textarea"
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            placeholder="Share your answer..."
            className="rounded-xl min-h-16 text-sm bg-card"
          />
          <Button
            type="submit"
            data-ocid="feed.daily_question.answer.submit_button"
            disabled={!answerText.trim() || submitAnswer.isPending}
            size="sm"
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
          >
            Submit Answer
          </Button>
        </form>
      )}
    </motion.div>
  );
}

function PostCard({ post }: { post: Post }) {
  const { userId, user: currentUser } = useAuth();
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentText, setCommentText] = useState("");

  const { data: likeCount = BigInt(0) } = usePostLikeCount(post.id);
  const { data: hasLiked = false } = useHasUserLikedPost(post.id, userId);
  const { data: comments = [], isLoading: commentsLoading } = usePostComments(
    post.id,
    commentsOpen,
  );
  const { data: author } = useSocialUser(post.authorId);

  const likePost = useLikePost();
  const unlikePost = useUnlikePost();
  const addComment = useAddPostComment();

  const handleLike = async () => {
    if (!userId) {
      toast.error("Please log in to like posts.");
      return;
    }
    try {
      if (hasLiked) {
        await unlikePost.mutateAsync({ postId: post.id, userId });
      } else {
        await likePost.mutateAsync({ postId: post.id, userId });
        if (post.authorId !== userId) {
          sendNotification(
            "Someone liked your post!",
            post.caption || "Check it out on World Mosaic",
          );
        }
      }
    } catch {
      toast.error("Failed to update like.");
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !currentUser) {
      toast.error("Please log in to comment.");
      return;
    }
    if (!commentText.trim()) return;
    try {
      await addComment.mutateAsync({
        postId: post.id,
        authorId: userId,
        authorName: currentUser.displayName || currentUser.username,
        text: commentText.trim(),
      });
      if (post.authorId !== userId) {
        sendNotification("New comment on your post!", commentText.trim());
      }
      setCommentText("");
    } catch {
      toast.error("Failed to post comment.");
    }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-2xl overflow-hidden shadow-xs"
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <Link to="/user/$userId" params={{ userId: post.authorId.toString() }}>
          <Avatar className="w-9 h-9">
            <AvatarImage src={author?.avatarUrl} />
            <AvatarFallback className="bg-primary/15 text-primary font-semibold text-sm">
              {author?.displayName?.[0]?.toUpperCase() ?? "?"}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1 min-w-0">
          <Link
            to="/user/$userId"
            params={{ userId: post.authorId.toString() }}
            className="font-semibold text-sm text-foreground hover:text-primary transition-colors"
          >
            {author?.displayName ?? author?.username ?? "..."}
          </Link>
          {author?.country && (
            <p className="text-xs text-muted-foreground">{author.country}</p>
          )}
        </div>
        <span className="text-xs text-muted-foreground flex-shrink-0">
          {timeAgo(post.createdAt)}
        </span>
      </div>

      <div className="aspect-square bg-muted">
        <img
          src={post.imageUrl}
          alt={post.caption || "Post"}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="px-4 pt-3 pb-1 flex items-center gap-3">
        <button
          type="button"
          data-ocid="feed.post.like_button"
          onClick={handleLike}
          className="flex items-center gap-1.5 transition-transform active:scale-90"
          aria-label={hasLiked ? "Unlike" : "Like"}
        >
          <Heart
            className={`w-6 h-6 transition-colors ${
              hasLiked
                ? "fill-red-500 text-red-500"
                : "text-foreground hover:text-red-400"
            }`}
          />
        </button>
        <button
          type="button"
          data-ocid="feed.post.comment_button"
          onClick={() => setCommentsOpen((v) => !v)}
          aria-label="Toggle comments"
        >
          <MessageCircle className="w-6 h-6 text-foreground hover:text-primary transition-colors" />
        </button>
      </div>

      <div className="px-4 pb-1">
        <p className="text-sm font-semibold text-foreground">
          {likeCount.toString()} likes
        </p>
      </div>

      {post.caption && (
        <div className="px-4 pb-3">
          <p className="text-sm text-foreground">
            <Link
              to="/user/$userId"
              params={{ userId: post.authorId.toString() }}
              className="font-semibold hover:text-primary mr-1"
            >
              {author?.username ?? ""}
            </Link>
            {post.caption}
          </p>
        </div>
      )}

      {!commentsOpen && (
        <button
          type="button"
          className="px-4 pb-3 text-sm text-muted-foreground hover:text-foreground"
          onClick={() => setCommentsOpen(true)}
        >
          View comments
        </button>
      )}

      <AnimatePresence>
        {commentsOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-border overflow-hidden"
          >
            <div className="px-4 py-3 space-y-2 max-h-48 overflow-y-auto">
              {commentsLoading ? (
                <Skeleton className="h-4 w-3/4 rounded" />
              ) : comments.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No comments yet.
                </p>
              ) : (
                comments.map((c) => (
                  <div key={c.id.toString()} className="flex gap-2 text-sm">
                    <span className="font-semibold text-foreground shrink-0">
                      {c.authorName}
                    </span>
                    <span className="text-foreground/80 break-words">
                      {c.text}
                    </span>
                  </div>
                ))
              )}
            </div>
            {userId ? (
              <form
                onSubmit={handleComment}
                className="flex gap-2 px-4 pb-3 border-t border-border pt-2"
              >
                <input
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  data-ocid="feed.post.comment.input"
                  className="flex-1 text-sm bg-transparent focus:outline-none placeholder:text-muted-foreground py-1"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim() || addComment.isPending}
                  className="text-sm font-semibold text-primary disabled:opacity-40"
                  data-ocid="feed.post.comment.submit_button"
                >
                  Post
                </button>
              </form>
            ) : (
              <p className="px-4 pb-3 text-xs text-muted-foreground">
                <button
                  type="button"
                  className="text-primary hover:underline"
                  onClick={() => toast.error("Please log in to comment.")}
                >
                  Log in
                </button>{" "}
                to leave a comment.
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}

export function Feed() {
  const { userId } = useAuth();
  const [createOpen, setCreateOpen] = useState(false);
  const { data: posts = [], isLoading } = usePosts();

  useNotifications(!!userId);

  const sortedPosts = [...posts].sort((a, b) =>
    Number(b.createdAt - a.createdAt),
  );

  return (
    <div className="relative min-h-screen">
      {/* Dynamic background only on feed page */}
      <DynamicBackground />

      <main className="relative z-10">
        <div className="max-w-lg mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-display font-bold text-white drop-shadow-md">
              World Feed
            </h1>
            {userId && (
              <Button
                onClick={() => setCreateOpen(true)}
                data-ocid="feed.create_post.button"
                className="bg-white/90 hover:bg-white text-foreground rounded-xl gap-2 shadow-md"
                size="sm"
              >
                <Plus className="w-4 h-4" />
                New Post
              </Button>
            )}
          </div>

          {/* Daily Question */}
          <DailyQuestionCard />

          {/* Loading skeletons */}
          {isLoading ? (
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-card border border-border rounded-2xl overflow-hidden"
                  data-ocid="feed.loading_state"
                >
                  <div className="flex items-center gap-3 p-4">
                    <Skeleton className="w-9 h-9 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-3 w-24 rounded" />
                      <Skeleton className="h-3 w-16 rounded" />
                    </div>
                  </div>
                  <Skeleton className="aspect-square w-full" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-4 w-16 rounded" />
                    <Skeleton className="h-4 w-3/4 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : sortedPosts.length === 0 ? (
            <div data-ocid="feed.empty_state" className="text-center py-20">
              <div className="bg-card/80 backdrop-blur-sm rounded-2xl p-8 inline-block">
                <div className="text-6xl mb-4">📸</div>
                <h2 className="text-xl font-display font-semibold text-foreground mb-2">
                  No posts yet
                </h2>
                <p className="text-muted-foreground mb-6">
                  Be the first to share a moment with the world!
                </p>
                {userId && (
                  <Button
                    onClick={() => setCreateOpen(true)}
                    data-ocid="feed.empty.create_post.button"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Share a Post
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {sortedPosts.map((post) => (
                <PostCard key={post.id.toString()} post={post} />
              ))}
            </div>
          )}
        </div>
      </main>

      {userId && (
        <CreatePostModal
          open={createOpen}
          onOpenChange={setCreateOpen}
          userId={userId}
        />
      )}
    </div>
  );
}
