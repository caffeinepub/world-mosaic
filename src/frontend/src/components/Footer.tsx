import { Link } from "@tanstack/react-router";
import { Globe, Heart } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();
  const hostname = window.location.hostname;

  return (
    <footer className="bg-foreground text-background/80 mt-20">
      <div className="container max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Globe className="w-5 h-5 text-primary" />
              <span className="font-display font-bold text-lg text-background">
                World Mosaic
              </span>
            </div>
            <p className="text-sm leading-relaxed">
              Connecting people across cultures, borders, and languages. Make
              your world a little smaller.
            </p>
          </div>

          <div>
            <h4 className="font-display font-semibold text-background mb-3">
              Explore
            </h4>
            <div className="flex flex-col gap-2 text-sm">
              <Link to="/" className="hover:text-background transition-colors">
                Home
              </Link>
              <Link
                to="/browse"
                search={{}}
                className="hover:text-background transition-colors"
              >
                Browse Friends
              </Link>
              <Link
                to="/countries"
                className="hover:text-background transition-colors"
              >
                Countries
              </Link>
              <Link
                to="/about"
                className="hover:text-background transition-colors"
              >
                About
              </Link>
              <Link
                to="/contact"
                className="hover:text-background transition-colors"
              >
                Contact
              </Link>
            </div>
          </div>

          <div>
            <h4 className="font-display font-semibold text-background mb-3">
              Connect
            </h4>
            <p className="text-sm">
              Join thousands of people discovering friendships beyond borders.
            </p>
            <p className="text-sm mt-3">🌍 Available worldwide, always free.</p>
          </div>
        </div>

        <div className="border-t border-background/10 mt-8 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
          <p>
            © {year}. Built with{" "}
            <Heart className="w-3.5 h-3.5 inline text-primary fill-primary" />{" "}
            using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-background transition-colors underline underline-offset-2"
            >
              caffeine.ai
            </a>
          </p>
          <p className="text-background/50">
            Connecting the world, one friendship at a time.
          </p>
        </div>
      </div>
    </footer>
  );
}
