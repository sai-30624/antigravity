import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useCategories, useTags } from "@/hooks/useResources";
import { useCreateCategory, useDeleteCategory, useCreateTag, useDeleteTag } from "@/hooks/useAdmin";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Tag, FolderOpen, Loader2 } from "lucide-react";



export default function AdminCategoriesPage() {
  const { data: categories = [], isLoading: catsLoading } = useCategories();
  const { data: tags = [], isLoading: tagsLoading } = useTags();

  const { mutate: createCat, isPending: creatingCat } = useCreateCategory();
  const { mutate: deleteCat, isPending: deletingCat } = useDeleteCategory();
  const { mutate: createTag, isPending: creatingTag } = useCreateTag();
  const { mutate: deleteTag, isPending: deletingTag } = useDeleteTag();

  const [newCatName, setNewCatName] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");
  const [newTagName, setNewTagName] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: "cat" | "tag"; id: number } | null>(null);

  const handleCreateCat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    createCat({ name: newCatName.trim(), description: newCatDesc.trim() || undefined }, {
      onSuccess: () => { setNewCatName(""); setNewCatDesc(""); },
    });
  };

  const handleCreateTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    createTag({ name: newTagName.trim() }, { onSuccess: () => setNewTagName("") });
  };

  return (
    <AppLayout>
      <div className="px-6 py-8 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white/90 mb-1">Categories & Tags</h1>
          <p className="text-sm text-zinc-500">Organize your resource library with categories and tags.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Categories */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FolderOpen size={16} className="text-violet-400" />
              <h2 className="text-sm font-semibold text-white/90">Categories</h2>
              <span className="text-xs text-zinc-600 ml-1">({categories.length})</span>
            </div>

            {/* Add category form */}
            <form onSubmit={handleCreateCat} className="bg-white/[0.02] border border-white/[0.07] rounded-xl p-4 space-y-3">
              <input
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="Category name *"
                className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50 transition-colors"
              />
              <input
                value={newCatDesc}
                onChange={(e) => setNewCatDesc(e.target.value)}
                placeholder="Description (optional)"
                className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50 transition-colors"
              />
              <Button type="submit" size="sm" disabled={creatingCat || !newCatName.trim()} className="w-full bg-violet-600/80 hover:bg-violet-600 text-white">
                {creatingCat ? <Loader2 size={13} className="animate-spin" /> : <><Plus size={13} className="mr-1.5" /> Add Category</>}
              </Button>
            </form>

            {/* Category list */}
            <div className="space-y-2">
              {catsLoading ? (
                <div className="py-8 text-center"><Loader2 size={18} className="animate-spin mx-auto text-violet-400" /></div>
              ) : categories.length === 0 ? (
                <p className="text-xs text-zinc-600 text-center py-6">No categories yet.</p>
              ) : (
                categories.map((c) => (
                  <div key={c.id} className="flex items-center gap-3 px-4 py-3 bg-white/[0.02] border border-white/[0.05] rounded-xl hover:border-white/10 group transition-all">
                    <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                      <FolderOpen size={14} className="text-violet-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white/80 truncate">{c.name}</p>
                      {c.description && <p className="text-xs text-zinc-600 truncate">{c.description}</p>}
                    </div>
                    {c.resourceCount !== undefined && (
                      <span className="text-xs text-zinc-600 shrink-0">{c.resourceCount}</span>
                    )}
                    <button
                      onClick={() => setDeleteConfirm({ type: "cat", id: c.id })}
                      className="p-1.5 text-zinc-700 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Tag size={16} className="text-cyan-400" />
              <h2 className="text-sm font-semibold text-white/90">Tags</h2>
              <span className="text-xs text-zinc-600 ml-1">({tags.length})</span>
            </div>

            {/* Add tag form */}
            <form onSubmit={handleCreateTag} className="bg-white/[0.02] border border-white/[0.07] rounded-xl p-4">
              <div className="flex gap-2">
                <input
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="Tag name *"
                  className="flex-1 bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
                />
                <Button type="submit" size="sm" disabled={creatingTag || !newTagName.trim()} className="bg-cyan-600/80 hover:bg-cyan-600 text-white shrink-0">
                  {creatingTag ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
                </Button>
              </div>
            </form>

            {/* Tag cloud */}
            <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4 min-h-[120px]">
              {tagsLoading ? (
                <div className="py-8 text-center"><Loader2 size={18} className="animate-spin mx-auto text-cyan-400" /></div>
              ) : tags.length === 0 ? (
                <p className="text-xs text-zinc-600 text-center py-6">No tags yet.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {tags.map((t) => (
                    <div key={t.id} className="group flex items-center gap-1 pl-3 pr-2 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-full transition-all hover:border-red-500/30">
                      <span className="text-xs font-medium text-cyan-300">#{t.name}</span>
                      <button
                        onClick={() => setDeleteConfirm({ type: "tag", id: t.id })}
                        className="text-cyan-600 hover:text-red-400 transition-colors p-0.5"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete confirm modal */}
      {deleteConfirm !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setDeleteConfirm(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative z-10 bg-[#0d0e1a] border border-white/10 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-semibold text-white/90 mb-2">
              Delete {deleteConfirm.type === "cat" ? "Category" : "Tag"}?
            </h3>
            <p className="text-sm text-zinc-500 mb-5">
              {deleteConfirm.type === "cat"
                ? "Resources in this category won't be deleted, but they'll lose their category assignment."
                : "This tag will be removed from all resources it's currently attached to."}
            </p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 border-white/10 text-zinc-400 hover:text-white" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
              <Button
                className="flex-1 bg-red-600/80 hover:bg-red-600 text-white"
                disabled={deletingCat || deletingTag}
                onClick={() => {
                  if (deleteConfirm.type === "cat") deleteCat(deleteConfirm.id);
                  else deleteTag(deleteConfirm.id);
                  setDeleteConfirm(null);
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
