import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
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
import {
  Eye,
  EyeOff,
  Globe,
  Loader2,
  LogOut,
  Pencil,
  Plus,
  Trash2,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Profile } from "../backend.d";
import {
  useCreateProfile,
  useDeleteProfile,
  useProfiles,
  useUpdateProfile,
} from "../hooks/useQueries";
import { ALL_COUNTRIES, getFlagEmoji, getInitials } from "../utils/flags";

const ADMIN_PASSWORD = "worldmossaic9876##";
const SESSION_KEY = "adminAuthenticated";

interface ProfileForm {
  name: string;
  country: string;
  photoUrl: string;
  bio: string;
  email: string;
  socialMedia: string;
}

const emptyForm: ProfileForm = {
  name: "",
  country: "",
  photoUrl: "",
  bio: "",
  email: "",
  socialMedia: "",
};

function PasswordGate({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isChecking, setIsChecking] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsChecking(true);
    setTimeout(() => {
      if (password === ADMIN_PASSWORD) {
        sessionStorage.setItem(SESSION_KEY, "true");
        onSuccess();
      } else {
        setError("Incorrect password. Please try again.");
        setPassword("");
      }
      setIsChecking(false);
    }, 400);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        <div className="bg-card border border-border rounded-3xl p-8 shadow-xl">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-4 shadow-md">
              <Globe className="w-9 h-9 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-display font-bold text-foreground">
              World Mosaic
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Admin Panel</p>
          </div>

          <h2 className="text-xl font-display font-semibold text-foreground mb-1">
            Admin Access
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Enter the admin password to manage World Mosaic
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-password">Password</Label>
              <div className="relative">
                <Input
                  id="admin-password"
                  data-ocid="admin.password.input"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter admin password"
                  className="rounded-xl pr-10"
                  autoFocus
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowPassword((v) => !v)}
                  data-ocid="admin.password.toggle"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {error && (
                <p
                  className="text-sm text-destructive"
                  data-ocid="admin.password.error_state"
                >
                  {error}
                </p>
              )}
            </div>

            <Button
              type="submit"
              data-ocid="admin.password.submit_button"
              disabled={isChecking || !password}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl gap-2"
            >
              {isChecking && <Loader2 className="w-4 h-4 animate-spin" />}
              Sign In
            </Button>
          </form>
        </div>
      </motion.div>
    </main>
  );
}

