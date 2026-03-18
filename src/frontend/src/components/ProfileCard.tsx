import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { motion } from "motion/react";
import type { Profile } from "../backend.d";
import { getFlagEmoji, getInitials } from "../utils/flags";

interface ProfileCardProps {
  profile: Profile;
  index: number;
}

export function ProfileCard({ profile, index }: ProfileCardProps) {
  const flag = getFlagEmoji(profile.country);
  const initials = getInitials(profile.name);
  const isPlaceholderPhoto =
    !profile.photoUrl ||
    profile.photoUrl === "" ||
    profile.photoUrl.startsWith("placeholder");

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: "easeOut" }}
      data-ocid={`profile.card.item.${index + 1}`}
      className="group bg-card rounded-2xl overflow-hidden shadow-xs border border-border card-hover"
    >
      <div className="relative h-48 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center overflow-hidden">
        {isPlaceholderPhoto ? (
          <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center text-3xl font-display font-bold text-primary">
            {initials}
          </div>
        ) : (
          <img
            src={profile.photoUrl}
            alt={profile.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        )}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 text-sm font-medium flex items-center gap-1">
          <span className="text-base">{flag}</span>
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-display font-semibold text-lg text-foreground truncate">
          {profile.name}
        </h3>
        <div className="flex items-center gap-1.5 mt-1 text-muted-foreground text-sm">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">{profile.country}</span>
        </div>
        <p className="mt-3 text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {profile.bio}
        </p>
        <Link to="/profile/$id" params={{ id: profile.id.toString() }}>
          <Button
            className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
            size="sm"
            data-ocid={`profile.view.button.${index + 1}`}
          >
            View Profile
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}
