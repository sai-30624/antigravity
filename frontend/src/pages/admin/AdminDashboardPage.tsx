import { AppLayout } from "@/components/AppLayout";
import { useAdminStats } from "@/hooks/useAdmin";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { FileText, Users, Download, Star, TrendingUp, Loader2 } from "lucide-react";
import { format } from "date-fns";

const COLORS = ["#7c3aed", "#6366f1", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444"];

const CustomTooltipStyle = {
  backgroundColor: "#0d0e1a",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: "8px",
  fontSize: "12px",
  color: "#a1a1aa",
};

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useAdminStats();

  const statCards = [
    {
      label: "Total Resources",
      value: stats?.totalResources ?? 0,
      icon: <FileText size={20} />,
      color: "from-violet-500 to-purple-600",
      glow: "shadow-violet-900/30",
    },
    {
      label: "Registered Users",
      value: stats?.totalUsers ?? 0,
      icon: <Users size={20} />,
      color: "from-indigo-500 to-blue-600",
      glow: "shadow-indigo-900/30",
    },
    {
      label: "Total Downloads",
      value: stats?.totalDownloads ?? 0,
      icon: <Download size={20} />,
      color: "from-emerald-500 to-teal-600",
      glow: "shadow-emerald-900/30",
    },
    {
      label: "Total Reviews",
      value: stats?.totalReviews ?? 0,
      icon: <Star size={20} />,
      color: "from-amber-500 to-orange-600",
      glow: "shadow-amber-900/30",
    },
  ];

  return (
    <AppLayout>
      <div className="px-6 py-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white/90 mb-1">Analytics Dashboard</h1>
          <p className="text-sm text-zinc-500">Platform-wide statistics and activity overview.</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 size={24} className="animate-spin text-violet-400" />
          </div>
        ) : (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
              {statCards.map((card) => (
                <div
                  key={card.label}
                  className={`relative overflow-hidden bg-white/[0.025] border border-white/[0.07] rounded-2xl p-5 shadow-xl ${card.glow}`}
                >
                  <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-20 bg-gradient-to-br ${card.color} -translate-y-6 translate-x-6`} />
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white mb-3 shadow-lg`}>
                    {card.icon}
                  </div>
                  <p className="text-2xl font-bold text-white/90">{card.value.toLocaleString()}</p>
                  <p className="text-xs text-zinc-500 mt-1">{card.label}</p>
                </div>
              ))}
            </div>

            {/* Charts row */}
            <div className="grid lg:grid-cols-3 gap-5 mb-5">
              {/* Downloads over time */}
              <div className="lg:col-span-2 bg-white/[0.02] border border-white/[0.07] rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-5">
                  <TrendingUp size={15} className="text-violet-400" />
                  <h2 className="text-sm font-semibold text-white/90">Downloads Over Time</h2>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={stats?.downloadsByDay ?? []}>
                    <defs>
                      <linearGradient id="dlGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10, fill: "#52525b" }}
                      tickFormatter={(v) => { try { return format(new Date(v), "MMM d"); } catch { return v; } }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis tick={{ fontSize: 10, fill: "#52525b" }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={CustomTooltipStyle} />
                    <Area type="monotone" dataKey="count" stroke="#7c3aed" fill="url(#dlGrad)" strokeWidth={2} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Resources by category pie */}
              <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-5">
                <h2 className="text-sm font-semibold text-white/90 mb-5">Resources by Category</h2>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={stats?.resourcesByCategory ?? []}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={3}
                      strokeWidth={0}
                    >
                      {(stats?.resourcesByCategory ?? []).map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={CustomTooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-2 space-y-1.5">
                  {(stats?.resourcesByCategory ?? []).slice(0, 5).map((c, i) => (
                    <div key={c.name} className="flex items-center gap-2 text-xs">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-zinc-400 truncate flex-1">{c.name}</span>
                      <span className="text-zinc-600">{c.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top resources bar chart */}
            <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-5">
              <h2 className="text-sm font-semibold text-white/90 mb-5">Top Resources by Downloads</h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={stats?.topResources ?? []} layout="vertical" margin={{ left: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: "#52525b" }} axisLine={false} tickLine={false} />
                  <YAxis
                    type="category"
                    dataKey="title"
                    width={160}
                    tick={{ fontSize: 10, fill: "#71717a" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => v.length > 24 ? v.slice(0, 24) + "…" : v}
                  />
                  <Tooltip contentStyle={CustomTooltipStyle} />
                  <Bar dataKey="downloads" fill="#7c3aed" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
