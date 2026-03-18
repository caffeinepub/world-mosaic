import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useCountries } from "../hooks/useQueries";
import { getFlagEmoji } from "../utils/flags";

const SKELETON_IDS = [
  "c1",
  "c2",
  "c3",
  "c4",
  "c5",
  "c6",
  "c7",
  "c8",
  "c9",
  "c10",
  "c11",
  "c12",
  "c13",
  "c14",
  "c15",
];

export function Countries() {
  const navigate = useNavigate();
  const { data: countries, isLoading } = useCountries();

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
              Countries
            </h1>
            <p className="text-muted-foreground">
              Explore friends by their home country. Click a country to see all
              profiles.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="container max-w-7xl mx-auto px-4 py-10 pb-16">
        {isLoading ? (
          <div
            data-ocid="countries.loading_state"
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
          >
            {SKELETON_IDS.map((id) => (
              <Skeleton key={id} className="h-32 w-full rounded-2xl" />
            ))}
          </div>
        ) : !countries || countries.length === 0 ? (
          <div
            data-ocid="countries.empty_state"
            className="text-center py-20 text-muted-foreground"
          >
            <div className="text-6xl mb-4">🌍</div>
            <p className="text-lg font-medium">No countries yet</p>
            <p className="text-sm mt-1">Add profiles to see countries here</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {countries.map(([country, count], i) => (
              <motion.button
                key={country}
                type="button"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                onClick={() => navigate({ to: "/browse", search: { country } })}
                className="bg-card border border-border rounded-2xl p-5 text-center card-hover cursor-pointer flex flex-col items-center gap-2"
              >
                <span className="text-4xl">{getFlagEmoji(country)}</span>
                <p className="font-display font-semibold text-foreground text-sm leading-tight">
                  {country}
                </p>
                <p className="text-xs text-muted-foreground">
                  {count.toString()}{" "}
                  {count === BigInt(1) ? "friend" : "friends"}
                </p>
              </motion.button>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
