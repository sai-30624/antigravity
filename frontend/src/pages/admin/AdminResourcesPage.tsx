import { useState, useRef } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useAdminResources, useDeleteResource, useUploadResource } from "@/hooks/useAdmin";
import { useCategories, useTags } from "@/hooks/useResources";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Search, FileUp, X, Loader2, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { ResourceDetailModal } from "@/components/ResourceDetailModal";
import { cn } from "@/lib/utils";

// ── Upload Modal ───────────────────────────────────────────
function UploadModal({ onClose }: { onClose: () => void }) {
  const { data: categories = [] } = useCategories();
  const { data: tags = [] } = useTags();
  const { mutate: upload, isPending } = useUploadResource();
  const fileRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { setError("Please select a file."); return; }
    if (!categoryId) { setError("Please select a category."); return; }
    setError("");

    const fd = new FormData();
    fd.append("file", file);
    fd.append("title", title);
    fd.append("description", description);
    fd.append("categoryId", String(categoryId));
    selectedTags.forEach((t) => fd.append("tagIds", String(t)));

    upload(fd, { onSuccess: onClose });
  };

  const toggleTag = (id: number) =>
    setSelectedTags((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
      <div
        className="relative z-10 w-full max-w-lg bg-[#0d0e1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h2 className="text-base font-semibold text-white/90">Upload Resource</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <p className="text-xs text-red-400 bg-red-950/40 border border-red-900/40 rounded-lg px-3 py-2">{error}</p>
          )}

          {/* File pick zone */}
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-white/10 hover:border-violet-500/40 rounded-xl p-6 text-center cursor-pointer transition-all group"
          >
            <FileUp size={24} className="mx-auto text-zinc-600 group-hover:text-violet-400 mb-2 transition-colors" />
            {file ? (
              <p className="text-sm font-medium text-violet-300">{file.name}</p>
            ) : (
              <>
                <p className="text-sm text-zinc-500">Click to select a file</p>
                <p className="text-xs text-zinc-700 mt-1">PDF, DOCX, MP4, ZIP and more</p>
              </>
            )}
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400">Title *</label>
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50 transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50 transition-colors resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400">Category *</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(Number(e.target.value))}
              className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-colors"
            >
              <option value="">Select category…</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {tags.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-400">Tags</label>
              <div className="flex flex-wrap gap-2">
                {tags.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => toggleTag(t.id)}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-xs border transition-all",
                      selectedTags.includes(t.id)
                        ? "bg-cyan-600/20 border-cyan-500/30 text-cyan-300"
                        : "border-white/[0.07] text-zinc-500 hover:text-zinc-300"
                    )}
                  >
                    #{t.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <Button type="submit" disabled={isPending} className="w-full bg-violet-600 hover:bg-violet-500 text-white">
            {isPending
              ? <><Loader2 size={14} className="mr-2 animate-spin" /> Uploading…</>
              : <><FileUp size={14} className="mr-2" /> Upload Resource</>
            }
          </Button>
        </form>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────
export default function AdminResourcesPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [showUpload, setShowUpload] = useState(false);
  const [previewId, setPreviewId] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const { data, isLoading, isFetching } = useAdminResources({ search: search || undefined, page, size: 12 });
  const { mutate: deleteResource, isPending: deleting } = useDeleteResource();
  const resources = data?.content ?? [];

  return (
    <AppLayout>
      <div className="px-6 py-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white/90 mb-1">Resources</h1>
            <p className="text-sm text-zinc-500">{data?.totalElements ?? 0} total resources</p>
          </div>
          <Button
            onClick={() => setShowUpload(true)}
            className="bg-violet-600 hover:bg-violet-500 text-white shadow-[0_0_20px_-5px_rgba(124,58,237,0.4)]"
          >
            <Plus size={15} className="mr-2" /> Upload Resource
          </Button>
        </div>

        <div className="relative mb-5 max-w-md">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            placeholder="Search resources…"
            className="w-full pl-9 pr-4 py-2.5 bg-white/[0.03] border border-white/[0.07] rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/40 transition-all"
          />
        </div>

        <div className={cn("border border-white/[0.07] rounded-2xl overflow-hidden", (isLoading || isFetching) && "opacity-70 transition-opacity")}>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.05] bg-white/[0.02]">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Title</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-zinc-500 uppercase tracking-wider hidden md:table-cell">Category</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-zinc-500 uppercase tracking-wider hidden lg:table-cell">Type</th>
                <th className="text-right px-4 py-3.5 text-xs font-semibold text-zinc-500 uppercase tracking-wider hidden sm:table-cell">Downloads</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {isLoading ? (
                <tr><td colSpan={5} className="py-16 text-center"><Loader2 size={20} className="animate-spin mx-auto text-violet-400" /></td></tr>
              ) : resources.length === 0 ? (
                <tr><td colSpan={5} className="py-16 text-center text-sm text-zinc-600">No resources found.</td></tr>
              ) : (
                resources.map((r) => (
                  <tr key={r.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-white/80 truncate max-w-xs group-hover:text-violet-300 transition-colors">{r.title}</p>
                      <p className="text-xs text-zinc-600 truncate max-w-xs mt-0.5">{r.description}</p>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <span className="text-xs text-violet-400 bg-violet-500/10 border border-violet-500/15 rounded-full px-2.5 py-0.5">
                        {r.category?.name}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 hidden lg:table-cell">
                      <span className="text-xs font-mono text-zinc-500">{r.fileType?.toUpperCase()}</span>
                    </td>
                    <td className="px-4 py-3.5 text-right text-xs text-zinc-500 hidden sm:table-cell">{r.downloadCount}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setPreviewId(r.id)}
                          className="p-1.5 text-zinc-600 hover:text-violet-400 hover:bg-violet-500/10 rounded-lg transition-all"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(r.id)}
                          className="p-1.5 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
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

      {showUpload && <UploadModal onClose={() => setShowUpload(false)} />}
      {previewId !== null && <ResourceDetailModal resourceId={previewId} onClose={() => setPreviewId(null)} />}

      {deleteConfirm !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setDeleteConfirm(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative z-10 bg-[#0d0e1a] border border-white/10 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-semibold text-white/90 mb-2">Delete Resource?</h3>
            <p className="text-sm text-zinc-500 mb-5">This action cannot be undone. All reviews and download history will also be removed.</p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 border-white/10 text-zinc-400 hover:text-white" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
              <Button
                className="flex-1 bg-red-600/80 hover:bg-red-600 text-white"
                disabled={deleting}
                onClick={() => { deleteResource(deleteConfirm); setDeleteConfirm(null); }}
              >
                {deleting ? <Loader2 size={14} className="animate-spin" /> : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
