import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, useRouterState } from "@tanstack/react-router";
import { Bell, LogOut, Menu, User, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import { AuthModal } from "./AuthModal";

const navLinks = [
  { to: "/" as const, label: "Home", ocid: "nav.home.link" },
  { to: "/feed" as const, label: "Feed", ocid: "nav.feed.link" },
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
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "signup">("login");
  const { user, logout } = useAuth();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const openLogin = () => {
    setAuthModalTab("login");
    setAuthModalOpen(true);
  };

  const openSignup = () => {
    setAuthModalTab("signup");
    setAuthModalOpen(true);
  };

  const handleBellClick = () => {
    if (typeof Notification !== "undefined") {
      if (Notification.permission === "granted") {
        toast.success("Notifications are enabled!");
      } else if (Notification.permission === "denied") {
        toast.error(
          "Notifications are blocked. Enable them in browser settings.",
        );
      } else {
        Notification.requestPermission().then((p) => {
          if (p === "granted") toast.success("Notifications enabled!");
          else toast("Notification permission dismissed.");
        });
      }
    } else {
      toast("Notifications not supported in this browser.");
    }
  };

  return (
    <>
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

            {/* Desktop nav */}
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

            {/* Auth controls */}
            <div className="flex items-center gap-2">
              {user ? (
                <>
                  {/* Bell icon */}
                  <button
                    type="button"
                    data-ocid="nav.notifications.button"
                    onClick={handleBellClick}
                    className="hidden md:flex p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                    aria-label="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                  </button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        data-ocid="nav.user.dropdown_menu"
                        className="hidden md:flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-muted transition-colors"
                      >
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={user.avatarUrl} />
                          <AvatarFallback className="bg-primary/15 text-primary font-semibold text-xs">
                            {user.displayName?.[0]?.toUpperCase() ?? "U"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium text-foreground">
                          {user.username}
                        </span>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="rounded-xl w-48"
                    >
                      <DropdownMenuItem asChild>
                        <Link
                          to="/user/$userId"
                          params={{ userId: user.id.toString() }}
                          data-ocid="nav.profile.link"
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <User className="w-4 h-4" />
                          My Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        data-ocid="nav.logout.button"
                        onClick={logout}
                        className="flex items-center gap-2 text-destructive cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        Log Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <div className="hidden md:flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    data-ocid="nav.login.button"
                    onClick={openLogin}
                    className="rounded-xl"
                  >
                    Log In
                  </Button>
                  <Button
                    size="sm"
                    data-ocid="nav.signup.button"
                    onClick={openSignup}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
                  >
                    Sign Up
                  </Button>
                </div>
              )}

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

        {/* Mobile menu */}
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

                {user ? (
                  <>
                    <Link
                      to="/user/$userId"
                      params={{ userId: user.id.toString() }}
                      data-ocid="nav.mobile.profile.link"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
                    >
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={user.avatarUrl} />
                        <AvatarFallback className="text-xs">
                          {user.displayName?.[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {user.username}
                    </Link>
                    <Button
                      variant="outline"
                      data-ocid="nav.mobile.logout.button"
                      onClick={() => {
                        logout();
                        setMenuOpen(false);
                      }}
                      className="mt-2 rounded-xl gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Log Out
                    </Button>
                  </>
                ) : (
                  <div className="flex gap-2 mt-2">
                    <Button
                      variant="outline"
                      data-ocid="nav.mobile.login.button"
                      onClick={() => {
                        openLogin();
                        setMenuOpen(false);
                      }}
                      className="flex-1 rounded-xl"
                    >
                      Log In
                    </Button>
                    <Button
                      data-ocid="nav.mobile.signup.button"
                      onClick={() => {
                        openSignup();
                        setMenuOpen(false);
                      }}
                      className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
                    >
                      Sign Up
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <AuthModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        defaultTab={authModalTab}
      />
    </>
  );
}
