import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useAdminUsers, useToggleUserStatus } from "@/hooks/useAdmin";
import { Button } from "@/components/ui/button";
import { Search, ChevronLeft, ChevronRight, Loader2, Shield, User, ToggleLeft, ToggleRight } from "lucide-react";
import { format, isValid } from "date-fns";
import { cn } from "@/lib/utils";

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const { data, isLoading, isFetching } = useAdminUsers({ search: search || undefined, page, size: 15 });
  const { mutate: toggleStatus, isPending: toggling } = useToggleUserStatus();
  const users = data?.content ?? [];

  return (
    <AppLayout>
      <div className="px-6 py-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white/90 mb-1">User Management</h1>
          <p className="text-sm text-zinc-500">{data?.totalElements ?? 0} registered users</p>
        </div>

        <div className="relative mb-5 max-w-md">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            placeholder="Search by name or email…"
            className="w-full pl-9 pr-4 py-2.5 bg-white/[0.03] border border-white/[0.07] rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/40 transition-all"
          />
        </div>

        <div className={cn("border border-white/[0.07] rounded-2xl overflow-hidden", (isLoading || isFetching) && "opacity-70 transition-opacity")}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.05] bg-white/[0.02]">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-zinc-500 uppercase tracking-wider">User</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-zinc-500 uppercase tracking-wider hidden sm:table-cell">Role</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-zinc-500 uppercase tracking-wider hidden md:table-cell">Last Viewed</th>
                <th className="text-right px-4 py-3.5 text-xs font-semibold text-zinc-500 uppercase tracking-wider hidden md:table-cell">Downloads</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-zinc-500 uppercase tracking-wider hidden lg:table-cell">Joined</th>
                <th className="text-center px-4 py-3.5 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {isLoading ? (
                <tr><td colSpan={7} className="py-16 text-center"><Loader2 size={20} className="animate-spin mx-auto text-violet-400" /></td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={7} className="py-16 text-center text-sm text-zinc-600">No users found.</td></tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-white/80 truncate group-hover:text-violet-300 transition-colors">{u.name}</p>
                          <p className="text-xs text-zinc-600 truncate">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 hidden sm:table-cell">
                      <span className={cn(
                        "inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full border",
                        u.role === "ROLE_ADMIN"
                          ? "bg-violet-500/10 text-violet-300 border-violet-500/20"
                          : "bg-white/[0.04] text-zinc-400 border-white/10"
                      )}>
                        {u.role === "ROLE_ADMIN" ? <Shield size={10} /> : <User size={10} />}
                        {u.role === "ROLE_ADMIN" ? "Admin" : "User"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <p className="text-xs text-zinc-400 truncate max-w-[150px]" title={u.lastViewedResource}>
                        {u.lastViewedResource || "—"}
                      </p>
                    </td>
                    <td className="px-4 py-3.5 text-right text-xs text-zinc-500 hidden md:table-cell">
                      <span className="tabular-nums">{u.downloadCount}</span>
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <span className="text-xs text-zinc-600">
                        {(() => {
                          if (!u.createdAt) return "—";
                          const date = new Date(u.createdAt);
                          return isValid(date) ? format(date, "MMM d, yyyy") : "—";
                        })()}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={cn(
                        "text-[11px] font-medium px-2.5 py-1 rounded-full",
                        u.active
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-red-500/10 text-red-400 border border-red-500/20"
                      )}>
                        {u.active ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => toggleStatus(u.id)}
                        disabled={toggling}
                        className={cn(
                          "p-1.5 rounded-lg transition-all",
                          u.active
                            ? "text-zinc-600 hover:text-red-400 hover:bg-red-500/10"
                            : "text-zinc-600 hover:text-emerald-400 hover:bg-emerald-500/10"
                        )}
                        title={u.active ? "Disable user" : "Enable user"}
                      >
                        {u.active ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {(data?.totalPages ?? 1) > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-xs text-zinc-600">Page {page + 1} of {data?.totalPages}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}
                className="border-white/10 bg-white/[0.03] text-zinc-400 hover:text-white disabled:opacity-40">
                <ChevronLeft size={14} />
              </Button>
              <Button variant="outline" size="sm" disabled={page >= (data?.totalPages ?? 1) - 1} onClick={() => setPage(page + 1)}
                className="border-white/10 bg-white/[0.03] text-zinc-400 hover:text-white disabled:opacity-40">
                <ChevronRight size={14} />
              </Button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
