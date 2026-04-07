import { useState } from "react";
import type { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  BookOpen,
  Home,
  User,
  LogOut,
  Menu,
  X,
  Shield,
  BarChart3,
  FileText,
  Users,
  Tag,
  MessageSquare,
  Bookmark,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  icon: ReactNode;
  href: string;
  role?: "ROLE_ADMIN" | "ROLE_USER";
}

const userNav: NavItem[] = [
  { label: "Browse Resources", icon: <Home size={18} />, href: "/" },
  { label: "Bookmarks", icon: <Bookmark size={18} />, href: "/bookmarks" },
  { label: "My Profile", icon: <User size={18} />, href: "/profile" },
];

const adminNav: NavItem[] = [
  { label: "Dashboard", icon: <BarChart3 size={18} />, href: "/admin" },
  { label: "Resources", icon: <FileText size={18} />, href: "/admin/resources" },
  { label: "Users", icon: <Users size={18} />, href: "/admin/users" },
  { label: "Categories & Tags", icon: <Tag size={18} />, href: "/admin/categories" },
  { label: "Feedback", icon: <MessageSquare size={18} />, href: "/admin/feedback" },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAdmin = user?.role === "ROLE_ADMIN";
  const navItems = isAdmin ? adminNav : userNav;

  const isActive = (href: string) => {
    if (href === "/" || href === "/admin") return location.pathname === href;
    return location.pathname.startsWith(href);
  };

  return (
    <div className="flex h-screen bg-[#050508] text-white overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 flex flex-col border-r border-white/5 bg-[#08090f]/90 backdrop-blur-xl transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-900/40">
            <BookOpen size={16} className="text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-violet-300 to-indigo-300 bg-clip-text text-transparent">
            Libranet
          </span>
          {isAdmin && (
            <span className="ml-auto flex items-center gap-1 text-[10px] font-semibold text-violet-300 bg-violet-500/10 border border-violet-500/20 rounded-full px-2 py-0.5">
              <Shield size={9} /> Admin
            </span>
          )}
          <button
            className="ml-auto lg:hidden text-zinc-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                isActive(item.href)
                  ? "bg-violet-600/20 text-violet-300 border border-violet-500/20"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              )}
            >
              <span className={cn(isActive(item.href) ? "text-violet-400" : "text-zinc-500 group-hover:text-zinc-300")}>
                {item.icon}
              </span>
              {item.label}
              {isActive(item.href) && (
                <ChevronRight size={14} className="ml-auto text-violet-400" />
              )}
            </Link>
          ))}

          {/* Switch role link */}
          {isAdmin && (
            <div className="pt-2 mt-2 border-t border-white/5">
              <Link
                to="/"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-all"
              >
                <Home size={18} className="text-zinc-600" />
                View as User
              </Link>
            </div>
          )}
          {!isAdmin && (
            <div className="pt-2 mt-2 border-t border-white/5">
              <button
                onClick={() => navigate("/admin")}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-all"
                style={{ display: user?.role === "ROLE_ADMIN" ? "flex" : "none" }}
              >
                <Shield size={18} className="text-zinc-600" />
                Admin Panel
              </button>
            </div>
          )}
        </nav>

        {/* User footer */}
        <div className="p-3 border-t border-white/5">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              className="text-zinc-600 hover:text-red-400 transition-colors"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <header className="flex items-center gap-4 px-4 py-3 border-b border-white/5 bg-[#08090f]/80 backdrop-blur-xl lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-violet-400" />
            <span className="font-bold text-sm bg-gradient-to-r from-violet-300 to-indigo-300 bg-clip-text text-transparent">
              Libranet
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
