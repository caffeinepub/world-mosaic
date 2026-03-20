import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import { Crown, Medal, Trophy } from "lucide-react";
import { motion } from "motion/react";
import type { SocialUser } from "../backend.d";
import { BadgeList } from "../components/BadgeDisplay";
import { VerifiedBadge } from "../components/VerifiedBadge";
import { useLeaderboard, useUserBadges } from "../hooks/useQueries";
import { getFlagEmoji } from "../utils/flags";

const RANK_CONFIG = [
  {
    icon: <Crown className="w-5 h-5" />,
    color: "#FFD700",
    label: "1st",
    bg: "from-yellow-50 to-amber-50 border-yellow-300",
  },
  {
    icon: <Medal className="w-5 h-5" />,
    color: "#C0C0C0",
    label: "2nd",
    bg: "from-slate-50 to-gray-100 border-gray-300",
  },
  {
    icon: <Trophy className="w-5 h-5" />,
    color: "#CD7F32",
    label: "3rd",
    bg: "from-orange-50 to-amber-50 border-orange-200",
  },
];

function LeaderboardRow({
  user,
  rank,
  index,
}: { user: SocialUser; rank: number; index: number }) {
  const { data: badges = [] } = useUserBadges(user.id);
  const config = rank <= 3 ? RANK_CONFIG[rank - 1] : null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      data-ocid={`leaderboard.item.${rank}`}
      className={`flex items-center gap-4 p-4 rounded-2xl border ${
        config ? `bg-gradient-to-r ${config.bg}` : "bg-card border-border"
      } shadow-xs`}
    >
      {/* Rank */}
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm"
        style={{
          backgroundColor: config
            ? `${config.color}33`
            : "oklch(0.93 0.015 75)",
          color: config ? config.color : "oklch(0.5 0.04 40)",
          border: `2px solid ${config?.color ?? "oklch(0.88 0.015 75)"}`,
        }}
      >
        {config ? config.icon : rank}
      </div>

      {/* Avatar */}
      <Link to="/user/$userId" params={{ userId: user.id.toString() }}>
        <Avatar className="w-11 h-11 flex-shrink-0">
          <AvatarImage src={user.avatarUrl} />
          <AvatarFallback className="bg-primary/15 text-primary font-bold">
            {user.displayName?.[0]?.toUpperCase() ?? "U"}
          </AvatarFallback>
        </Avatar>
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            to="/user/$userId"
            params={{ userId: user.id.toString() }}
            className="font-display font-semibold text-foreground hover:text-primary transition-colors text-sm"
          >
            {user.displayName}
          </Link>
          {user.isVerified && <VerifiedBadge size={14} />}
          {user.userType === "actor" && (
            <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full font-semibold">
              🎭 Actor
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {getFlagEmoji(user.country)} {user.country}
        </p>
        <BadgeList badges={badges} max={2} size="sm" />
      </div>

      {/* Score */}
      <div className="text-right flex-shrink-0">
        <p
          className="text-lg font-bold"
          style={{ color: config?.color ?? "oklch(0.64 0.18 28)" }}
        >
          {user.activityScore.toString()}
        </p>
        <p className="text-[10px] text-muted-foreground">points</p>
      </div>
    </motion.div>
  );
}

export function Leaderboard() {
  const { data: users = [], isLoading } = useLeaderboard();

  return (
    <main>
      <section className="gradient-mesh py-10 border-b border-border">
        <div className="container max-w-3xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="text-4xl font-display font-bold text-foreground mb-2">
              🏆 Leaderboard
            </h1>
            <p className="text-muted-foreground">
              Top members ranked by activity score. Keep engaging to climb the
              ranks!
            </p>
          </motion.div>
        </div>
      </section>

      <section className="container max-w-3xl mx-auto px-4 py-8 pb-16">
        {isLoading ? (
          <div className="space-y-3">
            {["sk1", "sk2", "sk3", "sk4", "sk5"].map((sk) => (
              <div
                key={sk}
                className="flex items-center gap-4 p-4 rounded-2xl border bg-card"
              >
                <Skeleton className="w-10 h-10 rounded-full" />
                <Skeleton className="w-11 h-11 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="w-12 h-8" />
              </div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <div
            data-ocid="leaderboard.empty_state"
            className="text-center py-20 text-muted-foreground"
          >
            <div className="text-6xl mb-4">🏆</div>
            <p className="text-lg font-medium">No rankings yet</p>
            <p className="text-sm mt-1">
              Start posting and engaging to earn points!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {users.map((user, i) => (
              <LeaderboardRow
                key={user.id.toString()}
                user={user}
                rank={i + 1}
                index={i}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
