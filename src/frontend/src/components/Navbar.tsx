import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const navLinks = [
  { to: "/" as const, label: "Home", ocid: "nav.home.link" },
  {
    to: "/browse" as const,
    label: "Browse",
    ocid: "nav.browse.link",
    search: {},
  },
  { to: "/countries" as const, label: "Countries", ocid: "nav.countries.link" },
  { to: "/about" as const, label: "About", ocid: "nav.about.link" },
  { to: "/contact" as const, label: "Contact", ocid: "nav.contact.link" },
  { to: "/admin" as const, label: "Admin", ocid: "nav.admin.link" },
];

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === "logging-in";

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (error: any) {
        if (error?.message === "User is already authenticated") {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link
            to="/"
            className="flex items-center gap-2 font-display font-bold text-xl text-foreground"
          >
            <img
              src="/assets/uploads/8CF45E72-C5D1-4FC7-8FF4-F25F3252F920-1.png"
              alt="World Mosaic"
              className="h-10 w-auto"
            />
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                search={"search" in link ? link.search : undefined}
                data-ocid={link.ocid}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentPath === link.to
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleAuth}
              disabled={isLoggingIn}
              variant={isAuthenticated ? "outline" : "default"}
              size="sm"
              className={`hidden md:flex rounded-xl ${
                !isAuthenticated
                  ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                  : ""
              }`}
            >
              {isLoggingIn
                ? "Logging in..."
                : isAuthenticated
                  ? "Logout"
                  : "Login"}
            </Button>

            <button
              type="button"
              className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-card border-t border-border overflow-hidden"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  search={"search" in link ? link.search : undefined}
                  data-ocid={link.ocid}
                  onClick={() => setMenuOpen(false)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    currentPath === link.to
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Button
                onClick={() => {
                  handleAuth();
                  setMenuOpen(false);
                }}
                disabled={isLoggingIn}
                variant={isAuthenticated ? "outline" : "default"}
                className={`mt-2 rounded-xl ${
                  !isAuthenticated
                    ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                    : ""
                }`}
              >
                {isLoggingIn
                  ? "Logging in..."
                  : isAuthenticated
                    ? "Logout"
                    : "Login"}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
