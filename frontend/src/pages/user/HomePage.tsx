import { useState } from "react";
import { Search, Grid, List, SlidersHorizontal, Loader2 } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { ResourceCard } from "@/components/ResourceCard";
import { ResourceDetailModal } from "@/components/ResourceDetailModal";
import { useResources, useCategories, useTags } from "@/hooks/useResources";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [tagId, setTagId] = useState<number | undefined>();
  const [page, setPage] = useState(0);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedResourceId, setSelectedResourceId] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  let searchTimer: ReturnType<typeof setTimeout>;
  const handleSearch = (val: string) => {
    setSearch(val);
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => { setDebouncedSearch(val); setPage(0); }, 400);
  };

  const { data, isLoading, isFetching } = useResources({
    search: debouncedSearch || undefined,
    categoryId,
    tagId,
    page,
    size: 12,
  });
  const { data: categories = [] } = useCategories();
  const { data: tags = [] } = useTags();

  const resources = data?.content ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <AppLayout>
      <div className="px-6 py-8 max-w-7xl mx-auto">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white/90 mb-1">Resource Library</h1>
          <p className="text-sm text-zinc-500">
            {data?.totalElements ?? 0} resources available
            {(debouncedSearch || categoryId || tagId) ? " · Filtered results" : ""}
          </p>
        </div>

        {/* Search + controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
            <input
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search resources by title, description…"
              className="w-full pl-9 pr-4 py-2.5 bg-white/[0.03] border border-white/[0.07] rounded-xl text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/40 focus:bg-white/[0.05] transition-all"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all",
              showFilters
                ? "bg-violet-600/20 border-violet-500/30 text-violet-300"
                : "bg-white/[0.03] border-white/[0.07] text-zinc-400 hover:text-white hover:border-white/20"
            )}
          >
            <SlidersHorizontal size={15} />
            Filters
            {(categoryId || tagId) && (
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
            )}
          </button>
          <div className="flex border border-white/[0.07] rounded-xl overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={cn("px-3 py-2.5 transition-all", viewMode === "grid" ? "bg-violet-600/20 text-violet-300" : "text-zinc-500 hover:text-white bg-white/[0.03]")}
            >
              <Grid size={15} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn("px-3 py-2.5 transition-all", viewMode === "list" ? "bg-violet-600/20 text-violet-300" : "text-zinc-500 hover:text-white bg-white/[0.03]")}
            >
              <List size={15} />
            </button>
          </div>
        </div>

        {/* Filters panel */}
        {showFilters && (
          <div className="mb-5 p-4 bg-white/[0.02] border border-white/[0.07] rounded-xl space-y-4 animate-in slide-in-from-top-2 duration-200">
            <div>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2.5">Category</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => { setCategoryId(undefined); setPage(0); }}
                  className={cn("px-3 py-1.5 rounded-lg text-xs font-medium border transition-all", !categoryId ? "bg-violet-600/20 border-violet-500/30 text-violet-300" : "border-white/[0.07] text-zinc-500 hover:text-zinc-300 hover:border-white/20")}
                >
                  All
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => { setCategoryId(c.id === categoryId ? undefined : c.id); setPage(0); }}
                    className={cn("px-3 py-1.5 rounded-lg text-xs font-medium border transition-all", categoryId === c.id ? "bg-violet-600/20 border-violet-500/30 text-violet-300" : "border-white/[0.07] text-zinc-500 hover:text-zinc-300 hover:border-white/20")}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
            {tags.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2.5">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {tags.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => { setTagId(t.id === tagId ? undefined : t.id); setPage(0); }}
                      className={cn("px-3 py-1.5 rounded-lg text-xs font-medium border transition-all", tagId === t.id ? "bg-cyan-600/20 border-cyan-500/30 text-cyan-300" : "border-white/[0.07] text-zinc-500 hover:text-zinc-300 hover:border-white/20")}
                    >
                      #{t.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {(categoryId || tagId) && (
              <button
                onClick={() => { setCategoryId(undefined); setTagId(undefined); setPage(0); }}
                className="text-xs text-red-400 hover:text-red-300 transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Resource grid/list */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 size={24} className="animate-spin text-violet-400" />
          </div>
        ) : resources.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center mb-4">
              <Search size={24} className="text-zinc-600" />
            </div>
            <p className="text-sm font-medium text-zinc-400">No resources found</p>
            <p className="text-xs text-zinc-600 mt-1">Try different search terms or filters</p>
          </div>
        ) : (
          <div
            className={cn(
              isFetching ? "opacity-70 transition-opacity" : "",
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                : "flex flex-col gap-3"
            )}
          >
            {resources.map((r) => (
              <ResourceCard key={r.id} resource={r} onClick={() => setSelectedResourceId(r.id)} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
              className="border-white/10 bg-white/[0.03] text-zinc-400 hover:text-white disabled:opacity-40"
            >
              Previous
            </Button>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
                const p = i;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={cn(
                      "w-8 h-8 rounded-lg text-xs font-medium transition-all",
                      page === p
                        ? "bg-violet-600/30 text-violet-300 border border-violet-500/30"
                        : "text-zinc-500 hover:text-white hover:bg-white/5"
                    )}
                  >
                    {p + 1}
                  </button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages - 1}
              onClick={() => setPage(page + 1)}
              className="border-white/10 bg-white/[0.03] text-zinc-400 hover:text-white disabled:opacity-40"
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Resource Detail Modal */}
      {selectedResourceId !== null && (
        <ResourceDetailModal
          resourceId={selectedResourceId}
          onClose={() => setSelectedResourceId(null)}
        />
      )}
    </AppLayout>
  );
}
