import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft, ExternalLink, Globe, Mail, MapPin } from "lucide-react";
import { motion } from "motion/react";
import { useProfile } from "../hooks/useQueries";
import { getFlagEmoji, getInitials } from "../utils/flags";

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
    </main>
  );
}
