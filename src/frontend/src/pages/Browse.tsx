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
import { Search, SlidersHorizontal } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import type { Profile } from "../backend.d";
import { ProfileCard } from "../components/ProfileCard";
import { useCountries, useSearchProfiles } from "../hooks/useQueries";
import { getFlagEmoji } from "../utils/flags";

type SortOption = "newest" | "az" | "country";

const SKELETON_IDS = ["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8", "s9"];

export function Browse() {
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [sort, setSort] = useState<SortOption>("newest");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { data: profiles, isLoading } = useSearchProfiles(debouncedSearch);
  const { data: countries } = useCountries();

  const filteredAndSorted = useMemo(() => {
    let items: Profile[] = profiles ?? [];
    if (selectedCountry !== "all") {
      items = items.filter((p) => p.country === selectedCountry);
    }
    if (sort === "az") {
      items = [...items].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === "country") {
      items = [...items].sort((a, b) => a.country.localeCompare(b.country));
    } else {
      items = [...items].sort((a, b) => Number(b.createdAt - a.createdAt));
    }
    return items;
  }, [profiles, selectedCountry, sort]);

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
              Browse Friends
            </h1>
            <p className="text-muted-foreground">
              Explore profiles from around the world and find your next
              international friend.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="container max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              data-ocid="browse.search_input"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name or country..."
              className="pl-9 rounded-xl"
            />
          </div>

          <Select value={selectedCountry} onValueChange={setSelectedCountry}>
            <SelectTrigger className="w-full sm:w-48 rounded-xl">
              <SelectValue placeholder="All Countries" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">🌍 All Countries</SelectItem>
              {(countries ?? []).map(([country]) => (
                <SelectItem key={country} value={country}>
                  {getFlagEmoji(country)} {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sort} onValueChange={(v) => setSort(v as SortOption)}>
            <SelectTrigger
              data-ocid="browse.sort.select"
              className="w-full sm:w-44 rounded-xl"
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="az">A-Z by Name</SelectItem>
              <SelectItem value="country">By Country</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {(countries ?? []).length > 0 && (
          <div className="flex gap-2 flex-wrap mt-4">
            <Button
              variant={selectedCountry === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCountry("all")}
              className={`rounded-full text-xs ${
                selectedCountry === "all"
                  ? "bg-primary text-primary-foreground"
                  : ""
              }`}
            >
              All
            </Button>
            {(countries ?? []).map(([country, count]) => (
              <Button
                key={country}
                variant={selectedCountry === country ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  setSelectedCountry((prev) =>
                    prev === country ? "all" : country,
                  )
                }
                className={`rounded-full text-xs ${
                  selectedCountry === country
                    ? "bg-primary text-primary-foreground"
                    : ""
                }`}
              >
                {getFlagEmoji(country)} {country}{" "}
                <span className="ml-1 opacity-60">({count.toString()})</span>
              </Button>
            ))}
          </div>
        )}
      </section>

      <section className="container max-w-7xl mx-auto px-4 pb-16">
        <p className="text-sm text-muted-foreground mb-6">
          {isLoading
            ? "Loading..."
            : `${filteredAndSorted.length} friends found`}
        </p>

        {isLoading ? (
          <div
            data-ocid="browse.loading_state"
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
                  <Skeleton className="h-9 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredAndSorted.length === 0 ? (
          <div
            data-ocid="browse.empty_state"
            className="text-center py-20 text-muted-foreground"
          >
            <div className="text-6xl mb-4">🌐</div>
            <p className="text-lg font-medium">No friends found</p>
            <p className="text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSorted.map((profile, i) => (
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
