import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import { Globe2, Search, Users } from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import type { Profile } from "../backend.d";
import { ProfileCard } from "../components/ProfileCard";
import { useCountries, useSearchProfiles } from "../hooks/useQueries";
import { getFlagEmoji } from "../utils/flags";

const FLOATING_EMOJIS = [
  "🇯🇵",
  "🇧🇷",
  "🇫🇷",
  "🇳🇬",
  "🇮🇳",
  "🇦🇺",
  "🇰🇷",
  "🇲🇽",
  "🇩🇪",
  "🇿🇦",
];

const SKELETON_IDS = ["sk1", "sk2", "sk3", "sk4", "sk5", "sk6"];

export function Home() {
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data: allProfiles, isLoading: profilesLoading } =
    useSearchProfiles(debouncedSearch);
  const { data: countries } = useCountries();

  const filteredProfiles: Profile[] = (allProfiles ?? []).filter((p) =>
    selectedCountry ? p.country === selectedCountry : true,
  );

  const topCountries = (countries ?? []).slice(0, 8);

  const handleCountryFilter = useCallback((country: string | null) => {
    setSelectedCountry((prev) => (prev === country ? null : country));
  }, []);

  return (
    <main>
      {/* Hero */}
      <section className="gradient-mesh relative overflow-hidden py-16 md:py-24">
        {FLOATING_EMOJIS.map((emoji, i) => (
          <motion.span
            key={emoji}
            className="absolute text-3xl select-none pointer-events-none"
            style={{
              left: `${8 + i * 9}%`,
              top: `${15 + (i % 3) * 30}%`,
              opacity: 0.35,
            }}
            animate={{
              y: [0, -10 - (i % 3) * 4, 0],
              rotate: [0, i % 2 === 0 ? 8 : -8, 0],
            }}
            transition={{
              duration: 3 + i * 0.4,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          >
            {emoji}
          </motion.span>
        ))}

        <div className="container max-w-4xl mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              <Globe2 className="w-4 h-4" />
              Connecting the world
            </span>
            <h1 className="text-5xl md:text-6xl font-display font-bold text-foreground leading-tight mb-4">
              World Mosaic — Make Friends
              <br />
              <span className="text-gradient">Across Borders</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
              Discover amazing people from every corner of the globe. Connect,
              learn, and grow together through friendship.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative max-w-2xl mx-auto"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              data-ocid="home.search_input"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name or country..."
              className="pl-12 pr-4 py-4 h-14 text-base rounded-2xl border-2 border-border focus:border-primary shadow-card bg-card"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-center gap-8 mt-8 text-sm text-muted-foreground"
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <span>{(allProfiles ?? []).length} friends worldwide</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe2 className="w-4 h-4 text-accent" />
              <span>{(countries ?? []).length} countries</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Country filters */}
      {topCountries.length > 0 && (
        <section className="container max-w-7xl mx-auto px-4 py-8">
          <div className="flex gap-3 flex-wrap items-center">
            <Button
              variant={selectedCountry === null ? "default" : "outline"}
              size="sm"
              onClick={() => handleCountryFilter(null)}
              data-ocid="home.country.tab"
              className={`rounded-full ${
                selectedCountry === null
                  ? "bg-primary text-primary-foreground"
                  : "border-border hover:border-primary hover:text-primary"
              }`}
            >
              🌍 All Countries
            </Button>
            {topCountries.map(([country]) => (
              <Button
                key={country}
                variant={selectedCountry === country ? "default" : "outline"}
                size="sm"
                onClick={() => handleCountryFilter(country)}
                data-ocid="home.country.tab"
                className={`rounded-full ${
                  selectedCountry === country
                    ? "bg-primary text-primary-foreground"
                    : "border-border hover:border-primary hover:text-primary"
                }`}
              >
                {getFlagEmoji(country)} {country}
              </Button>
            ))}
          </div>
        </section>
      )}

      {/* Profiles grid */}
      <section className="container max-w-7xl mx-auto px-4 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-display font-bold text-foreground">
            {selectedCountry
              ? `${getFlagEmoji(selectedCountry)} Friends from ${selectedCountry}`
              : debouncedSearch
                ? `Results for "${debouncedSearch}"`
                : "Meet New Friends"}
          </h2>
          <Link to="/browse" search={{}}>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl border-primary text-primary hover:bg-primary/10"
            >
              View All
            </Button>
          </Link>
        </div>

        {profilesLoading ? (
          <div
            data-ocid="profile.loading_state"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {SKELETON_IDS.map((id) => (
              <div
                key={id}
                className="bg-card rounded-2xl overflow-hidden border border-border"
              >
                <Skeleton className="h-48 w-full" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-9 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProfiles.length === 0 ? (
          <div
            data-ocid="profile.empty_state"
            className="text-center py-20 text-muted-foreground"
          >
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-lg font-medium">No friends found</p>
            <p className="text-sm mt-1">
              Try a different search or country filter
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProfiles.slice(0, 6).map((profile, i) => (
              <ProfileCard
                key={profile.id.toString()}
                profile={profile}
                index={i}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
