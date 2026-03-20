import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import type { SocialUser } from "../backend.d";
import { BadgeList } from "../components/BadgeDisplay";
import { VerifiedBadge } from "../components/VerifiedBadge";
import { useAllSocialUsers, useUserBadges } from "../hooks/useQueries";
import { ALL_COUNTRIES, getFlagEmoji } from "../utils/flags";

function UserCard({ user, index }: { user: SocialUser; index: number }) {
  const { data: badges = [] } = useUserBadges(user.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.35 }}
      className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-3 shadow-xs hover:shadow-card transition-shadow"
      data-ocid={`explore.user.item.${index + 1}`}
    >
      <div className="flex items-start gap-3">
        <Avatar className="w-12 h-12 flex-shrink-0">
          <AvatarImage src={user.avatarUrl} />
          <AvatarFallback className="bg-primary/15 text-primary font-bold">
            {user.displayName?.[0]?.toUpperCase() ?? "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1">
              <p className="font-display font-semibold text-foreground text-sm leading-tight">
                {user.displayName}
              </p>
              {user.isVerified && <VerifiedBadge size={14} />}
            </div>
            {user.userType === "actor" && (
              <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full font-semibold">
                🎭 Actor
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {getFlagEmoji(user.country)} {user.country}
          </p>
          {user.bio && (
            <p className="text-xs text-foreground/70 mt-1 line-clamp-2">
              {user.bio}
            </p>
          )}
        </div>
      </div>

      <BadgeList badges={badges} max={3} size="sm" />

      <Button
        asChild
        size="sm"
        data-ocid={`explore.view_profile.button.${index + 1}`}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl mt-auto"
      >
        <Link to="/user/$userId" params={{ userId: user.id.toString() }}>
          View Profile
        </Link>
      </Button>
    </motion.div>
  );
}

export function Explore() {
  const [search, setSearch] = useState("");
  const [countryFilter, setCountryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const { data: users = [], isLoading } = useAllSocialUsers();

  const filtered = useMemo(() => {
    let list: SocialUser[] = [...users];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (u) =>
          u.displayName.toLowerCase().includes(q) ||
          u.username.toLowerCase().includes(q) ||
          u.country.toLowerCase().includes(q),
      );
    }
    if (countryFilter !== "all") {
      list = list.filter((u) => u.country === countryFilter);
    }
    if (typeFilter !== "all") {
      list = list.filter((u) => u.userType === typeFilter);
    }
    return list;
  }, [users, search, countryFilter, typeFilter]);

  const uniqueCountries = useMemo(() => {
    const set = new Set(users.map((u) => u.country).filter(Boolean));
    return [...set].sort();
  }, [users]);

  return (
    <main>
      <section className="gradient-mesh py-10 border-b border-border">
        <div className="container max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="text-4xl font-display font-bold text-foreground mb-2">
              🌍 Explore
            </h1>
            <p className="text-muted-foreground">
              Discover members and actors from around the world.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="container max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              data-ocid="explore.search_input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, username, or country..."
              className="pl-9 rounded-xl"
            />
          </div>
          <Select value={countryFilter} onValueChange={setCountryFilter}>
            <SelectTrigger
              data-ocid="explore.country.select"
              className="w-full sm:w-48 rounded-xl"
            >
              <SelectValue placeholder="All Countries" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">🌍 All Countries</SelectItem>
              {uniqueCountries.map((c) => (
                <SelectItem key={c} value={c}>
                  {getFlagEmoji(c)} {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger
              data-ocid="explore.type.select"
              className="w-full sm:w-44 rounded-xl"
            >
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="member">👤 Member</SelectItem>
              <SelectItem value="actor">🎭 Actor</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      <section className="container max-w-7xl mx-auto px-4 pb-16">
        <p className="text-sm text-muted-foreground mb-6">
          {isLoading ? "Loading..." : `${filtered.length} members found`}
        </p>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {["sk1", "sk2", "sk3", "sk4", "sk5", "sk6", "sk7", "sk8"].map(
              (sk) => (
                <div
                  key={sk}
                  className="bg-card rounded-2xl p-5 border border-border space-y-3"
                >
                  <div className="flex gap-3">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                  <Skeleton className="h-9 w-full rounded-xl" />
                </div>
              ),
            )}
          </div>
        ) : filtered.length === 0 ? (
          <div
            data-ocid="explore.empty_state"
            className="text-center py-20 text-muted-foreground"
          >
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-lg font-medium">No members found</p>
            <p className="text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((user, i) => (
              <UserCard key={user.id.toString()} user={user} index={i} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
