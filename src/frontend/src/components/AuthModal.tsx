import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import { ALL_COUNTRIES } from "../utils/flags";
import { uploadFileToStorage } from "../utils/uploadFile";

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: "login" | "signup";
}

export function AuthModal({
  open,
  onOpenChange,
  defaultTab = "login",
}: AuthModalProps) {
  const { login, signup } = useAuth();
  const [tab, setTab] = useState<string>(defaultTab);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (open) setTab(defaultTab);
  }, [open, defaultTab]);

  // Login form
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup form
  const [signupUsername, setSignupUsername] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupCountry, setSignupCountry] = useState("");
  const [signupBio, setSignupBio] = useState("");
  const [userType, setUserType] = useState("member");
  const [stageName, setStageName] = useState("");
  const [portfolioLink, setPortfolioLink] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    try {
      const url = await uploadFileToStorage(file);
      setAvatarUrl(url);
    } catch {
      toast.error("Failed to upload avatar. Please try again.");
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUsername || !loginPassword) return;
    setIsPending(true);
    try {
      await login(loginUsername, loginPassword);
      toast.success("Welcome back!");
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.message || "Login failed. Please try again.");
    } finally {
      setIsPending(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupUsername || !signupPassword || !signupName || !signupCountry) {
      toast.error("Username, password, name, and country are required.");
      return;
    }
    if (signupEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupEmail)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (userType === "actor" && !stageName.trim()) {
      toast.error("Stage name is required for Actor accounts.");
      return;
    }
    if (userType === "actor" && !portfolioLink.trim()) {
      toast.error("Portfolio link is required for Actor accounts.");
      return;
    }
    setIsPending(true);
    try {
      await signup({
        username: signupUsername,
        password: signupPassword,
        displayName: signupName,
        email: signupEmail,
        country: signupCountry,
        bio: signupBio,
        avatarUrl,
        userType,
        stageName,
        portfolioLink,
      });
      toast.success("Account created! Welcome to World Mosaic!");
      onOpenChange(false);
    } catch (err: any) {
      toast.error(
        err?.message || "Signup failed. Username may already be taken.",
      );
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-ocid="auth.dialog"
        className="max-w-md rounded-2xl max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-center">
            World Mosaic
          </DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab} className="mt-2">
          <TabsList className="w-full rounded-xl">
            <TabsTrigger
              value="login"
              data-ocid="auth.login.tab"
              className="flex-1 rounded-lg"
            >
              Log In
            </TabsTrigger>
            <TabsTrigger
              value="signup"
              data-ocid="auth.signup.tab"
              className="flex-1 rounded-lg"
            >
              Sign Up
            </TabsTrigger>
          </TabsList>

          {/* Login */}
          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="login-username">Username</Label>
                <Input
                  id="login-username"
                  data-ocid="auth.login.username.input"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder="Your username"
                  className="rounded-xl"
                  autoComplete="username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  data-ocid="auth.login.password.input"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Your password"
                  className="rounded-xl"
                  autoComplete="current-password"
                />
              </div>
              <Button
                type="submit"
                data-ocid="auth.login.submit_button"
                disabled={isPending || !loginUsername || !loginPassword}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl gap-2"
              >
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Log In
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  className="text-primary hover:underline font-medium"
                  onClick={() => setTab("signup")}
                >
                  Sign up
                </button>
              </p>
            </form>
          </TabsContent>

          {/* Signup */}
          <TabsContent value="signup">
            <form onSubmit={handleSignup} className="space-y-4 mt-4">
              {/* Avatar */}
              <div className="flex flex-col items-center gap-3">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={avatarUrl} />
                  <AvatarFallback className="bg-primary/15 text-primary font-bold text-2xl">
                    {signupName ? signupName[0]?.toUpperCase() : "?"}
                  </AvatarFallback>
                </Avatar>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  data-ocid="auth.signup.avatar.upload_button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={avatarUploading}
                  className="rounded-xl gap-2"
                >
                  {avatarUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  {avatarUploading ? "Uploading..." : "Upload Photo"}
                </Button>
              </div>

              {/* User Type */}
              <div className="space-y-2">
                <Label htmlFor="signup-usertype">Account Type *</Label>
                <Select value={userType} onValueChange={setUserType}>
                  <SelectTrigger
                    data-ocid="auth.signup.usertype.select"
                    className="rounded-xl"
                  >
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">👤 Member</SelectItem>
                    <SelectItem value="actor">🎭 Actor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-username">Username *</Label>
                <Input
                  id="signup-username"
                  data-ocid="auth.signup.username.input"
                  value={signupUsername}
                  onChange={(e) => setSignupUsername(e.target.value)}
                  placeholder="Choose a username"
                  className="rounded-xl"
                  autoComplete="username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password *</Label>
                <Input
                  id="signup-password"
                  data-ocid="auth.signup.password.input"
                  type="password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder="Create a password"
                  className="rounded-xl"
                  autoComplete="new-password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-name">Display Name *</Label>
                <Input
                  id="signup-name"
                  data-ocid="auth.signup.name.input"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  placeholder="Your full name"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email *</Label>
                <Input
                  id="signup-email"
                  type="email"
                  data-ocid="auth.signup.email.input"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="rounded-xl"
                  autoComplete="email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-country">Country *</Label>
                <Input
                  id="signup-country"
                  data-ocid="auth.signup.country.input"
                  value={signupCountry}
                  onChange={(e) => setSignupCountry(e.target.value)}
                  placeholder="Your country"
                  list="signup-country-list"
                  className="rounded-xl"
                />
                <datalist id="signup-country-list">
                  {ALL_COUNTRIES.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-bio">Bio</Label>
                <Textarea
                  id="signup-bio"
                  data-ocid="auth.signup.bio.textarea"
                  value={signupBio}
                  onChange={(e) => setSignupBio(e.target.value)}
                  placeholder="Tell the world about yourself..."
                  className="rounded-xl min-h-20"
                />
              </div>

              {/* Actor-specific fields */}
              {userType === "actor" && (
                <div className="space-y-4 p-4 bg-purple-50 border border-purple-200 rounded-xl">
                  <p className="text-sm font-semibold text-purple-700">
                    🎭 Actor Details
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="signup-stagename">Stage Name *</Label>
                    <Input
                      id="signup-stagename"
                      data-ocid="auth.signup.stagename.input"
                      value={stageName}
                      onChange={(e) => setStageName(e.target.value)}
                      placeholder="Your stage / artist name"
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-portfolio">Portfolio Link *</Label>
                    <Input
                      id="signup-portfolio"
                      data-ocid="auth.signup.portfolio.input"
                      value={portfolioLink}
                      onChange={(e) => setPortfolioLink(e.target.value)}
                      placeholder="https://yourportfolio.com"
                      className="rounded-xl"
                    />
                  </div>
                </div>
              )}

              <p className="text-xs text-muted-foreground bg-muted/50 rounded-xl p-3">
                By signing up, you agree to share your content publicly on World
                Mosaic.
              </p>

              <Button
                type="submit"
                data-ocid="auth.signup.submit_button"
                disabled={isPending}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl gap-2"
              >
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Create Account
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <button
                  type="button"
                  className="text-primary hover:underline font-medium"
                  onClick={() => setTab("login")}
                >
                  Log in
                </button>
              </p>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
