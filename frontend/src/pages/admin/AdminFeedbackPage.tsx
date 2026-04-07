import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useAdminFeedback, useUpdateFeedbackStatus } from "@/hooks/useAdmin";
import { Button } from "@/components/ui/button";
import { MessageSquare, CheckCircle, XCircle, Clock, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const STATUS_TABS = ["ALL", "PENDING", "APPROVED", "REJECTED"] as const;

export default function AdminFeedbackPage() {
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [page, setPage] = useState(0);

  const { data, isLoading, isFetching } = useAdminFeedback({
    status: statusFilter === "ALL" ? undefined : statusFilter,
    page,
  });
  const { mutate: updateStatus, isPending: updating } = useUpdateFeedbackStatus();
  const feedback = data?.content ?? [];

  const statusConfig: Record<string, { icon: typeof Clock; color: string; bg: string }> = {
    PENDING:  { icon: Clock,        color: "text-amber-400",   bg: "bg-amber-500/10 border-amber-500/20"   },
    APPROVED: { icon: CheckCircle,  color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
    REJECTED: { icon: XCircle,      color: "text-red-400",     bg: "bg-red-500/10 border-red-500/20"       },
  };

  return (
    <AppLayout>
      <div className="px-6 py-8 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white/90 mb-1">Feedback Moderation</h1>
          <p className="text-sm text-zinc-500">Review and moderate user-submitted feedback and reviews.</p>
        </div>

        {/* Status tabs */}
        <div className="flex gap-1 p-1 bg-white/[0.03] border border-white/[0.07] rounded-xl mb-6 w-fit">
          {STATUS_TABS.map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(0); }}
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-medium transition-all",
                statusFilter === s
                  ? "bg-violet-600/30 text-violet-300 border border-violet-500/30"
                  : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              {s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Feedback list */}
        <div className={cn("space-y-3", (isLoading || isFetching) && "opacity-70 transition-opacity")}>
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={24} className="animate-spin text-violet-400" />
            </div>
          ) : feedback.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <MessageSquare size={32} className="text-zinc-700 mb-3" />
              <p className="text-sm text-zinc-500">No feedback found for this filter.</p>
            </div>
          ) : (
            feedback.map((f) => {
              const sc = statusConfig[f.status] ?? statusConfig.PENDING;
              const Icon = sc.icon;
              return (
                <div key={f.id} className="bg-white/[0.02] border border-white/[0.05] hover:border-white/10 rounded-2xl p-5 transition-all">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                        {f.user?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white/80">{f.user?.name}</p>
                        <p className="text-xs text-zinc-600">{f.user?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={cn("flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full border", sc.bg, sc.color)}>
                        <Icon size={10} />
                        {f.status}
                      </span>
                      <span className="text-xs text-zinc-600">
                        {f.createdAt ? format(new Date(f.createdAt), "MMM d, yyyy") : ""}
                      </span>
                    </div>
                  </div>

                  {/* Resource link */}
                  {f.resource && (
                    <p className="text-xs text-zinc-600 mb-2">
                      On resource: <span className="text-violet-400">{f.resource.title}</span>
                    </p>
                  )}

                  {/* Content */}
                  <p className="text-sm text-zinc-400 leading-relaxed mb-4 bg-black/20 rounded-lg px-4 py-3 border border-white/5">
                    {f.content}
                  </p>

                  {/* Action buttons (only for pending) */}
                  {f.status === "PENDING" && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        disabled={updating}
                        onClick={() => updateStatus({ id: f.id, status: "APPROVED" })}
                        className="flex-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/20"
                      >
                        <CheckCircle size={13} className="mr-1.5" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        disabled={updating}
                        onClick={() => updateStatus({ id: f.id, status: "REJECTED" })}
                        className="flex-1 bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/20"
                      >
                        <XCircle size={13} className="mr-1.5" /> Reject
                      </Button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {(data?.totalPages ?? 1) > 1 && (
          <div className="flex items-center justify-between mt-6">
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
