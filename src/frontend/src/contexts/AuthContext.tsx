import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { backendInterface as FullBackend, SocialUser } from "../backend.d";
import { useActor } from "../hooks/useActor";

const USER_ID_KEY = "wm_user_id";

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

interface SignupData {
  username: string;
  password: string;
  displayName: string;
  email: string;
  country: string;
  bio: string;
  avatarUrl: string;
  userType: string;
  stageName: string;
  portfolioLink: string;
}

interface AuthContextType {
  userId: bigint | null;
  user: SocialUser | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { actor: rawActor, isFetching } = useActor();
  const actor = rawActor as unknown as FullBackend | null;

  const [userId, setUserId] = useState<bigint | null>(() => {
    const stored = localStorage.getItem(USER_ID_KEY);
    return stored ? BigInt(stored) : null;
  });
  const [user, setUser] = useState<SocialUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isFetching) return;
    if (!actor || !userId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    actor
      .getSocialUser(userId)
      .then((u) => {
        setUser(u);
        setIsLoading(false);
      })
      .catch(() => {
        localStorage.removeItem(USER_ID_KEY);
        setUserId(null);
        setUser(null);
        setIsLoading(false);
      });
  }, [actor, isFetching, userId]);

  const refreshUser = useCallback(async () => {
    if (!actor || !userId) return;
    try {
      const u = await actor.getSocialUser(userId);
      setUser(u);
    } catch {
      // silently ignore refresh errors
    }
  }, [actor, userId]);

  const login = async (username: string, password: string) => {
    if (!actor) throw new Error("Not connected");
    const hash = await hashPassword(password);
    const id = await actor.loginUser(username, hash);
    if (id === null) throw new Error("Invalid username or password");
    const u = await actor.getSocialUser(id);
    localStorage.setItem(USER_ID_KEY, id.toString());
    setUserId(id);
    setUser(u);
    window.location.href = "/feed";
  };

  const signup = async (data: SignupData) => {
    if (!actor) throw new Error("Not connected");
    const hash = await hashPassword(data.password);
    const id = await actor.registerUser(
      data.username,
      hash,
      data.displayName,
      data.email,
      data.country,
      data.bio,
      data.avatarUrl,
    );
    // Update extended fields (userType, stageName, portfolioLink)
    await actor.updateSocialUser(
      id,
      data.displayName,
      data.email,
      data.country,
      data.bio,
      data.avatarUrl,
      data.userType || "member",
      data.stageName || null,
      data.portfolioLink || null,
    );
    const u = await actor.getSocialUser(id);
    localStorage.setItem(USER_ID_KEY, id.toString());
    setUserId(id);
    setUser(u);
    window.location.href = "/feed";
  };

  const logout = () => {
    localStorage.removeItem(USER_ID_KEY);
    setUserId(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ userId, user, isLoading, login, signup, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
