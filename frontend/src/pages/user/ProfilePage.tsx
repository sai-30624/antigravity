import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/AppLayout";
import { api } from "@/lib/axios";
import { User, Shield, Calendar, Download, Bookmark, Star, Save, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import type { UserProfile } from "@/types";

export default function ProfilePage() {
  const { user } = useAuth();

  const { data: profile, isLoading, refetch } = useQuery<UserProfile>({
    queryKey: ["profile"],
    queryFn: async () => (await api.get("/users/me")).data,
  });

  const [name, setName] = useState(user?.name ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.put("/users/me", {
        name,
        ...(currentPassword && newPassword ? { currentPassword, newPassword } : {}),
      });
      setSaved(true);
      setCurrentPassword("");
      setNewPassword("");
      refetch();
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const stats = [
    { label: "Downloads", value: profile?.downloadCount ?? 0, icon: <Download size={16} className="text-violet-400" /> },
    { label: "Bookmarks", value: profile?.bookmarkCount ?? 0, icon: <Bookmark size={16} className="text-indigo-400" /> },
    { label: "Reviews", value: profile?.reviewCount ?? 0, icon: <Star size={16} className="text-amber-400" /> },
  ];

  return (
    <AppLayout>
      <div className="px-6 py-8 max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white/90 mb-1">My Profile</h1>
          <p className="text-sm text-zinc-500">Manage your account information and security settings.</p>
        </div>

        {/* Avatar + name hero */}
        <div className="flex items-center gap-5 p-6 mb-6 bg-white/[0.02] border border-white/[0.07] rounded-2xl">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-violet-900/40">
            {(name || user?.name || "?").charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-lg font-semibold text-white/90">{profile?.name || user?.name}</p>
            <p className="text-sm text-zinc-500">{profile?.email || user?.email}</p>
            <span className={`inline-flex items-center gap-1.5 mt-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full ${
              user?.role === "ROLE_ADMIN"
                ? "bg-violet-500/10 text-violet-300 border border-violet-500/20"
                : "bg-white/5 text-zinc-400 border border-white/10"
            }`}>
              <Shield size={10} />
              {user?.role === "ROLE_ADMIN" ? "Administrator" : "Member"}
            </span>
          </div>
          {profile?.createdAt && (
            <div className="ml-auto text-right">
              <div className="flex items-center gap-1.5 text-xs text-zinc-600 justify-end">
                <Calendar size={11} />
                Member since
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                {new Date(profile.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </p>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col items-center justify-center gap-1 p-4 bg-white/[0.02] border border-white/[0.07] rounded-xl">
              {s.icon}
              <span className="text-xl font-bold text-white/90">{isLoading ? "—" : s.value}</span>
              <span className="text-xs text-zinc-600">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Edit form */}
        <form onSubmit={handleSave} className="space-y-5 bg-white/[0.02] border border-white/[0.07] rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-white/90 flex items-center gap-2">
            <User size={15} className="text-violet-400" />
            Account Details
          </h2>

          {error && (
            <div className="p-3 text-sm text-red-300 bg-red-950/40 border border-red-900/40 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400">Display Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400">Email Address</label>
            <input
              value={profile?.email || user?.email || ""}
              disabled
              className="w-full bg-black/20 border border-white/5 rounded-lg px-3 py-2.5 text-sm text-zinc-600 cursor-not-allowed"
            />
          </div>

          <div className="pt-4 border-t border-white/5">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">Change Password</p>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Leave blank to keep current"
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50 transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-400">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50 transition-colors"
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={saving}
            className={`w-full transition-all ${saved ? "bg-emerald-600 hover:bg-emerald-600" : "bg-violet-600 hover:bg-violet-500"} text-white shadow-[0_0_20px_-5px_rgba(124,58,237,0.4)]`}
          >
            {saving ? (
              <><Loader2 size={15} className="mr-2 animate-spin" /> Saving…</>
            ) : saved ? (
              <><CheckCircle size={15} className="mr-2" /> Saved!</>
            ) : (
              <><Save size={15} className="mr-2" /> Save Changes</>
            )}
          </Button>
        </form>
      </div>
    </AppLayout>
  );
}