export function Admin() {
  const [authenticated, setAuthenticated] = useState(
    () => sessionStorage.getItem(SESSION_KEY) === "true",
  );

  const { data: profiles, isLoading: profilesLoading } = useProfiles();
  const createProfile = useCreateProfile();
  const updateProfile = useUpdateProfile();
  const deleteProfile = useDeleteProfile();

  const [showForm, setShowForm] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Profile | null>(null);
  const [form, setForm] = useState<ProfileForm>(emptyForm);

  const handleSignOut = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setAuthenticated(false);
  };

  if (!authenticated) {
    return <PasswordGate onSuccess={() => setAuthenticated(true)} />;
  }

  const openCreate = () => {
    setEditingProfile(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (profile: Profile) => {
    setEditingProfile(profile);
    setForm({
      name: profile.name,
      country: profile.country,
      photoUrl: profile.photoUrl,
      bio: profile.bio,
      email: profile.email ?? "",
      socialMedia: profile.socialMedia ?? "",
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.country) {
      toast.error("Name and country are required.");
      return;
    }
    try {
      if (editingProfile) {
        await updateProfile.mutateAsync({
          id: editingProfile.id,
          name: form.name,
          country: form.country,
          photoUrl: form.photoUrl,
          bio: form.bio,
          email: form.email || null,
          socialMedia: form.socialMedia || null,
        });
        toast.success("Profile updated!");
      } else {
        await createProfile.mutateAsync({
          name: form.name,
          country: form.country,
          photoUrl: form.photoUrl,
          bio: form.bio,
          email: form.email || null,
          socialMedia: form.socialMedia || null,
        });
        toast.success("Profile created!");
      }
      setShowForm(false);
      setForm(emptyForm);
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteProfile.mutateAsync(deleteTarget.id);
      toast.success(`${deleteTarget.name}'s profile deleted.`);
      setDeleteTarget(null);
    } catch {
      toast.error("Could not delete profile.");
    }
  };

  const isPending = createProfile.isPending || updateProfile.isPending;

  return (
    <main>
      <section className="gradient-mesh py-10 border-b border-border">
        <div className="container max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-display font-bold text-foreground mb-1">
              Admin Panel
            </h1>
            <p className="text-muted-foreground">
              Manage World Mosaic profiles and website content.
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleSignOut}
            data-ocid="admin.signout.button"
            className="rounded-xl gap-2 border-border"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </section>

      <section className="container max-w-7xl mx-auto px-4 py-8 pb-20">
        <Tabs defaultValue="profiles" data-ocid="admin.tab">
          <TabsList className="mb-6 rounded-xl">
            <TabsTrigger
              value="profiles"
              data-ocid="admin.profiles.tab"
              className="rounded-lg gap-2"
            >
              <Users className="w-4 h-4" />
              Profiles
            </TabsTrigger>
          </TabsList>

          {/* ── Profiles Tab ── */}
          <TabsContent value="profiles">
            <div className="flex justify-end mb-4">
              <Button
                onClick={openCreate}
                data-ocid="admin.add_profile.button"
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Profile
              </Button>
            </div>

            {profilesLoading ? (
              <div
                data-ocid="admin.loading_state"
                className="text-center py-20"
              >
                <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
              </div>
            ) : (profiles ?? []).length === 0 ? (
              <div
                data-ocid="admin.empty_state"
                className="text-center py-20 text-muted-foreground"
              >
                <div className="text-6xl mb-4">📋</div>
                <p className="text-lg font-medium">No profiles yet</p>
                <p className="text-sm mt-1">
                  Click "Add Profile" to create the first one.
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {(profiles ?? []).map((profile, i) => (
                  <motion.div
                    key={profile.id.toString()}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    data-ocid={`admin.profile.item.${i + 1}`}
                    className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4"
                  >
                    <Avatar className="w-12 h-12 flex-shrink-0">
                      <AvatarImage src={profile.photoUrl} alt={profile.name} />
                      <AvatarFallback className="bg-primary/15 text-primary font-semibold">
                        {getInitials(profile.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-semibold text-foreground truncate">
                        {profile.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge
                          variant="secondary"
                          className="text-xs rounded-full"
                        >
                          {getFlagEmoji(profile.country)} {profile.country}
                        </Badge>
                        {profile.email && (
                          <span className="text-xs text-muted-foreground truncate hidden sm:block">
                            {profile.email}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => openEdit(profile)}
                        data-ocid={`admin.profile.edit_button.${i + 1}`}
                        className="rounded-xl w-9 h-9"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setDeleteTarget(profile)}
                        data-ocid={`admin.profile.delete_button.${i + 1}`}
                        className="rounded-xl w-9 h-9 border-destructive/30 text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </section>

      {/* Create/Edit Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent
          data-ocid="admin.form.dialog"
          className="max-w-lg rounded-2xl"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {editingProfile ? "Edit Profile" : "Add New Profile"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            {/* Photo */}
            <div className="space-y-2">
              <Label htmlFor="admin-photo">Photo URL</Label>
              <div className="flex gap-3 items-center">
                <Avatar className="w-14 h-14 flex-shrink-0">
                  <AvatarImage src={form.photoUrl} />
                  <AvatarFallback className="bg-primary/15 text-primary font-bold">
                    {form.name ? getInitials(form.name) : "?"}
                  </AvatarFallback>
                </Avatar>
                <Input
                  id="admin-photo"
                  data-ocid="admin.form.upload_button"
                  value={form.photoUrl}
                  onChange={(e) =>
                    setForm({ ...form, photoUrl: e.target.value })
                  }
                  placeholder="Paste image URL (e.g. https://...)"
                  className="rounded-xl"
                />
              </div>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="admin-name">Name *</Label>
              <Input
                id="admin-name"
                data-ocid="admin.form.name.input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Full name"
                className="rounded-xl"
                required
              />
            </div>

            {/* Country */}
            <div className="space-y-2">
              <Label htmlFor="admin-country">Country *</Label>
              <Input
                id="admin-country"
                data-ocid="admin.form.country.input"
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                placeholder="e.g. Japan, Brazil, France"
                list="country-list"
                className="rounded-xl"
                required
              />
              <datalist id="country-list">
                {ALL_COUNTRIES.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="admin-bio">Bio</Label>
              <Textarea
                id="admin-bio"
                data-ocid="admin.form.bio.textarea"
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="A short introduction..."
                className="rounded-xl min-h-24"
              />
            </div>

            {/* Email (optional) */}
            <div className="space-y-2">
              <Label htmlFor="admin-email">Email (optional)</Label>
              <Input
                id="admin-email"
                type="email"
                data-ocid="admin.form.email.input"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="contact@example.com"
                className="rounded-xl"
              />
            </div>

            {/* Social Media */}
            <div className="space-y-2">
              <Label htmlFor="admin-social">Social Media URL</Label>
              <Input
                id="admin-social"
                data-ocid="admin.form.social.input"
                value={form.socialMedia}
                onChange={(e) =>
                  setForm({ ...form, socialMedia: e.target.value })
                }
                placeholder="https://instagram.com/..."
                className="rounded-xl"
              />
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
                data-ocid="admin.form.cancel_button"
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                data-ocid="admin.form.submit_button"
                disabled={isPending}
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl gap-2"
              >
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingProfile ? "Save Changes" : "Create Profile"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent
          data-ocid="admin.delete.dialog"
          className="rounded-2xl"
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">
              Delete Profile?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong>{deleteTarget?.name}</strong>'s profile? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              data-ocid="admin.delete.cancel_button"
              className="rounded-xl"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="admin.delete.confirm_button"
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-xl"
            >
              {deleteProfile.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
