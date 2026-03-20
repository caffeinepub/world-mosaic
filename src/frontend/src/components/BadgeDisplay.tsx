import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Star } from "lucide-react";
import type { Badge } from "../backend.d";

export const BADGE_COLORS: Record<string, string> = {
  gold: "#FFD700",
  silver: "#C0C0C0",
  bronze: "#CD7F32",
  blue: "#3B82F6",
  green: "#22C55E",
  purple: "#8B5CF6",
  red: "#EF4444",
};

export const BADGE_TYPES = [
  "Top Member of the Week",
  "Rising Star",
  "Active Contributor",
  "Global Explorer",
  "Achievement Star",
  "Community Champion",
  "Creative Talent",
];

export const BADGE_EMOJIS: Record<string, string> = {
  "Top Member of the Week": "👑",
  "Rising Star": "⭐",
  "Active Contributor": "🔥",
  "Global Explorer": "🌍",
  "Achievement Star": "🏆",
  "Community Champion": "🛡️",
  "Creative Talent": "🎨",
};

interface BadgeDisplayProps {
  badge: Badge;
  size?: "sm" | "md" | "lg";
}

export function BadgeDisplay({ badge, size = "md" }: BadgeDisplayProps) {
  const color = BADGE_COLORS[badge.color] ?? badge.color ?? "#3B82F6";
  const emoji = BADGE_EMOJIS[badge.badgeType] ?? "🏅";

  const sizeClass = {
    sm: "w-7 h-7 text-sm",
    md: "w-9 h-9 text-base",
    lg: "w-12 h-12 text-xl",
  }[size];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`${sizeClass} rounded-full flex items-center justify-center cursor-help flex-shrink-0 border-2`}
            style={{
              backgroundColor: `${color}22`,
              borderColor: color,
              boxShadow: `0 0 8px ${color}55`,
            }}
          >
            <span role="img" aria-label={badge.badgeType}>
              {emoji}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-48">
          <p className="font-semibold">{badge.badgeType}</p>
          {badge.reason && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {badge.reason}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-0.5">
            Awarded by {badge.awardedBy}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function BadgeList({
  badges,
  max = 3,
  size = "sm",
}: {
  badges: Badge[];
  max?: number;
  size?: "sm" | "md" | "lg";
}) {
  const shown = badges.slice(0, max);
  const remaining = badges.length - shown.length;
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {shown.map((b) => (
        <BadgeDisplay key={b.id.toString()} badge={b} size={size} />
      ))}
      {remaining > 0 && (
        <span className="text-xs text-muted-foreground font-medium">
          +{remaining}
        </span>
      )}
      {badges.length === 0 && (
        <span className="text-xs text-muted-foreground italic">
          No badges yet
        </span>
      )}
    </div>
  );
}
