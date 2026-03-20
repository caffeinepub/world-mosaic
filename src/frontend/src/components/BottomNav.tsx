import { Link, useRouterState } from "@tanstack/react-router";
import { Home, PlusSquare, User } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { CreatePostModal } from "./CreatePostModal";

export function BottomNav() {
  const { userId } = useAuth();
  const [createOpen, setCreateOpen] = useState(false);
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  if (!userId) return null;

  const isActive = (path: string) => currentPath === path;

  return (
    <>
      <nav
        data-ocid="bottom_nav.panel"
        className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-[0_-1px_12px_rgba(0,0,0,0.08)]"
      >
        <div className="max-w-lg mx-auto flex items-center justify-around h-16 px-4">
          {/* Home */}
          <Link
            to="/feed"
            data-ocid="bottom_nav.home.link"
            className={`flex flex-col items-center gap-1 px-4 py-1 rounded-xl transition-colors ${
              isActive("/feed")
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Home
              className="w-6 h-6"
              strokeWidth={isActive("/feed") ? 2.5 : 1.8}
            />
            <span className="text-[10px] font-medium">Home</span>
          </Link>

          {/* Create Post */}
          <button
            type="button"
            data-ocid="bottom_nav.create_post.button"
            onClick={() => setCreateOpen(true)}
            className="flex flex-col items-center gap-1 px-4 py-1 rounded-xl text-muted-foreground hover:text-primary transition-colors"
          >
            <PlusSquare className="w-6 h-6" strokeWidth={1.8} />
            <span className="text-[10px] font-medium">Post</span>
          </button>

          {/* Profile */}
          <Link
            to="/user/$userId"
            params={{ userId: userId.toString() }}
            data-ocid="bottom_nav.profile.link"
            className={`flex flex-col items-center gap-1 px-4 py-1 rounded-xl transition-colors ${
              isActive(`/user/${userId}`)
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <User
              className="w-6 h-6"
              strokeWidth={isActive(`/user/${userId}`) ? 2.5 : 1.8}
            />
            <span className="text-[10px] font-medium">Profile</span>
          </Link>
        </div>
      </nav>

      <CreatePostModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        userId={userId}
      />
    </>
  );
}
